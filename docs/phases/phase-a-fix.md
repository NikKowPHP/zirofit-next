Based on your request to incorporate trainer service prices and enable sorting by price, I have devised a comprehensive plan to update the database schema, backend logic, and frontend components. Here are the planned changes:

1.  **Database Schema Enhancement:** I will add `price`, `currency`, and `duration` fields to the `Service` model in the Prisma schema. This change will be accompanied by a new database migration file to apply it.
2.  **Backend Updates:**
    *   The server action for managing services (`service-actions.ts`) will be updated to handle these new price-related fields, including validation.
    *   The API endpoint for fetching trainers (`lib/api/trainers.ts`) will be modified to include the lowest-priced service for each trainer and to support sorting by price (both ascending and descending).
3.  **Frontend Modifications:**
    *   The "Services" section in the profile editor will be enhanced with new input fields for price, currency, and duration.
    *   The trainer search results page will be updated. The sort control will now include options for sorting by price.
    *   Each trainer's card in the search results will now display their starting price to provide users with immediate value information.
4.  **Internationalization:** New text labels for the added features will be incorporated into the English and Polish translation files to ensure a consistent user experience across languages.

These changes will holistically integrate the concept of pricing into the platform, from data storage to user-facing search and display.

### BASH COMMANDS
```bash
mkdir -p "prisma/migrations/20250720100000_add_price_to_service"
touch "prisma/migrations/20250720100000_add_price_to_service/migration.sql"
```
-------------------------------------------------------------------------------
### prisma/migrations/20250720100000_add_price_to_service/migration.sql
```sql
-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "currency" TEXT,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "price" DECIMAL(10,2);
```
-------------------------------------------------------------------------------
### prisma/schema.prisma
```prisma
```
-------------------------------------------------------------------------------
### src/app/[locale]/profile/actions/service-actions.ts
```typescript
```
-------------------------------------------------------------------------------
### src/components/profile/sections/ServicesEditor.tsx
```typescript
```
-------------------------------------------------------------------------------
### src/components/trainers/SortControl.tsx
```typescript
```
-------------------------------------------------------------------------------
### src/components/trainers/TrainerResultCard.tsx
```typescript
```
-------------------------------------------------------------------------------
### src/lib/api/trainers.ts
```typescript
```
-------------------------------------------------------------------------------
### src/messages/en.json
```json
```
-------------------------------------------------------------------------------
### src/messages/pl.json
```json
```
-------------------------------------------------------------------------------
### src/lib/services/profileService.ts
```typescript
```
