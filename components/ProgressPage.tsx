
import React, { useState, useMemo, useEffect } from 'react';
import type { WorkoutEntry, BodyPart, Exercise, BodyPartId } from '../types';
import { ProgressChart } from './ProgressChart';
import { ActivityIcon, DumbbellIcon, ChartBarIcon, TrophyIcon, CalendarIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface ProgressPageProps {
  log: WorkoutEntry[];
  bodyParts: BodyPart[];
  exercises: Record<BodyPartId, Exercise[]>;
}

const calculate1RM = (weight: number, reps: number) => {
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
};

export const ProgressPage: React.FC<ProgressPageProps> = ({ log, bodyParts, exercises }) => {
    const { t, language } = useLanguage();
    const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
    const [selectedExerciseName, setSelectedExerciseName] = useState<string | null>(null);

    const validLog = useMemo(() => {
        return log.filter(entry => 
            entry && typeof entry.weight === 'number' && typeof entry.reps === 'number'
        ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [log]);

    const globalStats = useMemo(() => {
        const totalWorkouts = new Set(validLog.map(e => e.date.split('T')[0])).size;
        const totalVolume = validLog.reduce((acc, curr) => acc + (curr.weight * curr.reps), 0);
        const maxWeightEntry = validLog.reduce((max, curr) => (curr.weight > (max?.weight || 0) ? curr : max), null as WorkoutEntry | null);
        
        const partCounts: Record<string, number> = {};
        validLog.forEach(e => { partCounts[e.part] = (partCounts[e.part] || 0) + 1; });
        const favoritePartId = Object.keys(partCounts).reduce((a, b) => partCounts[a] > partCounts[b] ? a : b, '');
        const favoritePart = bodyParts.find(p => p.id === favoritePartId);

        return {
            totalWorkouts,
            totalVolume,
            maxWeight: maxWeightEntry?.weight || 0,
            maxWeightExercise: maxWeightEntry?.exercise || '-',
            favoritePart
        };
    }, [validLog, bodyParts]);

    useEffect(() => {
        if (!selectedPartId && bodyParts.length > 0) {
            setSelectedPartId(bodyParts[0].id);
        }
    }, [bodyParts, selectedPartId]);

    const partExercisesStats = useMemo(() => {
        if (!selectedPartId) return [];
        
        const availableExercises = exercises[selectedPartId] || [];
        
        return availableExercises.map(ex => {
            const exerciseLogs = validLog.filter(e => e.exercise === ex.name);
            
            if (exerciseLogs.length <= 1) return null;

            const pr = Math.max(...exerciseLogs.map(e => e.weight), 0);
            const lastLog = exerciseLogs[exerciseLogs.length - 1];
            
            return {
                ...ex,
                hasLogs: true,
                pr: pr === -Infinity ? 0 : pr,
                lastLogDate: lastLog ? lastLog.date : null
            };
        })
        .filter((ex): ex is NonNullable<typeof ex> => ex !== null)
        .sort((a, b) => (b.lastLogDate || '').localeCompare(a.lastLogDate || ''));
    }, [selectedPartId, exercises, validLog]);

    useEffect(() => {
        if (partExercisesStats.length > 0) {
            setSelectedExerciseName(partExercisesStats[0].name);
        } else {
            setSelectedExerciseName(null);
        }
    }, [partExercisesStats]);

    const selectedExerciseData = useMemo(() => {
        if (!selectedExerciseName) return null;

        const logs = validLog.filter(e => e.exercise === selectedExerciseName);
        if (logs.length === 0) return null;

        const chartData = logs.map(e => ({
            date: new Date(e.date),
            weight: e.weight,
            reps: e.reps
        }));

        const currentPR = Math.max(...logs.map(e => e.weight));
        const bestVolume = Math.max(...logs.map(e => e.weight * e.reps));
        
        let best1RM = 0;
        logs.forEach(e => {
            const est = calculate1RM(e.weight, e.reps);
            if (est > best1RM) best1RM = est;
        });

        const recentHistory = [...logs].reverse().slice(0, 3);

        return {
            chartData,
            currentPR,
            bestVolume,
            best1RM,
            recentHistory,
            totalSets: logs.length
        };
    }, [selectedExerciseName, validLog]);

    if (validLog.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center h-96 bg-gray-800 rounded-3xl border-2 border-dashed border-gray-700 text-gray-500">
                <ActivityIcon className="w-20 h-20 mb-4 opacity-50"/>
                <h2 className="text-2xl font-bold text-gray-300">{t('no_data_compare')}</h2>
                <p className="mt-2">{t('no_logs_desc')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-2xl shadow-lg border border-gray-700/50 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><DumbbellIcon className="w-16 h-16" /></div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{t('total_workouts')}</p>
                    <h3 className="text-3xl font-bold text-white">{globalStats.totalWorkouts} <span className="text-sm text-gray-500 font-normal">{t('session')}</span></h3>
                </div>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-2xl shadow-lg border border-gray-700/50 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><ChartBarIcon className="w-16 h-16" /></div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{t('total_volume')}</p>
                    <h3 className="text-3xl font-bold text-purple-400">{(globalStats.totalVolume / 1000).toFixed(0)}k <span className="text-sm text-gray-500 font-normal">{t('kg')}</span></h3>
                </div>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-2xl shadow-lg border border-gray-700/50 relative overflow-hidden group hover:border-yellow-500/30 transition-colors">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><TrophyIcon className="w-16 h-16" /></div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{t('max_weight')}</p>
                    <h3 className="text-3xl font-bold text-yellow-400">{globalStats.maxWeight} <span className="text-sm text-gray-500 font-normal">{t('kg')}</span></h3>
                    <p className="text-xs text-gray-500 truncate mt-1">{globalStats.maxWeightExercise}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-2xl shadow-lg border border-gray-700/50 relative overflow-hidden group hover:border-pink-500/30 transition-colors">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity text-pink-500">
                        {globalStats.favoritePart ? <span className="text-6xl">{globalStats.favoritePart.icon}</span> : <ActivityIcon className="w-16 h-16"/>}
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{t('fav_part')}</p>
                    <h3 className="text-2xl font-bold text-pink-400 truncate">{globalStats.favoritePart ? (t(`part_${globalStats.favoritePart.id}` as any) || globalStats.favoritePart.name) : '-'}</h3>
                </div>
            </div>

            <div className="flex justify-center py-2">
                <div className="flex gap-2 overflow-x-auto pb-2 px-2 max-w-full no-scrollbar">
                    {bodyParts.map(part => (
                        <button
                            key={part.id}
                            onClick={() => setSelectedPartId(part.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                                selectedPartId === part.id
                                ? `bg-gradient-to-r ${part.gradient} text-white shadow-lg ring-2 ring-white/20 scale-105`
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200 border border-gray-700'
                            }`}
                        >
                            <span>{part.icon}</span>
                            <span>{t(`part_${part.id}` as any) || part.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                <div className="lg:col-span-4 space-y-3 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 px-1">{t('exercises')} {bodyParts.find(p => p.id === selectedPartId)?.name}</h3>
                    {partExercisesStats.map((ex) => (
                        <button
                            key={ex.name}
                            onClick={() => setSelectedExerciseName(ex.name)}
                            className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} p-3 rounded-xl border transition-all duration-200 flex items-center justify-between group ${
                                selectedExerciseName === ex.name
                                ? 'bg-gray-700/80 border-blue-500/50 shadow-md'
                                : 'bg-gray-800 border-gray-700/50 hover:bg-gray-700 hover:border-gray-600'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedExerciseName === ex.name ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-900 text-gray-500'}`}>
                                    {ex.image ? <img src={ex.image} alt="" className="w-full h-full object-cover rounded-lg opacity-80" /> : <DumbbellIcon className="w-5 h-5"/>}
                                </div>
                                <div>
                                    <p className={`font-bold text-sm ${selectedExerciseName === ex.name ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>{ex.name}</p>
                                    {ex.lastLogDate && <p className="text-[10px] text-gray-500">{new Date(ex.lastLogDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {month: 'short', day: 'numeric'})}</p>}
                                </div>
                            </div>
                            <div className="text-left">
                                {ex.pr > 0 ? (
                                    <>
                                        <p className="text-xs text-gray-500">PR</p>
                                        <p className="font-bold text-yellow-500">{ex.pr} <span className="text-[10px]">k</span></p>
                                    </>
                                ) : (
                                    <span className="text-xs text-gray-600">--</span>
                                )}
                            </div>
                        </button>
                    ))}
                    {partExercisesStats.length === 0 && (
                        <div className="text-center py-12 text-gray-500 text-sm bg-gray-800/50 rounded-xl border border-dashed border-gray-700 flex flex-col items-center gap-2">
                             <ChartBarIcon className="w-8 h-8 opacity-50" />
                             <p>{t('no_data_compare')}</p>
                             <p className="text-xs text-gray-600">{t('need_two_logs')}</p>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-8 space-y-6">
                    {selectedExerciseData ? (
                        <>
                            <div className="bg-gray-800 p-6 rounded-3xl shadow-lg border border-gray-700/50">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            {selectedExerciseName}
                                            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md border border-blue-500/20">{t('performance_analysis')}</span>
                                        </h3>
                                    </div>
                                    <div className="text-left">
                                         <p className="text-xs text-gray-400">{t('current_pr')}</p>
                                         <p className="text-2xl font-bold text-yellow-400">{selectedExerciseData.currentPR} <span className="text-sm text-gray-500">{t('kg')}</span></p>
                                    </div>
                                </div>
                                
                                <div className="h-64 w-full">
                                    {selectedExerciseData.chartData.length > 1 ? (
                                        <ProgressChart data={selectedExerciseData.chartData} />
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-gray-500 bg-gray-900/50 rounded-xl">
                                            {t('need_two_logs')}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700/50">
                                    <p className="text-xs text-gray-400 mb-1">{t('est_1rm')}</p>
                                    <p className="text-xl font-bold text-white">{selectedExerciseData.best1RM} <span className="text-sm text-gray-500">{t('kg')}</span></p>
                                    <div className="w-full bg-gray-700 h-1.5 mt-2 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full rounded-full" style={{width: '80%'}}></div>
                                    </div>
                                </div>
                                <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700/50">
                                    <p className="text-xs text-gray-400 mb-1">{t('highest_vol')}</p>
                                    <p className="text-xl font-bold text-white">{selectedExerciseData.bestVolume.toLocaleString()} <span className="text-sm text-gray-500">{t('unit')}</span></p>
                                    <div className="w-full bg-gray-700 h-1.5 mt-2 rounded-full overflow-hidden">
                                        <div className="bg-purple-500 h-full rounded-full" style={{width: '60%'}}></div>
                                    </div>
                                </div>
                                <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700/50">
                                    <p className="text-xs text-gray-400 mb-1">{t('workout_count')}</p>
                                    <p className="text-xl font-bold text-white">{selectedExerciseData.totalSets} <span className="text-sm text-gray-500">{t('time')}</span></p>
                                     <div className="w-full bg-gray-700 h-1.5 mt-2 rounded-full overflow-hidden">
                                        <div className="bg-blue-500 h-full rounded-full" style={{width: '40%'}}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-2xl border border-gray-700/50 overflow-hidden">
                                <div className="bg-gray-700/30 px-4 py-3 border-b border-gray-700/50 flex justify-between items-center">
                                    <h4 className="font-bold text-sm text-gray-300">{t('recent_sessions')}</h4>
                                    <CalendarIcon className="w-4 h-4 text-gray-500"/>
                                </div>
                                <div>
                                    {selectedExerciseData.recentHistory.map((entry, idx) => (
                                        <div key={entry.id} className={`px-4 py-3 flex justify-between items-center ${idx !== selectedExerciseData.recentHistory.length -1 ? 'border-b border-gray-700/50' : ''}`}>
                                            <div className="flex items-center gap-3">
                                                <div className="bg-gray-700 text-gray-300 text-xs font-bold px-2 py-1 rounded-md">
                                                    {new Date(entry.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {month: 'short', day: 'numeric'})}
                                                </div>
                                                <span className="text-sm text-gray-400">{t('week')} {entry.week}</span>
                                            </div>
                                            <div className="flex gap-4 text-sm">
                                                <span className="font-bold text-white">{entry.weight} <span className="text-xs text-gray-500 font-normal">{t('kg')}</span></span>
                                                <span className="text-gray-400">x</span>
                                                <span className="font-bold text-white">{entry.reps} <span className="text-xs text-gray-500 font-normal">{t('reps')}</span></span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-gray-800 rounded-3xl border border-gray-700/50 p-8 text-gray-500 opacity-75">
                             <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                 <ChartBarIcon className="w-8 h-8 text-gray-400"/>
                             </div>
                             <p className="font-medium">{t('select_exercise_chart')}</p>
                             <p className="text-xs mt-2 text-gray-600">{t('need_two_logs')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
