import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { BackButton } from '../components/BackButton';
import { LocationSearchModal } from '../components/LocationSearchModal';
import { LocationDetailModal } from '../components/LocationDetailModal';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Skeleton, SkeletonItineraryItem } from '../components/Skeleton';
import { useToast } from '../contexts/ToastContext';
import { itineraryService, ItineraryItem, Location } from '../services/itineraryService';
import {
  GripVertical,
  Plus,
  Trash2,
  Sparkles,
  MapPin,
  Save,
  Loader2,
  Crown,
  Calendar,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

interface SortableItemProps {
  item: ItineraryItem;
  onDelete: () => void;
  isPremium?: boolean;
}

function SortableItem({ item, onDelete, isPremium }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const TRANSPORT_ICONS: Record<string, string> = {
    walking: '🚶',
    grab_bike: '🏍️',
    grab_car: '🚗',
    rickshaw: '🛺',
    bus: '🚌',
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <Card hoverable className="mb-4">
        <div className="flex items-center gap-4">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded-lg"
          >
            <GripVertical className="w-5 h-5 text-gray-400" />
          </button>

          {/* Image */}
          <img
            src={item.location.imageUrl}
            alt={item.location.name}
            className="w-20 h-20 object-cover rounded-lg border-2 border-black"
          />

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1">{item.location.name}</h3>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span>⏰ {item.scheduledStartTime} - {item.scheduledEndTime}</span>
              <span>⏱️ {item.durationMinutes} min</span>
              <span>{TRANSPORT_ICONS[item.transportationMethod] || '🚶'} {item.transportationMethod.replace('_', ' ')}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {isPremium && (
              <Button variant="secondary" size="small">
                <Sparkles className="w-4 h-4" />
              </Button>
            )}
            <Button variant="danger" size="small" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function TripPlanningPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [itinerary, setItinerary] = useState<any>(null);
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showOptimizeModal, setShowOptimizeModal] = useState(false);
  const [showLocalizeModal, setShowLocalizeModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [optimizationType, setOptimizationType] = useState('budget');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedItems, setOptimizedItems] = useState<ItineraryItem[] | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showLocationDetail, setShowLocationDetail] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (id) {
      loadItinerary();
    } else {
      setIsLoading(false);
    }
  }, [id]);

  const loadItinerary = async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await itineraryService.getItinerary(id);
      setItinerary(data.itinerary);
      setItems(data.itinerary.items || []);
    } catch (error: any) {
      console.error('Error loading itinerary:', error);
      showToast(error.response?.data?.message || 'Error loading itinerary', 'error');
      setItinerary(null);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddLocation = async (location: Location) => {
    if (!id) return;

    try {
      const newItem = await itineraryService.addItem(id, {
        locationId: location.id,
        orderIndex: items.length,
        scheduledStartTime: '09:00',
        scheduledEndTime: '11:00',
        durationMinutes: 120,
        transportationMethod: 'walking',
      });
      setItems([...items, newItem.item]);
    } catch (error) {
      console.error('Error adding location:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!id) return;

    try {
      await itineraryService.deleteItem(id, itemId);
      setItems(items.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleSave = async () => {
    if (!id) return;

    setIsSaving(true);
    try {
      const itemIds = items.map((item) => item.id);
      await itineraryService.reorderItems(id, itemIds);
      showToast('Itinerary saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving itinerary:', error);
      showToast('Error saving itinerary', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePremiumFeature = (feature: string) => {
    if (feature === 'optimize') {
      setShowOptimizeModal(true);
    } else if (feature === 'localize') {
      handleLocalize();
    } else if (feature === 'booking') {
      setShowPremiumModal(true);
    }
  };

  const handleOptimize = async () => {
    if (!id) return;

    setIsOptimizing(true);
    try {
      const result = await itineraryService.optimizeItinerary(id, optimizationType);
      setOptimizedItems(result.optimizedItinerary.items);
      setShowOptimizeModal(false);
      showToast('Itinerary optimized! Review changes below.', 'success');
    } catch (error) {
      console.error('Error optimizing:', error);
      showToast('Error optimizing itinerary', 'error');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleAcceptOptimization = async () => {
    if (!id || !optimizedItems) return;

    try {
      const itemIds = optimizedItems.map((item) => item.id);
      await itineraryService.reorderItems(id, itemIds);
      setItems(optimizedItems);
      setOptimizedItems(null);
      showToast('Optimization applied!', 'success');
    } catch (error) {
      console.error('Error applying optimization:', error);
      showToast('Error applying optimization', 'error');
    }
  };

  const handleLocalize = async () => {
    if (!id) return;

    try {
      const result = await itineraryService.localizeItinerary(id);
      if (result.alternatives.length === 0) {
        showToast('All locations are already authentic!', 'info');
        return;
      }
      setShowLocalizeModal(true);
      // Store alternatives for modal
      (window as any).localizeAlternatives = result.alternatives;
    } catch (error) {
      console.error('Error localizing:', error);
      showToast('Error finding local alternatives', 'error');
    }
  };

  const handleSchedule = async (startDate: string, endDate: string) => {
    if (!id) return;

    try {
      await itineraryService.scheduleItinerary(id, startDate, endDate);
      setShowScheduleModal(false);
      showToast('Trip scheduled successfully!', 'success');
      loadItinerary();
    } catch (error) {
      console.error('Error scheduling:', error);
      showToast('Error scheduling trip', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4FC3F7]/10 via-[#FAFAF8] to-[#81D4FA]/10 pb-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton variant="text" width="40%" height={32} className="mb-2" />
            <Skeleton variant="text" width="60%" height={20} />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonItineraryItem key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4FC3F7]/10 via-[#FAFAF8] to-[#81D4FA]/10 flex items-center justify-center">
        <Card static className="text-center p-12">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold mb-2">Itinerary Not Found</h2>
          <p className="text-gray-600 mb-6">The itinerary you're looking for doesn't exist or failed to load</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('/my-trips')}>
              Go to My Trips
            </Button>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4FC3F7]/10 via-[#FAFAF8] to-[#81D4FA]/10 flex items-center justify-center">
        <Card static className="text-center p-12">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Invalid Itinerary ID</h2>
          <p className="text-gray-600 mb-6">No itinerary ID provided</p>
          <Button onClick={() => navigate('/my-trips')}>
            Go to My Trips
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4FC3F7]/10 via-[#FAFAF8] to-[#81D4FA]/10 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <BackButton to="/my-trips" label="Back to My Trips" />
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{itinerary.title || 'Trip Planning'}</h1>
            <p className="text-gray-600">Drag and drop to rearrange your itinerary</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave} isLoading={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Premium Features Bar */}
            <Card static className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Premium Features</h3>
                <Crown className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                <Button
                  variant="secondary"
                  onClick={() => handlePremiumFeature('optimize')}
                  className="justify-start"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Optimize
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handlePremiumFeature('localize')}
                  className="justify-start"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Localize
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handlePremiumFeature('booking')}
                  className="justify-start"
                >
                  📅 Book Now
                </Button>
              </div>
            </Card>

            {/* Itinerary Items */}
            <Card static>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Your Itinerary</h2>
                <Button onClick={() => setIsSearchModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Location
                </Button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={items.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {items.map((item) => (
                    <SortableItem
                      key={item.id}
                      item={item}
                      onDelete={() => handleDeleteItem(item.id)}
                      isPremium={true}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              {items.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">No locations yet</p>
                  <p className="text-sm">Click "Add Location" to start building your itinerary</p>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trip Summary */}
            <Card static>
              <h3 className="text-xl font-bold mb-4">Trip Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Locations</span>
                  <span className="font-bold">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Duration</span>
                  <span className="font-bold">
                    {items.reduce((sum, item) => sum + item.durationMinutes, 0)} min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 border-2 border-black">
                    Planning
                  </span>
                </div>
              </div>
              <Button className="w-full mt-4" onClick={() => navigate(`/trip/${id}`)}>
                Start Trip →
              </Button>
            </Card>

            {/* Tips */}
            <Card static>
              <h3 className="text-lg font-bold mb-3">💡 Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Drag locations to reorder</li>
                <li>• Add breaks between activities</li>
                <li>• Check transportation options</li>
                <li>• Save regularly</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      <LocationSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelect={handleAddLocation}
      />

      {/* Premium Modal */}
      <Modal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} title="Premium Feature">
        <div className="text-center">
          <Crown className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <p className="text-gray-600 mb-6">
            This feature is available for premium users. Upgrade to unlock AI optimization,
            local recommendations, and direct booking.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowPremiumModal(false)} className="flex-1">
              Maybe Later
            </Button>
            <Button className="flex-1">
              Upgrade Now
            </Button>
          </div>
        </div>
      </Modal>

      {/* Optimize Modal */}
      <Modal isOpen={showOptimizeModal} onClose={() => setShowOptimizeModal(false)} title="AI Optimization">
        <div className="space-y-4">
          <p className="text-gray-600">Choose optimization type:</p>
          <select
            value={optimizationType}
            onChange={(e) => setOptimizationType(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-black rounded-lg"
          >
            <option value="budget">Optimize for Budget</option>
            <option value="distance">Minimize Distance</option>
            <option value="vibe">Match Vibe</option>
            <option value="indoors">Prioritize Indoors</option>
            <option value="outdoors">Prioritize Outdoors</option>
            <option value="attractions">Maximize Attractions</option>
          </select>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowOptimizeModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleOptimize} isLoading={isOptimizing} className="flex-1">
              Optimize
            </Button>
          </div>
        </div>
      </Modal>

      {/* Optimization Preview */}
      {optimizedItems && (
        <Modal isOpen={!!optimizedItems} onClose={() => setOptimizedItems(null)} title="Optimized Itinerary">
          <div className="space-y-4">
            <p className="text-gray-600">Review the optimized itinerary:</p>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {optimizedItems.map((item, index) => (
                <div key={item.id} className="p-3 bg-gray-50 border-2 border-black rounded-lg">
                  <div className="font-medium">{index + 1}. {item.location.name}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setOptimizedItems(null)} className="flex-1">
                Reject
              </Button>
              <Button onClick={handleAcceptOptimization} className="flex-1">
                Accept Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Localize Modal */}
      <Modal isOpen={showLocalizeModal} onClose={() => setShowLocalizeModal(false)} title="Localize by Anva">
        <div className="space-y-4">
          <p className="text-gray-600">Replace with authentic local alternatives:</p>
          {((window as any).localizeAlternatives || []).map((alt: any, index: number) => (
            <div key={index} className="p-4 bg-gray-50 border-2 border-black rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium line-through">{alt.currentLocation.name}</div>
                  <div className="font-bold text-[#4FC3F7] flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    {alt.alternativeLocation.name}
                    <span className="text-xs px-2 py-0.5 bg-yellow-100 rounded-full">Anva Authentic</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="secondary" size="small" className="flex-1">
                  Reject
                </Button>
                <Button size="small" className="flex-1">
                  Accept
                </Button>
              </div>
            </div>
          ))}
          {(!(window as any).localizeAlternatives || (window as any).localizeAlternatives.length === 0) && (
            <p className="text-center text-gray-500 py-4">All locations are already authentic!</p>
          )}
        </div>
      </Modal>

      {/* Schedule Modal */}
      <Modal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} title="Schedule Trip">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const startDate = formData.get('startDate') as string;
            const endDate = formData.get('endDate') as string;
            if (startDate && endDate) {
              handleSchedule(startDate, endDate);
            }
          }}
          className="space-y-4"
        >
          <Input
            label="Start Date"
            type="date"
            name="startDate"
            required
            min={new Date().toISOString().split('T')[0]}
          />
          <Input
            label="End Date"
            type="date"
            name="endDate"
            required
            min={new Date().toISOString().split('T')[0]}
          />
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowScheduleModal(false)} className="flex-1" type="button">
              Cancel
            </Button>
            <Button className="flex-1" type="submit">
              Schedule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

