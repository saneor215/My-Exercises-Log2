
import React, { useState, useMemo, useEffect } from 'react';
import type { WorkoutEntry, BodyPartId, BodyPart, Exercise } from '../types';
import { LogItem } from './LogItem';
import { Modal } from './Modal';
import { ImageModal } from './ImageModal';
import { EditWorkoutModal } from './EditWorkoutModal';
import { ClearIcon, CsvIcon, ActivityIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';

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
  const [selectedPartFilter, setSelectedPartFilter] = useState<string>('all');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WorkoutEntry | null>(null);
  const [viewingImage, setViewingImage] = useState<{src: string; alt: string} | null>(null);
  
  // Accordion State: Set of expanded dates
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  
  // Pagination State: Number of visible days
  const [visibleDaysCount, setVisibleDaysCount] = useState(7);

  // Helper: Get normalized date string YYYY-MM-DD
  const getDateStr = (dateStr: string) => {
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // 1. Filter Log based on selection
  const filteredLog = useMemo(() => {
      if (selectedPartFilter === 'all') return log;
      return log.filter(e => e.part === selectedPartFilter);
  }, [log, selectedPartFilter]);

  // 2. Group logs by Date
  const groupedLogs = useMemo(() => {
      const groups: Record<string, WorkoutEntry[]> = {};
      filteredLog.forEach(entry => {
          const dateStr = getDateStr(entry.date);
          if (!groups[dateStr]) groups[dateStr] = [];
          groups[dateStr].push(entry);
      });

      // Sort by date descending (Newest Day first)
      // BUT inside each day, sort exercises by time Ascending (Oldest Entry first)
      return Object.entries(groups)
          .map(([date, entries]) => ({ 
              date, 
              entries: entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) 
          }))
          .sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredLog]);
  
  // Auto-expand today or the first day if it's the only one
  useEffect(() => {
      if (groupedLogs.length > 0) {
          const today = getDateStr(new Date().toISOString());
          if (groupedLogs[0].date === today) {
              setExpandedDates(prev => new Set(prev).add(today));
          }
      }
  }, [groupedLogs.length]); // Only run when logs length changes significantly

  const toggleDay = (date: string) => {
      const newSet = new Set(expandedDates);
      if (newSet.has(date)) {
          newSet.delete(date);
      } else {
          newSet.add(date);
      }
      setExpandedDates(newSet);
  };
  
  const handleLoadMore = () => {
      setVisibleDaysCount(prev => prev + 7);
  };

  const handleUpdate = (updatedEntry: WorkoutEntry) => {
    onUpdateEntry(updatedEntry);
    setEditingEntry(null);
  };

  const handleClear = () => {
    onClearLog();
    setIsClearModalOpen(false);
  };

  const exportCSV = () => {
    const dataToExport = filteredLog.length > 0 ? filteredLog : log;
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

  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg ring-1 ring-white/10 h-full flex flex-col">
      
      {/* Header & Filters */}
      <div className="flex flex-col gap-4 mb-6 border-b border-gray-700 pb-6">
          <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  📊 سجل التمارين
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

          {/* Centered Body Part Filters */}
          <div className="flex justify-center w-full mt-2">
                <div className="flex gap-3 overflow-x-auto pb-2 px-4 no-scrollbar max-w-full items-center">
                    <button
                        onClick={() => setSelectedPartFilter('all')}
                        className={`flex flex-shrink-0 items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                            selectedPartFilter === 'all'
                            ? 'bg-white text-gray-900 shadow-lg scale-105 ring-2 ring-blue-400'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
                        }`}
                    >
                        الكل
                    </button>
                    {bodyParts.map(part => (
                        <button
                            key={part.id}
                            onClick={() => setSelectedPartFilter(part.id)}
                            className={`flex flex-shrink-0 items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                                selectedPartFilter === part.id
                                ? `bg-gradient-to-r ${part.gradient} text-white shadow-lg scale-105 ring-2 ring-white/30`
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
                            }`}
                        >
                            <span>{part.icon}</span>
                            <span>{part.name}</span>
                        </button>
                    ))}
                </div>
            </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4 custom-scrollbar">
          {groupedLogs.length > 0 ? (
              <>
                {groupedLogs.slice(0, visibleDaysCount).map(({ date, entries }) => {
                    const isExpanded = expandedDates.has(date);
                    
                    // Day Summary Stats
                    const totalVolume = entries.reduce((sum, e) => sum + (e.weight * e.reps), 0);
                    const totalSets = entries.length;
                    const uniqueExercisesCount = new Set(entries.map(e => e.exercise)).size;
                    
                    // Unique Body Parts for this day
                    const uniqueParts = Array.from(new Set(entries.map(e => e.part)))
                        .map(id => bodyParts.find(p => p.id === id)).filter(Boolean);

                    const formattedDate = new Date(date).toLocaleDateString('ar-EG', {
                         weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', calendar: 'gregory'
                    });

                    // Group entries by part for display inside the accordion
                    const entriesByPart = entries.reduce((acc, entry) => {
                        if (!acc[entry.part]) acc[entry.part] = [];
                        acc[entry.part].push(entry);
                        return acc;
                    }, {} as Record<string, WorkoutEntry[]>);

                    return (
                        <div key={date} className="rounded-2xl overflow-hidden ring-1 ring-white/5 transition-all duration-300">
                            {/* Header (Clickable) */}
                            <button 
                                onClick={() => toggleDay(date)}
                                className={`w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 text-right transition-colors duration-300 ${
                                    isExpanded ? 'bg-gray-700/80' : 'bg-gray-800 hover:bg-gray-700'
                                }`}
                            >
                                <div>
                                    <h4 className="text-lg font-bold text-white mb-2">{formattedDate}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {uniqueParts.map(part => part && (
                                            <span key={part.id} className={`text-xs px-2 py-1 rounded-md bg-gradient-to-r ${part.gradient} text-white font-bold shadow-sm flex items-center gap-1`}>
                                                {part.icon} {part.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0">
                                    <div className="flex gap-4 text-sm text-gray-400">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs text-gray-500">تمارين</span>
                                            <span className="font-bold text-blue-400">{uniqueExercisesCount}</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs text-gray-500">مجموعات</span>
                                            <span className="font-bold text-white">{totalSets}</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs text-gray-500">الحمل</span>
                                            <span className="font-bold text-purple-400">{(totalVolume / 1000).toFixed(1)}k</span>
                                        </div>
                                    </div>
                                    <div className={`text-gray-400 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                        <ChevronDownIcon className="w-6 h-6"/>
                                    </div>
                                </div>
                            </button>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <div className="bg-gray-900/30 border-t border-gray-700 p-4 animate-fade-in">
                                    {Object.entries(entriesByPart).map(([partId, partEntries]) => {
                                        const part = bodyParts.find(p => p.id === partId);
                                        return (
                                            <div key={partId} className="mb-6 last:mb-0">
                                                <h5 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
                                                    {part?.icon} تمارين {part?.name}
                                                </h5>
                                                <div className="space-y-3">
                                                    {(partEntries as WorkoutEntry[]).map(entry => (
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
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
                
                {visibleDaysCount < groupedLogs.length && (
                    <button 
                        onClick={handleLoadMore}
                        className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl font-bold transition-colors mt-4"
                    >
                        عرض المزيد من الأيام السابقة...
                    </button>
                )}
              </>
          ) : (
              <div className="flex flex-col items-center justify-center text-center text-gray-500 p-12 border-2 border-dashed border-gray-700 rounded-xl bg-gray-800/50 mt-4">
                <ActivityIcon className="w-16 h-16 mb-4 text-gray-600"/>
                <h4 className="text-xl font-bold text-gray-400">لا توجد سجلات</h4>
                <p className="text-sm mt-2">ابدأ بتسجيل تمارينك اليوم لتراها هنا!</p>
            </div>
          )}
      </div>

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
