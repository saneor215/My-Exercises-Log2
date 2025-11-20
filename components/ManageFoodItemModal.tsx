import React, { useState, useEffect, useMemo } from 'react';
import type { FoodItem } from '../types';
import { MICRONUTRIENTS_LIST, INITIAL_FOOD_DATABASE } from '../constants';

interface ManageFoodItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (food: Omit<FoodItem, 'id'> | FoodItem) => void;
    itemToEdit?: FoodItem;
}

// Function to parse serving size string like "150g" or "150" into a number
const parseGrams = (size: string): number | null => {
    const match = size.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : null;
}


export const ManageFoodItemModal: React.FC<ManageFoodItemModalProps> = ({ isOpen, onClose, onSave, itemToEdit }) => {
    const [name, setName] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fat, setFat] = useState('');
    const [servingSize, setServingSize] = useState(''); // User input e.g. "150g"
    const [micronutrients, setMicronutrients] = useState<string[]>([]);
    
    const [suggestions, setSuggestions] = useState<FoodItem[]>([]);
    const [selectedBaseFood, setSelectedBaseFood] = useState<FoodItem | null>(null);

    // Populate form when editing an existing item
    useEffect(() => {
        if (itemToEdit) {
            setName(itemToEdit.name);
            setCalories(String(itemToEdit.calories));
            setProtein(String(itemToEdit.protein));
            setCarbs(String(itemToEdit.carbs));
            setFat(String(itemToEdit.fat));
            setServingSize(itemToEdit.servingSize);
            setMicronutrients(itemToEdit.micronutrients || []);
            setSelectedBaseFood(null); // Editing is manual mode
        } else {
            // Reset for new item
            setName(''); setCalories(''); setProtein(''); setCarbs(''); setFat(''); setServingSize('');
            setMicronutrients([]);
            setSelectedBaseFood(null);
        }
    }, [itemToEdit, isOpen]);
    
    // Generate suggestions as user types
    useEffect(() => {
        if (name.trim().length > 1 && !selectedBaseFood) {
            const searchLower = name.toLowerCase();
            const filtered = INITIAL_FOOD_DATABASE.filter(food => 
                food.name.toLowerCase().includes(searchLower) ||
                food.keywords?.some(k => k.toLowerCase().includes(searchLower))
            );
            setSuggestions(filtered.slice(0, 5));
        } else {
            setSuggestions([]);
        }
    }, [name, selectedBaseFood]);

    // Auto-calculate macros when serving size changes
    useEffect(() => {
        if (selectedBaseFood) {
            const grams = parseGrams(servingSize);
            if (grams !== null) {
                const baseGrams = parseGrams(selectedBaseFood.servingSize) || 100; // Assume 100g if not specified
                const ratio = grams / baseGrams;
                setCalories(String(parseFloat((selectedBaseFood.calories * ratio).toFixed(1))));
                setProtein(String(parseFloat((selectedBaseFood.protein * ratio).toFixed(1))));
                setCarbs(String(parseFloat((selectedBaseFood.carbs * ratio).toFixed(1))));
                setFat(String(parseFloat((selectedBaseFood.fat * ratio).toFixed(1))));
            }
        }
    }, [servingSize, selectedBaseFood]);

    if (!isOpen) return null;

    const handleSuggestionClick = (food: FoodItem) => {
        setSelectedBaseFood(food);
        setName(food.name);
        setMicronutrients(food.micronutrients || []);
        setServingSize(''); // Clear serving size to prompt user input
        setSuggestions([]);
    };
    
    // When user manually edits a macro, we exit "auto-calculation" mode
    const handleManualEdit = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
        setter(value);
        setSelectedBaseFood(null);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const foodData = {
            name: name.trim(),
            calories: parseFloat(calories),
            protein: parseFloat(protein),
            carbs: parseFloat(carbs),
            fat: parseFloat(fat),
            servingSize: servingSize.trim(),
            micronutrients: micronutrients.length > 0 ? micronutrients : undefined,
        };
        if (!foodData.name || isNaN(foodData.calories) || isNaN(foodData.protein) || isNaN(foodData.carbs) || isNaN(foodData.fat) || !foodData.servingSize) {
            alert('يرجى ملء جميع الحقول بأرقام صالحة.');
            return;
        }
        if (itemToEdit) {
            onSave({ ...foodData, id: itemToEdit.id });
        } else {
            onSave(foodData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 ring-1 ring-white/10 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-white mb-4">{itemToEdit ? 'تعديل عنصر' : 'إضافة عنصر جديد'}</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="food-name" className="block text-sm font-medium text-gray-300 mb-2">اسم الطعام</label>
                        <div className="relative">
                            <input id="food-name" value={name} onChange={e => setName(e.target.value)} placeholder="اكتب للبحث عن اقتراحات..." className="w-full bg-gray-700 text-white p-3 rounded-lg" required/>
                            {suggestions.length > 0 && (
                                <div className="absolute z-10 w-full bg-gray-600 rounded-b-lg shadow-lg">
                                    {suggestions.map(s => (
                                        <button type="button" key={s.id} onClick={() => handleSuggestionClick(s)} className="block w-full text-right px-4 py-2 hover:bg-gray-500">
                                            {s.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="serving-size" className="block text-sm font-medium text-gray-300 mb-2">حجم الحصة</label>
                        <input id="serving-size" value={servingSize} onChange={e => setServingSize(e.target.value)} placeholder="مثال: 150g" className="w-full bg-gray-700 text-white p-3 rounded-lg" required/>
                    </div>
                    
                    {selectedBaseFood && <p className="text-xs text-center text-blue-300">يتم حساب القيم تلقائيًا. عدّل أي حقل للدخول في الوضع اليدوي.</p>}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="calories" className="block text-sm font-medium text-gray-300 mb-2">السعرات الحرارية</label>
                            <input id="calories" type="number" step="0.1" min="0" value={calories} onChange={e => handleManualEdit(setCalories, e.target.value)} placeholder="0" className="w-full bg-gray-700 text-white p-3 rounded-lg" required/>
                        </div>
                        <div>
                           <label htmlFor="protein" className="block text-sm font-medium text-gray-300 mb-2">البروتين (جرام)</label>
                           <input id="protein" type="number" step="0.1" min="0" value={protein} onChange={e => handleManualEdit(setProtein, e.target.value)} placeholder="0" className="w-full bg-gray-700 text-white p-3 rounded-lg" required/>
                        </div>
                        <div>
                            <label htmlFor="carbs" className="block text-sm font-medium text-gray-300 mb-2">الكربوهيدرات (جرام)</label>
                            <input id="carbs" type="number" step="0.1" min="0" value={carbs} onChange={e => handleManualEdit(setCarbs, e.target.value)} placeholder="0" className="w-full bg-gray-700 text-white p-3 rounded-lg" required/>
                        </div>
                        <div>
                           <label htmlFor="fat" className="block text-sm font-medium text-gray-300 mb-2">الدهون (جرام)</label>
                           <input id="fat" type="number" step="0.1" min="0" value={fat} onChange={e => handleManualEdit(setFat, e.target.value)} placeholder="0" className="w-full bg-gray-700 text-white p-3 rounded-lg" required/>
                        </div>
                    </div>
                    
                    <div className="pt-2">
                        <h3 className="text-lg font-semibold text-gray-300 mb-2">أهم الفيتامينات والمعادن</h3>
                        <p className="text-xs text-gray-400 mb-2">{selectedBaseFood ? "تم تحديدها تلقائيًا بناءً على اختيارك." : "حدد الفوائد يدويًا."}</p>
                        <div className="flex flex-wrap gap-2">
                            {MICRONUTRIENTS_LIST.map(micro => {
                                const isSelected = micronutrients.includes(micro.name);
                                return (
                                    <button
                                        type="button"
                                        key={micro.name}
                                        disabled={!!selectedBaseFood}
                                        className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                                            isSelected ? 'bg-sky-500 text-white shadow-md' : 'bg-gray-600 text-gray-200'
                                        } ${!selectedBaseFood ? 'hover:bg-gray-500' : 'opacity-70 cursor-not-allowed'}`}
                                    >
                                        {micro.emoji} {micro.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-lg">إلغاء</button>
                    <button type="submit" className="px-4 py-2 bg-emerald-600 rounded-lg">حفظ</button>
                </div>
            </form>
        </div>
    );
};