import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, CheckCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { differenceInDays, parseISO, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface SLAAlertCardProps {
  labRequests: LabRequest[];
  deliveryRequests: DeliveryRequest[];
}

// SLA thresholds in days
const SLA_THRESHOLDS = {
  solutionResponse: 3, // Days to respond to a solution request
  deliveryStart: 2, // Days before scheduled start to have lab ready
};

export function SLAAlertCard({ labRequests, deliveryRequests }: SLAAlertCardProps) {
  const today = new Date();

  // Calculate SLA breaches for solutions
  const solutionBreaches = labRequests.filter(r => {
    if (r.status !== 'Solution Pending' || !r.receivedOn) return false;
    try {
      const receivedDate = parseISO(r.receivedOn);
      const daysSinceReceived = differenceInDays(today, receivedDate);
      return daysSinceReceived > SLA_THRESHOLDS.solutionResponse;
    } catch {
      return false;
    }
  });

  // At risk solutions (approaching SLA)
  const solutionsAtRisk = labRequests.filter(r => {
    if (r.status !== 'Solution Pending' || !r.receivedOn) return false;
    try {
      const receivedDate = parseISO(r.receivedOn);
      const daysSinceReceived = differenceInDays(today, receivedDate);
      return daysSinceReceived >= SLA_THRESHOLDS.solutionResponse - 1 && daysSinceReceived <= SLA_THRESHOLDS.solutionResponse;
    } catch {
      return false;
    }
  });

  // Delivery breaches (should have started but haven't)
  const deliveryBreaches = deliveryRequests.filter(r => {
    if (r.labStatus !== 'Pending' || !r.startDate) return false;
    try {
      const startDate = parseISO(r.startDate);
      const daysUntilStart = differenceInDays(startDate, today);
      return daysUntilStart < 0; // Past start date but still pending
    } catch {
      return false;
    }
  });

  // Month-over-Month comparison
  const currentMonth = today;
  const lastMonth = subMonths(today, 1);
  
  const currentMonthStart = startOfMonth(currentMonth);
  const currentMonthEnd = endOfMonth(currentMonth);
  const lastMonthStart = startOfMonth(lastMonth);
  const lastMonthEnd = endOfMonth(lastMonth);

  const currentMonthSolutions = labRequests.filter(r => {
    if (!r.receivedOn) return false;
    try {
      const date = parseISO(r.receivedOn);
      return isWithinInterval(date, { start: currentMonthStart, end: currentMonthEnd });
    } catch {
      return false;
    }
  }).length;

  const lastMonthSolutions = labRequests.filter(r => {
    if (!r.receivedOn) return false;
    try {
      const date = parseISO(r.receivedOn);
      return isWithinInterval(date, { start: lastMonthStart, end: lastMonthEnd });
    } catch {
      return false;
    }
  }).length;

  const currentMonthDeliveries = deliveryRequests.filter(r => {
    if (!r.receivedOn) return false;
    try {
      const date = parseISO(r.receivedOn);
      return isWithinInterval(date, { start: currentMonthStart, end: currentMonthEnd });
    } catch {
      return false;
    }
  }).length;

  const lastMonthDeliveries = deliveryRequests.filter(r => {
    if (!r.receivedOn) return false;
    try {
      const date = parseISO(r.receivedOn);
      return isWithinInterval(date, { start: lastMonthStart, end: lastMonthEnd });
    } catch {
      return false;
    }
  }).length;

  const solutionsMoM = lastMonthSolutions > 0 
    ? ((currentMonthSolutions - lastMonthSolutions) / lastMonthSolutions) * 100 
    : currentMonthSolutions > 0 ? 100 : 0;

  const deliveriesMoM = lastMonthDeliveries > 0 
    ? ((currentMonthDeliveries - lastMonthDeliveries) / lastMonthDeliveries) * 100 
    : currentMonthDeliveries > 0 ? 100 : 0;

  const totalBreaches = solutionBreaches.length + deliveryBreaches.length;
  const totalAtRisk = solutionsAtRisk.length;

  const getMoMIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-3 h-3 text-green-600" />;
    if (value < 0) return <TrendingDown className="w-3 h-3 text-red-600" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  const getMoMColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* SLA Status Card */}
      <Card>
        <CardHeader className={`py-3 px-4 rounded-t-lg ${totalBreaches > 0 ? 'bg-red-500 text-white' : totalAtRisk > 0 ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'}`}>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {totalBreaches > 0 ? (
              <AlertTriangle className="w-4 h-4" />
            ) : totalAtRisk > 0 ? (
              <Clock className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            SLA Status
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {totalBreaches === 0 && totalAtRisk === 0 ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">All SLAs on track</span>
              </div>
            ) : (
              <>
                {solutionBreaches.length > 0 && (
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded-md border border-red-200">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm">Solution SLA Breached</span>
                    </div>
                    <Badge variant="destructive">{solutionBreaches.length}</Badge>
                  </div>
                )}
                {deliveryBreaches.length > 0 && (
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded-md border border-red-200">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm">Delivery Past Start Date</span>
                    </div>
                    <Badge variant="destructive">{deliveryBreaches.length}</Badge>
                  </div>
                )}
                {solutionsAtRisk.length > 0 && (
                  <div className="flex items-center justify-between p-2 bg-amber-50 rounded-md border border-amber-200">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span className="text-sm">Solutions At Risk</span>
                    </div>
                    <Badge className="bg-amber-500">{solutionsAtRisk.length}</Badge>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Month-over-Month Comparison */}
      <Card>
        <CardHeader className="bg-primary text-primary-foreground py-3 px-4 rounded-t-lg">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Month-over-Month
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Solutions (This Month)</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{currentMonthSolutions}</span>
                <div className={`flex items-center gap-1 text-xs ${getMoMColor(solutionsMoM)}`}>
                  {getMoMIcon(solutionsMoM)}
                  <span>{solutionsMoM > 0 ? '+' : ''}{solutionsMoM.toFixed(0)}%</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Deliveries (This Month)</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{currentMonthDeliveries}</span>
                <div className={`flex items-center gap-1 text-xs ${getMoMColor(deliveriesMoM)}`}>
                  {getMoMIcon(deliveriesMoM)}
                  <span>{deliveriesMoM > 0 ? '+' : ''}{deliveriesMoM.toFixed(0)}%</span>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t text-xs text-muted-foreground">
              vs. last month: {lastMonthSolutions} solutions, {lastMonthDeliveries} deliveries
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
