
import React, { useState, useMemo, useEffect } from 'react';
import type { NutritionGoals, FoodItem, DailyDietLog, MealType, LoggedFood, MicronutrientInfo, DietPlan } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, PlusCircleIcon, TrashIcon, XIcon, SaveIcon, BookOpenIcon } from './Icons';
import { ManageFoodItemModal } from './ManageFoodItemModal';
import { MICRONUTRIENTS_LIST } from '../constants';

// Helper to format date to 'YYYY-MM-DD'
const toYMD = (date: Date) => date.toISOString().split('T')[0];

// --- Sub-components ---

const TotalsSummary: React.FC<{ totals: Record<string, number>, goals: NutritionGoals, consumedMicronutrients: MicronutrientInfo[] }> = ({ totals, goals, consumedMicronutrients }) => {
    const macroInfo = [
        { name: 'بروتين', value: totals.protein, goal: goals.protein, unit: 'جرام', color: 'bg-sky-500' },
        { name: 'كربوهيدرات', value: totals.carbs, goal: goals.carbs, unit: 'جرام', color: 'bg-orange-500' },
        { name: 'دهون', value: totals.fat, goal: goals.fat, unit: 'جرام', color: 'bg-amber-500' },
    ];

    const caloriePercent = goals.calories > 0 ? (totals.calories / goals.calories) * 100 : 0;

    return (
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg ring-1 ring-white/10">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent mb-6">ملخص اليوم</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col items-center justify-center">
                    <div className="relative w-32 h-32">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#4a5568" strokeWidth="3" />
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#4f46e5" strokeWidth="3" strokeDasharray={`${caloriePercent}, 100`} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-white">{Math.round(totals.calories)}</span>
                            <span className="text-sm text-gray-400">/{goals.calories} سعرة</span>
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    {macroInfo.map(macro => (
                        <div key={macro.name}>
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="font-semibold text-gray-300">{macro.name}</span>
                                <span className="text-sm text-gray-400">{Math.round(macro.value)} / {macro.goal}{macro.unit}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                                <div className={`${macro.color} h-2.5 rounded-full`} style={{ width: `${Math.min(100, (macro.value / (macro.goal || 1)) * 100)}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {consumedMicronutrients.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">الفيتامينات والمعادن التي تم استهلاكها اليوم:</h3>
                    <div className="flex flex-wrap gap-2">
                        {consumedMicronutrients.map(micro => (
                            <span key={micro.name} className="bg-gray-700 text-gray-200 text-sm font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5">
                                {micro.emoji} {micro.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const AddFoodModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    foodDatabase: FoodItem[];
    onLogFood: (foodId: string, servings: number) => void;
    onAddNewFood: () => void;
}> = ({ isOpen, onClose, foodDatabase, onLogFood, onAddNewFood }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
    const [servings, setServings] = useState('1');

    useEffect(() => {
        if (!isOpen) {
            // Delay reset to avoid UI flicker while modal closes
            setTimeout(() => {
                setSearchQuery('');
                setSelectedFoodId(null);
                setServings('1');
            }, 300);
        }
    }, [isOpen]);

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const searchLower = searchQuery.toLowerCase();
        return foodDatabase.filter(food =>
            food.name.toLowerCase().includes(searchLower) ||
            food.keywords?.some(k => k.toLowerCase().includes(searchLower))
        ).slice(0, 7); // Limit results for performance
    }, [searchQuery, foodDatabase]);
    
    const selectedFood = useMemo(() => {
        return foodDatabase.find(f => f.id === selectedFoodId);
    }, [selectedFoodId, foodDatabase]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const servingsNum = parseFloat(servings);
        if (!selectedFoodId || isNaN(servingsNum) || servingsNum <= 0) {
            alert("يرجى اختيار طعام وإدخال كمية صالحة.");
            return;
        }
        onLogFood(selectedFoodId, servingsNum);
        onClose();
    };

    const handleSelectFood = (food: FoodItem) => {
        setSelectedFoodId(food.id);
        setSearchQuery(food.name); // Populate input for clarity
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 ring-1 ring-white/10" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-white mb-4">إضافة طعام</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="food-search" className="block text-sm text-gray-400 mb-1">ابحث في قاعدة البيانات</label>
                        <div className="relative">
                            <input
                                id="food-search"
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="مثال: صدر دجاج"
                                className="w-full bg-gray-700 text-white p-2 rounded-lg"
                                autoComplete="off"
                            />
                            {searchResults.length > 0 && searchQuery !== selectedFood?.name && (
                                <div className="absolute z-10 w-full mt-1 bg-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {searchResults.map(food => (
                                        <button
                                            type="button"
                                            key={food.id}
                                            onClick={() => handleSelectFood(food)}
                                            className="block w-full text-right px-3 py-2 hover:bg-gray-500 transition-colors"
                                        >
                                            {food.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button type="button" onClick={onAddNewFood} className="text-sm text-blue-400 hover:underline mt-2">...أو أضف عنصرًا جديدًا لقاعدة البيانات</button>
                    </div>
                    <div>
                        <label htmlFor="food-servings" className="block text-sm text-gray-400 mb-1">الكمية ({selectedFood?.servingSize || 'حصص'})</label>
                        <input id="food-servings" type="number" step="0.1" min="0.1" value={servings} onChange={e => setServings(e.target.value)} className="w-full bg-gray-700 text-white p-2 rounded-lg" disabled={!selectedFoodId} />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-lg">إلغاء</button>
                        <button type="submit" className="px-4 py-2 bg-emerald-600 rounded-lg" disabled={!selectedFoodId}>إضافة</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Main Component ---
interface DietPageProps {
    goals: NutritionGoals;
    foodDatabase: FoodItem[];
    dailyLogs: DailyDietLog;
    dietPlan: DietPlan;
    onLogFood: (date: string, meal: MealType, foodId: string, servings: number) => void;
    onRemoveLoggedFood: (date: string, meal: MealType, loggedFoodId: string) => void;
    onAddFoodToDatabase: (food: Omit<FoodItem, 'id'>) => FoodItem;
    onUpdateDietPlan: (plan: DietPlan) => void;
}

export const DietPage: React.FC<DietPageProps> = ({ goals, foodDatabase, dailyLogs, dietPlan, onLogFood, onRemoveLoggedFood, onAddFoodToDatabase, onUpdateDietPlan }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [addingFoodTo, setAddingFoodTo] = useState<MealType | null>(null);
    const [isManageFoodModalOpen, setIsManageFoodModalOpen] = useState(false);
    const [isEditingPlan, setIsEditingPlan] = useState(false);

    const selectedDateStr = toYMD(selectedDate);
    
    // Fallback logic: Use specific day log if it exists (even if empty, provided user touched it), otherwise use template.
    // Checking `dailyLogs[selectedDateStr] !== undefined` allows distinguishing between "untouched day" and "day cleared by user".
    // However, since our delete logic might keep the day object, this check is safe.
    const currentDayLog = dailyLogs[selectedDateStr] !== undefined ? dailyLogs[selectedDateStr] : dietPlan;

    // If editing plan, we use the dietPlan directly. If viewing day, we use currentDayLog.
    const displayLog = isEditingPlan ? dietPlan : currentDayLog;

    const { totals, consumedMicronutrients } = useMemo(() => {
        const dailyTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        const micros = new Set<string>();

        const meals = Object.values(displayLog) as (LoggedFood[] | undefined)[];
        meals.forEach(meal => {
             if (Array.isArray(meal)) {
                 meal.forEach(loggedFood => {
                    const foodItem = foodDatabase.find(f => f.id === loggedFood.foodId);
                    if (foodItem) {
                        dailyTotals.calories += foodItem.calories * loggedFood.servings;
                        dailyTotals.protein += foodItem.protein * loggedFood.servings;
                        dailyTotals.carbs += foodItem.carbs * loggedFood.servings;
                        dailyTotals.fat += foodItem.fat * loggedFood.servings;
                        foodItem.micronutrients?.forEach(micro => micros.add(micro));
                    }
                 });
             }
        });

        const consumedMicronutrientsInfo = MICRONUTRIENTS_LIST.filter(m => micros.has(m.name));

        return { totals: dailyTotals, consumedMicronutrients: consumedMicronutrientsInfo };
    }, [displayLog, foodDatabase]);

    const changeDate = (amount: number) => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + amount);
            return newDate;
        });
    };
    
    const mealTitles: Record<MealType, string> = {
        breakfast: '🍳 الفطور',
        lunch: '🍽️ الغداء',
        dinner: '🌙 العشاء',
        postWorkout: '🏋️‍♂️ بعد التمرين',
        snacks: '🍏 وجبات خفيفة',
    };

    const handleAddNewFood = () => {
        setAddingFoodTo(null);
        setIsManageFoodModalOpen(true);
    };
    
    const handleSaveNewFood = (foodData: Omit<FoodItem, 'id'> | FoodItem) => {
        if (!('id' in foodData)) {
            onAddFoodToDatabase(foodData);
        }
    };

    // Handler for adding food based on mode
    const handleLogFood = (foodId: string, servings: number) => {
        if (!addingFoodTo) return;
        
        if (isEditingPlan) {
            // Update the template directly
            const newLoggedFood: LoggedFood = { id: crypto.randomUUID(), foodId, servings };
            const updatedPlan = { ...dietPlan };
            const mealLog = updatedPlan[addingFoodTo] ? [...updatedPlan[addingFoodTo]!] : [];
            mealLog.push(newLoggedFood);
            updatedPlan[addingFoodTo] = mealLog;
            onUpdateDietPlan(updatedPlan);
        } else {
            // Update daily log (handles fallback copy internally in App.tsx)
            onLogFood(selectedDateStr, addingFoodTo, foodId, servings);
        }
    };

    // Handler for removing food based on mode
    const handleRemoveFood = (meal: MealType, loggedFoodId: string) => {
        if (isEditingPlan) {
            const updatedPlan = { ...dietPlan };
            if (updatedPlan[meal]) {
                updatedPlan[meal] = updatedPlan[meal]!.filter(f => f.id !== loggedFoodId);
                onUpdateDietPlan(updatedPlan);
            }
        } else {
            onRemoveLoggedFood(selectedDateStr, meal, loggedFoodId);
        }
    };

    return (
        <div className="space-y-8">
             <div className="flex justify-between items-center bg-gray-800 p-4 rounded-2xl shadow-md ring-1 ring-white/10">
                 {!isEditingPlan ? (
                     <>
                         <button onClick={() => changeDate(-1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronLeftIcon /></button>
                         <h2 className="text-xl font-bold text-white">{selectedDate.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', calendar: 'gregory' })}</h2>
                         <button onClick={() => changeDate(1)} className="p-2 rounded-full hover:bg-gray-700"><ChevronRightIcon /></button>
                     </>
                 ) : (
                     <div className="flex items-center justify-center w-full">
                         <h2 className="text-xl font-bold text-amber-400">تعديل الخطة الغذائية الثابتة</h2>
                     </div>
                 )}
             </div>
             
             <div className="flex justify-end">
                <button 
                    onClick={() => setIsEditingPlan(!isEditingPlan)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all shadow-md ${isEditingPlan ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-amber-600 hover:bg-amber-500 text-white'}`}
                >
                    {isEditingPlan ? (
                        <>
                             <SaveIcon className="w-5 h-5" />
                             <span>حفظ والعودة لليوميات</span>
                        </>
                    ) : (
                        <>
                             <BookOpenIcon className="w-5 h-5" />
                             <span>تعديل الخطة الثابتة</span>
                        </>
                    )}
                </button>
             </div>

             {isEditingPlan && (
                 <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-amber-200 text-sm text-center">
                     أنت الآن تقوم بتعديل الخطة الأساسية. أي تغييرات هنا ستظهر تلقائياً في جميع الأيام الجديدة أو الأيام التي لم تقم بتعديلها يدوياً.
                 </div>
             )}
             
             <TotalsSummary totals={totals} goals={goals} consumedMicronutrients={consumedMicronutrients} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(Object.keys(mealTitles) as MealType[]).map(meal => (
                    <div key={meal} className="bg-gray-800 p-4 rounded-2xl ring-1 ring-white/10 relative overflow-hidden">
                        {/* Visual indicator for using template in daily view */}
                        {!isEditingPlan && dailyLogs[selectedDateStr] === undefined && dietPlan[meal]?.length && (
                            <div className="absolute top-0 left-0 bg-blue-600/20 text-blue-300 text-[10px] px-2 py-1 rounded-br-lg">
                                من الخطة
                            </div>
                        )}
                        
                        <h3 className="text-lg font-bold text-teal-300 mb-3">{mealTitles[meal]}</h3>
                        <div className="space-y-2 mb-3">
                            {(displayLog[meal] || []).map(loggedFood => {
                                const foodItem = foodDatabase.find(f => f.id === loggedFood.foodId);
                                if (!foodItem) return null;
                                return (
                                    <div key={loggedFood.id} className="flex justify-between items-center bg-gray-700/50 p-2 rounded-lg text-sm">
                                        <div>
                                            <p className="font-semibold text-white">{foodItem.name}</p>
                                            <p className="text-gray-400">{loggedFood.servings} × {foodItem.servingSize} • {Math.round(foodItem.calories * loggedFood.servings)} سعرة</p>
                                        </div>
                                        <button onClick={() => handleRemoveFood(meal, loggedFood.id)} className="p-1 text-red-400 hover:text-red-300"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                );
                            })}
                        </div>
                        <button onClick={() => setAddingFoodTo(meal)} className="w-full flex items-center justify-center gap-2 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                            <PlusCircleIcon className="w-5 h-5" /> أضف طعام
                        </button>
                    </div>
                ))}
            </div>
            
            <AddFoodModal 
                isOpen={!!addingFoodTo}
                onClose={() => setAddingFoodTo(null)}
                foodDatabase={foodDatabase}
                onLogFood={handleLogFood}
                onAddNewFood={handleAddNewFood}
            />

            {isManageFoodModalOpen && (
                <ManageFoodItemModal
                    isOpen={isManageFoodModalOpen}
                    onClose={() => setIsManageFoodModalOpen(false)}
                    onSave={handleSaveNewFood}
                />
            )}
        </div>
    );
};
