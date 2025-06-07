**TODO #5:**
Objective: Define the `User` model in the Prisma schema.
File(s) To Create/Modify: `prisma/schema.prisma`.
Specific Instructions:
1.  Open `prisma/schema.prisma`.
2.  Define the `User` model. This model will store application-specific user details and link to Supabase Auth users.
    ```prisma
    model User {
      id                 String    @id @default(cuid())
      supabaseAuthUserId String?   @unique // Stores the UUID from Supabase Auth. Make nullable if user records can exist before linking.
      name               String
      email              String    @unique
      username           String?   @unique // Will be used for public profile URLs
      role               String    @default("trainer") // e.g., "trainer", "admin"
      emailVerifiedAt    DateTime?

      profile            Profile?  // One-to-one relation to Profile
      clients            Client[]  // One-to-many relation: A trainer has many clients

      createdAt          DateTime  @default(now())
      updatedAt          DateTime  @updatedAt
    }
    ```
Expected Outcome: The `User` model is correctly defined in `prisma/schema.prisma` with specified fields and relations placeholder.
Best Practice Reminders: Use Prisma conventions (camelCase for fields). `cuid()` is a good default for IDs.

**TODO #6:**
Objective: Define the `Profile` model in the Prisma schema.
File(s) To Create/Modify: `prisma/schema.prisma`.
Specific Instructions:
1.  Open `prisma/schema.prisma`.
2.  Define the `Profile` model, linking it to the `User` model.
    ```prisma
    model Profile {
      id                 String    @id @default(cuid())
      userId             String    @unique // Foreign key to User model
      user               User      @relation(fields: [userId], references: [id], onDelete: Cascade)

      certifications     String?
      location           String?
      phone              String?
      aboutMe            String?   @db.Text // For longer text
      philosophy         String?   @db.Text
      methodology        String?   @db.Text
      bannerImagePath    String?
      profilePhotoPath   String?

      services           Service[]
      testimonials       Testimonial[]
      transformationPhotos TransformationPhoto[]
      externalLinks      ExternalLink[]
      benefits           Benefit[]

      createdAt          DateTime  @default(now())
      updatedAt          DateTime  @updatedAt
    }
    ```
Expected Outcome: The `Profile` model is correctly defined in `prisma/schema.prisma` with its fields and relations.
Best Practice Reminders: `onDelete: Cascade` for `user` relation ensures profiles are deleted if the user is deleted. Use `@db.Text` for potentially long string fields.

**TODO #7:**
Objective: Define the `Service` model in the Prisma schema.
File(s) To Create/Modify: `prisma/schema.prisma`.
Specific Instructions:
1.  Open `prisma/schema.prisma`.
2.  Define the `Service` model, linking it to the `Profile` model.
    ```prisma
    model Service {
      id          String   @id @default(cuid())
      profileId   String   // Foreign key to Profile model
      profile     Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)

      title       String
      description String   @db.Text

      createdAt   DateTime @default(now())
      updatedAt   DateTime @updatedAt
    }
    ```
Expected Outcome: The `Service` model is correctly defined.
Best Practice Reminders: `onDelete: Cascade` ensures services are deleted if the parent profile is deleted.

**TODO #8:**
Objective: Define the `Testimonial` model in the Prisma schema.
File(s) To Create/Modify: `prisma/schema.prisma`.
Specific Instructions:
1.  Open `prisma/schema.prisma`.
2.  Define the `Testimonial` model, linking it to the `Profile` model.
    ```prisma
    model Testimonial {
      id               String   @id @default(cuid())
      profileId        String   // Foreign key to Profile model
      profile          Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)

      clientName       String
      testimonialText  String   @db.Text

      createdAt        DateTime @default(now())
      updatedAt        DateTime @updatedAt
    }
    ```
Expected Outcome: The `Testimonial` model is correctly defined.

**TODO #9:**
Objective: Define the `TransformationPhoto` model in the Prisma schema.
File(s) To Create/Modify: `prisma/schema.prisma`.
Specific Instructions:
1.  Open `prisma/schema.prisma`.
2.  Define the `TransformationPhoto` model, linking it to the `Profile` model.
    ```prisma
    model TransformationPhoto {
      id          String   @id @default(cuid())
      profileId   String   // Foreign key to Profile model
      profile     Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)

      imagePath   String   // Path to the image file (e.g., in Supabase Storage)
      caption     String?

      createdAt   DateTime @default(now())
      updatedAt   DateTime @updatedAt
    }
    ```
Expected Outcome: The `TransformationPhoto` model is correctly defined.

**TODO #10:**
Objective: Define the `ExternalLink` model in the Prisma schema.
File(s) To Create/Modify: `prisma/schema.prisma`.
Specific Instructions:
1.  Open `prisma/schema.prisma`.
2.  Define the `ExternalLink` model, linking it to the `Profile` model.
    ```prisma
    model ExternalLink {
      id        String   @id @default(cuid())
      profileId String   // Foreign key to Profile model
      profile   Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)

      linkUrl   String
      label     String

      createdAt DateTime @default(now())
      updatedAt DateTime @updatedAt
    }
    ```
Expected Outcome: The `ExternalLink` model is correctly defined.

**TODO #11:**
Objective: Define the `Benefit` model in the Prisma schema.
File(s) To Create/Modify: `prisma/schema.prisma`.
Specific Instructions:
1.  Open `prisma/schema.prisma`.
2.  Define the `Benefit` model, linking it to the `Profile` model.
    ```prisma
    model Benefit {
      id             String   @id @default(cuid())
      profileId      String   // Foreign key to Profile model
      profile        Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)

      iconName       String?  // Name of the icon (e.g., from an icon library)
      iconStyle      String?  @default("outline") // e.g., 'outline', 'solid'
      title          String
      description    String?  @db.Text
      orderColumn    Int      @default(0) // For ordering benefits

      createdAt      DateTime @default(now())
      updatedAt      DateTime @updatedAt
    }
    ```
Expected Outcome: The `Benefit` model is correctly defined.

**TODO #12:**
Objective: Define the `Client` model in the Prisma schema.
File(s) To Create/Modify: `prisma/schema.prisma`.
Specific Instructions:
1.  Open `prisma/schema.prisma`.
2.  Define the `Client` model, linking it to the `User` model (the trainer).
    ```prisma
    model Client {
      id                      String    @id @default(cuid())
      trainerId               String    // Foreign key to User model (trainer)
      trainer                 User      @relation(fields: [trainerId], references: [id], onDelete: Cascade) // 'trainer' is the User

      name                    String
      email                   String?   // Email of the client, can be unique per trainer
      phone                   String?
      status                  String    @default("active") // e.g., "active", "inactive", "lead"
      dateOfBirth             DateTime? @db.Date
      goals                   String?   @db.Text
      healthNotes             String?   @db.Text
      emergencyContactName    String?
      emergencyContactPhone   String?

      measurements            ClientMeasurement[]
      progressPhotos          ClientProgressPhoto[]
      sessionLogs             ClientSessionLog[]

      createdAt               DateTime  @default(now())
      updatedAt               DateTime  @updatedAt

      @@unique([trainerId, email]) // Client email should be unique per trainer
    }
    ```
Expected Outcome: The `Client` model is correctly defined.
Best Practice Reminders: Consider if client email should be globally unique or unique per trainer. `@@unique([trainerId, email])` implements per-trainer uniqueness.

**TODO #13:**
Objective: Define the `ClientMeasurement` model in the Prisma schema.
File(s) To Create/Modify: `prisma/schema.prisma`.
Specific Instructions:
1.  Open `prisma/schema.prisma`.
2.  Define the `ClientMeasurement` model.
    ```prisma
    model ClientMeasurement {
      id                 String    @id @default(cuid())
      clientId           String
      client             Client    @relation(fields: [clientId], references: [id], onDelete: Cascade)

      measurementDate    DateTime  @db.Date
      weightKg           Float?
      bodyFatPercentage  Float?
      notes              String?   @db.Text
      customMetrics      Json?     // To store array of {name: string, value: string}

      createdAt          DateTime  @default(now())
      updatedAt          DateTime  @updatedAt
    }
    ```
Expected Outcome: The `ClientMeasurement` model is correctly defined.
Best Practice Reminders: `Json?` type for `customMetrics` allows flexibility.

**TODO #14:**
Objective: Define the `ClientProgressPhoto` model in the Prisma schema.
File(s) To Create/Modify: `prisma/schema.prisma`.
Specific Instructions:
1.  Open `prisma/schema.prisma`.
2.  Define the `ClientProgressPhoto` model.
    ```prisma
    model ClientProgressPhoto {
      id         String   @id @default(cuid())
      clientId   String
      client     Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)

      photoDate  DateTime @db.Date
      imagePath  String   // Path to the image file
      caption    String?

      createdAt  DateTime @default(now())
      updatedAt  DateTime @updatedAt
    }
    ```
Expected Outcome: The `ClientProgressPhoto` model is correctly defined.

**TODO #15:**
Objective: Define the `ClientSessionLog` model in the Prisma schema.
File(s) To Create/Modify: `prisma/schema.prisma`.
Specific Instructions:
1.  Open `prisma/schema.prisma`.
2.  Define the `ClientSessionLog` model.
    ```prisma
    model ClientSessionLog {
      id                  String    @id @default(cuid())
      clientId            String
      client              Client    @relation(fields: [clientId], references: [id], onDelete: Cascade)

      sessionDate         DateTime
      durationMinutes     Int?
      activitySummary     String?
      sessionNotes        String?   @db.Text
      clientMoodFeedback  String?   // e.g., "energized", "tired"

      createdAt           DateTime  @default(now())
      updatedAt           DateTime  @updatedAt
    }
    ```
Expected Outcome: The `ClientSessionLog` model is correctly defined.

**TODO #16:**
Objective: Generate and apply database migrations using Prisma.
File(s) To Create/Modify: Creates migration files in `prisma/migrations`.
Specific Instructions:
1.  Run the Prisma migrate command to generate SQL migrations from your schema and apply them to the Supabase database:
    ```bash
    npx prisma migrate dev --name initial-schema
    ```
2.  Inspect the generated migration file in `prisma/migrations/...` to ensure it matches expectations.
3.  Confirm that the tables are created in your Supabase database (via Supabase Studio Table Editor).
Expected Outcome: Database schema is created in Supabase, matching the Prisma models. Migration files are generated.
Best Practice Reminders: Always review auto-generated migrations.

**TODO #17:**
Objective: Generate Prisma Client.
File(s) To Create/Modify: Updates `node_modules/@prisma/client`.
Specific Instructions:
1.  Prisma Client is usually generated automatically after `prisma migrate dev`. If not, or to regenerate:
    ```bash
    npx prisma generate
    ```
Expected Outcome: Prisma Client is generated/updated, allowing programmatic access to the database schema.
Best Practice Reminders: Prisma Client should be regenerated whenever the `schema.prisma` file changes.

**TODO #18:**
Objective: Create a Prisma Client singleton instance for use throughout the application.
File(s) To Create/Modify: `lib/prisma.ts` (or a similar path like `src/lib/prisma.ts`).
Specific Instructions:
1.  Create a new file, e.g., `src/lib/prisma.ts`.
2.  Implement the Prisma Client singleton pattern to avoid creating too many connections in a serverless environment.
    ```typescript
    // src/lib/prisma.ts
    import { PrismaClient } from '@prisma/client';

    declare global {
      // allow global `var` declarations
      // eslint-disable-next-line no-unused-vars
      var prisma: PrismaClient | undefined;
    }

    export const prisma =
      global.prisma ||
      new PrismaClient({
        // Optional: log: ['query', 'info', 'warn', 'error'],
      });

    if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

    export default prisma;
    ```
Expected Outcome: A reusable Prisma Client instance is available for database operations.
Best Practice Reminders: This pattern prevents exhausting database connections, especially in development with Next.js hot reloading.

---

This concludes the initial setup and data modeling phase. Please confirm when @roo has completed TODO #1, and I will proceed with the next set of tasks.