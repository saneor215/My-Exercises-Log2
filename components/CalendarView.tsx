
import React, { useState, useMemo } from 'react';
import type { WorkoutEntry, BodyPart } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface CalendarViewProps {
  log: WorkoutEntry[];
  selectedDate: string | null;
  onDateSelect: (date: string | null) => void;
  bodyParts: BodyPart[];
}

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

export const CalendarView: React.FC<CalendarViewProps> = ({ log, selectedDate, onDateSelect, bodyParts }) => {
  const [displayDate, setDisplayDate] = useState(new Date());
  const today = new Date();

  // Check if we are displaying the current month to hide the "Next" button
  const isCurrentMonth = displayDate.getMonth() === today.getMonth() && 
                         displayDate.getFullYear() === today.getFullYear();

  // Map date string to the dominant body part color/info for that day
  const workoutDaysInMonth = useMemo(() => {
    const dayInfo = new Map<string, string>(); // Date -> Color Class
    
    log.forEach(entry => {
        const entryDate = new Date(entry.date);
        if (entryDate.getFullYear() === displayDate.getFullYear() && entryDate.getMonth() === displayDate.getMonth()) {
            const year = entryDate.getFullYear();
            const month = String(entryDate.getMonth() + 1).padStart(2, '0');
            const day = String(entryDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            
            // If we haven't assigned a color to this day yet, find the body part color
            // Logic: Prioritize assigning a color if exists. 
            if (!dayInfo.has(dateStr)) {
                const part = bodyParts.find(p => p.id === entry.part);
                // Use the part's color or default to blue if not found
                const colorClass = part ? `bg-${part.color}-500` : 'bg-blue-500';
                dayInfo.set(dateStr, colorClass);
            }
        }
    });
    return dayInfo;
  }, [log, displayDate, bodyParts]);
  
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

  const weekdays = ['س', 'ج', 'خ', 'ر', 'ث', 'ن', 'ح'];

  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg ring-1 ring-white/10">
      <div className="flex items-center justify-between mb-6">
        {/* Next Month Button (Hidden if current month) */}
        <button 
            onClick={handleNextMonth} 
            disabled={isCurrentMonth}
            className={`p-2 rounded-full transition-colors ${isCurrentMonth ? 'opacity-0 cursor-default' : 'hover:bg-gray-700 text-gray-300 hover:text-white'}`}
        >
            <ChevronRightIcon className="w-6 h-6" />
        </button>

        <h3 className="font-bold text-xl bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
          {displayDate.toLocaleString('ar-EG', { month: 'long', year: 'numeric', calendar: 'gregory' })}
        </h3>

        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-700 transition-colors text-gray-300 hover:text-white">
            <ChevronLeftIcon className="w-6 h-6" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {weekdays.map(day => <div key={day} className="font-semibold text-gray-400 p-2 mb-2">{day}</div>)}
        {calendarDays.map((day, index) => {
          const year = day.getFullYear();
          const month = String(day.getMonth() + 1).padStart(2, '0');
          const date = String(day.getDate()).padStart(2, '0');
          const dayStr = `${year}-${month}-${date}`;

          const isCurrentMonthDay = day.getMonth() === displayDate.getMonth();
          const isSelected = selectedDate ? isSameDay(day, new Date(selectedDate + 'T00:00:00')) : false;
          const colorClass = workoutDaysInMonth.get(dayStr);

          const baseClasses = "w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 text-base relative z-10 group";
          let dayClasses = "";
          
          if (isSelected) {
            // Selected day: White background with distinct ring/text
            dayClasses = "bg-white text-gray-900 font-bold scale-110 shadow-lg ring-4 ring-blue-500";
          } else if (colorClass) {
            // Workout day: Full background color
            dayClasses = `${colorClass} text-white font-bold shadow-md hover:opacity-90`;
          } else if (isCurrentMonthDay) {
             // Normal day
            dayClasses = "text-gray-200 hover:bg-gray-700";
          } else {
             // Other month day
            dayClasses = "text-gray-600";
          }
          
          return (
            <div key={index} className="flex justify-center items-center p-1">
                <button 
                    disabled={!isCurrentMonthDay} 
                    onClick={() => handleDateClick(day)} 
                    className={`${baseClasses} ${dayClasses}`}
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
