
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays } from 'lucide-react';

export const MiniCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Calculate current quarter (13-week cycle)
  const getCurrentQuarter = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return `${year}-Q${Math.floor(month / 3) + 1}`;
  };

  // Calculate week in quarter
  const getCurrentWeekInQuarter = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
    const weekOfYear = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    return ((weekOfYear - 1) % 13) + 1;
  };

  const currentQuarter = getCurrentQuarter();
  const currentWeek = getCurrentWeekInQuarter();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <CalendarDays className="w-4 h-4" />
          Ciclo EBD
        </CardTitle>
        <div className="flex gap-2">
          <Badge variant="outline">{currentQuarter}</Badge>
          <Badge variant="default">Semana {currentWeek}/13</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border-none"
        />
      </CardContent>
    </Card>
  );
};
