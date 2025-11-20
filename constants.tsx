
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
    { id: 'food-3', name: 'بيضة مسلوقة', calories: 78, protein: 6, carbs: 0.6, fat: 5, servingSize: 'حبة كبيرة', micronutrients: ['فيتامين D'], keywords: ['egg', 'boiled egg', 'بيضة', 'بيض', 'مسلوق'] },
    { id: 'food-40', name: 'بيضة مقلية', calories: 90, protein: 6, carbs: 0.6, fat: 7, servingSize: 'حبة كبيرة', keywords: ['egg', 'fried egg', 'بيضة', 'بيض', 'مقلي'] },
    { id: 'food-27', name: 'بياض بيض', calories: 17, protein: 3.6, carbs: 0.2, fat: 0, servingSize: 'حبة (بياض فقط)', keywords: ['egg white', 'egg', 'بيض', 'بياض'] },
    { id: 'food-6', name: 'سلمون', calories: 208, protein: 20, carbs: 0, fat: 13, servingSize: '100g', micronutrients: ['أوميغا-3', 'فيتامين D'], keywords: ['salmon', 'fish', 'سمك', 'سلمون'] },
    { id: 'food-12', name: 'تونة (معلبة بالماء)', calories: 132, protein: 28, carbs: 0, fat: 1.3, servingSize: 'علبة صغيرة (100g)', micronutrients: ['أوميغا-3', 'فيتامين D'], keywords: ['tuna', 'canned tuna', 'fish', 'تونة'] },
    { id: 'food-7', name: 'لحم بقري مفروم', calories: 250, protein: 26, carbs: 0, fat: 15, servingSize: '100g', micronutrients: ['حديد'], keywords: ['beef', 'minced beef', 'لحم', 'بقري'] },
    { id: 'food-25', name: 'صدر ديك رومي', calories: 135, protein: 29, carbs: 0, fat: 1, servingSize: '100g', micronutrients: ['حديد'], keywords: ['turkey breast', 'poultry', 'ديك رومي'] },
    { id: 'food-14', name: 'عدس (مطبوخ)', calories: 116, protein: 9, carbs: 20, fat: 0.4, servingSize: '100g', micronutrients: ['حديد', 'ألياف'], keywords: ['lentils', 'legumes', 'عدس'] },
    { id: 'food-28', name: 'حمص (مطبوخ)', calories: 164, protein: 8.9, carbs: 27, fat: 2.6, servingSize: '100g', micronutrients: ['حديد', 'ألياف'], keywords: ['chickpeas', 'hummus', 'حمص'] },
    { id: 'food-29', name: 'فول (مطبوخ)', calories: 110, protein: 8, carbs: 19, fat: 0.5, servingSize: '100g', micronutrients: ['حديد', 'ألياف'], keywords: ['fava beans', 'beans', 'فول'] },
    { id: 'food-26', name: 'واي بروتين', calories: 120, protein: 24, carbs: 3, fat: 1, servingSize: 'سكوب (30g)', keywords: ['whey protein', 'supplement', 'بروتين', 'مكمل'] },

    // Carbs
    { id: 'food-2', name: 'رز أبيض (مطبوخ)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, servingSize: '100g', keywords: ['rice', 'white rice', 'رز', 'أرز'] },
    { id: 'food-17', name: 'رز بني (مطبوخ)', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, servingSize: '100g', micronutrients: ['ألياف'], keywords: ['brown rice', 'rice', 'رز', 'أرز', 'بني'] },
    { id: 'food-19', name: 'توست أسمر', calories: 80, protein: 4, carbs: 14, fat: 1, servingSize: 'شريحة واحدة', micronutrients: ['ألياف'], keywords: ['whole wheat bread', 'bread', 'خبز', 'أسمر', 'بر', 'توست'] },
    { id: 'food-16', name: 'شوفان', calories: 150, protein: 5, carbs: 27, fat: 2.5, servingSize: '40g (نصف كوب جاف)', micronutrients: ['ألياف', 'حديد'], keywords: ['oats', 'oatmeal', 'شوفان'] },
    { id: 'food-8', name: 'بطاطا حلوة', calories: 60, protein: 1.5, carbs: 14, fat: 0.1, servingSize: 'نصف حبة متوسطة (75g)', micronutrients: ['فيتامين A', 'ألياف'], keywords: ['sweet potato', 'بطاطا'] },
    { id: 'food-18', name: 'كينوا (مطبوخة)', calories: 120, protein: 4.4, carbs: 21, fat: 1.9, servingSize: '100g', micronutrients: ['حديد', 'ألياف'], keywords: ['quinoa', 'كينوا'] },
    { id: 'food-30', name: 'باستا (مطبوخة)', calories: 131, protein: 5, carbs: 25, fat: 1.1, servingSize: '100g', keywords: ['pasta', 'معكرونة', 'باستا'] },
    { id: 'food-55', name: 'خبز أبيض', calories: 265, protein: 9, carbs: 49, fat: 3, servingSize: 'رغيف صغير (100g)', keywords: ['bread', 'white bread', 'خبز', 'ابيض'] },

    // Fats & Nuts (Pieces/Handfuls)
    { id: 'food-4', name: 'زيت زيتون', calories: 120, protein: 0, carbs: 0, fat: 14, servingSize: 'ملعقة طعام (15ml)', micronutrients: ['أوميغا-3'], keywords: ['olive oil', 'oil', 'زيت'] },
    { id: 'food-21', name: 'أفوكادو', calories: 240, protein: 3, carbs: 12, fat: 22, servingSize: 'حبة متوسطة', micronutrients: ['بوتاسيوم', 'أوميغا-3', 'ألياف'], keywords: ['avocado', 'أفوكادو'] },
    
    // Nuts updated to 'per piece' where possible
    { id: 'food-20', name: 'لوز', calories: 7, protein: 0.25, carbs: 0.25, fat: 0.6, servingSize: 'حبة واحدة', micronutrients: ['أوميغا-3', 'كالسيوم', 'ألياف'], keywords: ['almonds', 'nuts', 'لوز'] },
    { id: 'food-31', name: 'جوز (عين الجمل)', calories: 14, protein: 0.3, carbs: 0.3, fat: 1.3, servingSize: 'نصف حبة (فص)', micronutrients: ['أوميغا-3'], keywords: ['walnuts', 'nuts', 'جوز', 'عين الجمل'] },
    { id: 'food-41', name: 'كاجو', calories: 9, protein: 0.3, carbs: 0.5, fat: 0.7, servingSize: 'حبة واحدة', micronutrients: ['حديد'], keywords: ['cashews', 'nuts', 'كاجو'] },
    
    // Pumpkin seeds changed to 10g
    { id: 'food-56', name: 'بذور القرع', calories: 57, protein: 3, carbs: 1.5, fat: 4.9, servingSize: '10g', micronutrients: ['حديد', 'ألياف', 'أوميغا-3'], keywords: ['pumpkin seeds', 'seeds', 'بذور', 'قرع'] },
    
    { id: 'food-32', name: 'بذور الشيا', calories: 138, protein: 4.7, carbs: 12, fat: 8.7, servingSize: 'أونصة (28g)', micronutrients: ['أوميغا-3', 'كالسيوم', 'ألياف'], keywords: ['chia seeds', 'seeds', 'شيا'] },
    { id: 'food-48', name: 'بذور سمسم', calories: 52, protein: 1.6, carbs: 2.1, fat: 4.5, servingSize: 'ملعقة طعام (9g)', micronutrients: ['كالسيوم', 'حديد'], keywords: ['sesame seeds', 'seeds', 'سمسم'] },
    { id: 'food-52', name: 'زبدة الفول السوداني', calories: 190, protein: 7, carbs: 7, fat: 16, servingSize: 'ملعقتين طعام (32g)', keywords: ['peanut butter', 'زبدة'] },
    
    // Fruits (Piece)
    { id: 'food-9', name: 'موز', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, servingSize: 'حبة متوسطة', micronutrients: ['بوتاسيوم'], keywords: ['banana', 'موز'] },
    { id: 'food-5', name: 'برتقال', calories: 62, protein: 1.2, carbs: 15, fat: 0.2, servingSize: 'حبة متوسطة', micronutrients: ['فيتامين C', 'ألياف'], keywords: ['orange', 'fruit', 'برتقال'] },
    { id: 'food-23', name: 'تفاح', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, servingSize: 'حبة متوسطة', micronutrients: ['فيتامين C', 'ألياف'], keywords: ['apple', 'fruit', 'تفاح'] },
    { id: 'food-33', name: 'فراولة', calories: 49, protein: 1, carbs: 12, fat: 0.5, servingSize: 'كوب (150g)', micronutrients: ['فيتامين C', 'ألياف'], keywords: ['strawberry', 'fruit', 'فراولة', 'توت'] },
    { id: 'food-34', name: 'توت أزرق', calories: 84, protein: 1, carbs: 21, fat: 0.5, servingSize: 'كوب (148g)', micronutrients: ['فيتامين C', 'ألياف'], keywords: ['blueberry', 'fruit', 'توت'] },
    { id: 'food-35', name: 'مانجو', calories: 202, protein: 2.8, carbs: 50, fat: 1.3, servingSize: 'حبة كاملة (336g)', micronutrients: ['فيتامين C', 'فيتامين A'], keywords: ['mango', 'fruit', 'مانجو'] },
    { id: 'food-36', name: 'أناناس', calories: 82, protein: 0.9, carbs: 21, fat: 0.2, servingSize: 'كوب قطع (165g)', micronutrients: ['فيتامين C'], keywords: ['pineapple', 'fruit', 'أناناس'] },
    { id: 'food-53', name: 'تمر', calories: 66, protein: 0.4, carbs: 18, fat: 0, servingSize: '3 حبات', keywords: ['dates', 'تمر'] },
    
    // Vegetables
    { id: 'food-10', name: 'سبانخ', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, servingSize: '100g', micronutrients: ['حديد', 'فيتامين A'], keywords: ['spinach', 'سبانخ'] },
    { id: 'food-22', name: 'بروكلي', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, servingSize: '100g', micronutrients: ['فيتامين C', 'فيتامين A', 'ألياف'], keywords: ['broccoli', 'بروكلي'] },
    { id: 'food-24', name: 'طماطم', calories: 22, protein: 1, carbs: 5, fat: 0.2, servingSize: 'حبة متوسطة', micronutrients: ['فيتامين C', 'فيتامين A'], keywords: ['tomato', 'طماطم'] },
    { id: 'food-37', name: 'فلفل رومي', calories: 24, protein: 1, carbs: 6, fat: 0.2, servingSize: 'حبة متوسطة', micronutrients: ['فيتامين C', 'فيتامين A'], keywords: ['bell pepper', 'pepper', 'فلفل'] },
    { id: 'food-38', name: 'خيار', calories: 16, protein: 0.7, carbs: 4, fat: 0.1, servingSize: 'حبة متوسطة', keywords: ['cucumber', 'خيار'] },
    { id: 'food-39', name: 'جزر', calories: 25, protein: 0.6, carbs: 6, fat: 0.1, servingSize: 'حبة متوسطة', micronutrients: ['فيتامين A'], keywords: ['carrot', 'جزر'] },
    { id: 'food-49', name: 'سلطة خضراء', calories: 20, protein: 1.5, carbs: 4, fat: 0.2, servingSize: 'صحن صغير', micronutrients: ['ألياف', 'فيتامين C', 'فيتامين A'], keywords: ['green salad', 'salad', 'سلطة'] },

    // Dairy
    { id: 'food-11', name: 'حليب (قليل الدسم)', calories: 100, protein: 8, carbs: 12, fat: 2.5, servingSize: 'كوب (240ml)', micronutrients: ['كالسيوم', 'فيتامين D'], keywords: ['milk', 'حليب'] },
    { id: 'food-13', name: 'زبادي يوناني', calories: 100, protein: 17, carbs: 6, fat: 0.7, servingSize: 'علبة (170g)', micronutrients: ['كالسيوم'], keywords: ['greek yogurt', 'yogurt', 'زبادي'] },
    { id: 'food-15', name: 'جبن قريش', calories: 81, protein: 11, carbs: 3.4, fat: 2.3, servingSize: 'نصف كوب (113g)', micronutrients: ['كالسيوم'], keywords: ['cottage cheese', 'cheese', 'جبن', 'قريش'] },
    { id: 'food-42', name: 'زبادي عادي', calories: 150, protein: 8, carbs: 11, fat: 8, servingSize: 'علبة (170g)', micronutrients: ['كالسيوم'], keywords: ['plain yogurt', 'yogurt', 'زبادي', 'عادي'] },
    { id: 'food-54', name: 'شريحة جبن', calories: 60, protein: 4, carbs: 1, fat: 4.5, servingSize: 'شريحة واحدة', micronutrients: ['كالسيوم'], keywords: ['cheese', 'slice', 'جبن', 'شريحة'] },

    // Misc
    { id: 'food-44', name: 'مسحوق كولاجين', calories: 22, protein: 5.5, carbs: 0, fat: 0, servingSize: 'سكوب (6g)', keywords: ['collagen powder', 'collagen', 'كولاجين'] },
    { id: 'food-45', name: 'عسل', calories: 64, protein: 0, carbs: 17, fat: 0, servingSize: 'ملعقة طعام (21g)', keywords: ['honey', 'عسل'] },
    { id: 'food-46', name: 'قهوة سوداء', calories: 2, protein: 0.3, carbs: 0, fat: 0, servingSize: 'كوب (240ml)', keywords: ['black coffee', 'coffee', 'قهوة'] },
    { id: 'food-47', name: 'ماء', calories: 0, protein: 0, carbs: 0, fat: 0, servingSize: 'كوب (240ml)', keywords: ['water', 'ماء'] },
];

export const INITIAL_DAILY_DIET_LOGS: DailyDietLog = {};
export const INITIAL_DIET_PLAN: DietPlan = {};
