import { HTMLAttributes } from 'react';

interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
}

export function ProgressBar({ 
  progress, 
  label, 
  showPercentage = false,
  className = '',
  ...props 
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${className}`} {...props}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm font-medium text-gray-700">{Math.round(clampedProgress)}%</span>
          )}
        </div>
      )}
      <div className="w-full h-3 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
        <div
          className="h-full bg-[#4FC3F7] transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}

