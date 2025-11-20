
import React from 'react';
import { ActivityIcon, CalendarIcon, ChartBarIcon, ClipboardListIcon, SettingsIcon } from './Icons';
import { Logo } from './Logo';
import type { View } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface NavigationProps {
    activeView: View;
    onNavigate: (view: View) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeView, onNavigate }) => {
    const { t, language, setLanguage } = useLanguage();

    const navItems: { id: View; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
        { id: 'log', label: t('nav_log'), icon: ActivityIcon },
        { id: 'calendar', label: t('nav_archive'), icon: CalendarIcon },
        { id: 'diet', label: t('nav_diet'), icon: ClipboardListIcon },
        { id: 'progress', label: t('nav_progress'), icon: ChartBarIcon },
        { id: 'settings', label: t('nav_settings'), icon: SettingsIcon },
    ];

    return (
        <header className="mb-6">
            <nav className="bg-gray-800 p-3 sm:p-2 rounded-xl shadow-lg ring-1 ring-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center justify-between w-full sm:w-auto">
                    <div className="flex items-center gap-3">
                        <Logo className="w-12 h-12" />
                        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-sky-500 bg-clip-text text-transparent">{t('app_title')}</h1>
                    </div>
                    {/* Mobile Language Toggle */}
                    <button 
                        onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                        className="sm:hidden px-3 py-1 rounded-md bg-gray-700 text-white font-bold text-sm"
                    >
                        {language === 'ar' ? 'EN' : 'عربي'}
                    </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                     {/* Desktop Language Toggle */}
                    <button 
                        onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                        className="hidden sm:block px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 text-white font-bold text-sm transition-colors mr-2"
                    >
                        {language === 'ar' ? 'English' : 'عربي'}
                    </button>

                    <ul className="flex items-center justify-around sm:justify-end gap-1 sm:gap-2 bg-gray-900/50 sm:bg-transparent p-1 rounded-lg flex-grow">
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
                                    <span className="relative hidden lg:inline">
                                        {item.label}
                                        {activeView === item.id && (
                                            <span className="absolute -bottom-3 right-0 w-full h-0.5 bg-blue-500 rounded-full"></span>
                                        )}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>
        </header>
    );
};
