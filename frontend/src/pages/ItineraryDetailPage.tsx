import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LoginModal } from '../components/LoginModal';
import { useAuth } from '../contexts/AuthContext';
import { itineraryService } from '../services/itineraryService';
import { ItineraryRecommendation } from '../services/onboardingService';
import {
  MapPin,
  Clock,
  DollarSign,
  Navigation,
  Calendar,
  ArrowRight,
  Edit,
  Play,
} from 'lucide-react';

const TRANSPORTATION_ICONS: Record<string, string> = {
  walking: '🚶',
  grab_bike: '🏍️',
  grab_car: '🚗',
  rickshaw: '🛺',
  bus: '🚌',
};

export default function ItineraryDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const itinerary = location.state?.itinerary as ItineraryRecommendation;

  if (!itinerary) {
    navigate('/');
    return null;
  }

  const handleAction = async (action: 'customize' | 'schedule' | 'go-now') => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }

    setIsSaving(true);
    try {
      // Save itinerary to database
      const { itinerary: savedItinerary } = await itineraryService.createItinerary({
        title: itinerary.title,
        items: itinerary.items,
      });

      if (action === 'customize') {
        navigate(`/plan/${savedItinerary.id}`);
      } else if (action === 'schedule') {
        navigate(`/plan/${savedItinerary.id}`, { state: { openSchedule: true } });
      } else if (action === 'go-now') {
        navigate(`/trip/${savedItinerary.id}`);
      }
    } catch (error) {
      console.error('Error saving itinerary:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4FC3F7]/10 via-[#FAFAF8] to-[#81D4FA]/10 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-black mb-4"
          >
            ← Back to itineraries
          </button>
          <h1 className="text-4xl font-bold mb-2">{itinerary.title}</h1>
          <p className="text-xl text-gray-600 mb-4">{itinerary.description}</p>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded-lg">
              <Clock className="w-5 h-5" />
              <span className="font-medium">{itinerary.durationDays} days</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded-lg">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">{itinerary.items.length} locations</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded-lg">
              <DollarSign className="w-5 h-5" />
              <span className="font-medium">
                ${itinerary.estimatedCost.min} - ${itinerary.estimatedCost.max}
              </span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <Card static className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Your Itinerary Timeline</h2>
          <div className="space-y-6">
            {itinerary.items.map((item, index) => {
              const location = itinerary.highlights.find(h => h.id === item.locationId);
              const nextItem = itinerary.items[index + 1];
              
              return (
                <div key={index}>
                  {/* Location Card */}
                  <div className="flex gap-4">
                    {/* Time */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-[#4FC3F7] border-2 border-black rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      {nextItem && (
                        <div className="w-0.5 h-full bg-black my-2" style={{ minHeight: '80px' }} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="bg-white border-2 border-black rounded-xl p-4 shadow-[4px_4px_0px_#000]">
                        <div className="flex gap-4">
                          {location?.imageUrl && (
                            <img
                              src={location.imageUrl}
                              alt={location.name}
                              className="w-24 h-24 object-cover rounded-lg border-2 border-black"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-1">{location?.name || 'Location'}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <Clock className="w-4 h-4" />
                              <span>
                                {item.scheduledStartTime} - {item.scheduledEndTime} ({item.durationMinutes} min)
                              </span>
                            </div>
                            {item.transportationMethod && (
                              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 border-2 border-black rounded-full text-sm font-medium">
                                <span>{TRANSPORTATION_ICONS[item.transportationMethod] || '🚶'}</span>
                                <span className="capitalize">{item.transportationMethod.replace('_', ' ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Transportation to next location */}
                      {nextItem && (
                        <div className="flex items-center gap-2 ml-28 mt-2 text-sm text-gray-600">
                          <Navigation className="w-4 h-4" />
                          <span>Travel to next location (~15 min)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Action Buttons */}
        <Card static>
          <h2 className="text-2xl font-bold mb-4">Ready to start your adventure?</h2>
          <p className="text-gray-600 mb-6">
            {isAuthenticated
              ? 'Choose how you want to proceed with this itinerary'
              : 'Login to customize, schedule, or start your trip'}
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              onClick={() => handleAction('customize')}
              variant="secondary"
              className="h-auto py-6 flex-col items-start"
              isLoading={isSaving}
            >
              <Edit className="w-6 h-6 mb-2" />
              <div className="text-left">
                <div className="font-bold text-lg">Customize</div>
                <div className="text-sm font-normal text-gray-600">
                  Drag & drop to rearrange
                </div>
              </div>
            </Button>

            <Button
              onClick={() => handleAction('schedule')}
              variant="secondary"
              className="h-auto py-6 flex-col items-start"
              isLoading={isSaving}
            >
              <Calendar className="w-6 h-6 mb-2" />
              <div className="text-left">
                <div className="font-bold text-lg">Schedule</div>
                <div className="text-sm font-normal text-gray-600">
                  Set dates for your trip
                </div>
              </div>
            </Button>

            <Button
              onClick={() => handleAction('go-now')}
              className="h-auto py-6 flex-col items-start"
              isLoading={isSaving}
            >
              <Play className="w-6 h-6 mb-2" />
              <div className="text-left">
                <div className="font-bold text-lg">Go Now</div>
                <div className="text-sm font-normal text-gray-600">
                  Start your trip right away
                </div>
              </div>
              <ArrowRight className="w-5 h-5 ml-auto mt-2" />
            </Button>
          </div>
        </Card>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}

