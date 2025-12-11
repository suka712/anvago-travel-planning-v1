import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { BackButton } from '../components/BackButton';
import { NotificationCard } from '../components/NotificationCard';
import { ProgressBar } from '../components/ProgressBar';
import { TimelineItem } from '../components/TimelineItem';
import { useToast } from '../contexts/ToastContext';
import { itineraryService, ItineraryItem } from '../services/itineraryService';
import { tripService } from '../services/tripService';
import {
  MapPin,
  Navigation,
  CheckCircle2,
  Clock,
  AlertCircle,
  Cloud,
  Car,
} from 'lucide-react';

export default function TripTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [itinerary, setItinerary] = useState<any>(null);
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [tripStatus, setTripStatus] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadItinerary();
      startTrip();
      startLocationTracking();
      
      // Poll for trip status
      const interval = setInterval(() => {
        if (id) {
          tripService.getTripStatus(id).then(setTripStatus).catch(console.error);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [id]);

  const loadItinerary = async () => {
    try {
      const data = await itineraryService.getItinerary(id!);
      setItinerary(data.itinerary);
      // Find first incomplete item
      const firstIncomplete = data.itinerary.items.findIndex((item: ItineraryItem) => !item.isCompleted);
      setCurrentLocationIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
    } catch (error) {
      console.error('Error loading itinerary:', error);
      showToast('Error loading itinerary', 'error');
    }
  };

  const startTrip = async () => {
    try {
      await tripService.startTrip(id!);
      showToast('Trip started! 🚀', 'success');
    } catch (error) {
      console.error('Error starting trip:', error);
      // Trip might already be started, that's okay
    }
  };

  const startLocationTracking = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        async (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);

          // Update backend
          if (id) {
            try {
              await tripService.updateTracking(id, newLocation.lat, newLocation.lng);
            } catch (error) {
              console.error('Error updating tracking:', error);
            }
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          showToast('Location access denied. Enable location for full features.', 'info');
        },
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
    }
  };

  const handleCompleteLocation = async () => {
    if (!id || !itinerary) return;

    const currentItem = itinerary.items[currentLocationIndex];
    
    try {
      const result = await tripService.completeItem(id, currentItem.id);
      
      showToast(`✓ Completed ${currentItem.location.name}`, 'success');
      
      const newNotifications = [...notifications];
      newNotifications.unshift(`✓ Completed ${currentItem.location.name}`);
      setNotifications(newNotifications);

      if (result.allCompleted) {
        showToast('🎉 Trip completed! Great job!', 'success');
        setTimeout(() => {
          navigate('/my-trips');
        }, 2000);
      } else if (currentLocationIndex < itinerary.items.length - 1) {
        setCurrentLocationIndex(currentLocationIndex + 1);
        setTimeout(() => {
          const nextNotif = [...newNotifications];
          nextNotif.unshift('📍 Ready for your next destination?');
          setNotifications(nextNotif);
          showToast('Ready for next destination!', 'info');
        }, 1000);
      }

      // Reload itinerary to get updated status
      loadItinerary();
    } catch (error) {
      console.error('Error completing location:', error);
      showToast('Error completing location', 'error');
    }
  };

  const handleBookTransport = () => {
    showToast('🚗 Grab bike booking initiated!', 'info');
    const newNotifications = [...notifications];
    newNotifications.unshift('🚗 Grab bike booked! Arriving in 5 minutes');
    setNotifications(newNotifications);
  };

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4FC3F7]/10 via-[#FAFAF8] to-[#81D4FA]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Loading your trip...</div>
        </div>
      </div>
    );
  }

  const currentItem = itinerary.items[currentLocationIndex];
  const completedItems = itinerary.items.slice(0, currentLocationIndex);
  const upcomingItems = itinerary.items.slice(currentLocationIndex + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4FC3F7]/10 via-[#FAFAF8] to-[#81D4FA]/10 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{itinerary.title}</h1>
            <p className="text-gray-600">Trip in Progress</p>
          </div>
          <Button variant="danger" onClick={() => navigate('/my-trips')}>
            End Trip
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Placeholder */}
            <Card static>
              <div className="aspect-video bg-gradient-to-br from-[#4FC3F7]/20 to-[#81D4FA]/20 rounded-lg border-2 border-black flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className="border border-gray-200" />
                  ))}
                </div>
                <div className="relative z-10 text-center">
                  <MapPin className="w-16 h-16 mx-auto mb-4 text-[#4FC3F7]" />
                  <p className="text-xl font-bold">Google Maps Integration</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Live location: {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Getting location...'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Current Location */}
            <Card static>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#4FC3F7] border-2 border-black rounded-full flex items-center justify-center">
                  <Navigation className="w-6 h-6 text-black" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Current Location</div>
                  <h2 className="text-2xl font-bold">{currentItem.location.name}</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="text-sm text-gray-600">Time</div>
                    <div className="font-medium">{currentItem.scheduledStartTime} - {currentItem.scheduledEndTime}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="text-sm text-gray-600">Distance</div>
                    <div className="font-medium">You're here!</div>
                  </div>
                </div>
              </div>

              <img
                src={currentItem.location.imageUrl}
                alt={currentItem.location.name}
                className="w-full h-48 object-cover rounded-lg border-2 border-black mb-4"
              />

              <p className="text-gray-700 mb-6">{currentItem.location.description}</p>

              <div className="flex gap-3">
                <Button onClick={handleCompleteLocation} className="flex-1">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Complete This Stop
                </Button>
                <Button variant="secondary" onClick={handleBookTransport}>
                  <Car className="w-4 h-4 mr-2" />
                  Book Transport
                </Button>
              </div>
            </Card>

            {/* Weather Alert */}
            <Card static className="bg-blue-50">
              <div className="flex items-start gap-3">
                <Cloud className="w-6 h-6 text-blue-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold mb-1">Weather Update</h3>
                  <p className="text-sm text-gray-700">
                    Clear skies today. Perfect weather for your trip! 🌤️ Temperature: 28°C
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card static>
              <h3 className="text-lg font-bold mb-3">📬 Notifications</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No notifications yet</p>
                ) : (
                  notifications.map((notif, index) => {
                    const isSuccess = notif.includes('✓') || notif.includes('Completed');
                    const isWarning = notif.includes('enjoying') || notif.includes('pushed');
                    const isInfo = notif.includes('Ready') || notif.includes('next destination');
                    
                    return (
                      <NotificationCard
                        key={index}
                        type={isSuccess ? 'success' : isWarning ? 'warning' : 'info'}
                        title={isSuccess ? 'Completed' : isWarning ? 'Schedule Update' : 'Reminder'}
                        message={notif}
                        onDismiss={() => {
                          setNotifications(notifications.filter((_, i) => i !== index));
                        }}
                      />
                    );
                  })
                )}
              </div>
            </Card>

            {/* Progress */}
            <Card static>
              <h3 className="text-lg font-bold mb-3">Trip Progress</h3>
              <ProgressBar
                progress={
                  itinerary
                    ? (itinerary.items.filter((item: ItineraryItem) => item.isCompleted).length /
                        itinerary.items.length) *
                      100
                    : 0
                }
                showPercentage={true}
                className="mb-3"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  {itinerary?.items.filter((item: ItineraryItem) => item.isCompleted).length || 0} of{' '}
                  {itinerary?.items.length || 0} locations completed
                </span>
              </div>

              {/* Completed */}
              {completedItems.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-green-600 mb-2">✓ Completed</div>
                  {completedItems.map((item: ItineraryItem) => (
                    <div key={item.id} className="text-sm text-gray-600 line-through">
                      {item.location.name}
                    </div>
                  ))}
                </div>
              )}

              {/* Upcoming */}
              {upcomingItems.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">📍 Up Next</div>
                  {upcomingItems.map((item: ItineraryItem) => (
                    <div key={item.id} className="text-sm text-gray-600">
                      {item.location.name}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Smart Routing */}
            <Card static className="bg-yellow-50">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold mb-1">Smart Routing</h3>
                  <p className="text-sm text-gray-700">
                    All routes clear! No traffic or weather issues detected.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

