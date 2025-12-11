# Anvago - Travel Planning App

A modern travel planning application for Danang, Vietnam (with future expansion to worldwide destinations).

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Maps**: Google Maps API
- **Weather**: OpenWeatherMap API

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- API keys for:
  - OpenWeatherMap
  - Google Maps

### Installation

1. Clone the repository
2. Install dependencies:

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. Set up environment variables:

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your database URL and API keys

# Frontend (if needed)
# Create frontend/.env if you need frontend-specific env vars
```

4. Set up the database:

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

5. Seed the database (when seed script is ready):

```bash
npm run seed
```

### Running the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
anvago-travel-planning-v1/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API service functions
│   │   └── utils/         # Utility functions
├── backend/           # Node.js backend API
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Route controllers
│   │   ├── services/      # Business logic
│   │   └── middleware/    # Express middleware
│   └── prisma/            # Prisma schema and migrations
└── docs/              # Documentation
```

## Features

- 🎯 Personalized onboarding with gamified questions
- 📍 Smart itinerary generation based on preferences
- 🗺️ Interactive trip planning with drag-and-drop
- 📱 Live trip tracking with GPS and geofencing
- 🌤️ Weather-aware routing and suggestions
- 🚗 Transportation booking integration
- ✨ Premium features (AI optimization, localization, booking)

## Documentation

- [Design System](./docs/DESIGN_SYSTEM.md)
- [Requirements](./docs/REQUIREMENTS.md)

## License

ISC

