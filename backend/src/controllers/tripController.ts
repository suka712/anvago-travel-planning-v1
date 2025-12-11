import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { getCurrentWeather } from '../services/weatherService';

export async function startTrip(req: AuthRequest, res: Response) {
  try {
    const { itineraryId } = req.params;

    // Verify ownership
    const itinerary = await prisma.itinerary.findFirst({
      where: { id: itineraryId, userId: req.userId },
    });

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    // Update itinerary status
    const updatedItinerary = await prisma.itinerary.update({
      where: { id: itineraryId },
      data: { status: 'in_progress' },
    });

    // Create or update trip tracking
    const tripTracking = await prisma.tripTracking.upsert({
      where: { itineraryId },
      create: {
        itineraryId,
        userId: req.userId!,
        status: 'in_progress',
      },
      update: {
        status: 'in_progress',
        lastUpdated: new Date(),
      },
    });

    res.json({ itinerary: updatedItinerary, tripTracking });
  } catch (error: any) {
    console.error('Start trip error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

export async function updateTracking(req: AuthRequest, res: Response) {
  try {
    const { itineraryId } = req.params;
    const { latitude, longitude } = req.body;

    // Verify ownership
    const itinerary = await prisma.itinerary.findFirst({
      where: { id: itineraryId, userId: req.userId },
      include: {
        items: {
          include: { location: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    // Update tracking
    const tripTracking = await prisma.tripTracking.update({
      where: { itineraryId },
      data: {
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        lastUpdated: new Date(),
      },
    });

    // Find nearest location (simple distance calculation)
    let currentLocationId = null;
    if (latitude && longitude) {
      const items = itinerary.items;
      let minDistance = Infinity;

      for (const item of items) {
        if (item.location.latitude && item.location.longitude) {
          const lat1 = parseFloat(latitude.toString());
          const lon1 = parseFloat(longitude.toString());
          const lat2 = parseFloat(item.location.latitude.toString());
          const lon2 = parseFloat(item.location.longitude.toString());

          // Haversine distance (simplified)
          const distance = Math.sqrt(
            Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2)
          ) * 111; // Rough km conversion

          if (distance < minDistance && distance < 0.2) {
            // Within 200m
            minDistance = distance;
            currentLocationId = item.locationId;
          }
        }
      }
    }

    if (currentLocationId) {
      await prisma.tripTracking.update({
        where: { itineraryId },
        data: { currentLocationId },
      });
    }

    // Get next location
    const currentIndex = itinerary.items.findIndex(
      (item) => item.locationId === currentLocationId
    );
    const nextItem = currentIndex >= 0 && currentIndex < itinerary.items.length - 1
      ? itinerary.items[currentIndex + 1]
      : null;

    res.json({
      status: tripTracking.status,
      currentLocationId,
      nextLocation: nextItem ? {
        id: nextItem.locationId,
        name: nextItem.location.name,
      } : null,
      progress: {
        completed: itinerary.items.filter((item) => item.isCompleted).length,
        total: itinerary.items.length,
      },
    });
  } catch (error: any) {
    console.error('Update tracking error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

export async function getTripStatus(req: AuthRequest, res: Response) {
  try {
    const { itineraryId } = req.params;

    const itinerary = await prisma.itinerary.findFirst({
      where: { id: itineraryId, userId: req.userId },
      include: {
        items: {
          include: { location: true },
          orderBy: { orderIndex: 'asc' },
        },
        tripTracking: true,
      },
    });

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    const completed = itinerary.items.filter((item) => item.isCompleted).length;
    const currentIndex = itinerary.items.findIndex(
      (item) => !item.isCompleted
    );

    res.json({
      status: itinerary.status,
      currentLocation: currentIndex >= 0 ? itinerary.items[currentIndex] : null,
      progress: {
        completed,
        total: itinerary.items.length,
        percentage: Math.round((completed / itinerary.items.length) * 100),
      },
      tripTracking: itinerary.tripTracking,
    });
  } catch (error: any) {
    console.error('Get trip status error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

export async function completeItem(req: AuthRequest, res: Response) {
  try {
    const { itineraryId } = req.params;
    const { itemId } = req.body;

    // Verify ownership
    const itinerary = await prisma.itinerary.findFirst({
      where: { id: itineraryId, userId: req.userId },
    });

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    // Mark item as completed
    const item = await prisma.itineraryItem.update({
      where: { id: itemId },
      data: {
        isCompleted: true,
        actualEndTime: new Date(),
      },
      include: { location: true },
    });

    // Check if all items completed
    const allItems = await prisma.itineraryItem.findMany({
      where: { itineraryId },
    });

    const allCompleted = allItems.every((i) => i.isCompleted);

    if (allCompleted) {
      await prisma.itinerary.update({
        where: { id: itineraryId },
        data: { status: 'completed' },
      });

      await prisma.tripTracking.update({
        where: { itineraryId },
        data: { status: 'completed' },
      });
    }

    res.json({ item, allCompleted });
  } catch (error: any) {
    console.error('Complete item error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

export async function getSmartRouting(req: AuthRequest, res: Response) {
  try {
    const { itineraryId } = req.params;
    const { currentLocationId, nextLocationId } = req.body;

    // Get weather
    const weather = await getCurrentWeather();
    const isBadWeather = ['Rain', 'Storm', 'Thunderstorm'].includes(weather.condition);

    // Get locations
    const currentLocation = await prisma.location.findUnique({
      where: { id: currentLocationId },
    });

    const nextLocation = await prisma.location.findUnique({
      where: { id: nextLocationId },
    });

    if (!currentLocation || !nextLocation) {
      return res.status(404).json({ message: 'Location not found' });
    }

    const alternatives: any[] = [];

    // If bad weather, suggest indoor alternatives
    if (isBadWeather && nextLocation.weatherDependent) {
      const indoorAlternatives = await prisma.location.findMany({
        where: {
          category: nextLocation.category,
          indoor: true,
          id: { not: nextLocationId },
        },
        take: 3,
        orderBy: { rating: 'desc' },
      });

      alternatives.push(...indoorAlternatives.map((loc) => ({
        type: 'weather',
        reason: 'Rain expected - indoor alternative',
        location: loc,
      })));
    }

    // Suggest similar category locations
    const similarLocations = await prisma.location.findMany({
      where: {
        category: nextLocation.category,
        id: { not: nextLocationId },
        priceRange: nextLocation.priceRange,
      },
      take: 2,
      orderBy: { isAnvaAuthentic: 'desc' },
    });

    alternatives.push(...similarLocations.map((loc) => ({
      type: 'similar',
      reason: 'Similar experience nearby',
      location: loc,
    })));

    res.json({
      currentRoute: {
        from: currentLocation,
        to: nextLocation,
        issues: isBadWeather && nextLocation.weatherDependent ? ['weather'] : [],
      },
      alternatives,
    });
  } catch (error: any) {
    console.error('Smart routing error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

