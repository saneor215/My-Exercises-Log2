
import React, { useState, useCallback } from 'react';
import { WorkoutInputForm } from './components/WorkoutInputForm';
import { WorkoutLog } from './components/WorkoutLog';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { WorkoutEntry, BodyPart, Exercise, BodyPartId, WorkoutRoutine, AppData, NutritionGoals, FoodItem, DailyDietLog, LoggedFood, MealType, WeeklySchedule, DietPlan } from './types';
import { INITIAL_EXERCISES, INITIAL_BODY_PARTS, INITIAL_NUTRITION_GOALS, INITIAL_FOOD_DATABASE, INITIAL_DAILY_DIET_LOGS, INITIAL_DIET_PLAN } from './constants';
import { Navigation } from './components/Navigation';
import { CalendarPage } from './components/CalendarPage';
import { DietPage } from './components/DietPage';
import { SettingsPage } from './components/SettingsPage';
import { ProgressPage } from './components/ProgressPage';
import { Modal } from './components/Modal';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

type View = 'log' | 'calendar' | 'progress' | 'diet' | 'settings';

function AppContent() {
  const { t } = useLanguage();

  // Workout State
  const [log, setLog] = useLocalStorage<WorkoutEntry[]>('workoutLog_categorized_react_v2', []);
  const [bodyParts, setBodyParts] = useLocalStorage<BodyPart[]>('workout_bodyParts_v2', INITIAL_BODY_PARTS);
  const [exercises, setExercises] = useLocalStorage<Record<BodyPartId, Exercise[]>>('workout_exercises_v2', INITIAL_EXERCISES);
  const [routines, setRoutines] = useLocalStorage<WorkoutRoutine[]>('workoutRoutines_v1', []);
  const [weeklySchedule, setWeeklySchedule] = useLocalStorage<WeeklySchedule>('workoutSchedule_v1', {});

  // Nutrition State
  const [nutritionGoals, setNutritionGoals] = useLocalStorage<NutritionGoals>('nutritionGoals_v1', INITIAL_NUTRITION_GOALS);
  const [foodDatabase, setFoodDatabase] = useLocalStorage<FoodItem[]>('foodDatabase_v1', INITIAL_FOOD_DATABASE);
  const [dailyDietLogs, setDailyDietLogs] = useLocalStorage<DailyDietLog>('dailyDietLogs_v1', INITIAL_DAILY_DIET_LOGS);
  const [dietPlan, setDietPlan] = useLocalStorage<DietPlan>('dietPlan_v1', INITIAL_DIET_PLAN);

  // UI State
  const [showIntro, setShowIntro] = useState(log.length === 0);
  const [activeView, setActiveView] = useState<View>('log');
  const [importSuccess, setImportSuccess] = useState(false);

  // --- WORKOUT HANDLERS ---
  const addEntry = useCallback((entry: Omit<WorkoutEntry, 'id' | 'date' | 'image'>) => {
    const exerciseDetails = exercises[entry.part]?.find(e => e.name === entry.exercise);
    const newEntry: WorkoutEntry = {
      ...entry,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      image: exerciseDetails?.image || 'https://picsum.photos/seed/placeholder/100/100'
    };
    setLog(prevLog => [newEntry, ...prevLog]);
    setShowIntro(false);
  }, [setLog, exercises]);
  
  const addMultipleEntries = useCallback((entries: Omit<WorkoutEntry, 'id' | 'date' | 'image'>[]) => {
    const newEntries: WorkoutEntry[] = entries.map(entry => {
        const exerciseDetails = exercises[entry.part]?.find(e => e.name === entry.exercise);
        return {
            ...entry,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            image: exerciseDetails?.image || 'https://picsum.photos/seed/placeholder/100/100'
        };
    });
    setLog(prevLog => [...newEntries, ...prevLog]);
    setShowIntro(false);
  }, [setLog, exercises]);

  const deleteEntry = useCallback((id: string) => {
    setLog(prevLog => {
        const updatedLog = prevLog.filter(entry => entry.id !== id);
        if (updatedLog.length === 0) {
            setShowIntro(true);
        }
        return updatedLog;
    });
  }, [setLog]);
  
  const updateEntry = useCallback((updatedEntry: WorkoutEntry) => {
    setLog(prevLog => prevLog.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry));
  }, [setLog]);

  const clearLog = useCallback(() => {
    setLog([]);
    setShowIntro(true);
  }, [setLog]);
  
  const addRoutine = useCallback((routine: Omit<WorkoutRoutine, 'id'>) => {
    const newRoutine = { ...routine, id: crypto.randomUUID() };
    setRoutines(prev => [...prev, newRoutine]);
  }, [setRoutines]);

  const updateRoutine = useCallback((updatedRoutine: WorkoutRoutine) => {
      setRoutines(prev => prev.map(r => r.id === updatedRoutine.id ? updatedRoutine : r));
  }, [setRoutines]);

  const deleteRoutine = useCallback((id: string) => {
      setRoutines(prev => prev.filter(r => r.id !== id));
  }, [setRoutines]);

  // --- NUTRITION HANDLERS ---
  const addFoodToDatabase = useCallback((food: Omit<FoodItem, 'id'>) => {
    const newFood = { ...food, id: crypto.randomUUID() };
    setFoodDatabase(prev => [...prev, newFood]);
    return newFood;
  }, [setFoodDatabase]);

  const updateFoodInDatabase = useCallback((updatedFood: FoodItem) => {
    setFoodDatabase(prev => prev.map(f => f.id === updatedFood.id ? updatedFood : f));
  }, [setFoodDatabase]);

  const deleteFoodFromDatabase = useCallback((id: string) => {
    setFoodDatabase(prev => prev.filter(f => f.id !== id));
  }, [setFoodDatabase]);
  
  const updateDietPlan = useCallback((newPlan: DietPlan) => {
      setDietPlan(newPlan);
  }, [setDietPlan]);

  // Enhanced logFood to assume template if day is missing
  const logFood = useCallback((date: string, meal: MealType, foodId: string, servings: number) => {
    const newLoggedFood: LoggedFood = { id: crypto.randomUUID(), foodId, servings };
    
    setDailyDietLogs(prev => {
        const currentDayLog = prev[date] !== undefined ? { ...prev[date] } : JSON.parse(JSON.stringify(dietPlan));
        const mealLog = currentDayLog[meal] ? [...currentDayLog[meal]!] : [];
        mealLog.push(newLoggedFood);
        currentDayLog[meal] = mealLog;
        return { ...prev, [date]: currentDayLog };
    });
  }, [setDailyDietLogs, dietPlan]);

  const removeLoggedFood = useCallback((date: string, meal: MealType, loggedFoodId: string) => {
    setDailyDietLogs(prev => {
        const currentDayLog = prev[date] !== undefined ? { ...prev[date] } : JSON.parse(JSON.stringify(dietPlan));
        if (!currentDayLog[meal]) return prev;
        currentDayLog[meal] = currentDayLog[meal]!.filter(food => food.id !== loggedFoodId);
        return { ...prev, [date]: currentDayLog };
    });
  }, [setDailyDietLogs, dietPlan]);


  // --- DATA MANAGEMENT (IMPORT/EXPORT) ---
  const importData = useCallback((data: AppData) => {
    try {
        if (!data || typeof data !== 'object') throw new Error("Invalid data file.");
        if (!Array.isArray(data.log)) throw new Error("Invalid log data.");

        setLog(data.log || []);
        setBodyParts(data.bodyParts || INITIAL_BODY_PARTS);
        setExercises(data.exercises || INITIAL_EXERCISES);
        setRoutines(data.routines || []);
        setWeeklySchedule(data.weeklySchedule || {});
        setNutritionGoals(data.nutritionGoals || INITIAL_NUTRITION_GOALS);
        setFoodDatabase(data.foodDatabase || INITIAL_FOOD_DATABASE);
        setDailyDietLogs(data.dailyDietLogs || INITIAL_DAILY_DIET_LOGS);
        setDietPlan(data.dietPlan || INITIAL_DIET_PLAN);

        setShowIntro((data.log || []).length === 0);
        setImportSuccess(true);
    } catch (error) {
        console.error("Import failed:", error);
        alert(`Import failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }, [setLog, setBodyParts, setExercises, setRoutines, setWeeklySchedule, setNutritionGoals, setFoodDatabase, setDailyDietLogs, setDietPlan]);

  const exportData = useCallback((): AppData => {
    return {
        log,
        bodyParts,
        exercises,
        routines,
        weeklySchedule,
        nutritionGoals,
        foodDatabase,
        dailyDietLogs,
        dietPlan
    };
  }, [log, bodyParts, exercises, routines, weeklySchedule, nutritionGoals, foodDatabase, dailyDietLogs, dietPlan]);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Navigation activeView={activeView} onNavigate={setActiveView} />

        <div className="mt-2">
           {activeView === 'log' && (
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2">
                  <WorkoutInputForm 
                    onAddEntry={addEntry}
                    bodyParts={bodyParts}
                    exercises={exercises}
                    routines={routines}
                    onAddMultipleEntries={addMultipleEntries}
                    weeklySchedule={weeklySchedule}
                    log={log}
                  />
                </div>
                <div className="lg:col-span-3">
                  <WorkoutLog 
                    log={log} 
                    onDeleteEntry={deleteEntry} 
                    onUpdateEntry={updateEntry} 
                    onClearLog={clearLog} 
                    showIntro={showIntro}
                    bodyParts={bodyParts}
                    exercises={exercises}
                   />
                </div>
              </div>
           )}
           {activeView === 'calendar' && (
              <CalendarPage 
                log={log} 
                onDeleteEntry={deleteEntry} 
                onUpdateEntry={updateEntry}
                bodyParts={bodyParts}
                exercises={exercises}
                weeklySchedule={weeklySchedule}
                routines={routines}
              />
           )}
           {activeView === 'progress' && (
              <ProgressPage 
                log={log}
                bodyParts={bodyParts}
                exercises={exercises}
              />
           )}
           {activeView === 'diet' && (
              <DietPage 
                goals={nutritionGoals}
                foodDatabase={foodDatabase}
                dailyLogs={dailyDietLogs}
                dietPlan={dietPlan}
                onLogFood={logFood}
                onRemoveLoggedFood={removeLoggedFood}
                onAddFoodToDatabase={addFoodToDatabase}
                onUpdateDietPlan={updateDietPlan}
              />
           )}
           {activeView === 'settings' && (
              <SettingsPage
                bodyParts={bodyParts}
                setBodyParts={setBodyParts}
                exercises={exercises}
                setExercises={setExercises}
                routines={routines}
                addRoutine={addRoutine}
                updateRoutine={updateRoutine}
                deleteRoutine={deleteRoutine}
                weeklySchedule={weeklySchedule}
                setWeeklySchedule={setWeeklySchedule}
                nutritionGoals={nutritionGoals}
                setNutritionGoals={setNutritionGoals}
                foodDatabase={foodDatabase}
                addFoodToDatabase={addFoodToDatabase}
                updateFoodInDatabase={updateFoodInDatabase}
                deleteFoodFromDatabase={deleteFoodFromDatabase}
                onImportData={importData}
                onExportData={exportData}
              />
           )}
        </div>
      </div>
      
      <Modal
        isOpen={importSuccess}
        onClose={() => setImportSuccess(false)}
        onConfirm={() => setImportSuccess(false)}
        title={t('import_success_title')}
        confirmText={t('ok')}
        cancelText={null}
        confirmButtonClass="bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-400 text-white"
      >
        <div className="text-center">
            <p className="text-lg font-medium text-green-400 mb-2">✅ {t('import_success_msg')}</p>
        </div>
      </Modal>
    </div>
  );
}

export default function App(): React.ReactElement {
    return (
        <LanguageProvider>
            <AppContent />
        </LanguageProvider>
    )
}
