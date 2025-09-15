
import React from 'react';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="absolute inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-md flex flex-col items-center justify-center z-50">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-2 border-cyan-400/50 rounded-full animate-ping"></div>
        <div className="absolute inset-2 border-2 border-purple-500/50 rounded-full animate-ping" style={{ animationDelay: '-0.5s' }}></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v11.494m-9-5.747h18" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 18h16" />
            </svg>
        </div>
      </div>
      <p className="mt-6 text-white text-lg font-medium tracking-wider">{message}</p>
    </div>
  );
};

export default Loader;
