import React, { useState, useMemo } from 'react';
import type { WorkoutEntry } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface CalendarViewProps {
  log: WorkoutEntry[];
  selectedDate: string | null;
  onDateSelect: (date: string | null) => void;
}

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

export const CalendarView: React.FC<CalendarViewProps> = ({ log, selectedDate, onDateSelect }) => {
  const [displayDate, setDisplayDate] = useState(new Date());

  const workoutDaysInMonth = useMemo(() => {
    const dates = new Set<string>();
    log.forEach(entry => {
        const entryDate = new Date(entry.date);
        if (entryDate.getFullYear() === displayDate.getFullYear() && entryDate.getMonth() === displayDate.getMonth()) {
            // Convert to local date string for accurate matching
            const year = entryDate.getFullYear();
            const month = String(entryDate.getMonth() + 1).padStart(2, '0');
            const day = String(entryDate.getDate()).padStart(2, '0');
            dates.add(`${year}-${month}-${day}`);
        }
    });
    return dates;
  }, [log, displayDate]);
  
  const handlePrevMonth = () => {
    setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  
  const handleDateClick = (date: Date) => {
    // FIX: Construct YYYY-MM-DD from local date parts to avoid timezone conversion issues from toISOString()
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    if (selectedDate === dateStr) {
      onDateSelect(null); // Toggle off
    } else {
      onDateSelect(dateStr); // Select
    }
  };

  const monthStart = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
  const startDate = new Date(monthStart);
  const firstDayOfMonth = monthStart.getDay(); // 0=Sun, 6=Sat
  const offset = (firstDayOfMonth + 1) % 7; // For Saturday start (day 6): if day is 6, offset is 0. If day is 0 (Sun), offset is 1.
  startDate.setDate(startDate.getDate() - offset);

  const calendarDays: Date[] = [];
  let currentDate = new Date(startDate);
  for (let i = 0; i < 42; i++) { // Always render 6 weeks
    calendarDays.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Right-to-left weekdays for Arabic calendar
  const weekdays = ['س', 'ج', 'خ', 'ر', 'ث', 'ن', 'ح'];

  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg ring-1 ring-white/10">
      <div className="flex items-center justify-between mb-4">
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-700 transition-colors"><ChevronRightIcon className="w-6 h-6" /></button>
        <h3 className="font-bold text-xl bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
          {displayDate.toLocaleString('ar-EG', { month: 'long', year: 'numeric', calendar: 'gregory' })}
        </h3>
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-700 transition-colors"><ChevronLeftIcon className="w-6 h-6" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {weekdays.map(day => <div key={day} className="font-semibold text-gray-400 p-2">{day}</div>)}
        {calendarDays.map((day, index) => {
          const year = day.getFullYear();
          const month = String(day.getMonth() + 1).padStart(2, '0');
          const date = String(day.getDate()).padStart(2, '0');
          const dayStr = `${year}-${month}-${date}`;

          const isCurrentMonth = day.getMonth() === displayDate.getMonth();
          // FIX: Parse selectedDate string as local time ('T00:00:00') to prevent timezone shifting.
          // new Date('YYYY-MM-DD') parses as UTC midnight, causing off-by-one errors.
          const isSelected = selectedDate ? isSameDay(day, new Date(selectedDate + 'T00:00:00')) : false;
          const hasWorkout = workoutDaysInMonth.has(dayStr);

          const baseClasses = "w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 text-base relative";
          let dayClasses = "";
          
          if (isSelected) {
            dayClasses = "bg-blue-500 text-white font-bold scale-110 shadow-lg";
          } else if (isCurrentMonth) {
            dayClasses = "text-gray-200 hover:bg-gray-700/70";
          } else {
            dayClasses = "text-gray-600";
          }
          
          return (
            <div key={index} className="flex justify-center items-center p-1">
                <button 
                    disabled={!isCurrentMonth} 
                    onClick={() => handleDateClick(day)} 
                    className={`${baseClasses} ${dayClasses}`}
                >
                    {day.getDate()}
                    {hasWorkout && !isSelected && (
                      <span className="absolute bottom-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    )}
                </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};