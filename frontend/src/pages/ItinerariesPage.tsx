import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { onboardingService, ItineraryRecommendation, UserPreferences } from '../services/onboardingService';
import { MapPin, Clock, DollarSign, Loader2, RefreshCw } from 'lucide-react';

export default function ItinerariesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState<ItineraryRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRerolling, setIsRerolling] = useState(false);
  
  const preferences = location.state?.preferences as UserPreferences || JSON.parse(localStorage.getItem('userPreferences') || '{}');

  useEffect(() => {
    loadItineraries();
  }, []);

  const loadItineraries = async () => {
    setIsLoading(true);
    try {
      const data = await onboardingService.getItineraries(preferences);
      setItineraries(data.itineraries);
    } catch (error) {
      console.error('Error loading itineraries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReroll = async () => {
    setIsRerolling(true);
    try {
      const data = await onboardingService.rerollItineraries(preferences);
      setItineraries(data.itineraries);
    } catch (error) {
      console.error('Error rerolling itineraries:', error);
    } finally {
      setIsRerolling(false);
    }
  };

  const handleSelectItinerary = (itinerary: ItineraryRecommendation) => {
    navigate('/itinerary-detail', { state: { itinerary } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4FC3F7]/10 via-[#FAFAF8] to-[#81D4FA]/10 flex items-center justify-center">
        <Card static className="text-center p-12">
          <Loader2 className="w-16 h-16 animate-spin text-[#4FC3F7] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Creating Your Perfect Itinerary...</h2>
          <p className="text-gray-600">
            We're analyzing weather, traffic, and your preferences
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4FC3F7]/10 via-[#FAFAF8] to-[#81D4FA]/10">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2">Your Personalized Itineraries</h1>
          <p className="text-xl text-gray-600">Choose your adventure in Danang</p>
          <Button
            variant="ghost"
            onClick={handleReroll}
            isLoading={isRerolling}
            className="mt-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reroll Itineraries
          </Button>
        </div>

        {/* Itineraries Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itineraries.map((itinerary, index) => (
            <Card key={index} hoverable className="overflow-hidden" onClick={() => handleSelectItinerary(itinerary)}>
              {/* Images */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {itinerary.highlights.slice(0, 4).map((highlight, i) => (
                  <img
                    key={i}
                    src={highlight.imageUrl}
                    alt={highlight.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold mb-2">{itinerary.title}</h3>
              <p className="text-gray-600 mb-4">{itinerary.description}</p>

              {/* Stats */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{itinerary.durationDays} days</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{itinerary.items.length} locations</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4" />
                  <span>
                    ${itinerary.estimatedCost.min} - ${itinerary.estimatedCost.max}
                  </span>
                </div>
              </div>

              {/* Highlights */}
              <div className="mb-4">
                <div className="text-sm font-medium mb-2">Highlights:</div>
                <div className="flex flex-wrap gap-2">
                  {itinerary.highlights.slice(0, 3).map((highlight) => (
                    <span
                      key={highlight.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#4FC3F7]/20 border-2 border-black"
                    >
                      {highlight.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action */}
              <Button
                onClick={() => handleSelectItinerary(itinerary)}
                className="w-full"
              >
                View Details
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

