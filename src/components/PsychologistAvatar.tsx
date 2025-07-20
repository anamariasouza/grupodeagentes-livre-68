
import React from 'react';

interface PsychologistAvatarProps {
  emotion: 'happy' | 'thinking' | 'concerned' | 'encouraging';
}

export const PsychologistAvatar: React.FC<PsychologistAvatarProps> = ({ emotion }) => {
  const getEmoji = () => {
    switch (emotion) {
      case 'happy':
        return '😊';
      case 'thinking':
        return '🤔';
      case 'concerned':
        return '😟';
      case 'encouraging':
        return '🙂';
      default:
        return '😊';
    }
  };

  return (
    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
      <span className="text-3xl">{getEmoji()}</span>
    </div>
  );
};
