
import React from 'react';

interface SuggestionChipProps {
  suggestion: string;
  onClick: (suggestion: string) => void;
}

const SuggestionChip: React.FC<SuggestionChipProps> = ({ suggestion, onClick }) => {
  return (
    <button
      onClick={() => onClick(suggestion)}
      className="px-4 py-2 bg-gray-800/80 border border-gray-600/50 rounded-full text-sm text-cyan-300 hover:bg-gray-700/80 hover:border-cyan-400/50 transition-all duration-200 backdrop-blur-sm"
    >
      {suggestion}
    </button>
  );
};

export default SuggestionChip;
