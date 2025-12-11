import { Modal } from './Modal';
import { Button } from './Button';
import { Location } from '../services/itineraryService';
import { MapPin, Clock, DollarSign, Star, ExternalLink } from 'lucide-react';

interface LocationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: Location | null;
  onAddToItinerary?: () => void;
}

export function LocationDetailModal({ 
  isOpen, 
  onClose, 
  location,
  onAddToItinerary 
}: LocationDetailModalProps) {
  if (!location) return null;

  const getPriceRangeColor = (range: string) => {
    switch (range.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'luxury':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={location.name}>
      <div className="space-y-4">
        {location.imageUrl && (
          <img
            src={location.imageUrl}
            alt={location.name}
            className="w-full h-48 object-cover rounded-lg border-2 border-black"
          />
        )}

        {location.description && (
          <p className="text-gray-600">{location.description}</p>
        )}

        {location.address && (
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-600">{location.address}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {location.rating && (
            <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 rounded-full border-2 border-black">
              <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
              <span className="text-sm font-medium">{location.rating.toFixed(1)}</span>
            </div>
          )}

          {location.priceRange && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium border-2 border-black ${getPriceRangeColor(location.priceRange)}`}>
              {location.priceRange}
            </span>
          )}

          {location.category && (
            <span className="px-3 py-1 bg-blue-100 rounded-full text-sm font-medium border-2 border-black">
              {location.category}
            </span>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          {onAddToItinerary && (
            <Button onClick={onAddToItinerary} className="flex-1">
              Add to Itinerary
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => {
              if (location.latitude && location.longitude) {
                window.open(
                  `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
                  '_blank'
                );
              }
            }}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Map
          </Button>
        </div>
      </div>
    </Modal>
  );
}

