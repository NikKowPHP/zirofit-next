/*
  Warnings:

  - You are about to drop the column `supabaseAuthUserId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_supabaseAuthUserId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "supabaseAuthUserId";

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
