import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { locationService, Location } from '../services/itineraryService';
import { Search, Loader2, MapPin, Star } from 'lucide-react';

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: Location) => void;
}

export function LocationSearchModal({ isOpen, onClose, onSelect }: LocationSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLocations();
    }
  }, [isOpen, searchTerm, category]);

  const loadLocations = async () => {
    setIsLoading(true);
    try {
      const data = await locationService.searchLocations({
        search: searchTerm || undefined,
        category: category || undefined,
        limit: 20,
      });
      setLocations(data.locations);
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (location: Location) => {
    onSelect(location);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Location">
      <div className="space-y-4">
        <Input
          placeholder="Search locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-5 h-5" />}
        />

        <div className="flex gap-2 flex-wrap">
          {['all', 'beach', 'temple', 'restaurant', 'market', 'attraction'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat === 'all' ? '' : cat)}
              className={`px-3 py-1 rounded-full text-sm font-medium border-2 border-black transition-all ${
                (cat === 'all' && !category) || category === cat
                  ? 'bg-[#4FC3F7] text-black'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div className="max-h-96 overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#4FC3F7]" />
            </div>
          ) : locations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No locations found</p>
            </div>
          ) : (
            locations.map((location) => (
              <button
                key={location.id}
                onClick={() => handleSelect(location)}
                className="w-full bg-white border-2 border-black rounded-lg p-3 hover:shadow-[4px_4px_0px_#000] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all text-left"
              >
                <div className="flex gap-3">
                  <img
                    src={location.imageUrl}
                    alt={location.name}
                    className="w-16 h-16 object-cover rounded-lg border-2 border-black"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold">{location.name}</h4>
                    <p className="text-sm text-gray-600 line-clamp-1">{location.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{location.rating}</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                        {location.category}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                        {location.priceRange}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}

