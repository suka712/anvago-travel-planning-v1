import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { PersonaCard } from '../components/PersonaCard';
import { EmojiSelector } from '../components/EmojiSelector';
import { SwipeCard } from '../components/SwipeCard';
import { onboardingService, UserPreferences, WeatherData } from '../services/onboardingService';
import { Cloud, Droplets, Wind, Loader2 } from 'lucide-react';

const PERSONAS = [
  { id: 'adventure', emoji: '🏔️', name: 'Adventure Seeker' },
  { id: 'culture', emoji: '🏛️', name: 'Culture Enthusiast' },
  { id: 'food', emoji: '🍜', name: 'Food Lover' },
  { id: 'beach', emoji: '🏖️', name: 'Beach Bum' },
  { id: 'nightlife', emoji: '🌃', name: 'Nightlife Explorer' },
  { id: 'family', emoji: '👨‍👩‍👧‍👦', name: 'Family Traveler' },
  { id: 'budget', emoji: '💰', name: 'Budget Traveler' },
  { id: 'luxury', emoji: '✨', name: 'Luxury Seeker' },
];

const INTERESTS = [
  { emoji: '🏖️', label: 'Beach' },
  { emoji: '🏛️', label: 'Temples' },
  { emoji: '🍜', label: 'Food' },
  { emoji: '🛍️', label: 'Shopping' },
  { emoji: '🎨', label: 'Art & Culture' },
  { emoji: '🏔️', label: 'Nature' },
  { emoji: '🎢', label: 'Activities' },
  { emoji: '🌃', label: 'Nightlife' },
  { emoji: '📸', label: 'Photography' },
  { emoji: '🧘', label: 'Wellness' },
];

const SWIPE_LOCATIONS = [
  { id: '1', name: 'My Khe Beach', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800' },
  { id: '2', name: 'Linh Ung Pagoda', imageUrl: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800' },
  { id: '3', name: 'Marble Mountains', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800' },
  { id: '4', name: 'Dragon Bridge', imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800' },
  { id: '5', name: 'Han Market', imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [likedLocations, setLikedLocations] = useState<string[]>([]);
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (step === 4) {
      // Load weather when reaching weather display step
      onboardingService.getWeather().then(setWeather).catch(console.error);
    }
  }, [step]);

  const handleSwipe = (locationId: string, liked: boolean) => {
    if (liked) {
      setLikedLocations([...likedLocations, locationId]);
    }
    
    if (swipeIndex < SWIPE_LOCATIONS.length - 1) {
      setSwipeIndex(swipeIndex + 1);
    } else {
      // Move to next step after all cards swiped
      setTimeout(() => setStep(step + 1), 300);
    }
  };

  const togglePersona = (personaId: string) => {
    if (selectedPersonas.includes(personaId)) {
      setSelectedPersonas(selectedPersonas.filter((p) => p !== personaId));
    } else {
      setSelectedPersonas([...selectedPersonas, personaId]);
    }
  };

  const handleGenerateItineraries = async () => {
    setIsLoading(true);
    
    const finalPreferences: UserPreferences = {
      ...preferences,
      personas: selectedPersonas,
      interests: selectedInterests,
      likedLocations,
    };

    try {
      await onboardingService.savePreferences(finalPreferences);
      // Store in localStorage for guest users
      localStorage.setItem('userPreferences', JSON.stringify(finalPreferences));
      navigate('/itineraries', { state: { preferences: finalPreferences } });
    } catch (error) {
      console.error('Error generating itineraries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <Card className="text-center max-w-2xl mx-auto">
            <div className="py-8">
              <h1 className="text-5xl font-bold mb-4">Welcome to Anvago! 🌴</h1>
              <p className="text-xl text-gray-600 mb-8">
                Let's create a personalized itinerary just for you in Danang, Vietnam
              </p>
              <Button onClick={() => setStep(1)} size="large">
                Get Started
              </Button>
            </div>
          </Card>
        );

      case 1:
        return (
          <Card className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Essential Questions</h2>
            <div className="space-y-6">
              <Input
                label="Do you have any destination in mind in Danang?"
                placeholder="e.g., My Khe Beach, Marble Mountains..."
                value={preferences.destination || ''}
                onChange={(e) => setPreferences({ ...preferences, destination: e.target.value })}
              />
              <Input
                label="How long are you going to stay in Danang? (days)"
                type="number"
                placeholder="3"
                value={preferences.tripDuration || ''}
                onChange={(e) => setPreferences({ ...preferences, tripDuration: parseInt(e.target.value) || undefined })}
              />
              <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  Skip
                </Button>
                <Button onClick={() => setStep(2)}>
                  Next
                </Button>
              </div>
            </div>
          </Card>
        );

      case 2:
        return (
          <div className="max-w-6xl mx-auto">
            <Card>
              <h2 className="text-3xl font-bold mb-2">Which persona describes you?</h2>
              <p className="text-gray-600 mb-6">Select all that apply</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {PERSONAS.map((persona) => (
                  <PersonaCard
                    key={persona.id}
                    id={persona.id}
                    emoji={persona.emoji}
                    name={persona.name}
                    selected={selectedPersonas.includes(persona.id)}
                    onClick={() => togglePersona(persona.id)}
                  />
                ))}
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setStep(3)}>
                  Skip
                </Button>
                <Button onClick={() => setStep(3)}>
                  Next
                </Button>
              </div>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="max-w-2xl mx-auto">
            <Card>
              <h2 className="text-3xl font-bold mb-2">Swipe through locations!</h2>
              <p className="text-gray-600 mb-6">Swipe right if you like it, left to pass</p>
              
              <div className="relative h-[500px] mb-20">
                {SWIPE_LOCATIONS.map((location, index) => (
                  index >= swipeIndex && (
                    <SwipeCard
                      key={location.id}
                      id={location.id}
                      name={location.name}
                      imageUrl={location.imageUrl}
                      onSwipe={handleSwipe}
                    />
                  )
                ))}
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setStep(4)}>
                  Skip
                </Button>
              </div>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="max-w-6xl mx-auto">
            <Card>
              <h2 className="text-3xl font-bold mb-2">What do you have in mind?</h2>
              <p className="text-gray-600 mb-6">Select your interests</p>
              <EmojiSelector
                options={INTERESTS}
                selected={selectedInterests}
                onChange={setSelectedInterests}
              />
              <div className="flex gap-3 justify-end mt-6">
                <Button variant="ghost" onClick={() => setStep(5)}>
                  Skip
                </Button>
                <Button onClick={() => setStep(5)}>
                  Next
                </Button>
              </div>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="max-w-4xl mx-auto">
            <Card>
              <h2 className="text-3xl font-bold mb-6">Danang Weather</h2>
              {weather ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-[#4FC3F7]/10 to-[#81D4FA]/10 rounded-xl p-8 border-2 border-black">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-6xl font-bold">{weather.current.temperature}°C</div>
                        <div className="text-2xl mt-2">{weather.current.condition}</div>
                        <div className="text-gray-600 mt-1">{weather.current.description}</div>
                      </div>
                      <Cloud className="w-32 h-32 text-[#4FC3F7]" />
                    </div>
                    <div className="flex gap-6 mt-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-5 h-5" />
                        <span>Humidity: {weather.current.humidity}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wind className="w-5 h-5" />
                        <span>Wind: {weather.current.windSpeed} km/h</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-4">7-Day Forecast</h3>
                    <div className="grid grid-cols-7 gap-2">
                      {weather.forecast.map((day, index) => (
                        <div
                          key={index}
                          className="bg-white border-2 border-black rounded-lg p-3 text-center"
                        >
                          <div className="text-sm font-medium">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                          <div className="text-2xl my-2">{day.temperature}°</div>
                          <div className="text-xs text-gray-600">{day.condition}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin text-[#4FC3F7]" />
                </div>
              )}
              
              <div className="flex gap-3 justify-end mt-6">
                <Button
                  onClick={handleGenerateItineraries}
                  size="large"
                  isLoading={isLoading}
                >
                  Generate My Itinerary
                </Button>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4FC3F7]/10 via-[#FAFAF8] to-[#81D4FA]/10">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2">Anvago</h1>
          <p className="text-xl text-gray-600">Plan your perfect trip to Danang</p>
        </div>

        {/* Progress indicator */}
        {step > 0 && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Step {step} of 5</span>
              <span className="text-sm text-gray-600">{Math.round((step / 5) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden border-2 border-black">
              <div
                className="h-full bg-[#4FC3F7] transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        {renderStep()}
      </div>
    </div>
  );
}
