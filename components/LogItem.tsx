import React from 'react';
import type { WorkoutEntry, BodyPart } from '../types';
import { TrashIcon, PencilIcon, CalendarIcon } from './Icons';

interface LogItemProps {
  entry: WorkoutEntry;
  bodyParts: BodyPart[];
  onDelete: (id: string) => void;
  onEditRequest: (entry: WorkoutEntry) => void;
  onImageClick: (image: {src: string; alt: string}) => void;
}

export const LogItem: React.FC<LogItemProps> = ({ entry, bodyParts, onDelete, onEditRequest, onImageClick }) => {
  const partInfo = bodyParts.find(p => p.id === entry.part);

  const formattedDate = new Date(entry.date).toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    calendar: 'gregory'
  });

  return (
    <div className="bg-gray-700/50 p-4 rounded-xl flex items-start gap-4 transition-transform duration-300 hover:scale-[1.02] hover:bg-gray-700 shadow-md">
      <img
          src={entry.image}
          alt={entry.exercise}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover cursor-pointer flex-shrink-0"
          onClick={() => onImageClick({src: entry.image, alt: entry.exercise})}
      />

      <div className="flex-grow">
        {partInfo && (
            <div className={`inline-flex items-center gap-2 px-3 py-1 mb-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${partInfo.gradient}`}>
                <span>{partInfo.icon}</span>
                <span>{partInfo.name}</span>
            </div>
        )}
        <p className="font-bold text-white text-xl">{entry.exercise}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-base mt-3">
            <div className="flex items-baseline gap-1.5">
                <span className="font-medium text-yellow-400">الأسبوع:</span>
                <span className="font-semibold text-yellow-300">{entry.week}</span>
            </div>
             <div className="flex items-baseline gap-1.5">
                <span className="font-medium text-cyan-400">الوزن:</span>
                <span className="font-semibold text-cyan-300">{entry.weight} كجم</span>
            </div>
            <div className="flex items-baseline gap-1.5">
                <span className="font-medium text-lime-400">التكرارات:</span>
                <span className="font-semibold text-lime-300">{entry.reps}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <CalendarIcon className="w-5 h-5 text-gray-500" />
                <span className="font-semibold text-gray-300">{formattedDate}</span>
            </div>
        </div>
        
        {entry.comment && (
            <div className="mt-3 pt-3 border-t border-gray-600/50">
                <p className="text-base text-gray-300">"{entry.comment}"</p>
            </div>
        )}
      </div>

      <div className="flex flex-col gap-2 self-start ml-auto">
          <button
            onClick={() => onEditRequest(entry)}
            className="p-2 rounded-full text-gray-400 hover:bg-blue-500/20 hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Edit entry"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-2 rounded-full text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Delete entry"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
      </div>
    </div>
  );
};
