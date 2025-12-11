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

