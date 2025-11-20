import React from 'react';
import { XIcon } from './Icons';

interface ImageModalProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ src, alt, onClose }) => {
  // Add a keydown listener to close the modal with the Escape key
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4 transition-opacity duration-300 animate-fade-in-fast"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative max-w-2xl w-full max-h-[90vh] transition-transform duration-300 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <img src={src} alt={alt} className="block w-full h-full object-contain rounded-lg shadow-2xl" />
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 sm:top-0 sm:right-0 sm:-mr-4 sm:-mt-4 bg-gray-800 rounded-full p-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white transition-transform hover:scale-110"
          aria-label="Close image view"
        >
          <XIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

// Add keyframes for modal animation
const style = document.createElement('style');
style.innerHTML = `
@keyframes fade-in-fast {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in-fast {
  animation: fade-in-fast 0.2s ease-out forwards;
}
@keyframes scale-in {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.animate-scale-in {
  animation: scale-in 0.2s ease-out forwards;
}
`;
document.head.appendChild(style);