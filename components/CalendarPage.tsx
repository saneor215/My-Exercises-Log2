
import React, { useState, useMemo } from 'react';
import type { WorkoutEntry, BodyPart, Exercise, BodyPartId, WeeklySchedule, WorkoutRoutine } from '../types';
import { CalendarView } from './CalendarView';
import { LogItem } from './LogItem';
import { EditWorkoutModal } from './EditWorkoutModal';
import { ImageModal } from './ImageModal';
import { useLanguage } from '../contexts/LanguageContext';

interface CalendarPageProps {
  log: WorkoutEntry[];
  onDeleteEntry: (id: string) => void;
  onUpdateEntry: (entry: WorkoutEntry) => void;
  bodyParts: BodyPart[];
  exercises: Record<BodyPartId, Exercise[]>;
  weeklySchedule?: WeeklySchedule;
  routines?: WorkoutRoutine[];
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ log, onDeleteEntry, onUpdateEntry, bodyParts, exercises, weeklySchedule, routines }) => {
    const { t, language } = useLanguage();
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [editingEntry, setEditingEntry] = useState<WorkoutEntry | null>(null);
    const [viewingImage, setViewingImage] = useState<{src: string; alt: string} | null>(null);
    
    const validLog = useMemo(() => {
        return log.filter(entry => 
            entry && 
            typeof entry === 'object' &&
            entry.id &&
            entry.part &&
            entry.exercise &&
            typeof entry.weight === 'number' &&
            typeof entry.reps === 'number' &&
            typeof entry.week === 'number' &&
            entry.date
        );
    }, [log]);

    const filteredLog = useMemo(() => {
        if (!selectedDate) return [];
        const [year, month, day] = selectedDate.split('-').map(Number);
        const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
        const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
        
        return validLog.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= startOfDay && entryDate <= endOfDay;
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [validLog, selectedDate]);
    
    const entriesByPart = useMemo(() => {
        return filteredLog.reduce((acc, entry) => {
            if (!acc[entry.part]) acc[entry.part] = [];
            acc[entry.part].push(entry);
            return acc;
        }, {} as Record<string, WorkoutEntry[]>);
    }, [filteredLog]);

    const daySummary = useMemo(() => {
      if (filteredLog.length === 0) return null;
      const totalSets = filteredLog.length;
      const totalVolume = filteredLog.reduce((sum, e) => sum + (e.weight * e.reps), 0);
      const uniqueExercises = new Set(filteredLog.map(e => e.exercise)).size;
      const weekNum = filteredLog[0].week;
      return { totalSets, totalVolume, uniqueExercises, weekNum };
    }, [filteredLog]);

    const uniqueDayParts = useMemo(() => {
      const partIds = new Set(filteredLog.map(e => e.part));
      return bodyParts.filter(p => partIds.has(p.id));
    }, [filteredLog, bodyParts]);

    const scheduledRoutineForSelectedDate = useMemo<WorkoutRoutine | null>(() => {
        if (!selectedDate || !weeklySchedule || !routines) return null;
        const [year, month, day] = selectedDate.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        const dayIndex = dateObj.getDay().toString();
        
        const routineId = weeklySchedule[dayIndex];
        if (!routineId) return null;
        
        return routines.find(r => r.id === routineId) || null;
    }, [selectedDate, weeklySchedule, routines]);

    const handleUpdate = (updatedEntry: WorkoutEntry) => {
        onUpdateEntry(updatedEntry);
        setEditingEntry(null);
    };

    const formattedSelectedDate = useMemo(() => {
        if (!selectedDate) return '';
        const date = new Date(selectedDate + 'T00:00:00');
        return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            calendar: 'gregory',
        });
    }, [selectedDate, language]);

    return (
        <div className="space-y-8">
            <CalendarView 
                log={validLog}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                bodyParts={bodyParts}
            />

            {selectedDate && (
                <div className="bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg ring-1 ring-white/10 animate-fade-in">
                    <h3 className="font-bold text-2xl bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent mb-6 text-center">
                        {formattedSelectedDate}
                    </h3>

                    {filteredLog.length > 0 ? (
                        <div className="space-y-6">
                            <div className="flex justify-center gap-3 flex-wrap">
                                {uniqueDayParts.map(part => (
                                    <div key={part.id} className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${part.gradient} text-white shadow-lg transform hover:scale-105 transition-transform cursor-default`}>
                                        <span className="text-2xl">{part.icon}</span>
                                        <span className="font-bold text-lg">{t(`part_${part.id}` as any) || part.name}</span>
                                    </div>
                                ))}
                            </div>

                            {daySummary && (
                                <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center bg-gray-700/30 p-4 rounded-xl border border-gray-600/20">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">{t('week')}</p>
                                        <p className="text-lg sm:text-xl font-bold text-yellow-400">{daySummary.weekNum}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">{t('exercises')}</p>
                                        <p className="text-lg sm:text-xl font-bold text-blue-400">{daySummary.uniqueExercises}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">{t('sets')}</p>
                                        <p className="text-lg sm:text-xl font-bold text-cyan-400">{daySummary.totalSets}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">{t('volume')}</p>
                                        <p className="text-lg sm:text-xl font-bold text-purple-400">{(daySummary.totalVolume / 1000).toFixed(1)}k</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6">
                                {Object.entries(entriesByPart).map(([partId, partEntries]) => {
                                    const part = bodyParts.find(p => p.id === partId);
                                    return (
                                        <div key={partId} className="bg-gray-900/30 border border-gray-700/50 p-4 rounded-2xl">
                                            <h4 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
                                                {part?.icon} {t('exercises')} {t(`part_${part?.id}` as any) || part?.name}
                                            </h4>
                                            <div className="space-y-3">
                                                {partEntries.map(entry => (
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
                        </div>
                    ) : scheduledRoutineForSelectedDate ? (
                         <div className="text-center p-8 border-2 border-dashed border-blue-500/30 bg-blue-900/10 rounded-xl">
                                <p className="text-lg font-bold text-blue-200 mb-2">{t('day_schedule')} {scheduledRoutineForSelectedDate.name}</p>
                                <p className="text-gray-400 mb-4">{t('not_logged_yet')}</p>
                                <ul className={`text-sm text-gray-300 space-y-1 mb-4 inline-block ${language === 'ar' ? 'text-right' : 'text-left'} bg-gray-800/50 p-4 rounded-lg`}>
                                    {scheduledRoutineForSelectedDate.exercises.map((ex, idx) => (
                                        <li key={idx} className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                            {ex.exerciseName}
                                        </li>
                                    ))}
                                </ul>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 p-8 border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center">
                            <p>{t('no_logs_day')}</p>
                        </div>
                    )}
                </div>
            )}
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
