import axios from 'axios';
import prisma from '../config/database';

const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY || '';
const DANANG_COORDS = { lat: 16.0544, lon: 108.2022 };

interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface ForecastData {
  date: string;
  temperature: number;
  condition: string;
  description: string;
  icon: string;
}

export async function getCurrentWeather(): Promise<WeatherData> {
  try {
    // Check cache first
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const cached = await prisma.weatherCache.findUnique({
      where: {
        location_date: {
          location: 'danang',
          date: today,
        },
      },
    });

    if (cached && new Date(cached.expiresAt) > new Date()) {
      const data = cached.weatherData as any;
      return {
        temperature: Math.round(data.current?.temp || 25),
        condition: data.current?.weather?.[0]?.main || 'Clear',
        description: data.current?.weather?.[0]?.description || 'clear sky',
        humidity: data.current?.humidity || 70,
        windSpeed: data.current?.wind_speed || 5,
        icon: data.current?.weather?.[0]?.icon || '01d',
      };
    }

    // Fetch from API
    if (!OPENWEATHERMAP_API_KEY || OPENWEATHERMAP_API_KEY === 'your-openweathermap-api-key') {
      // Return mock data if no API key
      return {
        temperature: 28,
        condition: 'Clear',
        description: 'clear sky',
        humidity: 75,
        windSpeed: 8,
        icon: '01d',
      };
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          lat: DANANG_COORDS.lat,
          lon: DANANG_COORDS.lon,
          appid: OPENWEATHERMAP_API_KEY,
          units: 'metric',
        },
      }
    );

    const weatherData = {
      temperature: Math.round(response.data.main.temp),
      condition: response.data.weather[0].main,
      description: response.data.weather[0].description,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
      icon: response.data.weather[0].icon,
    };

    // Cache the result
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await prisma.weatherCache.upsert({
      where: {
        location_date: {
          location: 'danang',
          date: today,
        },
      },
      create: {
        location: 'danang',
        date: today,
        weatherData: response.data,
        expiresAt,
      },
      update: {
        weatherData: response.data,
        expiresAt,
      },
    });

    return weatherData;
  } catch (error: any) {
    console.error('Weather API error:', error.message);
    // Return mock data on error
    return {
      temperature: 28,
      condition: 'Clear',
      description: 'clear sky',
      humidity: 75,
      windSpeed: 8,
      icon: '01d',
    };
  }
}

export async function getForecast(days: number = 7): Promise<ForecastData[]> {
  try {
    if (!OPENWEATHERMAP_API_KEY || OPENWEATHERMAP_API_KEY === 'your-openweathermap-api-key') {
      // Return mock forecast
      return Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return {
          date: date.toISOString().split('T')[0],
          temperature: 28 + Math.floor(Math.random() * 5) - 2,
          condition: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
          description: 'partly cloudy',
          icon: '02d',
        };
      });
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast`,
      {
        params: {
          lat: DANANG_COORDS.lat,
          lon: DANANG_COORDS.lon,
          appid: OPENWEATHERMAP_API_KEY,
          units: 'metric',
          cnt: days * 8, // 8 forecasts per day (3-hour intervals)
        },
      }
    );

    // Group by day and get daily averages
    const dailyData: { [key: string]: any[] } = {};
    
    response.data.list.forEach((item: any) => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyData[date]) {
        dailyData[date] = [];
      }
      dailyData[date].push(item);
    });

    return Object.keys(dailyData)
      .slice(0, days)
      .map((date) => {
        const dayItems = dailyData[date];
        const avgTemp = Math.round(
          dayItems.reduce((sum, item) => sum + item.main.temp, 0) / dayItems.length
        );
        const mainCondition = dayItems[Math.floor(dayItems.length / 2)].weather[0];

        return {
          date,
          temperature: avgTemp,
          condition: mainCondition.main,
          description: mainCondition.description,
          icon: mainCondition.icon,
        };
      });
  } catch (error: any) {
    console.error('Forecast API error:', error.message);
    // Return mock forecast
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      return {
        date: date.toISOString().split('T')[0],
        temperature: 28 + Math.floor(Math.random() * 5) - 2,
        condition: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
        description: 'partly cloudy',
        icon: '02d',
      };
    });
  }
}

