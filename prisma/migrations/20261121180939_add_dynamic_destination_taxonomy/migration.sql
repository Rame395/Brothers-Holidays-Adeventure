-- CreateTable
CREATE TABLE "DestinationCountry" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "blurb" TEXT NOT NULL DEFAULT '',
    "heroImage" TEXT NOT NULL DEFAULT '/images/trips/everest.jpg',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DestinationCountry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "blurb" TEXT NOT NULL DEFAULT '',
    "heroImage" TEXT NOT NULL DEFAULT '/images/trips/everest.jpg',
    "groupByRegion" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DestinationRegion" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "countrySlug" TEXT NOT NULL,
    "blurb" TEXT NOT NULL DEFAULT '',
    "heroImage" TEXT NOT NULL DEFAULT '/images/trips/everest.jpg',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DestinationRegion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DestinationCountry_slug_key" ON "DestinationCountry"("slug");

-- CreateIndex
CREATE INDEX "DestinationCountry_isActive_sortOrder_idx" ON "DestinationCountry"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "TripCategory_slug_key" ON "TripCategory"("slug");

-- CreateIndex
CREATE INDEX "TripCategory_isActive_sortOrder_idx" ON "TripCategory"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "DestinationRegion_slug_key" ON "DestinationRegion"("slug");

-- CreateIndex
CREATE INDEX "DestinationRegion_countrySlug_isActive_sortOrder_idx" ON "DestinationRegion"("countrySlug", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "DestinationRegion_countryId_idx" ON "DestinationRegion"("countryId");

-- AddForeignKey
ALTER TABLE "DestinationRegion" ADD CONSTRAINT "DestinationRegion_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "DestinationCountry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
