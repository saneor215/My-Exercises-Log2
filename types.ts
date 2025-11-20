
export type BodyPartId = 'upper' | 'lower' | 'friday' | string;

export type View = 'log' | 'calendar' | 'progress' | 'diet' | 'settings';

export interface BodyPart {
    id: BodyPartId;
    name: string;
    icon: string;
    color: string;
    gradient: string;
}

export interface Exercise {
    name:string;
    image: string;
}

export interface WorkoutEntry {
    id: string;
    part: BodyPartId;
    exercise: string;
    weight: number;
    reps: number;
    date: string;
    image: string;
    comment?: string;
    week: number;
}

export interface RoutineExercise {
    partId: BodyPartId;
    exerciseName: string;
}

export interface WorkoutRoutine {
    id: string;
    name: string;
    exercises: RoutineExercise[];
}

export type WeeklySchedule = Record<string, string | null>; // key: day index '0'-'6', value: routineId

// Nutrition Tracking Types
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'postWorkout' | 'snacks';

export interface FoodItem {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize: string; // e.g., "100g", "1 cup", "1 piece"
    micronutrients?: string[]; // e.g., ['Vitamin C', 'Iron']
    keywords?: string[]; // For smart search
}

export interface LoggedFood {
    id: string;
    foodId: string;
    servings: number;
}

export type DietPlan = {
    [meal in MealType]?: LoggedFood[];
};

export interface DailyDietLog {
    [date: string]: DietPlan; // YYYY-MM-DD format
}

export interface NutritionGoals {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface MicronutrientInfo {
    name: string;
    emoji: string;
}

// For Import/Export
export interface AppData {
    log: WorkoutEntry[];
    bodyParts: BodyPart[];
    exercises: Record<BodyPartId, Exercise[]>;
    routines: WorkoutRoutine[];
    weeklySchedule: WeeklySchedule;
    nutritionGoals: NutritionGoals;
    foodDatabase: FoodItem[];
    dailyDietLogs: DailyDietLog;
    dietPlan: DietPlan;
}