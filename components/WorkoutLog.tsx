
import React, { useState, useMemo, useEffect } from 'react';
import type { WorkoutEntry, BodyPartId, BodyPart, Exercise } from '../types';
import { LogItem } from './LogItem';
import { Modal } from './Modal';
import { ImageModal } from './ImageModal';
import { EditWorkoutModal } from './EditWorkoutModal';
import { ClearIcon, CsvIcon, ActivityIcon, ChevronRightIcon, ChevronLeftIcon, CalendarIcon } from './Icons';

interface WorkoutLogProps {
  log: WorkoutEntry[];
  onDeleteEntry: (id: string) => void;
  onUpdateEntry: (entry: WorkoutEntry) => void;
  onClearLog: () => void;
  showIntro: boolean;
  bodyParts: BodyPart[];
  exercises: Record<BodyPartId, Exercise[]>;
}

export const WorkoutLog: React.FC<WorkoutLogProps> = ({ log, onDeleteEntry, onUpdateEntry, onClearLog, showIntro, bodyParts, exercises }) => {
  // Calculate today string once to use across component
  const todayStr = useMemo(() => {
      const today = new Date();
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }, []);

  // State for the currently viewed date string (YYYY-MM-DD)
  const [viewDate, setViewDate] = useState<string>(todayStr);
  
  const [selectedPartFilter, setSelectedPartFilter] = useState<string>('all');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WorkoutEntry | null>(null);
  const [viewingImage, setViewingImage] = useState<{src: string; alt: string} | null>(null);

  // Helper: Get normalized date string YYYY-MM-DD
  const getDateStr = (dateStr: string) => {
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // 0. Filter the entire log based on the selected Body Part first
  const filteredGlobalLog = useMemo(() => {
      if (selectedPartFilter === 'all') return log;
      return log.filter(e => e.part === selectedPartFilter);
  }, [log, selectedPartFilter]);

  // 1. Get all unique dates that have logs (respecting the filter), sorted descending (newest first)
  const activeDates = useMemo(() => {
      const dates = new Set<string>();
      filteredGlobalLog.forEach(entry => {
          if (entry.date) {
              dates.add(getDateStr(entry.date));
          }
      });
      return Array.from(dates).sort((a, b) => b.localeCompare(a));
  }, [filteredGlobalLog]);

  // 2. Get available weeks for the dropdown filter (respecting the filter) with Month Context
  const availableWeeks = useMemo(() => {
      const weeksMap = new Map<number, string>();
      
      filteredGlobalLog.forEach(entry => {
          if (!weeksMap.has(entry.week)) {
              // Get the month name from the first entry found for this week
              const date = new Date(entry.date);
              const monthName = date.toLocaleDateString('ar-EG', { month: 'long' });
              weeksMap.set(entry.week, monthName);
          }
      });

      // Sort by week number descending
      return Array.from(weeksMap.entries())
          .sort((a, b) => b[0] - a[0])
          .map(([weekNum, monthName]) => ({ weekNum, monthName }));
  }, [filteredGlobalLog]);

  // 3. Filter logs for the current viewDate (from the globally filtered log)
  const dailyLogs = useMemo(() => {
      return filteredGlobalLog.filter(entry => getDateStr(entry.date) === viewDate);
  }, [filteredGlobalLog, viewDate]);

  // Effect: When filter changes, if current viewDate becomes invalid (empty), jump to the newest valid date
  // EXCEPT if today is selected, we want to stay on today even if empty.
  useEffect(() => {
      // Only auto-jump if:
      // 1. We have some logs in history (activeDates > 0)
      // 2. The current viewDate is NOT in those active logs (meaning it's empty based on current filter)
      // 3. AND critically: The current viewDate is NOT today. (Always allow viewing today).
      if (activeDates.length > 0 && !activeDates.includes(viewDate) && viewDate !== todayStr) {
          setViewDate(activeDates[0]);
      }
  }, [selectedPartFilter, activeDates, viewDate, todayStr]);

  // Navigation Handlers
  const handlePrevDay = () => {
      const currentIndex = activeDates.indexOf(viewDate);
      if (currentIndex !== -1 && currentIndex < activeDates.length - 1) {
          setViewDate(activeDates[currentIndex + 1]);
      } else if (currentIndex === -1) {
          // If we are on "Today" (and it's empty), jump to the most recent log
          if (activeDates.length > 0 && viewDate > activeDates[0]) {
               setViewDate(activeDates[0]);
          } else {
               const olderDate = activeDates.find(d => d < viewDate);
               if (olderDate) setViewDate(olderDate);
          }
      }
  };

  const handleNextDay = () => {
      const currentIndex = activeDates.indexOf(viewDate);
      if (currentIndex > 0) {
          setViewDate(activeDates[currentIndex - 1]);
      } else if (currentIndex === -1) {
           // If we are on an old date and want to go newer
           const newerDate = [...activeDates].reverse().find(d => d > viewDate);
           if (newerDate) setViewDate(newerDate);
           else if (viewDate < todayStr) setViewDate(todayStr);
      } else if (currentIndex === 0 && viewDate !== todayStr) {
           // If we are at the newest log, next step is Today
           setViewDate(todayStr);
      }
  };

  const handleJumpToWeek = (week: number) => {
      const entry = filteredGlobalLog.find(e => e.week === week);
      if (entry) {
          setViewDate(getDateStr(entry.date));
      }
  };

  const handleJumpToToday = () => {
      // FIX: Reset filter to 'all' when jumping to today to ensure visibility regardless of previous filter
      setSelectedPartFilter('all');
      setViewDate(todayStr);
  };
  
  const daySummary = useMemo(() => {
      if (dailyLogs.length === 0) return null;
      const totalSets = dailyLogs.length;
      const totalVolume = dailyLogs.reduce((sum, e) => sum + (e.weight * e.reps), 0);
      const parts = [...new Set(dailyLogs.map(e => bodyParts.find(p => p.id === e.part)?.name || '?'))];
      const weekNum = dailyLogs[0].week;
      return { totalSets, totalVolume, parts, weekNum };
  }, [dailyLogs, bodyParts]);


  const handleUpdate = (updatedEntry: WorkoutEntry) => {
    onUpdateEntry(updatedEntry);
    setEditingEntry(null);
  };

  const handleClear = () => {
    onClearLog();
    setIsClearModalOpen(false);
  };

  const exportCSV = () => {
    const dataToExport = filteredGlobalLog.length > 0 ? filteredGlobalLog : log;
    if (dataToExport.length === 0) {
      alert("لا يوجد بيانات للتصدير");
      return;
    }
    const headers = ["الأسبوع", "الجزء", "التمرين", "الوزن (كجم)", "التكرارات", "التاريخ", "تعليق"];
    const rows = dataToExport.map(entry => {
        const partName = bodyParts.find(p => p.id === entry.part)?.name || entry.part;
        return [
            entry.week,
            partName, 
            entry.exercise, 
            entry.weight, 
            entry.reps, 
            new Date(entry.date).toLocaleString('ar-SA', { calendar: 'gregory' }),
            entry.comment || ''
        ];
    });

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `workout_log_${selectedPartFilter !== 'all' ? selectedPartFilter : 'full'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formattedDisplayDate = new Date(viewDate).toLocaleDateString('ar-EG', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', calendar: 'gregory'
  });

  const isToday = viewDate === todayStr;
  const hasNewerLogs = activeDates.some(d => d > viewDate) || (activeDates.length > 0 && viewDate < todayStr && !isToday);
  const hasOlderLogs = activeDates.some(d => d < viewDate);

  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg ring-1 ring-white/10 h-full flex flex-col">
      
      {/* Header & Navigation */}
      <div className="flex flex-col gap-4 mb-6 border-b border-gray-700 pb-6">
          <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  📊 السجل اليومي
              </h3>
              <div className="flex gap-2">
                  <button onClick={exportCSV} className="bg-gray-700 p-2 rounded-lg hover:bg-gray-600 text-green-400" title="تصدير CSV">
                      <CsvIcon className="w-5 h-5"/>
                  </button>
                  <button onClick={() => setIsClearModalOpen(true)} className="bg-gray-700 p-2 rounded-lg hover:bg-gray-600 text-red-400" title="مسح السجل">
                      <ClearIcon className="w-5 h-5"/>
                  </button>
              </div>
          </div>

          {/* Date Navigation Bar */}
          <div className="bg-gray-900/50 p-2 rounded-xl flex items-center justify-between shadow-inner">
              <button 
                  onClick={handlePrevDay} 
                  disabled={!hasOlderLogs}
                  className="p-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                  <ChevronRightIcon className="w-6 h-6" />
              </button>

              <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 text-lg font-bold text-white">
                      <CalendarIcon className="w-5 h-5 text-blue-400"/>
                      <span>{formattedDisplayDate}</span>
                  </div>
                  {isToday && <span className="text-xs text-green-400 font-bold">اليوم</span>}
              </div>

              <button 
                  onClick={handleNextDay} 
                  disabled={!hasNewerLogs && isToday}
                  className="p-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                  <ChevronLeftIcon className="w-6 h-6" />
              </button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-col gap-3">
                {/* Body Part Icons Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                     <button
                        onClick={() => setSelectedPartFilter('all')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                            selectedPartFilter === 'all'
                            ? 'bg-white text-gray-900 shadow-lg scale-105'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                    >
                        الكل
                    </button>
                    {bodyParts.map(part => (
                        <button
                            key={part.id}
                            onClick={() => setSelectedPartFilter(part.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                                selectedPartFilter === part.id
                                ? `bg-gradient-to-r ${part.gradient} text-white shadow-lg scale-105`
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                            }`}
                        >
                            <span>{part.icon}</span>
                            <span>{part.name}</span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center justify-between gap-2">
                    {/* Week Filter */}
                   {availableWeeks.length > 0 && (
                       <div className="relative flex-grow sm:flex-grow-0">
                           <select 
                            onChange={(e) => handleJumpToWeek(Number(e.target.value))}
                            value={daySummary?.weekNum || ''}
                            className="w-full bg-gray-700 text-white text-sm pl-3 pr-8 py-2 rounded-lg border-none focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                           >
                               <option value="" disabled>تصفح حسب الأسبوع...</option>
                               {availableWeeks.map(w => (
                                   <option key={w.weekNum} value={w.weekNum}>
                                       أسبوع {w.weekNum} ({w.monthName})
                                   </option>
                               ))}
                           </select>
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-gray-400">
                                 <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                       </div>
                   )}
                   
                   {!isToday && (
                       <button onClick={handleJumpToToday} className="px-3 py-2 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-sm font-bold transition-colors whitespace-nowrap">
                           عودة لليوم
                       </button>
                   )}
                </div>
          </div>
      </div>

      {/* Content Area */}
      {dailyLogs.length > 0 ? (
          <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4">
              {/* Day Stats */}
              {daySummary && (
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                      <div className="bg-gray-700/30 p-2 rounded-lg">
                          <p className="text-xs text-gray-400">الأسبوع</p>
                          <p className="text-lg font-bold text-yellow-400">{daySummary.weekNum}</p>
                      </div>
                       <div className="bg-gray-700/30 p-2 rounded-lg">
                          <p className="text-xs text-gray-400">مجموعات</p>
                          <p className="text-lg font-bold text-cyan-400">{daySummary.totalSets}</p>
                      </div>
                       <div className="bg-gray-700/30 p-2 rounded-lg" title="مجموع (الوزن × التكرارات) لكل التمارين">
                          <p className="text-xs text-gray-400">إجمالي الحمل (كجم)</p>
                          <p className="text-lg font-bold text-purple-400">{(daySummary.totalVolume / 1000).toFixed(1)}k</p>
                      </div>
                  </div>
              )}

              {/* Logs List */}
              <div className="space-y-3">
                {dailyLogs.map(entry => (
                    <LogItem 
                        key={entry.id} 
                        entry={entry}
                        bodyParts={bodyParts}
                        onDelete={onDeleteEntry}
                        onEditRequest={setEditingEntry}
                        onImageClick={setViewingImage}
                    />
                ))}
              </div>
          </div>
      ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 p-8 border-2 border-dashed border-gray-700 rounded-xl bg-gray-800/50">
            <ActivityIcon className="w-16 h-16 mb-4 text-gray-600"/>
            <h4 className="text-xl font-bold text-gray-400">
                {selectedPartFilter !== 'all' 
                    ? `لا توجد تمارين ${bodyParts.find(p => p.id === selectedPartFilter)?.name || ''} في هذا اليوم`
                    : "لا توجد تمارين لهذا اليوم"}
            </h4>
            <p className="mb-6 text-sm text-gray-500">
                {activeDates.length > 0 ? "استخدم الأسهم أو القائمة للتنقل بين الأيام المسجلة." : "ابدأ بتسجيل تمارينك الآن!"}
            </p>
            
            {activeDates.length > 0 && !isToday && (
                <button 
                    onClick={() => setViewDate(activeDates[0])}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-lg"
                >
                    الذهاب لآخر تمرين مسجل
                </button>
            )}
        </div>
      )}

      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleClear}
        title="تأكيد المسح"
        confirmText="نعم, امسح الكل"
        cancelText="إلغاء"
      >
        <p>هل أنت متأكد أنك تريد مسح جميع سجلات التمارين نهائياً؟</p>
      </Modal>

      {viewingImage && (
        <ImageModal 
            src={viewingImage.src}
            alt={viewingImage.alt}
            onClose={() => setViewingImage(null)}
        />
      )}
      
      {editingEntry && (
        <EditWorkoutModal 
            entry={editingEntry}
            onUpdate={handleUpdate}
            onClose={() => setEditingEntry(null)}
            exercises={exercises}
        />
      )}
    </div>
  );
};
