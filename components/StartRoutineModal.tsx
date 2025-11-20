
import React, { useState, useEffect } from 'react';
import type { BodyPart, Exercise, BodyPartId, WorkoutRoutine, WorkoutEntry, RoutineExercise } from '../types';
import { XIcon } from './Icons';

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
    const [selectedRoutineId, setSelectedRoutineId] = useState<string>('');
    const [week, setWeek] = useState('');
    const [entriesData, setEntriesData] = useState<EntryData[]>([]);
    
    const selectedRoutine = routines.find(r => r.id === selectedRoutineId);
    
    // Handle Initial Routine Selection
    useEffect(() => {
        if (isOpen) {
            if (initialRoutineId) {
                setSelectedRoutineId(initialRoutineId);
            } else if (routines.length > 0 && !selectedRoutineId) {
                setSelectedRoutineId(routines[0].id);
            }
        }
    }, [isOpen, initialRoutineId, routines, selectedRoutineId]);

    // Suggest Week Number based on history
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

    // Auto-fill weights from history
    useEffect(() => {
        if (selectedRoutine) {
            const newEntries = selectedRoutine.exercises.map(re => {
                // Find the most recent entry for this exercise
                const lastEntry = log.find(e => e.exercise === re.exerciseName);
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
            alert("الرجاء إدخال رقم أسبوع صحيح.");
            return;
        }

        const entriesToSave: Omit<WorkoutEntry, 'id' | 'date' | 'image'>[] = [];
        for (let i = 0; i < selectedRoutine.exercises.length; i++) {
            const routineEx = selectedRoutine.exercises[i];
            const data = entriesData[i];
            const weightNum = parseFloat(data.weight);
            const repsNum = parseInt(data.reps, 10);

            // Allow saving even if some exercises are not filled
            if (!data.weight && !data.reps) continue;

            if (isNaN(weightNum) || isNaN(repsNum) || weightNum <= 0 || repsNum <= 0) {
                alert(`الرجاء إدخال قيم صالحة للتمرين: ${routineEx.exerciseName}`);
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
            alert("الرجاء إدخال بيانات تمرين واحد على الأقل.");
            return;
        }

        onSave(entriesToSave);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl p-6 ring-1 ring-white/10 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">بدء تمرين من خطة</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700"><XIcon className="w-6 h-6"/></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">الخطة المختارة</label>
                        <select value={selectedRoutineId} onChange={e => setSelectedRoutineId(e.target.value)} className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            {routines.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">رقم الأسبوع</label>
                        <input type="number" min="1" value={week} onChange={e => setWeek(e.target.value)} placeholder="رقم الأسبوع" className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4 border-t border-gray-700 pt-4">
                    {selectedRoutine && selectedRoutine.exercises.map((re, index) => {
                         const details = getExerciseDetails(re);
                         const data = entriesData[index];
                         if (!data) return null;
                         return (
                            <div key={index} className="bg-gray-700/50 p-3 rounded-lg">
                                <div className="flex items-center gap-4 mb-3">
                                    {details?.image && <img src={details.image} alt={re.exerciseName} className="w-16 h-16 rounded-md object-cover" />}
                                    <p className="font-semibold text-lg text-white">{re.exerciseName}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <input type="number" value={data.weight} onChange={e => handleDataChange(index, 'weight', e.target.value)} placeholder="الوزن (كجم)" className="w-full bg-gray-600 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    <input type="number" value={data.reps} onChange={e => handleDataChange(index, 'reps', e.target.value)} placeholder="التكرارات" className="w-full bg-gray-600 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    <textarea value={data.comment} onChange={e => handleDataChange(index, 'comment', e.target.value)} placeholder="تعليق (اختياري)" rows={1} className="md:col-span-2 w-full bg-gray-600 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                                </div>
                            </div>
                         );
                    })}
                </div>
                
                <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-gray-700">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-semibold">إلغاء</button>
                    <button onClick={handleSaveAll} className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg">حفظ كل التمارين</button>
                </div>
            </div>
        </div>
    );
};
