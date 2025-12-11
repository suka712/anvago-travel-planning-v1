import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SkeletonCard } from '../components/Skeleton';
import { useToast } from '../contexts/ToastContext';
import { itineraryService, Itinerary } from '../services/itineraryService';
import {
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Play,
  Loader2,
  Plus,
} from 'lucide-react';

export default function MyTripsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadItineraries();
  }, [filter]);

  const loadItineraries = async () => {
    setIsLoading(true);
    try {
      const status = filter === 'all' ? undefined : filter;
      const data = await itineraryService.getItineraries(status);
      setItineraries(data.itineraries);
    } catch (error) {
      console.error('Error loading itineraries:', error);
      showToast('Error loading trips', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;

    try {
      await itineraryService.deleteItinerary(id);
      setItineraries(itineraries.filter((it) => it.id !== id));
      showToast('Trip deleted', 'success');
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      showToast('Error deleting trip', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4FC3F7]/10 via-[#FAFAF8] to-[#81D4FA]/10 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Trips</h1>
            <p className="text-xl text-gray-600">Manage your travel plans</p>
          </div>
          <Button onClick={() => navigate('/')}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Trip
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {['all', 'draft', 'scheduled', 'in_progress', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg border-2 border-black font-medium whitespace-nowrap transition-all ${
                filter === status
                  ? 'bg-[#4FC3F7] text-black shadow-[4px_4px_0px_#000]'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Trips Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : itineraries.length === 0 ? (
          <Card static className="text-center py-20">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold mb-2">No trips found</h2>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? "You haven't created any trips yet"
                : `You don't have any ${filter} trips`}
            </p>
            <Button onClick={() => navigate('/')}>
              Create Your First Trip
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itineraries.map((itinerary) => {
              const items = itinerary.items || [];
              const imageItems = items.filter(item => item.location?.imageUrl).slice(0, 4);
              
              return (
                <Card key={itinerary.id} hoverable className="flex flex-col h-full min-h-[400px] !p-0">
                  {/* Image Grid */}
                  <div className="p-5 pb-0 flex-shrink-0" style={{ height: '180px' }}>
                    {imageItems.length > 0 ? (
                      <div className={`grid gap-2 h-40 ${
                        imageItems.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                      }`}>
                        {imageItems.map((item, i) => (
                          <img
                            key={i}
                            src={item.location.imageUrl}
                            alt={item.location.name}
                            className="w-full h-full object-cover rounded-lg border-2 border-black"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=No+Image';
                            }}
                          />
                        ))}
                        {/* Fill empty slots if less than 4 images */}
                        {imageItems.length < 4 && imageItems.length > 1 && (
                          Array.from({ length: 4 - imageItems.length }).map((_, i) => (
                            <div
                              key={`empty-${i}`}
                              className="w-full h-full bg-gray-100 rounded-lg border-2 border-black flex items-center justify-center"
                            >
                              <MapPin className="w-8 h-8 text-gray-400" />
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      <div className="h-40 bg-gradient-to-br from-[#4FC3F7]/20 to-[#81D4FA]/20 rounded-lg border-2 border-black flex items-center justify-center">
                        <MapPin className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Content - starts after image section */}
                  <div className="px-5 pt-4 pb-4 flex-1 flex flex-col min-h-0">
                    <div className="flex items-start justify-between mb-2 gap-2 flex-shrink-0">
                      <h3 className="text-xl font-bold flex-1 line-clamp-2 break-words">{itinerary.title || 'Untitled Trip'}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border-2 border-black whitespace-nowrap flex-shrink-0 ${getStatusColor(itinerary.status)}`}>
                        {itinerary.status.replace('_', ' ')}
                      </span>
                    </div>

                    {itinerary.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-shrink-0">
                        {itinerary.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{items.length} {items.length === 1 ? 'stop' : 'stops'}</span>
                      </div>
                      {itinerary.startDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>{new Date(itinerary.startDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-5 pb-5 flex gap-2 mt-auto flex-shrink-0">
                    {itinerary.status === 'scheduled' || itinerary.status === 'in_progress' ? (
                      <Button
                        onClick={() => navigate(`/trip/${itinerary.id}`)}
                        className="flex-1"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {itinerary.status === 'in_progress' ? 'Continue' : 'Start'}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => navigate(`/plan/${itinerary.id}`)}
                        variant="secondary"
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(itinerary.id)}
                      size="small"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

