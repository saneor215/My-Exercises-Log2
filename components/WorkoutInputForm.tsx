
import React, { useState, useEffect, useMemo } from 'react';
import type { WorkoutEntry, BodyPartId, BodyPart, Exercise, WorkoutRoutine, WeeklySchedule, RoutineExercise } from '../types';
import { SaveIcon, ClockIcon, ClipboardPlusIcon, CalendarIcon } from './Icons';
import { StartRoutineModal } from './StartRoutineModal';

interface WorkoutInputFormProps {
  onAddEntry: (entry: Omit<WorkoutEntry, 'id' | 'date' | 'image'>) => void;
  onAddMultipleEntries: (entries: Omit<WorkoutEntry, 'id' | 'date' | 'image'>[]) => void;
  bodyParts: BodyPart[];
  exercises: Record<BodyPartId, Exercise[]>;
  routines: WorkoutRoutine[];
  weeklySchedule?: WeeklySchedule;
  log: WorkoutEntry[];
}

const CustomSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }> = ({ children, ...props }) => (
    <div className="relative">
        <select
            {...props}
            className="w-full bg-gray-700 border-gray-600 text-white px-4 py-3 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
        >
            {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-gray-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
    </div>
);


export const WorkoutInputForm: React.FC<WorkoutInputFormProps> = ({ onAddEntry, onAddMultipleEntries, bodyParts, exercises, routines, weeklySchedule, log }) => {
  const [selectedPart, setSelectedPart] = useState<BodyPartId | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [reps, setReps] = useState<string>('');
  const [comment, setComment] = useState('');
  const [week, setWeek] = useState<string>('');

  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [initialRoutineId, setInitialRoutineId] = useState<string | undefined>(undefined);

  const REST_DURATION = 60;
  const [timeLeft, setTimeLeft] = useState(REST_DURATION);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  const todayScheduledRoutine = useMemo(() => {
      if (!weeklySchedule || !routines) return null;
      const dayIndex = new Date().getDay().toString();
      const routineId = weeklySchedule[dayIndex];
      if (!routineId) return null;
      return routines.find(r => r.id === routineId) || null;
  }, [weeklySchedule, routines]);

  const isTodayLogged = useMemo(() => {
      if (!todayScheduledRoutine) return false;
      
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      return log.some(entry => {
          const entryDate = new Date(entry.date);
          const entryDateStr = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}-${String(entryDate.getDate()).padStart(2, '0')}`;
          return entryDateStr === todayStr && todayScheduledRoutine.exercises.some(re => re.exerciseName === entry.exercise);
      });
  }, [log, todayScheduledRoutine]);

  const exerciseImage = useMemo(() => {
    if (!selectedPart || !selectedExercise) return null;
    return exercises[selectedPart]?.find(ex => ex.name === selectedExercise)?.image;
  }, [selectedPart, selectedExercise, exercises]);

  useEffect(() => {
    if (selectedPart) {
      setSelectedExercise(exercises[selectedPart]?.[0]?.name || '');
    } else {
      setSelectedExercise('');
    }
  }, [selectedPart, exercises]);

  useEffect(() => {
    if (!isTimerRunning) return;

    if (timeLeft <= 0) {
        setIsTimerRunning(false);
        setTimeLeft(REST_DURATION);
        return;
    }

    const intervalId = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isTimerRunning, timeLeft]);

  const handleTimerToggle = () => {
    if (isTimerRunning) {
        setIsTimerRunning(false);
        setTimeLeft(REST_DURATION);
    } else {
        setTimeLeft(REST_DURATION);
        setIsTimerRunning(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPart || !selectedExercise) {
      alert("الرجاء اختيار الجزء والتمرين");
      return;
    }
    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps, 10);
    const weekNum = parseInt(week, 10);

    if (isNaN(weekNum) || weekNum <= 0) {
        alert("الرجاء إدخال رقم أسبوع صحيح");
        return;
    }
    if (isNaN(weightNum) || weightNum <= 0) {
        alert("الرجاء إدخال وزن صحيح");
        return;
    }
    if (isNaN(repsNum) || repsNum <= 0) {
        alert("الرجاء إدخال عدد تكرارات صحيح");
        return;
    }

    onAddEntry({
      part: selectedPart,
      exercise: selectedExercise,
      weight: weightNum,
      reps: repsNum,
      week: weekNum,
      comment: comment.trim() || undefined,
    });
    setWeight('');
    setReps('');
    setComment('');
    setWeek('');
  };
  
  const handleQuickLogSchedule = () => {
      if (!todayScheduledRoutine || isTodayLogged) return;
      setInitialRoutineId(todayScheduledRoutine.id);
      setIsRoutineModalOpen(true);
  }
  
  const openRoutineModal = () => {
      setInitialRoutineId(undefined);
      setIsRoutineModalOpen(true);
  }

  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg ring-1 ring-white/10">
      
       <button
          type="button"
          onClick={handleTimerToggle}
          className={`w-full flex items-center justify-center gap-2 border-2 font-bold py-3 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 relative overflow-hidden mb-6 ${isTimerRunning ? 'border-red-500 text-red-400' : 'border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 focus:ring-cyan-400'}`}
      >
          {isTimerRunning && (
              <div className="absolute top-0 right-0 h-full bg-red-500/20" style={{width: `${(timeLeft / REST_DURATION) * 100}%`, transition: 'width 1s linear'}}></div>
          )}
          <span className="relative z-10 flex items-center justify-center gap-2">
              <ClockIcon className="w-5 h-5" />
              {isTimerRunning ? `${timeLeft} ثانية متبقية` : 'مؤقت الراحة'}
          </span>
      </button>
      
      {todayScheduledRoutine && (
         <div className={`mb-6 p-4 rounded-xl border transition-all duration-500 ${
             isTodayLogged 
             ? 'bg-green-900/20 border-green-500/30' 
             : 'bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/30'
         }`}>
             <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                 <div className="flex items-start gap-3">
                    <CalendarIcon className={`w-6 h-6 mt-1 flex-shrink-0 ${isTodayLogged ? 'text-green-400' : 'text-blue-400'}`} />
                    <div>
                        <p className={`text-xs font-bold uppercase tracking-wider ${isTodayLogged ? 'text-green-300' : 'text-blue-300'}`}>
                            {isTodayLogged ? 'تم الإنجاز' : 'جدول اليوم'}
                        </p>
                        <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">{todayScheduledRoutine.name}</h3>
                    </div>
                 </div>
                 {isTodayLogged && (
                     <span className="self-start sm:self-center bg-green-500/20 text-green-300 border border-green-500/30 text-xs font-bold px-3 py-1 rounded-full animate-fade-in whitespace-nowrap">
                         ✅ تم التسجيل
                     </span>
                 )}
             </div>
             
             <button 
                onClick={handleQuickLogSchedule}
                disabled={isTodayLogged}
                className={`w-full text-sm sm:text-base font-bold py-3 px-4 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 ${
                    isTodayLogged 
                    ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-500/20 hover:shadow-lg'
                }`}
             >
                 {isTodayLogged ? 'تم تسجيل تمارين اليوم' : 'تسجيل تمارين اليوم سريعاً'}
             </button>
         </div>
      )}

       <button
        type="button"
        onClick={openRoutineModal}
        disabled={routines.length === 0}
        className="w-full flex items-center justify-center gap-3 mb-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-400 disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        <ClipboardPlusIcon className="w-6 h-6" />
        <span>{routines.length > 0 ? 'بدء تمرين من خطة' : 'أنشئ خطة أولاً في الإعدادات'}</span>
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center">
            <span className="bg-gray-800 px-3 text-sm text-gray-500">أو تسجيل تمرين فردي</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-lg font-medium text-gray-300 mb-3">اختر الجزء:</label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {bodyParts.map((part) => (
              <button
                type="button"
                key={part.id}
                onClick={() => setSelectedPart(part.id)}
                className={`p-3 sm:p-4 rounded-xl text-center font-semibold text-sm sm:text-base transition-all duration-300 focus:outline-none focus:ring-4 ${
                  selectedPart === part.id
                    ? `bg-gradient-to-br ${part.gradient} text-white shadow-lg scale-105 ring-4 ring-offset-2 ring-offset-gray-800 ring-${part.color}-500`
                    : `bg-gray-700 hover:bg-gray-600 text-gray-300 ring-1 ring-gray-600`
                }`}
              >
                <span className="block text-xl mb-1">{part.icon}</span>
                {part.name}
              </button>
            ))}
          </div>
        </div>

        {selectedPart && (
            <div className="animate-fade-in space-y-4">
                <div>
                    <label htmlFor="exercise-select" className="block text-sm font-medium text-gray-300 mb-2">التمرين</label>
                    <CustomSelect id="exercise-select" value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)} disabled={!exercises[selectedPart] || exercises[selectedPart].length === 0}>
                        {exercises[selectedPart] && exercises[selectedPart].length > 0 ? (
                           exercises[selectedPart].map((ex) => (
                                <option key={ex.name} value={ex.name}>{ex.name}</option>
                            ))
                        ) : (
                            <option>لا توجد تمارين لهذا الجزء</option>
                        )}
                    </CustomSelect>
                </div>

                {exerciseImage && (
                    <div className="flex justify-center my-4">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden shadow-lg ring-2 ring-gray-600">
                            <img src={exerciseImage} alt={selectedExercise} className="w-full h-full object-cover" />
                        </div>
                    </div>
                )}
                
                <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-2">تعليق (اختياري)</label>
                    <textarea 
                        id="comment"
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        rows={2}
                        placeholder='مثال: الوزن كان جيداً...'
                        className="w-full bg-gray-700 border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                        <label htmlFor="weight-input" className="block text-sm font-medium text-gray-300 mb-2">الوزن (كجم)</label>
                        <input
                            id="weight-input"
                            type="number"
                            inputMode="decimal"
                            step="0.5"
                            min="0"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="0"
                            className="w-full bg-gray-700 border-gray-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-center font-bold text-lg"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="reps-input" className="block text-sm font-medium text-gray-300 mb-2">التكرارات</label>
                         <input
                            id="reps-input"
                            type="number"
                            inputMode="numeric"
                            step="1"
                            min="1"
                            value={reps}
                            onChange={(e) => setReps(e.target.value)}
                            placeholder="0"
                            className="w-full bg-gray-700 border-gray-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-center font-bold text-lg"
                            required
                        />
                    </div>
                </div>
                 <div>
                    <label htmlFor="week-input" className="block text-sm font-medium text-gray-300 mb-2">رقم الأسبوع</label>
                    <input
                        id="week-input"
                        type="number"
                        inputMode="numeric"
                        step="1"
                        min="1"
                        value={week}
                        onChange={(e) => setWeek(e.target.value)}
                        placeholder="مثال: 4"
                        className="w-full bg-gray-700 border-gray-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-center font-bold"
                        required
                    />
                </div>

                 <div className="pt-4 mt-4 border-t border-gray-700">
                    <button
                        type="submit"
                        disabled={!selectedPart || !exercises[selectedPart] || exercises[selectedPart].length === 0}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-400"
                    >
                        <SaveIcon className="w-5 h-5" />
                        <span>حفظ التمرين</span>
                    </button>
                </div>
            </div>
        )}
      </form>

      {isRoutineModalOpen && (
        <StartRoutineModal
            isOpen={isRoutineModalOpen}
            onClose={() => { setIsRoutineModalOpen(false); setInitialRoutineId(undefined); }}
            routines={routines}
            bodyParts={bodyParts}
            exercises={exercises}
            log={log}
            initialRoutineId={initialRoutineId}
            onSave={onAddMultipleEntries}
        />
    )}
    </div>
  );
};

const style = document.createElement('style');
style.innerHTML = `
@keyframes fade-in {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
  animation: fade-in 0.5s ease-out forwards;
}
`;
document.head.appendChild(style);
