
import React, { useState, useMemo } from 'react';
import type { WorkoutEntry, BodyPart } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface CalendarViewProps {
  log: WorkoutEntry[];
  selectedDate: string | null;
  onDateSelect: (date: string | null) => void;
  bodyParts: BodyPart[];
}

const COLOR_MAP: Record<string, string> = {
    sky: '#0ea5e9',
    emerald: '#10b981',
    orange: '#f97316',
    rose: '#f43f5e',
    fuchsia: '#d946ef',
    indigo: '#6366f1',
    teal: '#14b8a6',
    amber: '#f59e0b',
    blue: '#3b82f6',
    green: '#22c55e',
    red: '#ef4444',
    yellow: '#eab308',
    purple: '#a855f7',
    pink: '#ec4899',
    cyan: '#06b6d4',
    lime: '#84cc16',
    gray: '#6b7280',
};

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

export const CalendarView: React.FC<CalendarViewProps> = ({ log, selectedDate, onDateSelect, bodyParts }) => {
  const { language, dir } = useLanguage();
  const [displayDate, setDisplayDate] = useState(new Date());
  const today = new Date();

  const isCurrentMonth = displayDate.getMonth() === today.getMonth() && 
                         displayDate.getFullYear() === today.getFullYear();

  const dayStyles = useMemo(() => {
    const styles = new Map<string, string[]>();
    
    const getPartColor = (partId: string) => {
        const part = bodyParts.find(p => p.id === partId);
        const colorName = part ? part.color : 'blue';
        return COLOR_MAP[colorName] || '#3b82f6';
    };

    log.forEach(entry => {
        const entryDate = new Date(entry.date);
        if (entryDate.getFullYear() === displayDate.getFullYear() && entryDate.getMonth() === displayDate.getMonth()) {
            const year = entryDate.getFullYear();
            const month = String(entryDate.getMonth() + 1).padStart(2, '0');
            const day = String(entryDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            
            const color = getPartColor(entry.part);
            
            if (!styles.has(dateStr)) {
                styles.set(dateStr, [color]);
            } else {
                const currentColors = styles.get(dateStr)!;
                if (!currentColors.includes(color)) {
                    currentColors.push(color);
                }
            }
        }
    });
    return styles;
  }, [log, displayDate, bodyParts]);
  
  const getBackgroundStyle = (colors: string[] | undefined) => {
    if (!colors || colors.length === 0) return undefined;
    if (colors.length === 1) return { backgroundColor: colors[0] };

    const step = 100 / colors.length;
    let gradient = 'linear-gradient(135deg';
    
    colors.forEach((color, index) => {
        const start = index * step;
        const end = (index + 1) * step;
        gradient += `, ${color} ${start}% ${end}%`;
    });
    
    gradient += ')';
    return { background: gradient };
  };

  const handlePrevMonth = () => {
    setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    if (isCurrentMonth) return;
    setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  
  const handleDateClick = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    if (selectedDate === dateStr) {
      onDateSelect(null);
    } else {
      onDateSelect(dateStr);
    }
  };

  const monthStart = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
  const startDate = new Date(monthStart);
  const firstDayOfMonth = monthStart.getDay(); 
  const offset = (firstDayOfMonth + 1) % 7; 
  startDate.setDate(startDate.getDate() - offset);

  const calendarDays: Date[] = [];
  let currentDate = new Date(startDate);
  for (let i = 0; i < 42; i++) { 
    calendarDays.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const weekdays = language === 'ar' 
    ? ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
    : ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg ring-1 ring-white/10">
      <div className="flex items-center justify-between mb-6">
        <button 
            onClick={dir === 'rtl' ? handleNextMonth : handlePrevMonth}
            disabled={dir === 'rtl' && isCurrentMonth}
            className={`p-2 rounded-full transition-colors ${dir === 'rtl' && isCurrentMonth ? 'opacity-0 cursor-default' : 'hover:bg-gray-700 text-gray-300 hover:text-white'}`}
        >
           {dir === 'rtl' ? <ChevronRightIcon className="w-6 h-6" /> : <ChevronLeftIcon className="w-6 h-6" />}
        </button>

        <h3 className="font-bold text-xl bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
          {displayDate.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric', calendar: 'gregory' })}
        </h3>

        <button 
            onClick={dir === 'rtl' ? handlePrevMonth : handleNextMonth}
            disabled={dir === 'ltr' && isCurrentMonth} 
            className={`p-2 rounded-full transition-colors ${dir === 'ltr' && isCurrentMonth ? 'opacity-0 cursor-default' : 'hover:bg-gray-700 text-gray-300 hover:text-white'}`}
        >
             {dir === 'rtl' ? <ChevronLeftIcon className="w-6 h-6" /> : <ChevronRightIcon className="w-6 h-6" />}
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekdays.map(day => (
            <div key={day} className="font-bold text-gray-400 p-1 text-[10px] sm:text-sm truncate">
                {day}
            </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const isCurrentMonthDay = day.getMonth() === displayDate.getMonth();
          const isSelected = selectedDate ? isSameDay(day, new Date(selectedDate + 'T00:00:00')) : false;
          
          const year = day.getFullYear();
          const month = String(day.getMonth() + 1).padStart(2, '0');
          const date = String(day.getDate()).padStart(2, '0');
          const dayStr = `${year}-${month}-${date}`;
          
          const colors = dayStyles.get(dayStr);
          const style = getBackgroundStyle(colors);

          const baseClasses = "w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-all duration-300 text-xs sm:text-base relative z-10 group border-2";
          let dayClasses = "";
          
          if (isSelected) {
            dayClasses = "bg-white text-gray-900 font-bold scale-110 shadow-lg border-blue-500";
          } else if (style) {
            dayClasses = "text-white font-bold shadow-md hover:opacity-90 border-transparent";
          } else if (isCurrentMonthDay) {
            dayClasses = "text-gray-200 hover:bg-gray-700 border-transparent";
          } else {
            dayClasses = "text-gray-600 border-transparent";
          }
          
          return (
            <div key={index} className="flex justify-center items-center p-1">
                <button 
                    disabled={!isCurrentMonthDay} 
                    onClick={() => handleDateClick(day)} 
                    className={`${baseClasses} ${dayClasses}`}
                    style={!isSelected && isCurrentMonthDay ? style : undefined}
                >
                    {day.getDate()}
                </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
