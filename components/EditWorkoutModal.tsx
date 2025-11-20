
import React, { useState } from 'react';
import type { WorkoutEntry, Exercise, BodyPartId } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface EditWorkoutModalProps {
  entry: WorkoutEntry;
  onUpdate: (updatedEntry: WorkoutEntry) => void;
  onClose: () => void;
  exercises: Record<BodyPartId, Exercise[]>;
}

export const EditWorkoutModal: React.FC<EditWorkoutModalProps> = ({ entry, onUpdate, onClose, exercises }) => {
  const { t, dir } = useLanguage();
  const [exercise, setExercise] = useState(entry.exercise);
  const [weight, setWeight] = useState(String(entry.weight));
  const [reps, setReps] = useState(String(entry.reps));
  const [week, setWeek] = useState(String(entry.week));
  const [comment, setComment] = useState(entry.comment || '');
  
  const availableExercises = exercises[entry.part] || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps, 10);
    const weekNum = parseInt(week, 10);

    if (isNaN(weekNum) || weekNum <= 0) {
        alert(t('alert_valid_week'));
        return;
    }
    if (isNaN(weightNum) || weightNum <= 0) {
        alert(t('alert_valid_weight'));
        return;
    }
    if (isNaN(repsNum) || repsNum <= 0) {
        alert(t('alert_valid_reps'));
        return;
    }

    onUpdate({
      ...entry,
      exercise,
      weight: weightNum,
      reps: repsNum,
      week: weekNum,
      comment: comment.trim() || undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-6">{t('edit')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
            <div>
              <label htmlFor="edit-exercise" className="block text-sm font-medium text-gray-300 mb-2">{t('exercise')}</label>
              <div className="relative">
                <select
                  id="edit-exercise"
                  value={exercise}
                  onChange={e => setExercise(e.target.value)}
                  className="w-full bg-gray-700 border-gray-600 text-white px-4 py-3 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableExercises.map(ex => <option key={ex.name} value={ex.name}>{ex.name}</option>)}
                </select>
                <div className={`pointer-events-none absolute inset-y-0 ${dir === 'rtl' ? 'left-0' : 'right-0'} flex items-center px-2 text-gray-400`}>
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <div>
                    <label htmlFor="edit-week" className="block text-sm font-medium text-gray-300 mb-2">{t('week')}</label>
                    <input id="edit-week" type="number" inputMode="numeric" value={week} onChange={e => setWeek(e.target.value)} className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                    <label htmlFor="edit-weight" className="block text-sm font-medium text-gray-300 mb-2">{t('weight')} ({t('kg')})</label>
                    <input id="edit-weight" type="number" inputMode="decimal" step="0.5" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                    <label htmlFor="edit-reps" className="block text-sm font-medium text-gray-300 mb-2">{t('reps')}</label>
                    <input id="edit-reps" type="number" inputMode="numeric" value={reps} onChange={e => setReps(e.target.value)} className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
            </div>
            
            <div>
              <label htmlFor="edit-comment" className="block text-sm font-medium text-gray-300 mb-2">{t('comment')}</label>
              <textarea id="edit-comment" value={comment} onChange={e => setComment(e.target.value)} rows={2} className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400">
                {t('cancel')}
              </button>
              <button type="submit" className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400">
                {t('save')}
              </button>
            </div>
        </form>
      </div>
    </div>
  );
};
