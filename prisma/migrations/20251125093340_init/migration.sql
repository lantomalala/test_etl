-- CreateTable
CREATE TABLE "Product" (
    "id" BIGSERIAL NOT NULL,
    "itemId" TEXT NOT NULL,
    "title" TEXT,
    "oemReference" TEXT,
    "price" DOUBLE PRECISION,
    "currency" VARCHAR(8),
    "url" TEXT,
    "seller" TEXT,
    "listingStartDate" TIMESTAMPTZ,
    "status" VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
    "endDate" TIMESTAMPTZ,
    "closedReason" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_itemId_key" ON "Product"("itemId");
