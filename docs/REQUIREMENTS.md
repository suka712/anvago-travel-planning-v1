# Anvago Travel Planning App - Requirements Document

**Version:** 1.0.0  
**Last Updated:** 2025-01-XX  
**Project:** Anvago - Travel Planning App for Danang, Vietnam  
**Hackathon Deadline:** 9 days  
**Final Host:** Grab

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [User Flows](#user-flows)
5. [Feature Specifications](#feature-specifications)
6. [Database Schema](#database-schema)
7. [API Specifications](#api-specifications)
8. [External Integrations](#external-integrations)
9. [UI/UX Requirements](#uiux-requirements)
10. [Implementation Priorities](#implementation-priorities)
11. [Assumptions & Open Questions](#assumptions--open-questions)

---

## Project Overview

Anvago is a travel planning application that helps users plan trips to Danang, Vietnam (with future expansion to worldwide destinations). The app provides personalized itinerary recommendations based on user preferences, weather, and traffic data, with features for customization, scheduling, and live trip tracking.

### Core Value Propositions

1. **Personalized Planning**: Gamified onboarding to understand user preferences
2. **Smart Recommendations**: AI-powered itinerary generation based on preferences, weather, and traffic
3. **Flexible Customization**: Drag-and-drop interface for easy itinerary modification
4. **Live Trip Management**: Real-time tracking, notifications, and smart routing during trips
5. **Seamless Integration**: Direct booking and transportation options

---

## Tech Stack

### Frontend
- **Framework**: React (with TypeScript)
- **Styling**: Tailwind CSS v4
- **UI Components**: Custom components following design system
- **Icons**: Lucide React
- **Maps**: Google Maps API (or alternative)
- **State Management**: React Context API / Zustand (TBD)
- **Forms**: React Hook Form
- **Drag & Drop**: @dnd-kit or react-beautiful-dnd

### Backend
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js or Fastify
- **Database**: PostgreSQL
- **ORM**: Prisma or TypeORM
- **Authentication**: JWT + OAuth (Google, Facebook)
- **File Storage**: Local filesystem or cloud storage (AWS S3, Cloudinary)

### Infrastructure
- **Version Control**: Git
- **Package Manager**: npm or pnpm
- **Environment Variables**: dotenv
- **API Documentation**: Swagger/OpenAPI (optional)

---

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   React Client  │
│   (Frontend)    │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│  Node.js API    │
│   (Backend)     │
└────────┬────────┘
         │
    ┌────┴────┬──────────────┬──────────────┐
    │         │              │              │
┌───▼───┐ ┌──▼───┐    ┌──────▼──────┐ ┌────▼────┐
│PostgreSQL│ │Storage│    │External APIs│ │Auth    │
│          │ │       │    │(Weather,     │ │(OAuth)  │
│          │ │       │    │ Maps, etc.)  │ │        │
└──────────┘ └───────┘    └──────────────┘ └────────┘
```

### Project Structure

```
anvago-travel-planning-v1/
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API service functions
│   │   ├── utils/           # Utility functions
│   │   ├── types/           # TypeScript types
│   │   └── styles/          # Global styles, Tailwind config
│   ├── public/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── controllers/     # Route controllers
│   │   ├── services/        # Business logic
│   │   ├── models/          # Database models
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Utility functions
│   │   ├── types/           # TypeScript types
│   │   └── config/          # Configuration files
│   ├── prisma/              # Prisma schema (if using Prisma)
│   └── package.json
├── docs/
│   ├── DESIGN_SYSTEM.md
│   └── REQUIREMENTS.md
└── README.md
```

---

## User Flows

### Flow 1: Onboarding (No Login Required)

**Goal**: Collect user preferences and show personalized itinerary recommendations

#### Step 1.1: Essential Questions
- **Question 1**: "Do you have any destination in mind? (within Danang)"
  - Type: Text input / Searchable dropdown
  - Options: Pre-populated list of Danang locations
  - Required: No (skippable)
  - Multiple selection: No

- **Question 2**: "How long are you going to stay in Danang?"
  - Type: Number input / Dropdown
  - Options: Days (1-30+)
  - Required: No (skippable)
  - Multiple selection: No

#### Step 1.2: Gamified Questions
- **Question 1**: "Which of these personas best describe you?"
  - Type: Card selection (multiple allowed)
  - Options: 
    - Adventure Seeker 🏔️
    - Culture Enthusiast 🏛️
    - Food Lover 🍜
    - Beach Bum 🏖️
    - Nightlife Explorer 🌃
    - Family Traveler 👨‍👩‍👧‍👦
    - Budget Traveler 💰
    - Luxury Seeker ✨
  - Required: No (skippable)
  - Multiple selection: Yes

- **Question 2**: "Which of these locations matches your vibe?"
  - Type: Tinder-style swipe cards
  - Options: Image cards of Danang locations (beaches, temples, markets, etc.)
  - Required: No (skippable)
  - Multiple selection: Yes (swipe right to like)

- **Question 3**: "What do you have in mind?"
  - Type: Emoji/Icon selection grid
  - Options: 
    - 🏖️ Beach
    - 🏛️ Temples
    - 🍜 Food
    - 🛍️ Shopping
    - 🎨 Art & Culture
    - 🏔️ Nature
    - 🎢 Activities
    - 🌃 Nightlife
    - 📸 Photography
    - 🧘 Wellness
  - Required: No (skippable)
  - Multiple selection: Yes

- **Additional Questions** (to be added):
  - Budget range (Low/Medium/High/Luxury)
  - Travel style (Solo/Couple/Family/Group)
  - Preferred transportation (Walking/Bike/Car/Mixed)

#### Step 1.3: Weather Display
- Show current weather for Danang
- Display: Temperature, condition, forecast for trip duration
- Purpose: Demonstrate external data integration for personalization

#### Step 1.4: Itinerary Recommendations
- Display 3-5 pre-planned itineraries based on:
  - User preferences (from questions)
  - Weather conditions
  - Traffic data
  - Popular locations
- Each itinerary card shows:
  - Title
  - Duration
  - Highlights (3-4 key locations)
  - Estimated cost range
  - Weather compatibility indicator
- User can:
  - View detailed itinerary
  - Click "Reroll" to go back to questions
  - Skip to detailed view

#### Step 1.5: Detailed Itinerary View
- Full itinerary breakdown:
  - Timeline with locations
  - Transportation plan between locations
  - Estimated time at each location
  - Cost estimates
- Transportation options displayed:
  - Grab Bike
  - Grab Car
  - Walking
  - Rickshaw
  - Public transport
- Action buttons:
  - **Customize** (requires login)
  - **Schedule** (requires login)
  - **Go Now** (requires login)
- If user clicks any action without login → Show login modal

---

### Flow 2: Trip Planning (Logged In User)

**Goal**: Allow users to customize their selected itinerary

#### Step 2.1: Drag-and-Drop Itinerary Builder
- **UI**: Vertical timeline with draggable location cards
- Each card contains:
  - Location name
  - Image
  - Time slot
  - Duration
  - Transportation method to next location
  - Category tags
- **Basic Features** (Free):
  - Drag and drop to reorder locations
  - Search for locations and add to itinerary
  - Remove locations
  - Adjust time slots manually
  - Change transportation method

#### Step 2.2: Anva Smart Search (Paid Feature)
- Click on any location card
- Show "Replace with Anva Smart Search" option
- Filter options:
  - Same radius (within X km)
  - Same budget range
  - Same category (restaurant, attraction, etc.)
- Display replacement suggestions
- User can preview and replace

#### Step 2.3: Go AI Optimization (Paid Feature)
- Button: "Optimize with Go AI"
- Dropdown menu for specific optimization:
  - Optimize for indoors
  - Optimize for outdoors
  - Optimize for vibe
  - Optimize for budget
  - Optimize for walking distance
  - Maximize attractions
  - Custom combination
- On click:
  - Show loading state
  - Display side-by-side comparison:
    - Left: Current itinerary
    - Right: Optimized itinerary
  - User can:
    - Accept changes
    - Reject changes
    - Accept individual changes

#### Step 2.4: Localize by Anva (Paid Feature)
- Button: "Localize by Anva"
- Process:
  1. Highlight locations that have "Anva Authentic" alternatives
  2. Show side-by-side comparison for each:
     - Current location
     - Anva Authentic alternative (with stamp/badge)
  3. User can accept/reject each replacement individually
- "Anva Authentic" criteria:
  - Locally-owned
  - Highly rated by locals
  - Authentic experience
  - Similar category/price

#### Step 2.5: Booking Integration (Paid Feature)
- For each bookable location (hotels, restaurants, activities):
  - Show "Book Now" button
  - Integration with:
    - Booking.com
    - (Future: Agoda, Airbnb, etc.)
  - Open booking flow within app (iframe or redirect)
  - Track booking status

#### Step 2.6: Save & Schedule
- Save itinerary
- Set trip start date/time
- Set reminders/notifications

---

### Flow 3: Trip in Progress (Active Trip)

**Goal**: Guide users through their trip with live tracking and smart suggestions

#### Step 3.1: Trip Dashboard
- **Layout**:
  - Left/Map view: Google Maps integration
  - Right/Timeline: Current itinerary with progress
- **Map Features**:
  - Current user location (GPS)
  - Route to next destination
  - All itinerary locations marked
  - Real-time traffic overlay
- **Timeline Features**:
  - Current location highlighted
  - Completed locations checked off
  - Upcoming locations with ETA
  - Time adjustments (if behind/ahead of schedule)

#### Step 3.2: Geofencing & Location Tracking
- **Geofencing**:
  - Create geofence around each location (radius: ~100-200m)
  - Detect when user enters/exits geofence
  - Update trip status automatically
- **GPS Tracking**:
  - Continuous location updates (when trip is active)
  - Calculate distance to next destination
  - Estimate arrival time

#### Step 3.3: Smart Notifications & Suggestions

**Notification Types**:

1. **Trip Start**:
   - "Ready to go? Book your Grab bike now."
   - Appears when trip start time approaches

2. **Next Destination**:
   - "Are you ready for the next destination? Get Grab bike or your preferred form of transport."
   - Triggered: 15-30 minutes before next location time

3. **Running Late**:
   - "It seems you are enjoying this destination. We pushed your schedule back by 30 minutes."
   - Triggered: User is still at location past scheduled departure time
   - Auto-adjusts remaining schedule

4. **Transportation Reminder**:
   - "Time to head to [Next Location]. Book transportation now?"
   - With quick booking buttons

5. **Weather Alert**:
   - "Rain expected in 30 minutes. Consider heading indoors or rescheduling."

#### Step 3.4: Anva Smart Routing
- **Trigger Conditions**:
  - Rain detected in weather forecast
  - Heavy traffic on current route
  - Road closures/incidents
- **Process**:
  1. Detect adverse conditions
  2. Calculate alternative routes
  3. Suggest alternative indoor locations (if applicable)
  4. Show comparison:
     - Current route (with issues)
     - Alternative route/location
  5. User can accept or dismiss

#### Step 3.5: Trip Completion
- Mark trip as completed
- Show summary:
  - Locations visited
  - Time spent
  - Photos (if integrated)
  - Rating/feedback option

---

## Feature Specifications

### Authentication

#### Email Signup/Login
- Email + password registration
- Email verification (optional for MVP)
- Password reset functionality
- JWT token-based authentication

#### OAuth Integration
- Google OAuth
- Facebook OAuth
- Dummy keys for development (user will add real keys later)
- Store OAuth provider and provider ID

### Onboarding System

#### Question Engine
- Progressive question flow
- All questions skippable
- Save answers to session/localStorage (before login)
- Persist to database after login
- Support multiple selections where specified

#### Swipe Card Component
- Tinder-style swipe interface
- Swipe right = like, left = pass
- Visual feedback on swipe
- Smooth animations

#### Itinerary Generation Algorithm
- Input: User preferences, weather, traffic, duration
- Output: Ranked list of itineraries
- Factors:
  - Preference matching score
  - Weather compatibility
  - Traffic optimization
  - Location proximity
  - Popularity/ratings
  - Budget alignment

### Trip Planning Features

#### Drag-and-Drop System
- Library: @dnd-kit (recommended) or react-beautiful-dnd
- Vertical timeline layout
- Smooth animations
- Auto-save on changes
- Undo/redo functionality (nice-to-have)

#### Location Search
- Search bar with autocomplete
- Filter by category, budget, rating
- Add to itinerary at specific time slot
- Preview location details before adding

#### AI Optimization (Paid)
- Backend service for optimization logic
- Consider:
  - Distance minimization
  - Time optimization
  - Budget constraints
  - Weather conditions
  - User preferences
- Return optimized itinerary with explanation

#### Localization Feature (Paid)
- Database of "Anva Authentic" locations
- Matching algorithm:
  - Same category
  - Similar price range
  - Within radius
  - High local ratings
- Side-by-side comparison UI

### Trip Tracking Features

#### Geofencing Implementation
- Use browser Geolocation API
- Calculate distance from target coordinates
- Check if within geofence radius
- Update status in real-time
- Background tracking (with user permission)

#### Notification System
- Browser notifications (with permission)
- In-app notifications
- Push notifications (if PWA implemented)
- Notification preferences/settings

#### Smart Routing
- Integration with:
  - Weather API (for rain detection)
  - Google Maps API (for traffic)
- Route calculation
- Alternative location suggestions
- Indoor location database (for weather alternatives)

### Booking Integration

#### Booking.com Integration
- API integration (or iframe/redirect)
- Pass location and dates
- Track booking status
- Store booking references

---

## Database Schema

### Users Table
```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- nullable for OAuth users
  name VARCHAR(255),
  avatar_url TEXT,
  oauth_provider VARCHAR(50), -- 'google', 'facebook', null
  oauth_provider_id VARCHAR(255),
  subscription_tier VARCHAR(50) DEFAULT 'free', -- 'free', 'premium'
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### User Preferences Table
```sql
user_preferences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  destination VARCHAR(255),
  trip_duration INTEGER, -- days
  personas TEXT[], -- array of persona types
  liked_locations UUID[], -- array of location IDs
  interests TEXT[], -- array of interest emojis/categories
  budget_range VARCHAR(50),
  travel_style VARCHAR(50),
  preferred_transportation TEXT[],
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Locations Table
```sql
locations (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  category VARCHAR(100), -- 'attraction', 'restaurant', 'hotel', etc.
  subcategory VARCHAR(100),
  image_url TEXT,
  rating DECIMAL(3, 2),
  price_range VARCHAR(50), -- 'low', 'medium', 'high', 'luxury'
  opening_hours JSONB,
  is_anva_authentic BOOLEAN DEFAULT false,
  local_rating DECIMAL(3, 2),
  indoor BOOLEAN,
  outdoor BOOLEAN,
  weather_dependent BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Itineraries Table
```sql
itineraries (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id), -- nullable for guest users
  title VARCHAR(255),
  description TEXT,
  start_date DATE,
  end_date DATE,
  duration_days INTEGER,
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'scheduled', 'in_progress', 'completed', 'cancelled'
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Itinerary Items Table
```sql
itinerary_items (
  id UUID PRIMARY KEY,
  itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id),
  order_index INTEGER NOT NULL,
  scheduled_start_time TIME,
  scheduled_end_time TIME,
  actual_start_time TIMESTAMP,
  actual_end_time TIMESTAMP,
  duration_minutes INTEGER,
  transportation_method VARCHAR(50), -- 'walking', 'grab_bike', 'grab_car', 'rickshaw', etc.
  notes TEXT,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Transportation Bookings Table
```sql
transportation_bookings (
  id UUID PRIMARY KEY,
  itinerary_item_id UUID REFERENCES itinerary_items(id),
  user_id UUID REFERENCES users(id),
  provider VARCHAR(50), -- 'grab', etc.
  booking_reference VARCHAR(255),
  status VARCHAR(50), -- 'pending', 'confirmed', 'completed', 'cancelled'
  estimated_cost DECIMAL(10, 2),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Activity Bookings Table
```sql
activity_bookings (
  id UUID PRIMARY KEY,
  itinerary_item_id UUID REFERENCES itinerary_items(id),
  user_id UUID REFERENCES users(id),
  provider VARCHAR(50), -- 'booking.com', 'agoda', etc.
  booking_reference VARCHAR(255),
  status VARCHAR(50),
  booking_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Trip Tracking Table
```sql
trip_tracking (
  id UUID PRIMARY KEY,
  itinerary_id UUID REFERENCES itineraries(id),
  user_id UUID REFERENCES users(id),
  current_location_id UUID REFERENCES locations(id),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  status VARCHAR(50), -- 'not_started', 'in_progress', 'paused', 'completed'
  last_updated TIMESTAMP,
  created_at TIMESTAMP
)
```

### Weather Cache Table
```sql
weather_cache (
  id UUID PRIMARY KEY,
  location VARCHAR(255), -- 'danang' or coordinates
  date DATE,
  weather_data JSONB, -- full weather API response
  cached_at TIMESTAMP,
  expires_at TIMESTAMP
)
```

---

## API Specifications

### Authentication Endpoints

#### POST /api/auth/register
- Register new user with email/password
- Request body: `{ email, password, name }`
- Response: `{ user, token }`

#### POST /api/auth/login
- Login with email/password
- Request body: `{ email, password }`
- Response: `{ user, token }`

#### POST /api/auth/oauth/google
- OAuth callback for Google
- Request body: `{ code }` or `{ idToken }`
- Response: `{ user, token }`

#### POST /api/auth/oauth/facebook
- OAuth callback for Facebook
- Request body: `{ accessToken }`
- Response: `{ user, token }`

#### GET /api/auth/me
- Get current user (protected)
- Headers: `Authorization: Bearer <token>`
- Response: `{ user }`

### Onboarding Endpoints

#### POST /api/onboarding/preferences
- Save user preferences (can be called before login)
- Request body: `{ destination, duration, personas, interests, ... }`
- Response: `{ preferences }`

#### GET /api/onboarding/itineraries
- Get recommended itineraries based on preferences
- Query params: `?preferences={json}` or use session
- Response: `{ itineraries: [...] }`

#### POST /api/onboarding/reroll
- Regenerate itineraries with same preferences
- Request body: `{ preferences }`
- Response: `{ itineraries: [...] }`

### Itinerary Endpoints

#### GET /api/itineraries
- Get user's itineraries (protected)
- Query params: `?status=draft|scheduled|in_progress|completed`
- Response: `{ itineraries: [...] }`

#### GET /api/itineraries/:id
- Get single itinerary with items (protected)
- Response: `{ itinerary, items: [...] }`

#### POST /api/itineraries
- Create new itinerary (protected)
- Request body: `{ title, start_date, end_date, items: [...] }`
- Response: `{ itinerary }`

#### PUT /api/itineraries/:id
- Update itinerary (protected)
- Request body: `{ title, items: [...] }`
- Response: `{ itinerary }`

#### DELETE /api/itineraries/:id
- Delete itinerary (protected)
- Response: `{ success: true }`

#### PUT /api/itineraries/:id/items/reorder
- Reorder itinerary items (drag-and-drop)
- Request body: `{ itemIds: [uuid1, uuid2, ...] }`
- Response: `{ success: true }`

#### POST /api/itineraries/:id/items
- Add item to itinerary
- Request body: `{ locationId, orderIndex, scheduledStartTime, ... }`
- Response: `{ item }`

#### DELETE /api/itineraries/:id/items/:itemId
- Remove item from itinerary
- Response: `{ success: true }`

#### POST /api/itineraries/:id/optimize
- AI optimize itinerary (paid feature)
- Request body: `{ optimizationType: 'budget' | 'distance' | 'vibe' | ... }`
- Response: `{ optimizedItinerary, changes: [...] }`

#### POST /api/itineraries/:id/localize
- Get Anva Authentic alternatives (paid feature)
- Response: `{ alternatives: [{ itemId, currentLocation, alternativeLocation, ... }] }`

### Location Endpoints

#### GET /api/locations
- Search locations
- Query params: `?search=...&category=...&budget=...&radius=...`
- Response: `{ locations: [...] }`

#### GET /api/locations/:id
- Get location details
- Response: `{ location }`

#### GET /api/locations/smart-search
- Smart search for replacements (paid feature)
- Query params: `?locationId=...&radius=...&budget=...&category=...`
- Response: `{ suggestions: [...] }`

### Trip Tracking Endpoints

#### POST /api/trips/:itineraryId/start
- Start a trip (protected)
- Response: `{ trip }`

#### POST /api/trips/:itineraryId/tracking
- Update user location (protected)
- Request body: `{ latitude, longitude }`
- Response: `{ status, currentLocation, nextLocation, ... }`

#### GET /api/trips/:itineraryId/status
- Get current trip status (protected)
- Response: `{ status, currentLocation, progress, ... }`

#### POST /api/trips/:itineraryId/complete-item
- Mark itinerary item as completed (protected)
- Request body: `{ itemId }`
- Response: `{ success: true }`

#### POST /api/trips/:itineraryId/smart-routing
- Get smart routing suggestions (paid feature)
- Request body: `{ currentLocation, nextLocation }`
- Response: `{ alternatives: [...] }`

### Weather Endpoints

#### GET /api/weather/current
- Get current weather for Danang
- Response: `{ temperature, condition, forecast: [...] }`

#### GET /api/weather/forecast
- Get weather forecast
- Query params: `?days=7`
- Response: `{ forecast: [...] }`

### Booking Endpoints

#### POST /api/bookings/transportation
- Book transportation (paid feature)
- Request body: `{ itemId, provider, ... }`
- Response: `{ booking }`

#### POST /api/bookings/activity
- Book activity/hotel (paid feature)
- Request body: `{ itemId, provider, ... }`
- Response: `{ booking, bookingUrl }`

---

## External Integrations

### Weather API
- **Provider**: OpenWeatherMap (recommended) or WeatherAPI
- **Endpoints Used**:
  - Current weather
  - 7-day forecast
- **Caching**: Cache responses for 1 hour to reduce API calls

### Maps API
- **Provider**: Google Maps API
- **Features Used**:
  - Maps display
  - Geocoding (address to coordinates)
  - Reverse geocoding
  - Directions/routing
  - Traffic data
  - Places API (for location search)

### OAuth Providers
- **Google OAuth**: Google Sign-In API
- **Facebook OAuth**: Facebook Login API
- **Dummy Keys**: Use placeholder keys for development

### Booking Integrations
- **Booking.com**: API or affiliate link integration
- **Grab**: API for transportation booking (if available) or deep links

---

## UI/UX Requirements

### Design System Compliance
- All components must follow `DESIGN_SYSTEM.md`
- Use Tailwind CSS v4
- DM Sans font family
- Sky blue primary color (#4FC3F7)
- Black borders (2px) and shadows
- Rounded corners

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interactions (minimum 44x44px touch targets)

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Focus states on all interactive elements
- Sufficient color contrast

### Performance
- Lazy loading for images
- Code splitting for routes
- Optimistic UI updates
- Loading states for all async operations

### Animations
- Smooth transitions (200ms duration)
- Drag-and-drop animations
- Swipe card animations
- Button hover/active states
- Card hover effects

---

## Implementation Priorities

### Phase 1: Core MVP (Days 1-3)
1. ✅ Project setup (frontend + backend)
2. ✅ Database schema and migrations
3. ✅ Authentication (email + OAuth with dummy keys)
4. ✅ Basic onboarding flow (essential questions)
5. ✅ Location database (mock data for Danang)
6. ✅ Basic itinerary generation
7. ✅ Itinerary display

### Phase 2: Planning Features (Days 4-5)
1. ✅ Drag-and-drop itinerary builder
2. ✅ Location search and add
3. ✅ Itinerary save/load
4. ✅ Basic customization
5. ✅ Weather integration
6. ✅ Transportation planning

### Phase 3: Trip Tracking (Days 6-7)
1. ✅ Trip dashboard with map
2. ✅ GPS tracking and geofencing
3. ✅ Basic notifications
4. ✅ Trip status updates
5. ✅ Smart routing (basic)

### Phase 4: Premium Features & Polish (Days 8-9)
1. ✅ AI optimization (mock/placeholder)
2. ✅ Localization feature (mock data)
3. ✅ Booking integration (placeholder)
4. ✅ UI polish and animations
5. ✅ Error handling and edge cases
6. ✅ Testing and bug fixes

---

## Assumptions & Open Questions

### Assumptions Made
1. **Location Data**: Will use mock/seed data for Danang locations initially
2. **Weather API**: OpenWeatherMap (free tier sufficient for demo)
3. **Maps**: Google Maps API (requires API key)
4. **Payment**: Premium features marked but not fully implemented (payment gateway not integrated)
5. **Booking**: Booking.com integration will be placeholder/affiliate links for demo
6. **Grab API**: Will use deep links or mock integration (Grab API may require partnership)
7. **Geofencing**: Browser Geolocation API with manual distance calculation
8. **Notifications**: Browser notifications + in-app notifications (push notifications optional)

### Open Questions for User
1. **Location Data Source**: Do you have a database of Danang locations, or should we create comprehensive mock data?
2. **Weather API Preference**: OpenWeatherMap, WeatherAPI, or another provider?
3. **Maps Provider**: Google Maps, Mapbox, or another? (Google Maps requires billing setup)
4. **Payment Integration**: Should we implement a basic Stripe/payment flow, or just mark features as "premium"?
5. **Booking.com Integration**: Do you have API access, or should we use affiliate links/redirects?
6. **Grab Integration**: Do you have access to Grab API, or should we use deep links/mock?
7. **Geofencing Precision**: What radius should we use for geofencing? (Suggested: 100-200m)
8. **Notification Preferences**: Browser notifications only, or also implement PWA push notifications?
9. **AI Optimization**: Should we implement a real optimization algorithm, or use rule-based logic for demo?
10. **Anva Authentic Locations**: Do you have a list, or should we mark certain locations as "authentic" in seed data?

---

## Success Metrics (For Demo)

### Technical Demonstration
- ✅ Smooth onboarding flow
- ✅ Real-time weather integration
- ✅ Functional drag-and-drop
- ✅ GPS tracking and geofencing
- ✅ Smart routing suggestions
- ✅ Responsive design
- ✅ Fast load times

### User Experience
- ✅ Intuitive navigation
- ✅ Clear visual feedback
- ✅ Engaging gamified onboarding
- ✅ Seamless trip planning
- ✅ Helpful live trip guidance

---

## Next Steps

1. **Review this document** with the team
2. **Answer open questions** to finalize requirements
3. **Set up development environment**
4. **Initialize project structure**
5. **Begin Phase 1 implementation**

---

**Document Status**: Draft - Awaiting Review  
**Last Updated**: 2025-01-XX

