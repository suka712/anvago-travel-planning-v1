import api from './api';

export interface UserPreferences {
  destination?: string;
  tripDuration?: number;
  personas?: string[];
  likedLocations?: string[];
  interests?: string[];
  budgetRange?: string;
  travelStyle?: string;
  preferredTransportation?: string[];
}

export interface ItineraryRecommendation {
  title: string;
  description: string;
  durationDays: number;
  highlights: Array<{
    id: string;
    name: string;
    imageUrl: string;
  }>;
  estimatedCost: {
    min: number;
    max: number;
  };
  items: Array<{
    locationId: string;
    orderIndex: number;
    scheduledStartTime: string;
    scheduledEndTime: string;
    durationMinutes: number;
    transportationMethod: string;
  }>;
}

export interface WeatherData {
  current: {
    temperature: number;
    condition: string;
    description: string;
    humidity: number;
    windSpeed: number;
    icon: string;
  };
  forecast: Array<{
    date: string;
    temperature: number;
    condition: string;
    description: string;
    icon: string;
  }>;
}

export const onboardingService = {
  async savePreferences(preferences: UserPreferences): Promise<void> {
    await api.post('/onboarding/preferences', preferences);
  },

  async getItineraries(preferences: UserPreferences): Promise<{ itineraries: ItineraryRecommendation[] }> {
    const response = await api.post<{ itineraries: ItineraryRecommendation[] }>(
      '/onboarding/itineraries',
      { preferences }
    );
    return response.data;
  },

  async rerollItineraries(preferences: UserPreferences): Promise<{ itineraries: ItineraryRecommendation[] }> {
    const response = await api.post<{ itineraries: ItineraryRecommendation[] }>(
      '/onboarding/reroll',
      { preferences }
    );
    return response.data;
  },

  async getWeather(): Promise<WeatherData> {
    const response = await api.get<WeatherData>('/onboarding/weather');
    return response.data;
  },
};

