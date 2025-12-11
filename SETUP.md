# Anvago Setup Guide

## Quick Start

### 1. Database Setup

Make sure PostgreSQL is running, then:

```bash
cd backend
# Update .env with your DATABASE_URL
npx prisma migrate dev --name init
npx prisma generate
npm run seed
```

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend will run on http://localhost:5000

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on http://localhost:3000

## Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/anvago?schema=public"
JWT_SECRET="your-secret-key"
OPENWEATHERMAP_API_KEY="your-api-key"  # Optional for demo (uses mock data)
GOOGLE_MAPS_API_KEY="your-api-key"     # For maps integration
```

### Frontend

Create `frontend/.env` if needed:

```env
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (protected)

### Onboarding
- `POST /api/onboarding/preferences` - Save preferences
- `POST /api/onboarding/itineraries` - Get recommended itineraries
- `POST /api/onboarding/reroll` - Regenerate itineraries
- `GET /api/onboarding/weather` - Get weather data

### Locations
- `GET /api/locations` - Search locations
- `GET /api/locations/:id` - Get location details
- `GET /api/locations/smart-search` - Smart search (premium, protected)

### Itineraries
- `GET /api/itineraries` - Get user's itineraries (protected)
- `GET /api/itineraries/:id` - Get itinerary details (protected)
- `POST /api/itineraries` - Create itinerary (protected)
- `PUT /api/itineraries/:id` - Update itinerary (protected)
- `DELETE /api/itineraries/:id` - Delete itinerary (protected)
- `PUT /api/itineraries/:id/items/reorder` - Reorder items (protected)
- `POST /api/itineraries/:id/items` - Add item (protected)
- `DELETE /api/itineraries/:id/items/:itemId` - Remove item (protected)

## Next Steps

1. Complete onboarding flow UI
2. Build itinerary display and detail views
3. Implement drag-and-drop trip planning
4. Add Google Maps integration
5. Build trip tracking dashboard
6. Add premium feature placeholders
7. Polish UI/UX

## Notes

- Weather API uses mock data if API key is not provided
- OAuth endpoints are placeholders (return 501)
- Premium features are marked but not fully implemented
- Location data is seeded from `backend/prisma/seed.ts`

