// Simple seed script using raw SQL to bypass Prisma 7 client initialization issues
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/anvago?schema=public',
});

const locations = [
  {
    name: 'My Khe Beach',
    description: 'One of the most beautiful beaches in Vietnam, perfect for swimming and water sports.',
    address: 'My Khe Beach, Da Nang, Vietnam',
    latitude: 16.0472,
    longitude: 108.2478,
    category: 'beach',
    subcategory: 'swimming',
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    rating: 4.8,
    price_range: 'low',
    indoor: false,
    outdoor: true,
    weather_dependent: true,
    is_anva_authentic: false,
    local_rating: 4.7,
  },
  {
    name: 'Non Nuoc Beach',
    description: 'Pristine beach with white sand and clear blue water, less crowded than My Khe.',
    address: 'Non Nuoc Beach, Da Nang, Vietnam',
    latitude: 16.0167,
    longitude: 108.2333,
    category: 'beach',
    subcategory: 'swimming',
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    rating: 4.6,
    price_range: 'low',
    indoor: false,
    outdoor: true,
    weather_dependent: true,
    is_anva_authentic: true,
    local_rating: 4.8,
  },
  {
    name: 'Linh Ung Pagoda',
    description: 'Famous pagoda with a 67-meter tall Lady Buddha statue overlooking the sea.',
    address: 'Son Tra Peninsula, Da Nang, Vietnam',
    latitude: 16.1000,
    longitude: 108.2167,
    category: 'temple',
    subcategory: 'buddhist',
    image_url: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800',
    rating: 4.7,
    price_range: 'low',
    indoor: true,
    outdoor: true,
    weather_dependent: false,
    is_anva_authentic: true,
    local_rating: 4.8,
  },
  {
    name: 'Banh Xeo Ba Duong',
    description: 'Famous local restaurant serving authentic Vietnamese pancakes (banh xeo).',
    address: '280/23 Hoang Dieu, Da Nang, Vietnam',
    latitude: 16.0667,
    longitude: 108.2167,
    category: 'restaurant',
    subcategory: 'local',
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    rating: 4.8,
    price_range: 'low',
    indoor: true,
    outdoor: false,
    weather_dependent: false,
    is_anva_authentic: true,
    local_rating: 4.9,
  },
  {
    name: 'Marble Mountains',
    description: 'Five limestone hills with caves, pagodas, and stunning views of the coastline.',
    address: 'Hoa Hai, Da Nang, Vietnam',
    latitude: 16.0000,
    longitude: 108.2667,
    category: 'attraction',
    subcategory: 'nature',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    rating: 4.7,
    price_range: 'medium',
    indoor: true,
    outdoor: true,
    weather_dependent: true,
    is_anva_authentic: true,
    local_rating: 4.8,
  },
];

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Clear existing locations
    await pool.query('DELETE FROM locations');
    console.log('✅ Cleared existing locations');

    // Insert locations
    for (const loc of locations) {
      await pool.query(
        `INSERT INTO locations (
          id, name, description, address, latitude, longitude, category, subcategory,
          image_url, rating, price_range, indoor, outdoor, weather_dependent,
          is_anva_authentic, local_rating, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())`,
        [
          uuidv4(),
          loc.name,
          loc.description,
          loc.address,
          loc.latitude,
          loc.longitude,
          loc.category,
          loc.subcategory,
          loc.image_url,
          loc.rating,
          loc.price_range,
          loc.indoor,
          loc.outdoor,
          loc.weather_dependent,
          loc.is_anva_authentic,
          loc.local_rating,
        ]
      );
    }

    console.log(`✅ Created ${locations.length} locations`);
    console.log('🎉 Seeding completed!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed().catch(console.error);

