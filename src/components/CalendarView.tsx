import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ClipboardList, Truck, TrendingUp, DollarSign, Users } from 'lucide-react';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, isWithinInterval, isAfter, isBefore, endOfDay } from 'date-fns';
import { formatINR } from '@/lib/formatUtils';

interface CalendarViewProps {
  labRequests: LabRequest[];
  deliveryRequests: DeliveryRequest[];
}

type CalendarEvent = {
  id: string;
  type: 'solution' | 'delivery';
  title: string;
  client: string;
  startDate: Date;
  endDate: Date;
  status: string;
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarView = ({ labRequests, deliveryRequests }: CalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Parse all events from requests
  const events = useMemo(() => {
    const allEvents: CalendarEvent[] = [];

    labRequests.forEach((req) => {
      if (req.labStartDate && req.labEndDate) {
        try {
          const startDate = parseISO(req.labStartDate);
          const endDate = parseISO(req.labEndDate);
          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            allEvents.push({
              id: req.id,
              type: 'solution',
              title: req.labName || 'Untitled',
              client: req.client,
              startDate,
              endDate,
              status: req.status,
            });
          }
        } catch (e) {
          // Skip invalid dates
        }
      }
    });

    deliveryRequests.forEach((req) => {
      if (req.startDate && req.endDate) {
        try {
          const startDate = parseISO(req.startDate);
          const endDate = parseISO(req.endDate);
          if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            allEvents.push({
              id: req.id,
              type: 'delivery',
              title: req.trainingName || req.labName || 'Untitled',
              client: req.client,
              startDate,
              endDate,
              status: req.labStatus,
            });
          }
        } catch (e) {
          // Skip invalid dates
        }
      }
    });

    return allEvents;
  }, [labRequests, deliveryRequests]);

  // Get days for the current month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Add padding days for the start of the week
    const startPadding = monthStart.getDay();
    const paddedDays: (Date | null)[] = Array(startPadding).fill(null);

    return [...paddedDays, ...days];
  }, [currentMonth]);

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      try {
        return isWithinInterval(day, { start: event.startDate, end: event.endDate }) ||
          isSameDay(day, event.startDate) ||
          isSameDay(day, event.endDate);
      } catch {
        return false;
      }
    });
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader variant="primary" className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-primary-foreground">Lab Schedule Calendar</CardTitle>
            <CardDescription className="text-primary-foreground/70">
              View lab start and end dates across all requests
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="secondary" onClick={handleToday}>
              Today
            </Button>
            <Button variant="secondary" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="min-h-[100px] bg-muted/30 rounded-lg" />;
              }

              const dayEvents = getEventsForDay(day);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentMonth);

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[100px] p-1 rounded-lg border transition-colors ${
                    isToday
                      ? 'border-primary bg-primary/5'
                      : isCurrentMonth
                      ? 'border-border bg-card hover:bg-muted/50'
                      : 'border-transparent bg-muted/30'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : 'text-foreground'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`text-xs px-1.5 py-0.5 rounded cursor-pointer truncate ${
                          event.type === 'solution'
                            ? 'bg-blue-500/20 text-blue-700 hover:bg-blue-500/30'
                            : 'bg-green-500/20 text-green-700 hover:bg-green-500/30'
                        }`}
                        title={`${event.title} - ${event.client}`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground px-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500/20 border border-blue-500/50" />
          <span className="text-sm text-muted-foreground">Solutions</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/50" />
          <span className="text-sm text-muted-foreground">Deliveries</span>
        </div>
      </div>

      {/* Selected event details */}
      {selectedEvent && (
        <Card>
          <CardHeader variant="primary" className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${selectedEvent.type === 'solution' ? 'bg-accent' : 'bg-accent'}`}>
                {selectedEvent.type === 'solution' ? (
                  <ClipboardList className="h-5 w-5 text-accent-foreground" />
                ) : (
                  <Truck className="h-5 w-5 text-accent-foreground" />
                )}
              </div>
              <div>
                <CardTitle className="text-primary-foreground">{selectedEvent.title}</CardTitle>
                <CardDescription className="text-primary-foreground/70">{selectedEvent.client}</CardDescription>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setSelectedEvent(null)}>
              Close
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <Badge variant={selectedEvent.type === 'solution' ? 'default' : 'secondary'}>
                  {selectedEvent.type === 'solution' ? 'Solution' : 'Delivery'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">
                  {format(selectedEvent.startDate, 'MMM d')} - {format(selectedEvent.endDate, 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge 
                  variant="outline"
                  className={
                    selectedEvent.status === 'Solution Sent' || selectedEvent.status === 'Ready' || selectedEvent.status === 'Completed'
                      ? 'border-green-500 text-green-600'
                      : selectedEvent.status === 'In Progress'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-muted-foreground'
                  }
                >
                  {selectedEvent.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Delivery Labs for the Month */}
      <Card className="overflow-hidden">
        <CardHeader variant="primary">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary-foreground" />
            <div>
              <CardTitle className="text-primary-foreground">Upcoming Delivery Labs</CardTitle>
              <CardDescription className="text-primary-foreground/70">
                Delivery labs starting in {format(currentMonth, 'MMMM yyyy')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {(() => {
            const today = new Date();
            const monthStart = startOfMonth(currentMonth);
            const monthEnd = endOfMonth(currentMonth);
            
            const upcomingDeliveries = events
              .filter((e) => {
                if (e.type !== 'delivery') return false;
                // Show labs that start in the current month and haven't started yet (or start today onwards)
                return isWithinInterval(e.startDate, { start: monthStart, end: monthEnd }) &&
                       (isAfter(e.startDate, today) || isSameDay(e.startDate, today));
              })
              .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

            if (upcomingDeliveries.length === 0) {
              return (
                <p className="text-muted-foreground text-center py-8">
                  No upcoming delivery labs in {format(currentMonth, 'MMMM')}
                </p>
              );
            }

            return (
              <div className="space-y-3">
                {upcomingDeliveries.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/20 hover:bg-green-500/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <Truck className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">{event.client}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="border-green-500 text-green-600">
                        {format(event.startDate, 'MMM d')}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.ceil((event.startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))} days away
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Business Pipeline - Solution Sent */}
      <Card className="overflow-hidden">
        <CardHeader variant="primary">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
            <div>
              <CardTitle className="text-primary-foreground">Business Pipeline</CardTitle>
              <CardDescription className="text-primary-foreground/70">
                Solutions with "Solution Sent" status - potential business in pipeline
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {(() => {
            const solutionSentRequests = labRequests.filter(
              (req) => req.status === 'Solution Sent'
            );

            if (solutionSentRequests.length === 0) {
              return (
                <p className="text-muted-foreground text-center py-8">
                  No solutions in pipeline
                </p>
              );
            }

            const totalPipelineValue = solutionSentRequests.reduce(
              (sum, req) => sum + (req.totalAmountForTraining || 0),
              0
            );
            const totalUsers = solutionSentRequests.reduce(
              (sum, req) => sum + (req.userCount || 0),
              0
            );

            return (
              <div className="space-y-4">
                {/* Pipeline Summary */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-amber-500/5 rounded-lg border border-amber-500/20">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-600">{solutionSentRequests.length}</p>
                    <p className="text-xs text-muted-foreground">In Pipeline</p>
                  </div>
                  <div className="text-center border-x border-amber-500/20">
                    <p className="text-2xl font-bold text-amber-600">{formatINR(totalPipelineValue)}</p>
                    <p className="text-xs text-muted-foreground">Total Value</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-600">{totalUsers}</p>
                    <p className="text-xs text-muted-foreground">Total Users</p>
                  </div>
                </div>

                {/* Pipeline Items */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {solutionSentRequests
                    .sort((a, b) => (b.totalAmountForTraining || 0) - (a.totalAmountForTraining || 0))
                    .map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-amber-500/10">
                            <ClipboardList className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium">{req.labName || 'Untitled'}</p>
                            <p className="text-sm text-muted-foreground">{req.client}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-amber-600">
                            {formatINR(req.totalAmountForTraining)}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {req.userCount} users
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Upcoming events list */}
      <Card className="overflow-hidden">
        <CardHeader variant="primary">
          <CardTitle className="text-primary-foreground">All Upcoming Labs</CardTitle>
          <CardDescription className="text-primary-foreground/70">Labs scheduled in the next 30 days</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {events.filter((e) => e.startDate >= new Date()).length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No upcoming labs scheduled</p>
          ) : (
            <div className="space-y-3">
              {events
                .filter((e) => e.startDate >= new Date())
                .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
                .slice(0, 5)
                .map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${event.type === 'solution' ? 'bg-blue-500/10' : 'bg-green-500/10'}`}>
                        {event.type === 'solution' ? (
                          <ClipboardList className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Truck className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">{event.client}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{format(event.startDate, 'MMM d')}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(event.startDate, 'MMM d')} - {format(event.endDate, 'MMM d')}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
