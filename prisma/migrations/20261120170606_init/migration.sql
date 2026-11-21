-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'EDITOR', 'SALES_AGENT');

-- CreateEnum
CREATE TYPE "DepartureStatus" AS ENUM ('OPEN', 'LIMITED', 'GUARANTEED', 'SOLD_OUT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DEPOSIT_PAID', 'PAID', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PARTIAL', 'PAID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "InquiryType" AS ENUM ('GENERAL', 'CUSTOM_TRIP', 'TRIP_INQUIRY', 'EXPEDITION', 'CALLBACK');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'QUOTED', 'NEGOTIATION', 'WON', 'LOST', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('NOTE', 'CALL', 'EMAIL', 'WHATSAPP', 'STATUS_CHANGE', 'QUOTE_SENT');

-- CreateEnum
CREATE TYPE "SubscriberStatus" AS ENUM ('ACTIVE', 'UNSUBSCRIBED');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'EDITOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "categories" TEXT[],
    "region" TEXT,
    "area" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "gallery" TEXT[],
    "mapImage" TEXT,
    "videoUrl" TEXT,
    "days" INTEGER NOT NULL,
    "maxAltitude" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "priceUsd" INTEGER,
    "groupMax" INTEGER NOT NULL DEFAULT 8,
    "seasonMonths" INTEGER[],
    "startPoint" TEXT NOT NULL,
    "endPoint" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "highlights" TEXT[],
    "includes" TEXT[],
    "excludes" TEXT[],
    "gearList" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "badge" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "featuredOrder" INTEGER NOT NULL DEFAULT 0,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "focusKeyword" TEXT,
    "ogImage" TEXT,
    "canonicalUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripItineraryDay" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "dayOrder" INTEGER NOT NULL,
    "dayLabel" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "altitude" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "meals" TEXT,
    "accommodation" TEXT,
    "distanceKm" DOUBLE PRECISION,
    "durationHrs" TEXT,

    CONSTRAINT "TripItineraryDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripDeparture" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "priceOverride" INTEGER,
    "seatsTotal" INTEGER NOT NULL DEFAULT 8,
    "seatsBooked" INTEGER NOT NULL DEFAULT 0,
    "status" "DepartureStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripDeparture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripFaq" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TripFaq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripReview" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorCountry" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "title" TEXT,
    "comment" TEXT NOT NULL,
    "tripDate" TIMESTAMP(3),
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrekRoute" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "range" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "startPoint" TEXT NOT NULL,
    "highestPoint" INTEGER NOT NULL,
    "highestPointName" TEXT NOT NULL,
    "priceFrom" INTEGER NOT NULL,
    "season" TEXT NOT NULL,
    "seasonLabel" TEXT NOT NULL,
    "statusBadge" TEXT NOT NULL,
    "statusColor" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "elevationStart" TEXT NOT NULL,
    "elevationMid" TEXT NOT NULL,
    "elevationPeak" TEXT NOT NULL,
    "svgPath" TEXT NOT NULL,
    "peakX" DOUBLE PRECISION NOT NULL,
    "peakY" DOUBLE PRECISION NOT NULL,
    "linkedTripSlug" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrekRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpeditionObjective" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "permit" TEXT NOT NULL,
    "band" TEXT NOT NULL,
    "bandType" TEXT NOT NULL,
    "elevation" INTEGER NOT NULL,
    "elevationFt" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "seasonSub" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "specs" TEXT NOT NULL,
    "guideRatio" TEXT NOT NULL,
    "guideSpecs" TEXT NOT NULL,
    "image" TEXT,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpeditionObjective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchiveEntry" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "decade" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "subRegion" TEXT NOT NULL,
    "passDetail" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "altitude" INTEGER NOT NULL,
    "altitudeFt" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArchiveEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "dispatchNo" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL DEFAULT 'Brothers Field Team',
    "authorRole" TEXT NOT NULL DEFAULT 'Senior Alpine Lead',
    "category" TEXT NOT NULL DEFAULT 'Field Dispatch',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "badge" TEXT NOT NULL,
    "badgeType" TEXT NOT NULL,
    "rating" TEXT NOT NULL DEFAULT '5.0',
    "ratingCount" TEXT NOT NULL DEFAULT '0 logged',
    "duration" TEXT NOT NULL,
    "metricLabel" TEXT NOT NULL,
    "metricValue" TEXT NOT NULL,
    "tariff" TEXT NOT NULL,
    "logisticsBadge" TEXT NOT NULL,
    "telemetryWarning" TEXT,
    "telemetryIcon" TEXT,
    "telemetryColor" TEXT,
    "mirrored" BOOLEAN NOT NULL DEFAULT false,
    "readingTimeMin" INTEGER NOT NULL DEFAULT 5,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ogImage" TEXT,
    "canonicalUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "whatsapp" TEXT,
    "country" TEXT,
    "nationality" TEXT,
    "source" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "tripSlug" TEXT NOT NULL,
    "tripName" TEXT NOT NULL,
    "departureId" TEXT,
    "departureDate" TIMESTAMP(3),
    "isCustomDate" BOOLEAN NOT NULL DEFAULT false,
    "travellers" INTEGER NOT NULL DEFAULT 1,
    "pricePerPerson" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NPR',
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "specialNotes" TEXT,
    "adminNotes" TEXT,
    "sourcePage" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "type" "InquiryType" NOT NULL DEFAULT 'GENERAL',
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "customerId" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "whatsapp" TEXT,
    "country" TEXT,
    "interest" TEXT,
    "routeName" TEXT,
    "tripId" TEXT,
    "preferredDate" TIMESTAMP(3),
    "groupSize" INTEGER,
    "budget" TEXT,
    "message" TEXT,
    "assignedToId" TEXT,
    "estimatedValue" INTEGER,
    "followUpAt" TIMESTAMP(3),
    "sourcePage" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadActivity" (
    "id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL DEFAULT 'NOTE',
    "content" TEXT NOT NULL,
    "inquiryId" TEXT,
    "bookingId" TEXT,
    "customerId" TEXT,
    "adminUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "source" TEXT,
    "status" "SubscriberStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "siteName" TEXT NOT NULL DEFAULT 'BROTHERS Holidays Adventure',
    "tagline" TEXT NOT NULL DEFAULT 'Himalayan Field Journal & Premium Expeditions',
    "contactEmail" TEXT NOT NULL DEFAULT 'info@brothersholidays.com',
    "contactPhone" TEXT NOT NULL DEFAULT '+977-1-4700000',
    "whatsappNumber" TEXT NOT NULL DEFAULT '+9779800000000',
    "officeAddress" TEXT NOT NULL DEFAULT 'Thamel, Kathmandu 44600, Nepal',
    "registrationNo" TEXT NOT NULL DEFAULT 'Govt. Regd. 58177/068/069 · TAAN · NMA · NTB',
    "defaultCurrency" TEXT NOT NULL DEFAULT 'NPR',
    "usdExchangeRate" DOUBLE PRECISION NOT NULL DEFAULT 135.0,
    "announcementBanner" TEXT,
    "announcementActive" BOOLEAN NOT NULL DEFAULT false,
    "instagramUrl" TEXT,
    "facebookUrl" TEXT,
    "youtubeUrl" TEXT,
    "tripadvisorUrl" TEXT,
    "gaMeasurementId" TEXT,
    "gtmContainerId" TEXT,
    "googleSiteVerification" TEXT,
    "bingSiteVerification" TEXT,
    "facebookPixelId" TEXT,
    "defaultMetaTitle" TEXT NOT NULL DEFAULT 'BROTHERS Holidays Adventure — Himalayan Field Journal & Premium Expeditions',
    "defaultMetaDescription" TEXT NOT NULL DEFAULT 'An alpine editorial journal of routes across Nepal, mapped with absolute elevation, topographic precision, and zero commercial filler.',
    "defaultOgImage" TEXT NOT NULL DEFAULT '/images/trips/hero-ama-dablam.jpg',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageSeo" (
    "id" TEXT NOT NULL,
    "routePath" TEXT NOT NULL,
    "pageLabel" TEXT NOT NULL,
    "metaTitle" TEXT NOT NULL,
    "metaDescription" TEXT NOT NULL,
    "metaKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "canonicalUrl" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "structuredDataJson" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageSeo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Redirect" (
    "id" TEXT NOT NULL,
    "fromPath" TEXT NOT NULL,
    "toPath" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL DEFAULT 301,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Redirect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "folder" TEXT NOT NULL DEFAULT 'general',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Trip_slug_key" ON "Trip"("slug");

-- CreateIndex
CREATE INDEX "Trip_country_isPublished_idx" ON "Trip"("country", "isPublished");

-- CreateIndex
CREATE INDEX "Trip_region_isPublished_idx" ON "Trip"("region", "isPublished");

-- CreateIndex
CREATE INDEX "Trip_isFeatured_featuredOrder_idx" ON "Trip"("isFeatured", "featuredOrder");

-- CreateIndex
CREATE INDEX "TripItineraryDay_tripId_idx" ON "TripItineraryDay"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "TripItineraryDay_tripId_dayOrder_key" ON "TripItineraryDay"("tripId", "dayOrder");

-- CreateIndex
CREATE INDEX "TripDeparture_tripId_startDate_idx" ON "TripDeparture"("tripId", "startDate");

-- CreateIndex
CREATE INDEX "TripDeparture_status_startDate_idx" ON "TripDeparture"("status", "startDate");

-- CreateIndex
CREATE INDEX "TripFaq_tripId_sortOrder_idx" ON "TripFaq"("tripId", "sortOrder");

-- CreateIndex
CREATE INDEX "TripReview_tripId_isPublished_idx" ON "TripReview"("tripId", "isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "TrekRoute_code_key" ON "TrekRoute"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TrekRoute_slug_key" ON "TrekRoute"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ExpeditionObjective_slug_key" ON "ExpeditionObjective"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ArchiveEntry_slug_key" ON "ArchiveEntry"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "JournalPost_slug_key" ON "JournalPost"("slug");

-- CreateIndex
CREATE INDEX "JournalPost_isPublished_publishedAt_idx" ON "JournalPost"("isPublished", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_reference_key" ON "Booking"("reference");

-- CreateIndex
CREATE INDEX "Booking_status_createdAt_idx" ON "Booking"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Booking_customerEmail_idx" ON "Booking"("customerEmail");

-- CreateIndex
CREATE INDEX "Booking_tripId_idx" ON "Booking"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "Inquiry_reference_key" ON "Inquiry"("reference");

-- CreateIndex
CREATE INDEX "Inquiry_status_priority_createdAt_idx" ON "Inquiry"("status", "priority", "createdAt");

-- CreateIndex
CREATE INDEX "Inquiry_email_idx" ON "Inquiry"("email");

-- CreateIndex
CREATE INDEX "LeadActivity_inquiryId_idx" ON "LeadActivity"("inquiryId");

-- CreateIndex
CREATE INDEX "LeadActivity_bookingId_idx" ON "LeadActivity"("bookingId");

-- CreateIndex
CREATE INDEX "LeadActivity_customerId_idx" ON "LeadActivity"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PageSeo_routePath_key" ON "PageSeo"("routePath");

-- CreateIndex
CREATE UNIQUE INDEX "Redirect_fromPath_key" ON "Redirect"("fromPath");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_url_key" ON "MediaAsset"("url");

-- AddForeignKey
ALTER TABLE "TripItineraryDay" ADD CONSTRAINT "TripItineraryDay_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripDeparture" ADD CONSTRAINT "TripDeparture_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripFaq" ADD CONSTRAINT "TripFaq_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripReview" ADD CONSTRAINT "TripReview_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalPost" ADD CONSTRAINT "JournalPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_departureId_fkey" FOREIGN KEY ("departureId") REFERENCES "TripDeparture"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
