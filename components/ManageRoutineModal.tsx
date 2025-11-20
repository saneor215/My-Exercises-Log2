import React, { useState, useEffect } from 'react';
import type { BodyPart, Exercise, BodyPartId, WorkoutRoutine, RoutineExercise } from '../types';
import { XIcon, TrashIcon } from './Icons';

interface ManageRoutineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (routine: Omit<WorkoutRoutine, 'id'>) => void;
    routineToEdit?: WorkoutRoutine;
    bodyParts: BodyPart[];
    exercises: Record<BodyPartId, Exercise[]>;
}

export const ManageRoutineModal: React.FC<ManageRoutineModalProps> = ({
    isOpen, onClose, onSave, routineToEdit, bodyParts, exercises
}) => {
    const [name, setName] = useState('');
    const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>([]);
    const [selectedPart, setSelectedPart] = useState<BodyPartId>('');
    const [selectedExercise, setSelectedExercise] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            if (routineToEdit) {
                setName(routineToEdit.name);
                setRoutineExercises(routineToEdit.exercises);
            } else {
                setName('');
                setRoutineExercises([]);
            }
            setSelectedPart(bodyParts.length > 0 ? bodyParts[0].id : '');
        }
    }, [routineToEdit, isOpen, bodyParts]);
    
    useEffect(() => {
        if(selectedPart && exercises[selectedPart]?.length > 0) {
            setSelectedExercise(exercises[selectedPart][0].name);
        } else {
            setSelectedExercise('');
        }
    }, [selectedPart, exercises]);

    if (!isOpen) return null;

    const handleAddExercise = () => {
        if (!selectedPart || !selectedExercise) return;
        setRoutineExercises(prev => [...prev, { partId: selectedPart, exerciseName: selectedExercise }]);
    };

    const handleRemoveExercise = (index: number) => {
        setRoutineExercises(prev => prev.filter((_, i) => i !== index));
    };
    
    const getExerciseDetails = (re: RoutineExercise): (Exercise & { partName: string }) | null => {
        const part = bodyParts.find(p => p.id === re.partId);
        const exercise = exercises[re.partId]?.find(e => e.name === re.exerciseName);
        if (part && exercise) {
            return { ...exercise, partName: part.name };
        }
        return null;
    };

    const handleSave = () => {
        if (!name.trim()) {
            alert('الرجاء إدخال اسم للخطة.');
            return;
        }
        if (routineExercises.length === 0) {
            alert('الرجاء إضافة تمرين واحد على الأقل للخطة.');
            return;
        }
        onSave({ name: name.trim(), exercises: routineExercises });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl p-6 ring-1 ring-white/10 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">{routineToEdit ? 'تعديل الخطة' : 'إنشاء خطة جديدة'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700"><XIcon className="w-6 h-6"/></button>
                </div>

                <div className="mb-4">
                    <label htmlFor="routine-name" className="block text-sm font-medium text-gray-300 mb-2">اسم الخطة</label>
                    <input id="routine-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="مثال: يوم الدفع" className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-200 mb-2">إضافة تمرين</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <select value={selectedPart} onChange={e => setSelectedPart(e.target.value)} className="md:col-span-1 bg-gray-700 text-white px-3 py-2 rounded-lg">
                            {bodyParts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <select value={selectedExercise} onChange={e => setSelectedExercise(e.target.value)} disabled={!selectedPart || !exercises[selectedPart] || exercises[selectedPart].length === 0} className="md:col-span-1 bg-gray-700 text-white px-3 py-2 rounded-lg">
                            {exercises[selectedPart]?.map(ex => <option key={ex.name} value={ex.name}>{ex.name}</option>)}
                        </select>
                        <button onClick={handleAddExercise} disabled={!selectedExercise} className="md:col-span-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-600">إضافة</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-2 border-t border-gray-700 pt-4">
                    <h3 className="text-lg font-bold text-gray-200 mb-2">تمارين الخطة</h3>
                    {routineExercises.length > 0 ? routineExercises.map((re, index) => {
                        const details = getExerciseDetails(re);
                        return (
                            <div key={index} className="bg-gray-700/50 p-2 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-white">{details?.name || re.exerciseName}</p>
                                    <p className="text-sm text-gray-400">{details?.partName || re.partId}</p>
                                </div>
                                <button onClick={() => handleRemoveExercise(index)} className="p-2 rounded-full hover:bg-red-500/20 text-red-400"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        );
                    }) : <p className="text-gray-500 text-center py-4">لم تتم إضافة أي تمارين بعد.</p>}
                </div>
                
                <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-gray-700">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-semibold">إلغاء</button>
                    <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">حفظ الخطة</button>
                </div>
            </div>
        </div>
    );
};
