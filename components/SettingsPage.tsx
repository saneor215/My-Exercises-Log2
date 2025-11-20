
import React, { useState, useRef, useMemo } from 'react';
import type { BodyPart, Exercise, BodyPartId, WorkoutRoutine, NutritionGoals, FoodItem, AppData, WeeklySchedule } from '../types';
import { TrashIcon, XIcon, PencilIcon, SaveIcon, ImportIcon, ExportIcon, BookOpenIcon, CalendarIcon } from './Icons';
import { Modal } from './Modal';
import { ManageRoutineModal } from './ManageRoutineModal';
import { ManageFoodItemModal } from './ManageFoodItemModal';
import { WEEKDAYS_MAP } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsPageProps {
  bodyParts: BodyPart[];
  setBodyParts: React.Dispatch<React.SetStateAction<BodyPart[]>>;
  exercises: Record<BodyPartId, Exercise[]>;
  setExercises: React.Dispatch<React.SetStateAction<Record<BodyPartId, Exercise[]>>>;
  routines: WorkoutRoutine[];
  addRoutine: (routine: Omit<WorkoutRoutine, 'id'>) => void;
  updateRoutine: (routine: WorkoutRoutine) => void;
  deleteRoutine: (id: string) => void;
  weeklySchedule: WeeklySchedule;
  setWeeklySchedule: React.Dispatch<React.SetStateAction<WeeklySchedule>>;
  nutritionGoals: NutritionGoals;
  setNutritionGoals: React.Dispatch<React.SetStateAction<NutritionGoals>>;
  foodDatabase: FoodItem[];
  addFoodToDatabase: (food: Omit<FoodItem, 'id'>) => FoodItem;
  updateFoodInDatabase: (food: FoodItem) => void;
  deleteFoodFromDatabase: (id: string) => void;
  onImportData: (data: AppData) => void;
  onExportData: () => AppData;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 500;
            let width = img.width;
            let height = img.height;

            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            } else {
                resolve(base64);
            }
        };
        img.onerror = () => resolve(base64);
    });
};

const COLOR_SCHEMES = [
    { color: 'rose', gradient: 'from-rose-500 to-pink-500' },
    { color: 'fuchsia', gradient: 'from-fuchsia-500 to-purple-500' },
    { color: 'indigo', gradient: 'from-indigo-500 to-blue-500' },
    { color: 'teal', gradient: 'from-teal-500 to-cyan-500' },
    { color: 'orange', gradient: 'from-orange-500 to-amber-500' },
];
const EMOJI_ICONS = ['💪', '🔥', ' Cardio', '🧘', '🤸', '🏋️'];

const ManagePartModal: React.FC<{
  part: BodyPart;
  exercisesForPart: Exercise[];
  onClose: () => void;
  onUpdatePartName: (newName: string) => void;
  onUpdateExercise: (index: number, updatedExercise: Exercise) => void;
  onAddExercise: (newExercise: Exercise) => void;
  onDeleteExercise: (index: number) => void;
}> = ({ part, exercisesForPart, onClose, onUpdatePartName, onUpdateExercise, onAddExercise, onDeleteExercise }) => {
    const { t } = useLanguage();
    const [partName, setPartName] = useState(part.name);
    const [newExerciseName, setNewExerciseName] = useState('');
    const [newExerciseImage, setNewExerciseImage] = useState<string | null>(null);
    const newExerciseFileRef = useRef<HTMLInputElement>(null);
    const [exerciseToDelete, setExerciseToDelete] = useState<number | null>(null);
    const [isProcessingImage, setIsProcessingImage] = useState(false);

    const handleImageUpload = async (file: File, callback: (base64: string) => void) => {
        if (file && file.type.startsWith('image/')) {
            setIsProcessingImage(true);
            try {
                const rawBase64 = await fileToBase64(file);
                const compressedBase64 = await compressImage(rawBase64);
                callback(compressedBase64);
            } catch (error) {
                console.error("Error converting file:", error);
                alert("Failed to upload image");
            } finally {
                setIsProcessingImage(false);
            }
        }
    };
    
    const handleUpdatePartName = () => {
        if(partName.trim() && partName.trim() !== part.name) {
            onUpdatePartName(partName.trim());
        }
    }

    const handleAddNewExercise = () => {
        if (!newExerciseName.trim() || !newExerciseImage) {
            alert("Please enter name and image");
            return;
        }
        const newExercise = { name: newExerciseName.trim(), image: newExerciseImage };
        onAddExercise(newExercise);
        setNewExerciseName('');
        setNewExerciseImage(null);
        if (newExerciseFileRef.current) newExerciseFileRef.current.value = '';
    }
    
    const confirmDeleteExercise = () => {
        if (exerciseToDelete === null) return;
        onDeleteExercise(exerciseToDelete);
        setExerciseToDelete(null);
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl p-6 ring-1 ring-white/10 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">{t('manage_part')}: {t(`part_${part.id}` as any) || part.name}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700"><XIcon className="w-6 h-6"/></button>
                </div>
                
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('edit_part_name')}</label>
                    <div className="flex gap-2">
                        <input type="text" value={partName} onChange={e => setPartName(e.target.value)} onBlur={handleUpdatePartName} className="flex-grow bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button onClick={handleUpdatePartName} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg">{t('save_name')}</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4">
                    <h3 className="text-xl font-bold text-gray-200 border-b border-gray-700 pb-2">{t('exercises_list')}</h3>
                    {exercisesForPart.map((exercise, index) => (
                        <div key={index} className="bg-gray-700/50 p-3 rounded-lg flex items-center gap-4">
                            <img src={exercise.image} alt={exercise.name} className="w-16 h-16 rounded-md object-cover"/>
                            <div className="flex-grow space-y-2">
                                <input type="text" value={exercise.name} onChange={e => {
                                    onUpdateExercise(index, {...exercise, name: e.target.value});
                                }} className="w-full bg-gray-600 text-white px-3 py-1.5 rounded-md"/>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    disabled={isProcessingImage}
                                    onChange={e => e.target.files && handleImageUpload(e.target.files[0], base64 => {
                                        onUpdateExercise(index, {...exercise, image: base64});
                                    })} 
                                    className="w-full text-sm text-gray-400 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-300 hover:file:bg-blue-500/30 disabled:opacity-50"
                                />
                            </div>
                            <button onClick={() => setExerciseToDelete(index)} className="p-2 rounded-full hover:bg-red-500/20 text-red-400"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    ))}
                </div>
                 
                <div className="mt-6 pt-4 border-t border-gray-700">
                     <h3 className="text-xl font-bold text-gray-200 mb-2">{t('add_new_exercise')}</h3>
                     <div className="flex items-start gap-4">
                        <div className="flex-grow space-y-2">
                           <input type="text" value={newExerciseName} onChange={e => setNewExerciseName(e.target.value)} placeholder={t('exercise_name_new')} className="w-full bg-gray-700 text-white px-3 py-2 rounded-md"/>
                           <input 
                                ref={newExerciseFileRef} 
                                type="file" 
                                accept="image/*" 
                                disabled={isProcessingImage}
                                onChange={e => e.target.files && handleImageUpload(e.target.files[0], base64 => setNewExerciseImage(base64))} 
                                className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 disabled:opacity-50"
                           />
                        </div>
                        {newExerciseImage && <img src={newExerciseImage} alt="Preview" className="w-16 h-16 rounded-md object-cover"/>}
                        <button onClick={handleAddNewExercise} disabled={isProcessingImage} className="self-center bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg h-full disabled:bg-gray-600">
                            {isProcessingImage ? t('uploading') : t('add')}
                        </button>
                     </div>
                </div>

                <Modal
                    isOpen={exerciseToDelete !== null}
                    onClose={() => setExerciseToDelete(null)}
                    onConfirm={confirmDeleteExercise}
                    title={t('confirm_delete_part')} 
                    confirmText={t('delete')}
                    cancelText={t('cancel')}
                >
                    <p>Delete this exercise?</p>
                </Modal>
            </div>
        </div>
    );
};

export const SettingsPage: React.FC<SettingsPageProps> = (props) => {
    const { t, dir, language } = useLanguage();
    const { bodyParts, setBodyParts, exercises, setExercises, routines, addRoutine, updateRoutine, deleteRoutine, weeklySchedule, setWeeklySchedule } = props;
    const { nutritionGoals, setNutritionGoals, foodDatabase, addFoodToDatabase, updateFoodInDatabase, deleteFoodFromDatabase } = props;
    const { onImportData, onExportData } = props;

    const [managingPart, setManagingPart] = useState<BodyPart | null>(null);
    const [partToDelete, setPartToDelete] = useState<BodyPart | null>(null);
    const [managingRoutine, setManagingRoutine] = useState<WorkoutRoutine | 'new' | null>(null);
    const [routineToDelete, setRoutineToDelete] = useState<WorkoutRoutine | null>(null);
    const [managingFoodItem, setManagingFoodItem] = useState<FoodItem | 'new' | null>(null);
    const [foodItemToDelete, setFoodItemToDelete] = useState<FoodItem | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const [newPartName, setNewPartName] = useState('');
    const [editedGoals, setEditedGoals] = useState(nutritionGoals);
    const [foodSearch, setFoodSearch] = useState('');
    const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const importedDataRef = useRef<AppData | null>(null);

    const filteredFoodDatabase = useMemo(() => {
        if (!foodSearch) return [];
        const searchLower = foodSearch.toLowerCase();
        return foodDatabase.filter(item =>
            item.name.toLowerCase().includes(searchLower) ||
            item.keywords?.some(k => k.toLowerCase().includes(searchLower))
        ).slice(0, 10);
    }, [foodSearch, foodDatabase]);

    const handleAddPart = () => {
        if (!newPartName.trim()) {
            alert("Please enter a part name");
            return;
        }
        const newPartId = newPartName.trim().toLowerCase().replace(/\s+/g, '-');
        if (bodyParts.some(p => p.id === newPartId)) { alert('Exists'); return; }
        const colorScheme = COLOR_SCHEMES[bodyParts.length % COLOR_SCHEMES.length];
        const icon = EMOJI_ICONS[bodyParts.length % EMOJI_ICONS.length];
        setBodyParts(prev => [...prev, { id: newPartId, name: newPartName.trim(), icon, ...colorScheme }]);
        setExercises(prev => ({ ...prev, [newPartId]: [] }));
        setNewPartName('');
    };
    
    const confirmDeletePart = () => {
        if (!partToDelete) return;
        setBodyParts(prev => prev.filter(p => p.id !== partToDelete.id));
        setExercises(prev => { const newExercises = { ...prev }; delete newExercises[partToDelete.id]; return newExercises; });
        setPartToDelete(null);
    };

    const handleUpdatePartName = (partId: BodyPartId, newName: string) => {
        setBodyParts(prev => prev.map(p => p.id === partId ? {...p, name: newName} : p));
        setManagingPart(prev => prev ? {...prev, name: newName} : null);
    };
    const handleExerciseUpdate = (partId: BodyPartId, exIndex: number, updatedExercise: Exercise) => setExercises(prev => ({ ...prev, [partId]: prev[partId].map((ex, i) => i === exIndex ? updatedExercise : ex) }));
    const handleExerciseAdd = (partId: BodyPartId, newExercise: Exercise) => setExercises(prev => ({ ...prev, [partId]: [...(prev[partId] || []), newExercise] }));
    const handleExerciseDelete = (partId: BodyPartId, exIndex: number) => setExercises(prev => ({ ...prev, [partId]: prev[partId].filter((_, i) => i !== exIndex) }));
    const confirmDeleteRoutine = () => { if (routineToDelete) { deleteRoutine(routineToDelete.id); setRoutineToDelete(null); }};
    
    const handleScheduleChange = (dayId: string, routineId: string) => {
        setWeeklySchedule(prev => ({
            ...prev,
            [dayId]: routineId || null
        }));
    };

    const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedGoals(prev => ({ ...prev, [name]: Number(value) || 0 }));
    };
    
    const handleSaveFoodItem = (foodData: Omit<FoodItem, 'id'> | FoodItem) => {
        if ('id' in foodData) {
            updateFoodInDatabase(foodData);
            setSelectedFoodItem(foodData);
        } else {
            const newFood = addFoodToDatabase(foodData);
            setSelectedFoodItem(newFood);
        }
        setFoodSearch('');
    };
    
    const handleDeleteFoodItem = (item: FoodItem) => {
        setFoodItemToDelete(item);
    }
    const confirmDeleteFoodItem = () => { 
        if(foodItemToDelete) { 
            deleteFoodFromDatabase(foodItemToDelete.id); 
            setFoodItemToDelete(null);
            if(selectedFoodItem?.id === foodItemToDelete.id) {
                setSelectedFoodItem(null);
            }
        }
    };

    const handleExport = () => {
        const data = onExportData();
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const timestamp = new Date().toISOString().slice(0, 10);
        link.download = `workout-app-backup-${timestamp}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                if (data && data.log && data.foodDatabase) {
                    importedDataRef.current = data;
                    setIsImportModalOpen(true);
                } else { throw new Error("Invalid file"); }
            } catch (error) { alert(`Import failed. ${error instanceof Error ? error.message : "Unknown"}`); }
            finally { if (event.target) event.target.value = ''; }
        };
        reader.readAsText(file);
    };

    const confirmImport = () => {
        if (importedDataRef.current) { onImportData(importedDataRef.current); }
        setIsImportModalOpen(false);
        importedDataRef.current = null;
    };


    return (
        <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg ring-1 ring-white/10 space-y-12">
            
            <section>
                <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent mb-6">{t('settings_workout')}</h2>
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-200">{t('current_parts')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {bodyParts.map(part => (
                            <div key={part.id} className="bg-gray-700/50 rounded-xl shadow-lg flex flex-col overflow-hidden ring-1 ring-white/10">
                                <div className={`p-4 bg-gradient-to-r ${part.gradient}`}>
                                    <span className="font-bold text-lg text-white">{part.icon} {t(`part_${part.id}` as any) || part.name}</span>
                                </div>
                                <div className="p-3 flex items-center justify-end gap-2">
                                    <button onClick={() => setManagingPart(part)} className="flex-grow bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-3 rounded-lg text-sm transition-colors">
                                        {t('manage_exercises')}
                                    </button>
                                    <button onClick={() => setPartToDelete(part)} className="flex-shrink-0 p-2 rounded-full bg-gray-600 hover:bg-red-500/90 text-gray-300 hover:text-white transition-colors">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="pt-8 mt-8 border-t border-gray-700">
                    <h3 className="text-xl font-bold text-gray-200 mb-2">{t('add_part')}</h3>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input type="text" value={newPartName} onChange={e => setNewPartName(e.target.value)} placeholder={t('part_placeholder')} className="flex-grow bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        <button onClick={handleAddPart} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg">{t('add_part_btn')}</button>
                    </div>
                </div>
                <div className="pt-8 mt-8 border-t border-gray-700 space-y-4">
                    <h3 className="text-xl font-bold text-gray-200">{t('workout_plans')}</h3>
                     {routines.map(routine => (
                        <div key={routine.id} className="bg-gray-700/50 p-4 rounded-lg flex items-center justify-between">
                            <span className="font-bold text-lg text-white">{routine.name}</span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setManagingRoutine(routine)} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg text-sm">{t('edit')}</button>
                                <button onClick={() => setRoutineToDelete(routine)} className="p-2 rounded-full bg-red-600/80 hover:bg-red-500 text-white"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                    ))}
                    <button onClick={() => setManagingRoutine('new')} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg">{t('create_new_plan')}</button>
                </div>

                 <div className="pt-8 mt-8 border-t border-gray-700">
                    <div className="flex items-center gap-2 mb-4">
                        <CalendarIcon className="w-6 h-6 text-yellow-400" />
                        <h3 className="text-xl font-bold text-gray-200">{t('weekly_schedule')}</h3>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">{t('schedule_desc')}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {WEEKDAYS_MAP.map((day, idx) => (
                            <div key={day.id} className="bg-gray-700/50 p-4 rounded-lg flex items-center justify-between gap-4">
                                <span className="font-bold text-white min-w-[60px]">
                                    {language === 'ar' ? day.name : ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'][idx]}
                                </span>
                                <div className="relative flex-grow">
                                    <select 
                                        value={weeklySchedule[day.id] || ''} 
                                        onChange={(e) => handleScheduleChange(day.id, e.target.value)}
                                        className="w-full bg-gray-600 text-white px-3 py-2 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">{t('rest_day')}</option>
                                        {routines.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                     <div className={`pointer-events-none absolute inset-y-0 ${dir === 'rtl' ? 'left-0' : 'right-0'} flex items-center px-2 text-gray-400`}>
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="pt-8 border-t border-gray-700">
                <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-lime-300 bg-clip-text text-transparent mb-6">{t('settings_nutrition')}</h2>
                <div>
                    <h3 className="text-xl font-bold text-gray-200 mb-4">{t('daily_goals')}</h3>
                    <div className="space-y-4 md:space-y-0 md:flex md:items-end md:gap-4 flex-wrap">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-grow">
                             <div>
                                <label htmlFor="goal-calories" className="block text-sm font-medium text-gray-200 mb-1">{t('calories')}</label>
                                <input id="goal-calories" type="number" name="calories" value={editedGoals.calories} onChange={handleGoalChange} placeholder="2000" className="w-full bg-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="goal-protein" className="block text-sm font-medium text-gray-200 mb-1">{t('protein')}</label>
                                <input id="goal-protein" type="number" name="protein" value={editedGoals.protein} onChange={handleGoalChange} placeholder="150" className="w-full bg-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="goal-carbs" className="block text-sm font-medium text-gray-200 mb-1">{t('carbs')}</label>
                                <input id="goal-carbs" type="number" name="carbs" value={editedGoals.carbs} onChange={handleGoalChange} placeholder="200" className="w-full bg-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="goal-fat" className="block text-sm font-medium text-gray-200 mb-1">{t('fat')}</label>
                                <input id="goal-fat" type="number" name="fat" value={editedGoals.fat} onChange={handleGoalChange} placeholder="65" className="w-full bg-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>
                        <button onClick={() => setNutritionGoals(editedGoals)} className="w-full sm:w-auto flex-shrink-0 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg h-10">{t('save_goals')}</button>
                    </div>
                </div>
                <div className="pt-8 mt-8 border-t border-gray-700">
                    <h3 className="text-xl font-bold text-gray-200 mb-2">{t('food_db')}</h3>
                    <div className="relative">
                        <input 
                            type="text"
                            value={foodSearch}
                            onChange={e => {
                                setFoodSearch(e.target.value);
                                setSelectedFoodItem(null);
                            }}
                            placeholder={t('search_food')}
                            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {foodSearch && (
                             <div className="absolute z-10 w-full mt-1 bg-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {filteredFoodDatabase.length > 0 ? (
                                    filteredFoodDatabase.map(item => (
                                        <button key={item.id} onClick={() => { setSelectedFoodItem(item); setFoodSearch(''); }} className={`block w-full ${dir === 'rtl' ? 'text-right' : 'text-left'} px-4 py-3 hover:bg-gray-500 transition-colors`}>
                                            {item.name}
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-gray-400">{t('no_results')}</div>
                                )}
                            </div>
                        )}
                    </div>

                    {selectedFoodItem && (
                         <div className="mt-4 bg-gray-700/50 p-4 rounded-lg animate-fade-in">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-xl text-white">{selectedFoodItem.name} <span className="text-base text-gray-400">({selectedFoodItem.servingSize})</span></p>
                                    <p className="text-base text-gray-300">
                                        <span className="text-yellow-400">{selectedFoodItem.calories} {t('calories')}</span> • <span className="text-sky-400">{selectedFoodItem.protein} {t('protein')}</span> • <span className="text-orange-400">{selectedFoodItem.carbs} {t('carbs')}</span> • <span className="text-amber-400">{selectedFoodItem.fat} {t('fat')}</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setManagingFoodItem(selectedFoodItem)} className="p-3 rounded-full text-gray-300 hover:bg-blue-500/20 hover:text-blue-400 transition-colors">
                                        <PencilIcon className="w-6 h-6"/>
                                    </button>
                                    <button onClick={() => handleDeleteFoodItem(selectedFoodItem)} className="p-3 rounded-full text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-colors">
                                        <TrashIcon className="w-6 h-6"/>
                                    </button>
                                </div>
                            </div>
                         </div>
                    )}
                    
                    <button onClick={() => setManagingFoodItem('new')} className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold">
                        <BookOpenIcon className="w-5 h-5" /> {t('add_new_item')}
                    </button>
                </div>
            </section>
            
            <section className="pt-8 border-t border-gray-700">
                <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-6">{t('settings_data')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={handleExport} className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-lg">
                        <ExportIcon className="w-5 h-5"/> <span>{t('export_all')}</span>
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg">
                        <ImportIcon className="w-5 h-5"/> <span>{t('import_all')}</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".json" className="hidden" />
                </div>
            </section>


            {managingPart && (<ManagePartModal part={managingPart} exercisesForPart={exercises[managingPart.id] || []} onClose={() => setManagingPart(null)} onUpdatePartName={(newName) => handleUpdatePartName(managingPart.id, newName)} onUpdateExercise={(index, updatedEx) => handleExerciseUpdate(managingPart.id, index, updatedEx)} onAddExercise={(newEx) => handleExerciseAdd(managingPart.id, newEx)} onDeleteExercise={(index) => handleExerciseDelete(managingPart.id, index)}/>)}
            {managingRoutine && (<ManageRoutineModal isOpen={!!managingRoutine} onClose={() => setManagingRoutine(null)} routineToEdit={managingRoutine === 'new' ? undefined : managingRoutine} bodyParts={bodyParts} exercises={exercises} onSave={(routineData) => { if (managingRoutine === 'new') { addRoutine(routineData); } else if (managingRoutine.id) { updateRoutine({ ...routineData, id: managingRoutine.id }); } setManagingRoutine(null); }}/>)}
            {managingFoodItem && (<ManageFoodItemModal isOpen={!!managingFoodItem} onClose={() => setManagingFoodItem(null)} itemToEdit={managingFoodItem === 'new' ? undefined : managingFoodItem} onSave={handleSaveFoodItem} />)}
            
            <Modal isOpen={!!partToDelete} onClose={() => setPartToDelete(null)} onConfirm={confirmDeletePart} title={t('confirm_delete_part')} confirmText={t('delete')} cancelText={t('cancel')}><p>{t('confirm_delete_part_msg', {name: partToDelete?.name || ''})}</p></Modal>
            <Modal isOpen={!!routineToDelete} onClose={() => setRoutineToDelete(null)} onConfirm={confirmDeleteRoutine} title={t('confirm_delete_plan')} confirmText={t('delete')} cancelText={t('cancel')}><p>{t('confirm_delete_plan_msg', {name: routineToDelete?.name || ''})}</p></Modal>
            <Modal isOpen={!!foodItemToDelete} onClose={() => setFoodItemToDelete(null)} onConfirm={confirmDeleteFoodItem} title={t('confirm_delete_food')} confirmText={t('delete')} cancelText={t('cancel')}><p>{t('confirm_delete_food_msg', {name: foodItemToDelete?.name || ''})}</p></Modal>
            <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onConfirm={confirmImport} title={t('confirm_import')} confirmText={t('import_yes')} cancelText={t('cancel')}><p>{t('confirm_import_msg')}</p></Modal>
        </div>
    );
};
