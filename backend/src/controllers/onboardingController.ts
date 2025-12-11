import { Request, Response } from 'express';
import prisma from '../config/database';
import { generateItineraries } from '../services/itineraryService';
import { getCurrentWeather, getForecast } from '../services/weatherService';
import { AuthRequest } from '../middleware/auth';

export async function savePreferences(req: AuthRequest, res: Response) {
  try {
    const preferences = req.body;

    if (req.userId) {
      // Save to database if user is logged in
      await prisma.userPreferences.upsert({
        where: { userId: req.userId },
        create: {
          userId: req.userId,
          ...preferences,
        },
        update: preferences,
      });
    }

    // Return preferences (can be stored in session/localStorage for guests)
    res.json({ preferences });
  } catch (error: any) {
    console.error('Save preferences error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

export async function getItineraries(req: Request, res: Response) {
  try {
    const preferences = req.body.preferences || req.query.preferences;

    if (!preferences) {
      return res.status(400).json({ message: 'Preferences are required' });
    }

    const parsedPreferences =
      typeof preferences === 'string' ? JSON.parse(preferences) : preferences;

    const itineraries = await generateItineraries(parsedPreferences);

    res.json({ itineraries });
  } catch (error: any) {
    console.error('Get itineraries error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

export async function rerollItineraries(req: Request, res: Response) {
  try {
    const preferences = req.body.preferences;

    if (!preferences) {
      return res.status(400).json({ message: 'Preferences are required' });
    }

    const itineraries = await generateItineraries(preferences);

    res.json({ itineraries });
  } catch (error: any) {
    console.error('Reroll itineraries error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

export async function getWeather(req: Request, res: Response) {
  try {
    const current = await getCurrentWeather();
    const forecast = await getForecast(7);

    res.json({ current, forecast });
  } catch (error: any) {
    console.error('Get weather error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

