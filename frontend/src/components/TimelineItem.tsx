import { Card } from './Card';
import { ItineraryItem } from '../services/itineraryService';
import { CheckCircle2, Clock, MapPin } from 'lucide-react';

interface TimelineItemProps {
  item: ItineraryItem;
  index: number;
  isCurrent: boolean;
  isCompleted: boolean;
  isUpcoming: boolean;
  onClick?: () => void;
}

export function TimelineItem({
  item,
  index,
  isCurrent,
  isCompleted,
  isUpcoming,
  onClick,
}: TimelineItemProps) {
  return (
    <div
      className={`relative flex gap-4 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Timeline Line */}
      <div className="flex flex-col items-center">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-2 border-black shadow-[2px_2px_0px_#000] ${
            isCompleted
              ? 'bg-green-500 text-white'
              : isCurrent
              ? 'bg-[#4FC3F7] text-black'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            index + 1
          )}
        </div>
        {!isUpcoming && (
          <div className="w-0.5 h-full bg-black my-2" style={{ minHeight: '60px' }} />
        )}
      </div>

      {/* Content */}
      <Card
        static
        className={`flex-1 ${
          isCurrent ? 'ring-2 ring-[#4FC3F7]' : ''
        } ${isCompleted ? 'opacity-75' : ''}`}
      >
        <div className="flex gap-4">
          <img
            src={item.location.imageUrl}
            alt={item.location.name}
            className="w-20 h-20 object-cover rounded-lg border-2 border-black flex-shrink-0"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className={`text-lg font-bold ${isCompleted ? 'line-through' : ''}`}>
                {item.location.name}
              </h3>
              {isCurrent && (
                <span className="px-2 py-1 bg-[#4FC3F7] text-black rounded-full text-xs font-bold border-2 border-black">
                  Current
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {item.scheduledStartTime} - {item.scheduledEndTime}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {item.durationMinutes} min
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

