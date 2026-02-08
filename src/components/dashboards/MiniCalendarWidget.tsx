import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronRight, ClipboardList, Truck } from 'lucide-react';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { format, addDays, parseISO, isSameDay, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MiniCalendarWidgetProps {
  labRequests: LabRequest[];
  deliveryRequests: DeliveryRequest[];
  onNavigateToCalendar?: () => void;
}

interface DayEvent {
  date: Date;
  solutions: { name: string; client: string; type: 'start' | 'end' }[];
  deliveries: { name: string; client: string; type: 'start' | 'end' }[];
}

export function MiniCalendarWidget({ 
  labRequests, 
  deliveryRequests, 
  onNavigateToCalendar 
}: MiniCalendarWidgetProps) {
  const today = startOfDay(new Date());
  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  // Build events for each day
  const dayEvents: DayEvent[] = next7Days.map(date => {
    const solutions: DayEvent['solutions'] = [];
    const deliveries: DayEvent['deliveries'] = [];

    labRequests.forEach(req => {
      try {
        if (req.labStartDate) {
          const startDate = parseISO(req.labStartDate);
          if (isSameDay(startDate, date)) {
            solutions.push({ 
              name: req.labName || 'Unnamed Lab', 
              client: req.client,
              type: 'start' 
            });
          }
        }
        if (req.labEndDate) {
          const endDate = parseISO(req.labEndDate);
          if (isSameDay(endDate, date)) {
            solutions.push({ 
              name: req.labName || 'Unnamed Lab', 
              client: req.client,
              type: 'end' 
            });
          }
        }
      } catch {}
    });

    deliveryRequests.forEach(req => {
      try {
        if (req.startDate) {
          const startDate = parseISO(req.startDate);
          if (isSameDay(startDate, date)) {
            deliveries.push({ 
              name: req.trainingName || req.labName || 'Unnamed Training', 
              client: req.client,
              type: 'start' 
            });
          }
        }
        if (req.endDate) {
          const endDate = parseISO(req.endDate);
          if (isSameDay(endDate, date)) {
            deliveries.push({ 
              name: req.trainingName || req.labName || 'Unnamed Training', 
              client: req.client,
              type: 'end' 
            });
          }
        }
      } catch {}
    });

    return { date, solutions, deliveries };
  });

  const hasEvents = dayEvents.some(d => d.solutions.length > 0 || d.deliveries.length > 0);

  return (
    <Card>
      <CardHeader className="bg-primary text-primary-foreground py-3 px-4 rounded-t-lg flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Next 7 Days
        </CardTitle>
        {onNavigateToCalendar && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary-foreground hover:bg-primary-foreground/10 gap-1 h-7 px-2"
            onClick={onNavigateToCalendar}
          >
            View Calendar
            <ChevronRight className="w-3 h-3" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {!hasEvents ? (
          <div className="p-6 text-center text-muted-foreground text-sm">
            No scheduled labs in the next 7 days
          </div>
        ) : (
          <div className="divide-y">
            {dayEvents.map((day, idx) => {
              const isToday = isSameDay(day.date, today);
              const totalEvents = day.solutions.length + day.deliveries.length;
              
              if (totalEvents === 0) return null;

              return (
                <div 
                  key={idx} 
                  className={cn(
                    "p-3 hover:bg-muted/50 transition-colors",
                    isToday && "bg-primary/5"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Date column */}
                    <div className={cn(
                      "flex-shrink-0 text-center min-w-[50px]",
                      isToday && "text-primary font-bold"
                    )}>
                      <div className="text-xs uppercase text-muted-foreground">
                        {format(day.date, 'EEE')}
                      </div>
                      <div className="text-lg font-semibold">
                        {format(day.date, 'd')}
                      </div>
                      {isToday && (
                        <Badge variant="default" className="text-[10px] px-1 py-0">
                          Today
                        </Badge>
                      )}
                    </div>

                    {/* Events column */}
                    <div className="flex-1 space-y-1.5 min-w-0">
                      {day.solutions.map((event, i) => (
                        <div 
                          key={`sol-${i}`} 
                          className="flex items-center gap-2 text-sm"
                        >
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full flex-shrink-0",
                            event.type === 'start' ? "bg-blue-500" : "bg-blue-300"
                          )} />
                          <ClipboardList className="w-3 h-3 text-blue-600 flex-shrink-0" />
                          <span className="truncate font-medium">{event.name}</span>
                          <span className="text-xs text-muted-foreground truncate">
                            {event.client}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[10px] px-1 py-0 ml-auto flex-shrink-0",
                              event.type === 'start' 
                                ? "border-blue-300 text-blue-600" 
                                : "border-blue-200 text-blue-400"
                            )}
                          >
                            {event.type === 'start' ? 'Start' : 'End'}
                          </Badge>
                        </div>
                      ))}
                      {day.deliveries.map((event, i) => (
                        <div 
                          key={`del-${i}`} 
                          className="flex items-center gap-2 text-sm"
                        >
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full flex-shrink-0",
                            event.type === 'start' ? "bg-green-500" : "bg-green-300"
                          )} />
                          <Truck className="w-3 h-3 text-green-600 flex-shrink-0" />
                          <span className="truncate font-medium">{event.name}</span>
                          <span className="text-xs text-muted-foreground truncate">
                            {event.client}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[10px] px-1 py-0 ml-auto flex-shrink-0",
                              event.type === 'start' 
                                ? "border-green-300 text-green-600" 
                                : "border-green-200 text-green-400"
                            )}
                          >
                            {event.type === 'start' ? 'Start' : 'End'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
