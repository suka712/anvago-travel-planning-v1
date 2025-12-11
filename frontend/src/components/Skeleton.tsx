import { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ 
  variant = 'rectangular', 
  width, 
  height, 
  className = '', 
  ...props 
}: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-gray-200 rounded';
  
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={style}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border-2 border-black p-5 shadow-[6px_6px_0px_#000]">
      <div className="grid grid-cols-2 gap-2 mb-4 h-40">
        <Skeleton variant="rectangular" className="w-full h-full" />
        <Skeleton variant="rectangular" className="w-full h-full" />
        <Skeleton variant="rectangular" className="w-full h-full" />
        <Skeleton variant="rectangular" className="w-full h-full" />
      </div>
      <Skeleton variant="text" width="60%" className="mb-2" />
      <Skeleton variant="text" width="40%" className="mb-4" />
      <div className="flex gap-2">
        <Skeleton variant="rectangular" width="70%" height={40} />
        <Skeleton variant="rectangular" width="30%" height={40} />
      </div>
    </div>
  );
}

export function SkeletonItineraryItem() {
  return (
    <div className="bg-white rounded-xl border-2 border-black p-5 shadow-[6px_6px_0px_#000] mb-4">
      <div className="flex items-center gap-4">
        <Skeleton variant="rectangular" width={80} height={80} />
        <div className="flex-1">
          <Skeleton variant="text" width="70%" className="mb-2" />
          <Skeleton variant="text" width="50%" />
        </div>
      </div>
    </div>
  );
}

