import prisma from '../config/database';
import { getCurrentWeather } from './weatherService';

interface UserPreferences {
  destination?: string;
  tripDuration?: number;
  personas?: string[];
  likedLocations?: string[];
  interests?: string[];
  budgetRange?: string;
  travelStyle?: string;
  preferredTransportation?: string[];
}

interface ItineraryItem {
  locationId: string;
  orderIndex: number;
  scheduledStartTime: string;
  scheduledEndTime: string;
  durationMinutes: number;
  transportationMethod: string;
}

export async function generateItineraries(preferences: UserPreferences) {
  const duration = preferences.tripDuration || 3;
  const budgetRange = preferences.budgetRange || 'medium';
  const interests = preferences.interests || [];
  const personas = preferences.personas || [];

  // Get all locations
  let locations = await prisma.location.findMany({
    where: {
      // Filter by budget if specified
      ...(budgetRange && {
        priceRange: {
          in: budgetRange === 'low' ? ['low'] : budgetRange === 'high' ? ['high', 'luxury'] : ['low', 'medium', 'high'],
        },
      }),
    },
  });

  // Filter by interests/categories
  if (interests.length > 0) {
    const categoryMap: { [key: string]: string[] } = {
      '🏖️': ['beach'],
      '🏛️': ['temple', 'museum'],
      '🍜': ['restaurant'],
      '🛍️': ['market'],
      '🎨': ['museum', 'temple'],
      '🏔️': ['attraction'],
      '🎢': ['attraction', 'theme_park'],
      '🌃': ['nightlife'],
      '📸': ['attraction', 'beach', 'temple'],
      '🧘': ['beach', 'nature'],
    };

    const relevantCategories = interests
      .map((emoji) => categoryMap[emoji] || [])
      .flat();

    if (relevantCategories.length > 0) {
      locations = locations.filter(
        (loc) => relevantCategories.includes(loc.category || '')
      );
    }
  }

  // Filter by personas
  if (personas.length > 0) {
    const personaFilters: { [key: string]: (loc: any) => boolean } = {
      'Adventure Seeker': (loc) => ['attraction', 'nature'].includes(loc.category || ''),
      'Culture Enthusiast': (loc) => ['temple', 'museum'].includes(loc.category || ''),
      'Food Lover': (loc) => loc.category === 'restaurant',
      'Beach Bum': (loc) => loc.category === 'beach',
      'Nightlife Explorer': (loc) => loc.category === 'nightlife',
      'Family Traveler': (loc) => ['attraction', 'beach', 'museum'].includes(loc.category || ''),
      'Budget Traveler': (loc) => loc.priceRange === 'low',
      'Luxury Seeker': (loc) => ['high', 'luxury'].includes(loc.priceRange || ''),
    };

    const personaCategories = personas
      .map((p) => personaFilters[p])
      .filter(Boolean);

    if (personaCategories.length > 0) {
      locations = locations.filter((loc) =>
        personaCategories.some((filter) => filter(loc))
      );
    }
  }

  // Get weather to filter weather-dependent locations if needed
  const weather = await getCurrentWeather();
  const isBadWeather = ['Rain', 'Storm', 'Thunderstorm'].includes(weather.condition);

  if (isBadWeather) {
    locations = locations.filter((loc) => !loc.weatherDependent || loc.indoor);
  }

  // Generate 3-5 different itineraries
  const numItineraries = Math.min(5, Math.max(3, Math.floor(locations.length / 4)));
  const itineraries = [];

  for (let i = 0; i < numItineraries; i++) {
    const selectedLocations = selectLocationsForItinerary(
      locations,
      duration,
      i
    );

    if (selectedLocations.length === 0) continue;

    const items: ItineraryItem[] = [];
    let currentTime = 9; // Start at 9 AM

    selectedLocations.forEach((location, index) => {
      const duration = getLocationDuration(location);
      const startTime = formatTime(currentTime);
      const endTime = formatTime(currentTime + duration / 60);

      items.push({
        locationId: location.id,
        orderIndex: index,
        scheduledStartTime: startTime,
        scheduledEndTime: endTime,
        durationMinutes: duration,
        transportationMethod:
          index === 0
            ? 'walking'
            : getTransportationMethod(
                selectedLocations[index - 1],
                location,
                preferences.preferredTransportation
              ),
      });

      currentTime += duration / 60 + 0.5; // Add 30 min travel time
    });

    const title = generateItineraryTitle(selectedLocations, duration);
    const description = generateItineraryDescription(selectedLocations, duration);

    itineraries.push({
      title,
      description,
      durationDays: duration,
      items,
      highlights: selectedLocations.slice(0, 4).map((loc) => ({
        id: loc.id,
        name: loc.name,
        imageUrl: loc.imageUrl,
      })),
      estimatedCost: calculateEstimatedCost(selectedLocations, duration),
    });
  }

  return itineraries;
}

function selectLocationsForItinerary(
  locations: any[],
  duration: number,
  variation: number
): any[] {
  if (locations.length === 0) return [];

  // Sort by rating (highest first) for better quality
  const sortedByRating = [...locations].sort((a, b) => {
    const ratingA = a.rating?.toNumber() || 0;
    const ratingB = b.rating?.toNumber() || 0;
    return ratingB - ratingA;
  });

  // Calculate locations per day (2-4 per day)
  const locationsPerDay = Math.min(4, Math.max(2, Math.ceil(sortedByRating.length / duration)));
  const totalNeeded = locationsPerDay * duration;

  // Create variation by starting from different points
  const startIndex = (variation * locationsPerDay) % sortedByRating.length;
  
  // Select locations with variety
  const selected: any[] = [];
  const usedCategories = new Set<string>();
  const usedLocations = new Set<string>();

  // First pass: select top-rated locations ensuring category variety
  for (let i = 0; i < sortedByRating.length && selected.length < totalNeeded; i++) {
    const loc = sortedByRating[(startIndex + i) % sortedByRating.length];
    const category = loc.category || 'attraction';
    
    // Prefer locations with different categories
    if (!usedCategories.has(category) || selected.length < totalNeeded * 0.7) {
      if (!usedLocations.has(loc.id)) {
        selected.push(loc);
        usedCategories.add(category);
        usedLocations.add(loc.id);
      }
    }
  }

  // Second pass: fill remaining slots if needed
  if (selected.length < totalNeeded) {
    for (const loc of sortedByRating) {
      if (selected.length >= totalNeeded) break;
      if (!usedLocations.has(loc.id)) {
        selected.push(loc);
        usedLocations.add(loc.id);
      }
    }
  }

  // Shuffle slightly to create variation between itineraries
  const shuffled = [...selected];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, totalNeeded);
}

function getLocationDuration(location: any): number {
  // Duration in minutes based on category
  const durations: { [key: string]: number } = {
    beach: 120,
    restaurant: 90,
    temple: 60,
    museum: 90,
    market: 60,
    attraction: 120,
    nightlife: 180,
  };

  return durations[location.category || 'attraction'] || 90;
}

function getTransportationMethod(
  from: any,
  to: any,
  preferred?: string[]
): string {
  // Simple distance estimation using coordinates if available
  const methods = preferred || ['walking', 'grab_bike', 'grab_car'];
  
  if (from.latitude && from.longitude && to.latitude && to.longitude) {
    // Calculate rough distance (Haversine simplified)
    const lat1 = parseFloat(from.latitude.toString());
    const lon1 = parseFloat(from.longitude.toString());
    const lat2 = parseFloat(to.latitude.toString());
    const lon2 = parseFloat(to.longitude.toString());
    
    const distance = Math.sqrt(
      Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2)
    ) * 111; // Rough km conversion
    
    // Choose method based on distance
    if (distance < 1 && methods.includes('walking')) {
      return 'walking';
    } else if (distance < 5 && methods.includes('grab_bike')) {
      return 'grab_bike';
    } else if (methods.includes('grab_car')) {
      return 'grab_car';
    }
  }
  
  // Fallback: use preferred or default
  if (methods.includes('walking')) return 'walking';
  if (methods.includes('grab_bike')) return 'grab_bike';
  return 'grab_car';
}

function formatTime(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function generateItineraryTitle(locations: any[], duration: number): string {
  const categories = new Set(locations.map((l) => l.category));
  if (categories.has('beach')) return `${duration}-Day Beach & Culture Adventure`;
  if (categories.has('temple')) return `${duration}-Day Cultural Discovery`;
  if (categories.has('restaurant')) return `${duration}-Day Food & Fun Journey`;
  return `${duration}-Day Danang Explorer`;
}

function generateItineraryDescription(
  locations: any[],
  duration: number
): string {
  const highlights = locations.slice(0, 3).map((l) => l.name).join(', ');
  return `Explore the best of Danang with visits to ${highlights} and more. Perfect for ${duration} days of adventure.`;
}

function calculateEstimatedCost(locations: any[], duration: number): {
  min: number;
  max: number;
} {
  const costs: { [key: string]: { min: number; max: number } } = {
    low: { min: 50, max: 150 },
    medium: { min: 150, max: 300 },
    high: { min: 300, max: 500 },
    luxury: { min: 500, max: 1000 },
  };

  let totalMin = 0;
  let totalMax = 0;

  locations.forEach((loc) => {
    const cost = costs[loc.priceRange || 'medium'] || costs.medium;
    totalMin += cost.min;
    totalMax += cost.max;
  });

  // Add transportation and accommodation estimates
  totalMin += duration * 50; // Basic accommodation
  totalMax += duration * 200; // Better accommodation

  return {
    min: totalMin * duration,
    max: totalMax * duration,
  };
}

