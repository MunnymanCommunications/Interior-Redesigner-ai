
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import SuggestionChip from './SuggestionChip';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  suggestions: string[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  hasUploadedImage: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, suggestions, onSendMessage, isLoading, hasUploadedImage }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!isLoading) {
      onSendMessage(suggestion);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-900/50 border-l border-gray-700/50 rounded-r-2xl">
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-cyan-400 rounded-full flex-shrink-0"></div>
            )}
            <div className={`p-4 rounded-xl max-w-md ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
              {msg.image && <img src={msg.image} alt="Generated design" className="mt-4 rounded-lg" />}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {hasUploadedImage && suggestions.length > 0 && (
        <div className="px-6 pb-2">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Here are a few ideas to get you started:</h3>
            <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                    <SuggestionChip key={i} suggestion={s} onClick={handleSuggestionClick} />
                ))}
            </div>
        </div>
      )}
      
      <div className="p-6 border-t border-gray-700/50">
        <div className="flex items-center bg-gray-800 rounded-lg px-4 py-2 gap-4 ring-1 ring-transparent focus-within:ring-purple-500 transition">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={hasUploadedImage ? "e.g., 'Make the furniture bohemian themed...'" : "Please upload an image first"}
            className="w-full bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none"
            disabled={isLoading || !hasUploadedImage}
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim() || !hasUploadedImage} className="p-2 rounded-full bg-purple-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-purple-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
