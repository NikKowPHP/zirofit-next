-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "currency" TEXT,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "price" DECIMAL(10,2);
