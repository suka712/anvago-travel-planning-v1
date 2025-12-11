import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export async function getItineraries(req: AuthRequest, res: Response) {
  try {
    const { status } = req.query;

    const where: any = { userId: req.userId };
    if (status) {
      where.status = status;
    }

    const itineraries = await prisma.itinerary.findMany({
      where,
      include: {
        items: {
          include: {
            location: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ itineraries });
  } catch (error: any) {
    console.error('Get itineraries error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

export async function getItinerary(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const itinerary = await prisma.itinerary.findFirst({
      where: {
        id,
        userId: req.userId,
      },
      include: {
        items: {
          include: {
            location: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    res.json({ itinerary });
  } catch (error: any) {
    console.error('Get itinerary error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

export async function createItinerary(req: AuthRequest, res: Response) {
  try {
    const { title, startDate, endDate, items } = req.body;

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    const durationDays = start && end
      ? Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const itinerary = await prisma.itinerary.create({
      data: {
        userId: req.userId!,
        title,
        startDate: start,
        endDate: end,
        durationDays,
        items: {
          create: items.map((item: any, index: number) => ({
            locationId: item.locationId,
            orderIndex: index,
            scheduledStartTime: item.scheduledStartTime,
            scheduledEndTime: item.scheduledEndTime,
            durationMinutes: item.durationMinutes,
            transportationMethod: item.transportationMethod,
          })),
        },
      },
      include: {
        items: {
          include: {
            location: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    res.status(201).json({ itinerary });
  } catch (error: any) {
    console.error('Create itinerary error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

export async function updateItinerary(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, items } = req.body;

    // Verify ownership
    const existing = await prisma.itinerary.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    // Update itinerary
    const itinerary = await prisma.itinerary.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(items && {
          items: {
            deleteMany: {},
            create: items.map((item: any, index: number) => ({
              locationId: item.locationId,
              orderIndex: index,
              scheduledStartTime: item.scheduledStartTime,
              scheduledEndTime: item.scheduledEndTime,
              durationMinutes: item.durationMinutes,
              transportationMethod: item.transportationMethod,
            })),
          },
        }),
      },
      include: {
        items: {
          include: {
            location: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    res.json({ itinerary });
  } catch (error: any) {
    console.error('Update itinerary error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

export async function reorderItems(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { itemIds } = req.body;

    if (!Array.isArray(itemIds)) {
      return res.status(400).json({ message: 'itemIds must be an array' });
    }

    // Verify ownership
    const existing = await prisma.itinerary.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    // Update order indices
    await Promise.all(
      itemIds.map((itemId: string, index: number) =>
        prisma.itineraryItem.update({
          where: { id: itemId },
          data: { orderIndex: index },
        })
      )
    );

    res.json({ success: true });
  } catch (error: any) {
    console.error('Reorder items error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

export async function addItem(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { locationId, orderIndex, scheduledStartTime, scheduledEndTime, durationMinutes, transportationMethod } = req.body;

    // Verify ownership
    const existing = await prisma.itinerary.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    const item = await prisma.itineraryItem.create({
      data: {
        itineraryId: id,
        locationId,
        orderIndex: orderIndex ?? 0,
        scheduledStartTime,
        scheduledEndTime,
        durationMinutes,
        transportationMethod,
      },
      include: {
        location: true,
      },
    });

    res.status(201).json({ item });
  } catch (error: any) {
    console.error('Add item error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

export async function deleteItem(req: AuthRequest, res: Response) {
  try {
    const { id, itemId } = req.params;

    // Verify ownership
    const existing = await prisma.itinerary.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    await prisma.itineraryItem.delete({
      where: { id: itemId },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

export async function deleteItinerary(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    // Verify ownership
    const existing = await prisma.itinerary.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    await prisma.itinerary.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete itinerary error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

export async function optimizeItinerary(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { optimizationType } = req.body;

    // Verify ownership and get itinerary
    const itinerary = await prisma.itinerary.findFirst({
      where: { id, userId: req.userId },
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

    // Generate optimized version based on type
    const optimizedItems = [...itinerary.items];

    switch (optimizationType) {
      case 'budget':
        // Sort by price (low to high)
        optimizedItems.sort((a, b) => {
          const priceOrder = { low: 1, medium: 2, high: 3, luxury: 4 };
          return (priceOrder[a.location.priceRange as keyof typeof priceOrder] || 2) -
                 (priceOrder[b.location.priceRange as keyof typeof priceOrder] || 2);
        });
        break;
      case 'distance':
        // Reorder to minimize travel distance (simplified - would use actual coordinates)
        // For demo, just reverse order
        optimizedItems.reverse();
        break;
      case 'vibe':
        // Group by category
        optimizedItems.sort((a, b) => {
          return (a.location.category || '').localeCompare(b.location.category || '');
        });
        break;
      case 'indoors':
        // Prioritize indoor locations
        optimizedItems.sort((a, b) => {
          if (a.location.indoor && !b.location.indoor) return -1;
          if (!a.location.indoor && b.location.indoor) return 1;
          return 0;
        });
        break;
      case 'outdoors':
        // Prioritize outdoor locations
        optimizedItems.sort((a, b) => {
          if (a.location.outdoor && !b.location.outdoor) return -1;
          if (!a.location.outdoor && b.location.outdoor) return 1;
          return 0;
        });
        break;
      default:
        // Default: maximize attractions
        optimizedItems.sort((a, b) => {
          return (b.location.rating?.toNumber() || 0) - (a.location.rating?.toNumber() || 0);
        });
    }

    // Map to response format
    const changes = optimizedItems.map((item, index) => ({
      itemId: item.id,
      oldIndex: itinerary.items.findIndex((i) => i.id === item.id),
      newIndex: index,
      location: item.location,
    }));

    res.json({
      optimizedItinerary: {
        items: optimizedItems.map((item, index) => ({
          ...item,
          orderIndex: index,
        })),
      },
      changes,
    });
  } catch (error: any) {
    console.error('Optimize itinerary error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

export async function localizeItinerary(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    // Verify ownership
    const itinerary = await prisma.itinerary.findFirst({
      where: { id, userId: req.userId },
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

    // Find Anva Authentic alternatives for each location
    const alternatives = await Promise.all(
      itinerary.items.map(async (item) => {
        if (item.location.isAnvaAuthentic) {
          return null; // Already authentic
        }

        // Find authentic alternative
        const authenticAlternative = await prisma.location.findFirst({
          where: {
            category: item.location.category,
            isAnvaAuthentic: true,
            id: { not: item.locationId },
            priceRange: item.location.priceRange,
          },
          orderBy: { localRating: 'desc' },
        });

        if (authenticAlternative) {
          return {
            itemId: item.id,
            currentLocation: item.location,
            alternativeLocation: authenticAlternative,
          };
        }

        return null;
      })
    );

    const filteredAlternatives = alternatives.filter((alt) => alt !== null);

    res.json({ alternatives: filteredAlternatives });
  } catch (error: any) {
    console.error('Localize itinerary error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

export async function scheduleItinerary(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.body;

    // Verify ownership
    const existing = await prisma.itinerary.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    const durationDays = start && end
      ? Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const itinerary = await prisma.itinerary.update({
      where: { id },
      data: {
        startDate: start,
        endDate: end,
        durationDays,
        status: start && start > new Date() ? 'scheduled' : 'draft',
      },
      include: {
        items: {
          include: { location: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    res.json({ itinerary });
  } catch (error: any) {
    console.error('Schedule itinerary error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

