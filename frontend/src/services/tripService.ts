import api from './api';

export interface TripStatus {
  status: string;
  currentLocation: any;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  tripTracking: any;
}

export interface SmartRouting {
  currentRoute: {
    from: any;
    to: any;
    issues: string[];
  };
  alternatives: Array<{
    type: string;
    reason: string;
    location: any;
  }>;
}

export const tripService = {
  async startTrip(itineraryId: string): Promise<{ itinerary: any; tripTracking: any }> {
    const response = await api.post<{ itinerary: any; tripTracking: any }>(
      `/trips/${itineraryId}/start`
    );
    return response.data;
  },

  async updateTracking(itineraryId: string, latitude: number, longitude: number): Promise<{
    status: string;
    currentLocationId: string | null;
    nextLocation: { id: string; name: string } | null;
    progress: { completed: number; total: number };
  }> {
    const response = await api.post<{
      status: string;
      currentLocationId: string | null;
      nextLocation: { id: string; name: string } | null;
      progress: { completed: number; total: number };
    }>(`/trips/${itineraryId}/tracking`, { latitude, longitude });
    return response.data;
  },

  async getTripStatus(itineraryId: string): Promise<TripStatus> {
    const response = await api.get<TripStatus>(`/trips/${itineraryId}/status`);
    return response.data;
  },

  async completeItem(itineraryId: string, itemId: string): Promise<{ item: any; allCompleted: boolean }> {
    const response = await api.post<{ item: any; allCompleted: boolean }>(
      `/trips/${itineraryId}/complete-item`,
      { itemId }
    );
    return response.data;
  },

  async getSmartRouting(itineraryId: string, currentLocationId: string, nextLocationId: string): Promise<SmartRouting> {
    const response = await api.post<SmartRouting>(`/trips/${itineraryId}/smart-routing`, {
      currentLocationId,
      nextLocationId,
    });
    return response.data;
  },
};

