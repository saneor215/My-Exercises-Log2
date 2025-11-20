import React, { useState, useMemo, useEffect } from 'react';
import type { WorkoutEntry, BodyPart, Exercise, BodyPartId } from '../types';
import { ProgressChart } from './ProgressChart';
import { ActivityIcon } from './Icons';

interface ProgressPageProps {
  log: WorkoutEntry[];
  bodyParts: BodyPart[];
  exercises: Record<BodyPartId, Exercise[]>;
}

const StatCard: React.FC<{ title: string; value: string; subtext?: string; className?: string }> = ({ title, value, subtext, className }) => (
    <div className={`bg-gray-800 p-4 rounded-xl ring-1 ring-white/10 ${className}`}>
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <p className={`text-2xl font-bold text-white ${className}`}>{value}</p>
        {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
    </div>
);

export const ProgressPage: React.FC<ProgressPageProps> = ({ log, bodyParts, exercises }) => {
    const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

    const validLog = useMemo(() => {
        return log.filter(entry => 
            entry && 
            typeof entry === 'object' &&
            typeof entry.exercise === 'string' &&
            typeof entry.weight === 'number' &&
            typeof entry.date === 'string' &&
            typeof entry.reps === 'number' &&
            typeof entry.week === 'number'
        );
    }, [log]);
    
    const loggedExercises = useMemo(() => {
        return [...new Set(validLog.map(entry => entry.exercise))].sort();
    }, [validLog]);
    
    useEffect(() => {
        if (!selectedExercise && loggedExercises.length > 0) {
            setSelectedExercise(loggedExercises[0]);
        }
         if (selectedExercise && !loggedExercises.includes(selectedExercise)) {
            setSelectedExercise(loggedExercises.length > 0 ? loggedExercises[0] : null);
        }
    }, [loggedExercises, selectedExercise]);
    
    const chartData = useMemo(() => {
        if (!selectedExercise) return [];
        return validLog
            .filter(e => e.exercise === selectedExercise)
            .map(e => ({ date: new Date(e.date), weight: e.weight, reps: e.reps }))
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [validLog, selectedExercise]);

    const personalRecords = useMemo(() => {
        const prs: { [key: string]: WorkoutEntry } = {};
        validLog.forEach(entry => {
            if (!prs[entry.exercise] || entry.weight > prs[entry.exercise].weight) {
                prs[entry.exercise] = entry;
            }
        });
        return Object.values(prs).sort((a, b) => {
             const partA = bodyParts.find(p => p.id === a.part)?.name || '';
             const partB = bodyParts.find(p => p.id === b.part)?.name || '';
             return partA.localeCompare(partB) || a.exercise.localeCompare(b.exercise)
        });
    }, [validLog, bodyParts]);

    const overallStats = useMemo(() => {
        const totalWorkouts = validLog.length;
        const heaviestLift = totalWorkouts > 0 ? Math.max(...validLog.map(e => e.weight)) : 0;
        return { totalWorkouts, heaviestLift };
    }, [validLog]);

    const exerciseStats = useMemo(() => {
        if (chartData.length === 0) return null;
        const pr = Math.max(...chartData.map(d => d.weight));

        const latestWeekEntry = validLog.reduce((latest, entry) => (!latest || entry.week > latest.week) ? entry : latest, null as WorkoutEntry | null);
        const latestWeek = latestWeekEntry ? latestWeekEntry.week : 0;
        
        const getVolumeForWeek = (weekNum: number) => {
            return validLog
                .filter(e => e.exercise === selectedExercise && e.week === weekNum)
                .reduce((sum, d) => sum + (d.weight * d.reps), 0);
        }

        const currentVolume = getVolumeForWeek(latestWeek);
        const prevVolume = getVolumeForWeek(latestWeek - 1);

        let volumeChange = 0;
        if (prevVolume > 0) {
            volumeChange = ((currentVolume - prevVolume) / prevVolume) * 100;
        } else if (currentVolume > 0) {
            volumeChange = 100; // If there was no volume before, any new volume is 100% increase
        }

        return { pr, currentVolume, volumeChange };

    }, [chartData, validLog, selectedExercise]);

    if (validLog.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 p-8 border-2 border-dashed border-gray-700 rounded-xl bg-gray-800">
                <ActivityIcon className="w-16 h-16 mb-4"/>
                <h4 className="text-xl font-bold text-gray-400">لا توجد بيانات لعرض التقدم</h4>
                <p>ابدأ بتسجيل بعض التمارين أولاً لرؤية تحليلاتك هنا.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg ring-1 ring-white/10">
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent mb-6">نظرة عامة على التقدم</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <StatCard title="إجمالي التمارين المسجلة" value={overallStats.totalWorkouts.toLocaleString('ar-EG')} />
                   <StatCard title="أثقل وزن (كل التمارين)" value={`${overallStats.heaviestLift.toLocaleString('ar-EG')} كجم`} />
                </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg ring-1 ring-white/10">
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-lime-400 to-green-400 bg-clip-text text-transparent mb-6">تحليل تمرين محدد</h2>
                <div className="mb-6">
                    <label htmlFor="exercise-progress-select" className="sr-only">اختر تمريناً</label>
                    <div className="relative">
                        <select
                            id="exercise-progress-select"
                            value={selectedExercise || ''}
                            onChange={e => setSelectedExercise(e.target.value)}
                            className="w-full bg-gray-700 border-gray-600 text-white pl-3 pr-10 py-3 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        >
                            {loggedExercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                        </select>
                         <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-gray-400">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>

                {chartData.length > 1 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <StatCard title="الرقم القياسي (PR)" value={`${exerciseStats?.pr.toLocaleString('ar-EG') || 0} كجم`} subtext="أثقل وزن مسجل لهذا التمرين" />
                            <StatCard title="حجم التمرين (آخر أسبوع)" value={`${exerciseStats?.currentVolume.toLocaleString('ar-EG') || 0}`} subtext="الوزن × التكرارات" />
                            <StatCard 
                                title="التغير عن الأسبوع الماضي" 
                                value={`${exerciseStats?.volumeChange.toFixed(0) || 0}%`}
                                className={exerciseStats && exerciseStats.volumeChange > 0 ? 'text-green-400' : exerciseStats && exerciseStats.volumeChange < 0 ? 'text-red-400' : ''} 
                            />
                        </div>
                        <div className="h-96">
                            <ProgressChart data={chartData} />
                        </div>
                    </>
                ) : (
                    <div className="text-center text-gray-500 py-16">
                        سجل هذا التمرين مرتين على الأقل لعرض مخطط التقدم.
                    </div>
                )}
            </div>

            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg ring-1 ring-white/10">
                 <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-6">الأرقام القياسية الشخصية (PRs)</h2>
                 <div className="overflow-x-auto">
                    <table className="w-full text-right min-w-[600px]">
                        <thead className="border-b border-gray-700">
                            <tr>
                                <th className="p-3 text-sm font-semibold text-gray-400">الجزء</th>
                                <th className="p-3 text-sm font-semibold text-gray-400">التمرين</th>
                                <th className="p-3 text-sm font-semibold text-gray-400">أثقل وزن</th>
                                <th className="p-3 text-sm font-semibold text-gray-400">التاريخ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {personalRecords.map(pr => {
                                const partInfo = bodyParts.find(p => p.id === pr.part);
                                return (
                                    <tr key={pr.id} className="border-b border-gray-700/50 hover:bg-gray-700/40">
                                        <td className="p-3">
                                            {partInfo && <span className={`px-2 py-1 rounded-full text-xs font-bold bg-${partInfo.color}-500/20 text-${partInfo.color}-300`}>{partInfo.name}</span>}
                                        </td>
                                        <td className="p-3 font-medium text-gray-200">{pr.exercise}</td>
                                        <td className="p-3 font-bold text-cyan-300">{pr.weight} كجم</td>
                                        <td className="p-3 text-sm text-gray-400">{new Date(pr.date).toLocaleDateString('ar-EG', { calendar: 'gregory' })}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};