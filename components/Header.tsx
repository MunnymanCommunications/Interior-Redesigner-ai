
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 p-4 sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-9-5.747h18" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 18h16" />
                </svg>
            </div>
            <h1 className="text-xl font-bold text-white tracking-wider">
                AI Interior Designer Pro
            </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
