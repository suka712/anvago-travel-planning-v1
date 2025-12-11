import api from './api';

export interface Location {
  id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  imageUrl: string;
  rating: number;
  priceRange: string;
}

export interface ItineraryItem {
  id: string;
  locationId: string;
  location: Location;
  orderIndex: number;
  scheduledStartTime: string;
  scheduledEndTime: string;
  durationMinutes: number;
  transportationMethod: string;
  notes?: string;
  isCompleted: boolean;
}

export interface Itinerary {
  id: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  durationDays?: number;
  status: string;
  items: ItineraryItem[];
}

export const itineraryService = {
  async getItineraries(status?: string): Promise<{ itineraries: Itinerary[] }> {
    const params = status ? { status } : {};
    const response = await api.get<{ itineraries: Itinerary[] }>('/itineraries', { params });
    return response.data;
  },

  async getItinerary(id: string): Promise<{ itinerary: Itinerary }> {
    const response = await api.get<{ itinerary: Itinerary }>(`/itineraries/${id}`);
    return response.data;
  },

  async createItinerary(data: {
    title: string;
    startDate?: string;
    endDate?: string;
    items: Array<{
      locationId: string;
      orderIndex: number;
      scheduledStartTime: string;
      scheduledEndTime: string;
      durationMinutes: number;
      transportationMethod: string;
    }>;
  }): Promise<{ itinerary: Itinerary }> {
    const response = await api.post<{ itinerary: Itinerary }>('/itineraries', data);
    return response.data;
  },

  async updateItinerary(id: string, data: { title?: string; items?: any[] }): Promise<{ itinerary: Itinerary }> {
    const response = await api.put<{ itinerary: Itinerary }>(`/itineraries/${id}`, data);
    return response.data;
  },

  async deleteItinerary(id: string): Promise<void> {
    await api.delete(`/itineraries/${id}`);
  },

  async reorderItems(id: string, itemIds: string[]): Promise<void> {
    await api.put(`/itineraries/${id}/items/reorder`, { itemIds });
  },

  async addItem(id: string, item: any): Promise<{ item: ItineraryItem }> {
    const response = await api.post<{ item: ItineraryItem }>(`/itineraries/${id}/items`, item);
    return response.data;
  },

  async deleteItem(id: string, itemId: string): Promise<void> {
    await api.delete(`/itineraries/${id}/items/${itemId}`);
  },
};

export const locationService = {
  async searchLocations(params: {
    search?: string;
    category?: string;
    budget?: string;
    limit?: number;
  }): Promise<{ locations: Location[] }> {
    const response = await api.get<{ locations: Location[] }>('/locations', { params });
    return response.data;
  },

  async getLocation(id: string): Promise<{ location: Location }> {
    const response = await api.get<{ location: Location }>(`/locations/${id}`);
    return response.data;
  },

  async smartSearch(params: {
    locationId: string;
    radius?: number;
    budget?: string;
    category?: string;
  }): Promise<{ suggestions: Location[] }> {
    const response = await api.get<{ suggestions: Location[] }>('/locations/smart-search', { params });
    return response.data;
  },
};

