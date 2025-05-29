import React from 'react';

interface TypingIndicatorProps {
  isTyping: boolean;
  user?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isTyping, user }) => {
  if (!isTyping) return null;

  return (
    <div className="flex items-center space-x-1 px-4 py-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-sm text-gray-500">
        {user ? `${user} is typing...` : 'Typing...'}
      </span>
    </div>
  );
};

export default TypingIndicator;