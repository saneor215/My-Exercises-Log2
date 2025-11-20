
import type { BodyPart, BodyPartId, Exercise, NutritionGoals, FoodItem, DailyDietLog, MicronutrientInfo, DietPlan } from './types';

export const INITIAL_BODY_PARTS: BodyPart[] = [
    { id: 'upper', name: 'علوي', icon: '💪', color: 'sky', gradient: 'from-sky-500 to-cyan-400' },
    { id: 'lower', name: 'سفلي', icon: '🦵', color: 'emerald', gradient: 'from-emerald-500 to-green-400' },
    { id: 'friday', name: 'معدة', icon: '🔥', color: 'orange', gradient: 'from-orange-500 to-amber-400' }
];

export const INITIAL_EXERCISES: Record<BodyPartId, Exercise[]> = {
  upper: [
    { name: "Lat Pulldown (ظهر1)", image: "https://picsum.photos/seed/latpulldown/100/100" },
    { name: "Seated Row (ظهر2)", image: "https://picsum.photos/seed/seatedrow/100/100" },
    { name: "Chest Press (صدر1)", image: "https://picsum.photos/seed/chestpress/100/100" },
    { name: "Incline Chest Press (صدر2)", image: "https://picsum.photos/seed/inclinepress/100/100" },
    { name: "Barbell Bench Press (صدر3)", image: "https://picsum.photos/seed/benchpress/100/100" },
    { name: "Butterfly (صدر4)", image: "https://picsum.photos/seed/butterfly/100/100" },
    { name: "Lateral Raise (أكتاف جانبي)", image: "https://picsum.photos/seed/latraise/100/100" },
    { name: "Shoulder Press (ضغط أكتاف)", image: "https://picsum.photos/seed/shoulderpress/100/100" },
    { name: "Pushdown (تراي)", image: "https://picsum.photos/seed/pushdown/100/100" },
    { name: "Seated Triceps Extension (تراي آلة)", image: "https://picsum.photos/seed/tricepsext/100/100" },
    { name: "Cable Curl (باي)", image: "https://picsum.photos/seed/cablecurl/100/100" },
    { name: "Biceps Curl Machine (باي آلة)", image: "https://picsum.photos/seed/bicepcurl/100/100" }
  ],
  lower: [
    { name: "Leg Press (رجل1)", image: "https://picsum.photos/seed/legpress/100/100" },
    { name: "Leg Curl (رجل2)", image: "https://picsum.photos/seed/legcurl/100/100" },
    { name: "Leg Extension (رجل3)", image: "https://picsum.photos/seed/legextension/100/100" },
    { name: "Seated Calf Raise (سمانة1)", image: "https://picsum.photos/seed/calfraise/100/100" },
    { name: "Standing Calf Raise (سمانة2)", image: "https://picsum.photos/seed/standingcalf/100/100" },
    { name: "Seated Adductor Machine (رجل داخلي)", image: "https://picsum.photos/seed/adductor/100/100" },
    { name: "Seated Hip Abduction (رجل خارجي)", image: "https://picsum.photos/seed/abduction/100/100" }
  ],
  friday: [
    { name: "Abdominal Crunch (معدة)", image: "https://picsum.photos/seed/crunch/100/100" },
    { name: "Abdominal Machine (معدة واقف)", image: "https://picsum.photos/seed/abmachine/100/100" },
    { name: "Rotary torso machine (خواصر)", image: "https://picsum.photos/seed/torso/100/100" },
    { name: "Back Extension (تمدد الظهر)", image: "https://picsum.photos/seed/backext/100/100" },
    { name: "Cardio Bike (دراجة)", image: "https://picsum.photos/seed/bike/100/100" },
    { name: "Cardio Treadmill (مشاية)", image: "https://picsum.photos/seed/treadmill/100/100" }
  ]
};

export const WEEKDAYS_MAP = [
    { id: '6', name: 'السبت' },
    { id: '0', name: 'الأحد' },
    { id: '1', name: 'الاثنين' },
    { id: '2', name: 'الثلاثاء' },
    { id: '3', name: 'الأربعاء' },
    { id: '4', name: 'الخميس' },
    { id: '5', name: 'الجمعة' },
];


// Nutrition Constants
export const INITIAL_NUTRITION_GOALS: NutritionGoals = {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
};

export const MICRONUTRIENTS_LIST: MicronutrientInfo[] = [
    { name: 'فيتامين C', emoji: '🍊' },
    { name: 'حديد', emoji: '⚙️' },
    { name: 'كالسيوم', emoji: '🥛' },
    { name: 'فيتامين D', emoji: '☀️' },
    { name: 'بوتاسيوم', emoji: '🍌' },
    { name: 'أوميغا-3', emoji: '🐟' },
    { name: 'فيتامين A', emoji: '🥕' },
    { name: 'ألياف', emoji: '🌾' },
];

export const INITIAL_FOOD_DATABASE: FoodItem[] = [
    // Proteins
    { id: 'food-1', name: 'صدر دجاج', calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: '100g', micronutrients: ['حديد'], keywords: ['chicken breast', 'poultry', 'دجاج'] },
    { id: 'food-3', name: 'بيضة مسلوقة', calories: 78, protein: 6, carbs: 0.6, fat: 5, servingSize: '1 large (50g)', micronutrients: ['فيتامين D'], keywords: ['egg', 'boiled egg', 'بيضة', 'بيض', 'مسلوق'] },
    { id: 'food-40', name: 'بيضة مقلية', calories: 90, protein: 6, carbs: 0.6, fat: 7, servingSize: '1 large (50g)', keywords: ['egg', 'fried egg', 'بيضة', 'بيض', 'مقلي'] },
    { id: 'food-27', name: 'بياض بيض', calories: 52, protein: 11, carbs: 0.7, fat: 0.2, servingSize: '100g', keywords: ['egg white', 'egg', 'بيض'] },
    { id: 'food-6', name: 'سلمون', calories: 208, protein: 20, carbs: 0, fat: 13, servingSize: '100g', micronutrients: ['أوميغا-3', 'فيتامين D'], keywords: ['salmon', 'fish', 'سمك', 'سلمون'] },
    { id: 'food-12', name: 'تونة (معلبة بالماء)', calories: 132, protein: 28, carbs: 0, fat: 1.3, servingSize: '100g', micronutrients: ['أوميغا-3', 'فيتامين D'], keywords: ['tuna', 'canned tuna', 'fish', 'تونة'] },
    { id: 'food-7', name: 'لحم بقري مفروم', calories: 250, protein: 26, carbs: 0, fat: 15, servingSize: '100g', micronutrients: ['حديد'], keywords: ['beef', 'minced beef', 'لحم', 'بقري'] },
    { id: 'food-25', name: 'صدر ديك رومي', calories: 135, protein: 29, carbs: 0, fat: 1, servingSize: '100g', micronutrients: ['حديد'], keywords: ['turkey breast', 'poultry', 'ديك رومي'] },
    { id: 'food-14', name: 'عدس', calories: 116, protein: 9, carbs: 20, fat: 0.4, servingSize: '100g', micronutrients: ['حديد', 'ألياف'], keywords: ['lentils', 'legumes', 'عدس'] },
    { id: 'food-28', name: 'حمص', calories: 164, protein: 8.9, carbs: 27, fat: 2.6, servingSize: '100g', micronutrients: ['حديد', 'ألياف'], keywords: ['chickpeas', 'hummus', 'حمص'] },
    { id: 'food-29', name: 'فول', calories: 88, protein: 8, carbs: 15, fat: 0.5, servingSize: '100g', micronutrients: ['حديد', 'ألياف'], keywords: ['fava beans', 'beans', 'فول'] },
    { id: 'food-26', name: 'واي بروتين', calories: 375, protein: 80, carbs: 5, fat: 3, servingSize: '100g', keywords: ['whey protein', 'supplement', 'بروتين', 'مكمل'] },
    { id: 'food-51', name: 'بروتين شيك (مُحضر)', calories: 120, protein: 24, carbs: 3, fat: 1.5, servingSize: '1 scoop in water', keywords: ['protein shake', 'whey', 'بروتين', 'شيك'] },

    // Carbs
    { id: 'food-2', name: 'رز أبيض', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, servingSize: '100g', keywords: ['rice', 'white rice', 'رز', 'أرز'] },
    { id: 'food-17', name: 'رز بني', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, servingSize: '100g', micronutrients: ['ألياف'], keywords: ['brown rice', 'rice', 'رز', 'أرز', 'بني'] },
    { id: 'food-19', name: 'خبز أسمر', calories: 265, protein: 13, carbs: 48, fat: 3.4, servingSize: '100g', micronutrients: ['ألياف'], keywords: ['whole wheat bread', 'bread', 'خبز', 'أسمر', 'بر', 'توست'] },
    { id: 'food-16', name: 'شوفان', calories: 389, protein: 16.9, carbs: 66, fat: 6.9, servingSize: '100g', micronutrients: ['ألياف', 'حديد'], keywords: ['oats', 'oatmeal', 'شوفان'] },
    { id: 'food-8', name: 'بطاطا حلوة', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, servingSize: '100g', micronutrients: ['فيتامين A', 'ألياف'], keywords: ['sweet potato', 'بطاطا'] },
    { id: 'food-18', name: 'كينوا', calories: 120, protein: 4.4, carbs: 21, fat: 1.9, servingSize: '100g', micronutrients: ['حديد', 'ألياف'], keywords: ['quinoa', 'كينوا'] },
    { id: 'food-30', name: 'باستا', calories: 131, protein: 5, carbs: 25, fat: 1.1, servingSize: '100g', keywords: ['pasta', 'معكرونة', 'باستا'] },

    // Fats & Nuts
    { id: 'food-4', name: 'زيت زيتون', calories: 884, protein: 0, carbs: 0, fat: 100, servingSize: '100g', micronutrients: ['أوميغا-3'], keywords: ['olive oil', 'oil', 'زيت'] },
    { id: 'food-21', name: 'أفوكادو', calories: 160, protein: 2, carbs: 9, fat: 15, servingSize: '100g', micronutrients: ['بوتاسيوم', 'أوميغا-3', 'ألياف'], keywords: ['avocado', 'أفوكادو'] },
    { id: 'food-20', name: 'لوز', calories: 579, protein: 21, carbs: 22, fat: 49, servingSize: '100g', micronutrients: ['أوميغا-3', 'كالسيوم', 'ألياف'], keywords: ['almonds', 'nuts', 'لوز'] },
    { id: 'food-31', name: 'جوز', calories: 654, protein: 15, carbs: 14, fat: 65, servingSize: '100g', micronutrients: ['أوميغا-3'], keywords: ['walnuts', 'nuts', 'جوز', 'عين الجمل'] },
    { id: 'food-41', name: 'كاجو', calories: 553, protein: 18, carbs: 30, fat: 44, servingSize: '100g', micronutrients: ['حديد'], keywords: ['cashews', 'nuts', 'كاجو'] },
    { id: 'food-32', name: 'بذور الشيا', calories: 486, protein: 17, carbs: 42, fat: 31, servingSize: '100g', micronutrients: ['أوميغا-3', 'كالسيوم', 'ألياف'], keywords: ['chia seeds', 'seeds', 'شيا'] },
    { id: 'food-48', name: 'بذور سمسم', calories: 573, protein: 18, carbs: 23, fat: 50, servingSize: '100g', micronutrients: ['كالسيوم', 'حديد'], keywords: ['sesame seeds', 'seeds', 'سمسم'] },
    
    // Fruits
    { id: 'food-9', name: 'موز', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, servingSize: '100g', micronutrients: ['بوتاسيوم'], keywords: ['banana', 'موز'] },
    { id: 'food-5', name: 'برتقال', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, servingSize: '100g', micronutrients: ['فيتامين C', 'ألياف'], keywords: ['orange', 'fruit', 'برتقال'] },
    { id: 'food-23', name: 'تفاح', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, servingSize: '100g', micronutrients: ['فيتامين C', 'ألياف'], keywords: ['apple', 'fruit', 'تفاح'] },
    { id: 'food-33', name: 'فراولة', calories: 32, protein: 0.7, carbs: 8, fat: 0.3, servingSize: '100g', micronutrients: ['فيتامين C', 'ألياف'], keywords: ['strawberry', 'fruit', 'فراولة', 'توت'] },
    { id: 'food-34', name: 'توت أزرق', calories: 57, protein: 0.7, carbs: 14, fat: 0.3, servingSize: '100g', micronutrients: ['فيتامين C', 'ألياف'], keywords: ['blueberry', 'fruit', 'توت'] },
    { id: 'food-35', name: 'مانجو', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, servingSize: '100g', micronutrients: ['فيتامين C', 'فيتامين A'], keywords: ['mango', 'fruit', 'مانجو'] },
    { id: 'food-36', name: 'أناناس', calories: 50, protein: 0.5, carbs: 13, fat: 0.1, servingSize: '100g', micronutrients: ['فيتامين C'], keywords: ['pineapple', 'fruit', 'أناناس'] },
    
    // Vegetables
    { id: 'food-10', name: 'سبانخ', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, servingSize: '100g', micronutrients: ['حديد', 'فيتامين A'], keywords: ['spinach', 'سبانخ'] },
    { id: 'food-22', name: 'بروكلي', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, servingSize: '100g', micronutrients: ['فيتامين C', 'فيتامين A', 'ألياف'], keywords: ['broccoli', 'بروكلي'] },
    { id: 'food-24', name: 'طماطم', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, servingSize: '100g', micronutrients: ['فيتامين C', 'فيتامين A'], keywords: ['tomato', 'طماطم'] },
    { id: 'food-37', name: 'فلفل رومي', calories: 20, protein: 0.9, carbs: 4.6, fat: 0.2, servingSize: '100g', micronutrients: ['فيتامين C', 'فيتامين A'], keywords: ['bell pepper', 'pepper', 'فلفل'] },
    { id: 'food-38', name: 'خيار', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, servingSize: '100g', keywords: ['cucumber', 'خيار'] },
    { id: 'food-39', name: 'جزر', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, servingSize: '100g', micronutrients: ['فيتامين A'], keywords: ['carrot', 'جزر'] },
    { id: 'food-49', name: 'سلطة خضراء', calories: 15, protein: 1, carbs: 3, fat: 0.2, servingSize: '100g', micronutrients: ['ألياف', 'فيتامين C', 'فيتامين A'], keywords: ['green salad', 'salad', 'سلطة'] },
    { id: 'food-50', name: 'إيدام خضار', calories: 70, protein: 2, carbs: 10, fat: 2.5, servingSize: '100g', micronutrients: ['ألياف', 'فيتامين A'], keywords: ['vegetable stew', 'idam', 'إيدام', 'مرق'] },

    // Dairy
    { id: 'food-11', name: 'حليب', calories: 42, protein: 3.4, carbs: 5, fat: 1, servingSize: '100g', micronutrients: ['كالسيوم', 'فيتامين D'], keywords: ['milk', 'حليب'] },
    { id: 'food-13', name: 'زبادي يوناني', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, servingSize: '100g', micronutrients: ['كالسيوم'], keywords: ['greek yogurt', 'yogurt', 'زبادي'] },
    { id: 'food-15', name: 'جبن قريش', calories: 72, protein: 14, carbs: 3.4, fat: 1, servingSize: '100g', micronutrients: ['كالسيوم'], keywords: ['cottage cheese', 'cheese', 'جبن', 'قريش'] },
    { id: 'food-42', name: 'زبادي عادي', calories: 61, protein: 10, carbs: 4.7, fat: 0.4, servingSize: '100g', micronutrients: ['كالسيوم'], keywords: ['plain yogurt', 'yogurt', 'زبادي', 'عادي'] },
    { id: 'food-43', name: 'لبن', calories: 61, protein: 3.3, carbs: 5, fat: 3.3, servingSize: '100g', micronutrients: ['كالسيوم'], keywords: ['laban', 'buttermilk', 'لبن'] },

    // Misc
    { id: 'food-44', name: 'مسحوق كولاجين', calories: 22, protein: 5.5, carbs: 0, fat: 0, servingSize: '6g', keywords: ['collagen powder', 'collagen', 'كولاجين'] },
    { id: 'food-45', name: 'عسل', calories: 21, protein: 0, carbs: 5.8, fat: 0, servingSize: '1 tsp (7g)', keywords: ['honey', 'عسل'] },
    { id: 'food-46', name: 'قهوة سوداء', calories: 2, protein: 0.3, carbs: 0, fat: 0, servingSize: '1 cup (240ml)', keywords: ['black coffee', 'coffee', 'قهوة'] },
    { id: 'food-47', name: 'ماء', calories: 0, protein: 0, carbs: 0, fat: 0, servingSize: '1 cup (240ml)', keywords: ['water', 'ماء'] },
];

export const INITIAL_DAILY_DIET_LOGS: DailyDietLog = {};
export const INITIAL_DIET_PLAN: DietPlan = {};
