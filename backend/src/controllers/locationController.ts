import { Request, Response } from 'express';
import prisma from '../config/database';

export async function getLocations(req: Request, res: Response) {
  try {
    const {
      search,
      category,
      budget,
      radius,
      latitude,
      longitude,
      limit = 50,
    } = req.query;

    let where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (budget) {
      where.priceRange = budget;
    }

    const locations = await prisma.location.findMany({
      where,
      take: Number(limit),
      orderBy: { rating: 'desc' },
    });

    res.json({ locations });
  } catch (error: any) {
    console.error('Get locations error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

export async function getLocation(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const location = await prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.json({ location });
  } catch (error: any) {
    console.error('Get location error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

export async function smartSearch(req: Request, res: Response) {
  try {
    const { locationId, radius, budget, category } = req.query;

    if (!locationId) {
      return res.status(400).json({ message: 'locationId is required' });
    }

    const baseLocation = await prisma.location.findUnique({
      where: { id: locationId as string },
    });

    if (!baseLocation) {
      return res.status(404).json({ message: 'Base location not found' });
    }

    let where: any = {
      id: { not: locationId as string },
    };

    if (category) {
      where.category = category;
    } else if (baseLocation.category) {
      where.category = baseLocation.category;
    }

    if (budget) {
      where.priceRange = budget;
    } else if (baseLocation.priceRange) {
      where.priceRange = baseLocation.priceRange;
    }

    const suggestions = await prisma.location.findMany({
      where,
      take: 10,
      orderBy: [
        { isAnvaAuthentic: 'desc' },
        { localRating: 'desc' },
        { rating: 'desc' },
      ],
    });

    res.json({ suggestions });
  } catch (error: any) {
    console.error('Smart search error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

