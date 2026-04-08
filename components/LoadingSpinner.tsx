import React from 'react';

export default function LoadingSpinner({ size = 'md', color = 'blue' }: { size?: 'sm' | 'md' | 'lg', color?: 'blue' | 'white' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const colorClasses = {
    blue: 'border-blue-200 border-t-blue-600',
    white: 'border-white/30 border-t-white',
  };

  return (
    <div className="flex justify-center items-center">
      <div 
        className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`} 
      />
    </div>
  );
}
