import React, { useEffect } from 'react';

interface FullscreenModalProps {
  imageUrl: string;
  onClose: () => void;
}

const FullscreenModal: React.FC<FullscreenModalProps> = ({ imageUrl, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-colors z-10"
        aria-label="Close fullscreen view"
      >
        &times;
      </button>
      <img
        src={imageUrl}
        alt="Fullscreen interior design"
        className="max-h-full max-w-full object-contain"
        onClick={(e) => e.stopPropagation()} // Prevents closing modal when clicking on the image itself
      />
    </div>
  );
};

export default FullscreenModal;
