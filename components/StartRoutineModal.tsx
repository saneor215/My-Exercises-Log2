
import React, { useState, useEffect } from 'react';
import type { BodyPart, Exercise, BodyPartId, WorkoutRoutine, WorkoutEntry, RoutineExercise } from '../types';
import { XIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface StartRoutineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (entries: Omit<WorkoutEntry, 'id' | 'date' | 'image'>[]) => void;
    routines: WorkoutRoutine[];
    bodyParts: BodyPart[];
    exercises: Record<BodyPartId, Exercise[]>;
    log: WorkoutEntry[];
    initialRoutineId?: string;
}

type EntryData = {
    weight: string;
    reps: string;
    comment: string;
}

export const StartRoutineModal: React.FC<StartRoutineModalProps> = ({
    isOpen, onClose, onSave, routines, bodyParts, exercises, log, initialRoutineId
}) => {
    const { t } = useLanguage();
    const [selectedRoutineId, setSelectedRoutineId] = useState<string>('');
    const [week, setWeek] = useState('');
    const [entriesData, setEntriesData] = useState<EntryData[]>([]);
    
    const selectedRoutine = routines.find(r => r.id === selectedRoutineId);
    
    useEffect(() => {
        if (isOpen) {
            if (initialRoutineId) {
                setSelectedRoutineId(initialRoutineId);
            } else if (routines.length > 0 && !selectedRoutineId) {
                setSelectedRoutineId(routines[0].id);
            }
        }
    }, [isOpen, initialRoutineId, routines, selectedRoutineId]);

    useEffect(() => {
        if (isOpen) {
            if (log.length > 0) {
                const maxWeek = Math.max(...log.map(e => e.week));
                setWeek(String(maxWeek));
            } else {
                setWeek('1');
            }
        }
    }, [isOpen, log]);

    useEffect(() => {
        if (selectedRoutine) {
            const newEntries = selectedRoutine.exercises.map(re => {
                const exerciseHistory = log.filter(e => e.exercise === re.exerciseName);
                exerciseHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                const lastEntry = exerciseHistory[0];
                
                return { 
                    weight: lastEntry ? String(lastEntry.weight) : '', 
                    reps: lastEntry ? String(lastEntry.reps) : '', 
                    comment: '' 
                };
            });
            setEntriesData(newEntries);
        } else {
            setEntriesData([]);
        }
    }, [selectedRoutine, log]);
    
    if (!isOpen) return null;

    const handleDataChange = (index: number, field: keyof EntryData, value: string) => {
        const newEntries = [...entriesData];
        newEntries[index][field] = value;
        setEntriesData(newEntries);
    };

    const getExerciseDetails = (re: RoutineExercise): Exercise | null => {
        return exercises[re.partId]?.find(e => e.name === re.exerciseName) || null;
    };

    const handleSaveAll = () => {
        if (!selectedRoutine) return;

        const weekNum = parseInt(week, 10);
        if (isNaN(weekNum) || weekNum <= 0) {
            alert(t('alert_valid_week'));
            return;
        }

        const entriesToSave: Omit<WorkoutEntry, 'id' | 'date' | 'image'>[] = [];
        for (let i = 0; i < selectedRoutine.exercises.length; i++) {
            const routineEx = selectedRoutine.exercises[i];
            const data = entriesData[i];
            const weightNum = parseFloat(data.weight);
            const repsNum = parseInt(data.reps, 10);

            if (!data.weight && !data.reps) continue;

            if (isNaN(weightNum) || isNaN(repsNum) || weightNum <= 0 || repsNum <= 0) {
                alert(t('alert_valid_weight') + `: ${routineEx.exerciseName}`);
                return;
            }
            
            entriesToSave.push({
                part: routineEx.partId,
                exercise: routineEx.exerciseName,
                weight: weightNum,
                reps: repsNum,
                week: weekNum,
                comment: data.comment.trim() || undefined,
            });
        }
        
        if (entriesToSave.length === 0) {
            alert(t('alert_enter_valid'));
            return;
        }

        onSave(entriesToSave);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl ring-1 ring-white/10 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 sm:p-6 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl sm:text-2xl font-bold text-white">{t('start_plan')}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white"><XIcon className="w-6 h-6"/></button>
                </div>
                
                <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-700/30 p-4 rounded-xl">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">{t('plan_selected')}</label>
                            <select value={selectedRoutineId} onChange={e => setSelectedRoutineId(e.target.value)} className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {routines.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">{t('week_num')}</label>
                            <input type="number" min="1" value={week} onChange={e => setWeek(e.target.value)} placeholder="4" className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-center" required />
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        {selectedRoutine && selectedRoutine.exercises.map((re, index) => {
                             const details = getExerciseDetails(re);
                             const data = entriesData[index];
                             if (!data) return null;
                             return (
                                <div key={index} className="bg-gray-700/50 p-4 rounded-xl border border-gray-600/30">
                                    <div className="flex items-center gap-4 mb-4">
                                        {details?.image && <img src={details.image} alt={re.exerciseName} className="w-14 h-14 rounded-lg object-cover bg-gray-600" />}
                                        <div>
                                            <p className="font-bold text-lg text-white leading-tight">{re.exerciseName}</p>
                                            <p className="text-sm text-gray-400">{details?.name || re.exerciseName}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1 text-center">{t('weight')} ({t('kg')})</label>
                                            <input type="number" inputMode="decimal" value={data.weight} onChange={e => handleDataChange(index, 'weight', e.target.value)} placeholder={data.weight ? `${data.weight}` : "-"} className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-bold text-lg" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1 text-center">{t('reps')}</label>
                                            <input type="number" inputMode="numeric" value={data.reps} onChange={e => handleDataChange(index, 'reps', e.target.value)} placeholder={data.reps ? `${data.reps}` : "-"} className="w-full bg-gray-800 border border-gray-600 text-white px-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-bold text-lg" />
                                        </div>
                                    </div>
                                    <input type="text" value={data.comment} onChange={e => handleDataChange(index, 'comment', e.target.value)} placeholder={t('notes')} className="w-full bg-gray-700/50 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm placeholder-gray-500" />
                                </div>
                             );
                        })}
                    </div>
                </div>
                
                <div className="p-4 sm:p-6 border-t border-gray-700 bg-gray-800 rounded-b-2xl flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold transition-colors">{t('cancel')}</button>
                    <button onClick={handleSaveAll} className="flex-[2] py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg transition-colors">{t('save_all')}</button>
                </div>
            </div>
        </div>
    );
};
