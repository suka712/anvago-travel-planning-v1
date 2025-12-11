import { useState } from 'react';
import { Heart, X } from 'lucide-react';

interface SwipeCardProps {
  id: string;
  name: string;
  imageUrl: string;
  onSwipe: (id: string, liked: boolean) => void;
}

export function SwipeCard({ id, name, imageUrl, onSwipe }: SwipeCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    setOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // If swiped far enough, register the swipe
    if (Math.abs(offset.x) > 100) {
      const liked = offset.x > 0;
      onSwipe(id, liked);
      setOffset({ x: 0, y: 0 });
    } else {
      // Reset position
      setOffset({ x: 0, y: 0 });
    }
  };

  const rotation = offset.x * 0.1;
  const opacity = 1 - Math.abs(offset.x) / 300;

  return (
    <div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{
        transform: `translateX(${offset.x}px) translateY(${offset.y}px) rotate(${rotation}deg)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        className="bg-white rounded-2xl border-2 border-black shadow-[8px_8px_0px_#000] overflow-hidden h-full"
        style={{ opacity }}
      >
        <div className="relative h-full">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-4/5 object-cover"
          />
          <div className="p-6 h-1/5 flex items-center justify-center">
            <h3 className="text-2xl font-bold text-center">{name}</h3>
          </div>
          
          {/* Swipe indicators */}
          {offset.x > 50 && (
            <div className="absolute top-8 right-8 bg-green-500 text-white px-6 py-3 rounded-full border-2 border-black font-bold text-xl rotate-12">
              LIKE
            </div>
          )}
          {offset.x < -50 && (
            <div className="absolute top-8 left-8 bg-red-500 text-white px-6 py-3 rounded-full border-2 border-black font-bold text-xl -rotate-12">
              PASS
            </div>
          )}
        </div>
      </div>
      
      {/* Button controls */}
      <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 flex gap-4">
        <button
          onClick={() => onSwipe(id, false)}
          className="w-16 h-16 bg-white border-2 border-black rounded-full shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 flex items-center justify-center"
        >
          <X className="w-8 h-8 text-red-500" />
        </button>
        <button
          onClick={() => onSwipe(id, true)}
          className="w-16 h-16 bg-white border-2 border-black rounded-full shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 flex items-center justify-center"
        >
          <Heart className="w-8 h-8 text-green-500" />
        </button>
      </div>
    </div>
  );
}

