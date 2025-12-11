-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "name" TEXT,
    "avatar_url" TEXT,
    "oauth_provider" TEXT,
    "oauth_provider_id" TEXT,
    "subscription_tier" TEXT NOT NULL DEFAULT 'free',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "destination" TEXT,
    "trip_duration" INTEGER,
    "personas" TEXT[],
    "liked_locations" TEXT[],
    "interests" TEXT[],
    "budget_range" TEXT,
    "travel_style" TEXT,
    "preferred_transportation" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "category" TEXT,
    "subcategory" TEXT,
    "image_url" TEXT,
    "rating" DECIMAL(3,2),
    "price_range" TEXT,
    "opening_hours" JSONB,
    "is_anva_authentic" BOOLEAN NOT NULL DEFAULT false,
    "local_rating" DECIMAL(3,2),
    "indoor" BOOLEAN NOT NULL DEFAULT false,
    "outdoor" BOOLEAN NOT NULL DEFAULT false,
    "weather_dependent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itineraries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "title" TEXT,
    "description" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "duration_days" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "is_template" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itineraries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itinerary_items" (
    "id" TEXT NOT NULL,
    "itinerary_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "scheduled_start_time" TEXT,
    "scheduled_end_time" TEXT,
    "actual_start_time" TIMESTAMP(3),
    "actual_end_time" TIMESTAMP(3),
    "duration_minutes" INTEGER,
    "transportation_method" TEXT,
    "notes" TEXT,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itinerary_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transportation_bookings" (
    "id" TEXT NOT NULL,
    "itinerary_item_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "booking_reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "estimated_cost" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transportation_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_bookings" (
    "id" TEXT NOT NULL,
    "itinerary_item_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "booking_reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "booking_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_tracking" (
    "id" TEXT NOT NULL,
    "itinerary_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "current_location_id" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trip_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_cache" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "weather_data" JSONB NOT NULL,
    "cached_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weather_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "trip_tracking_itinerary_id_key" ON "trip_tracking"("itinerary_id");

-- CreateIndex
CREATE UNIQUE INDEX "weather_cache_location_date_key" ON "weather_cache"("location", "date");

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_items" ADD CONSTRAINT "itinerary_items_itinerary_id_fkey" FOREIGN KEY ("itinerary_id") REFERENCES "itineraries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_items" ADD CONSTRAINT "itinerary_items_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportation_bookings" ADD CONSTRAINT "transportation_bookings_itinerary_item_id_fkey" FOREIGN KEY ("itinerary_item_id") REFERENCES "itinerary_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportation_bookings" ADD CONSTRAINT "transportation_bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_bookings" ADD CONSTRAINT "activity_bookings_itinerary_item_id_fkey" FOREIGN KEY ("itinerary_item_id") REFERENCES "itinerary_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_bookings" ADD CONSTRAINT "activity_bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_tracking" ADD CONSTRAINT "trip_tracking_itinerary_id_fkey" FOREIGN KEY ("itinerary_id") REFERENCES "itineraries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_tracking" ADD CONSTRAINT "trip_tracking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
