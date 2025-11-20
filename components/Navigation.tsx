import React from 'react';
import { ActivityIcon, CalendarIcon, ChartBarIcon, ClipboardListIcon, SettingsIcon } from './Icons';
import { Logo } from './Logo';
import type { View } from '../types';


interface NavigationProps {
    activeView: View;
    onNavigate: (view: View) => void;
}

const navItems: { id: View; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { id: 'log', label: 'سجل التمارين', icon: ActivityIcon },
    { id: 'calendar', label: 'التقويم', icon: CalendarIcon },
    { id: 'diet', label: 'البرنامج الغذائي', icon: ClipboardListIcon },
    { id: 'progress', label: 'التقدم', icon: ChartBarIcon },
    { id: 'settings', label: 'الإعدادات', icon: SettingsIcon },
];

export const Navigation: React.FC<NavigationProps> = ({ activeView, onNavigate }) => {
    return (
        <header className="mb-6">
            <nav className="bg-gray-800 p-3 sm:p-2 rounded-xl shadow-lg ring-1 ring-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Logo className="w-10 h-10" />
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">سجل المتابعة الرياضي والغذائي</h1>
                </div>
                <ul className="flex items-center justify-around sm:justify-end gap-1 sm:gap-2 bg-gray-900/50 sm:bg-transparent p-1 rounded-lg">
                    {navItems.map(item => (
                        <li key={item.id} className="flex-1 sm:flex-initial">
                            <button
                                onClick={() => onNavigate(item.id)}
                                className={`w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-sm sm:text-base font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 ${
                                    activeView === item.id 
                                    ? 'text-white bg-gray-700/60 sm:bg-transparent' 
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                }`}
                            >
                                <item.icon className={`w-5 h-5 transition-colors ${activeView === item.id ? 'text-blue-400' : ''}`} />
                                <span className="relative hidden sm:inline">
                                    {item.label}
                                    {activeView === item.id && (
                                        <span className="absolute -bottom-3 right-0 w-full h-0.5 bg-blue-500 rounded-full"></span>
                                    )}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
};