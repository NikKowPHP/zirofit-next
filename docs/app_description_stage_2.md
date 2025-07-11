### docs/app_description.md
# **ZIRO.FIT: Technical Application Description (v2)**

## 1. Vision & Architectural Philosophy

**ZIRO.FIT** is a **Progressive Web App (PWA) and SaaS Marketplace** designed to connect clients with personal trainers and provide trainers with an all-in-one digital toolkit to manage and grow their business. Our architecture prioritizes **end-to-end type-safety** (Prisma, Zod), **a mobile-first, responsive user experience**, and a **seamless, marketplace-driven user journey**.

The core philosophy is to **bridge the gap between clients seeking fitness guidance and professional trainers, while simultaneously empowering those trainers by consolidating their administrative and marketing needs into a single, intuitive platform**. We believe that by simplifying client management, progress tracking, and public brand-building, trainers can dedicate more time to what they do best: transforming lives. This application is designed not as a simple utility, but as a **business-in-a-box and discovery platform** to help trainers attract clients, showcase results, and grow their independent fitness careers.

Furthermore, we are committed to **providing tangible value upfront**. Our **value-based freemium model** directly addresses this by ensuring that the core features needed to manage a business and build an online presence are available to all trainers. The premium tier will fund the app's continued development and offer advanced analytics, automation, and client engagement tools.

## 2. Architectural Overview

The system is designed around a **clean separation of concerns** within a **Next.js App Router structure**. This approach leverages **server components for performance and SEO** on public-facing pages and **client components with server actions for rich, interactive dashboard experiences**, creating a cohesive yet modular development environment that is installable as a PWA.

```mermaid
graph TD
    subgraph User Device
        A[Trainer App on Browser/PWA]
        PublicClient[Public Client on Browser/PWA]
    end

    subgraph Hosting / Frontend Layer (Vercel)
        B([Next.js App with PWA Manifest])
        B -- Serves UI --> A
        B -- Serves UI --> PublicClient
        B -- "Server Actions" --> C
    end

    subgraph Backend Services & APIs
        C{ ZIRO.FIT Backend Logic }
        D[Supabase Auth]
        E[Supabase Storage]
        F[PostgreSQL DB via Prisma]
        H[Notification Service via Resend]
        S[Error Tracking via Sentry]
    end

    %% Trainer Flow
    A -- "Signs Up / Logs In" --> D
    A -- "Updates Profile & Availability" --> C
    A -- "Uploads Photo" --> E

    %% Public Client Flow
    PublicClient -- "Searches for trainers" --> B
    PublicClient -- "Views Trainer Profile & Calendar" --> B
    PublicClient -- "Books a session" --> C

    %% Backend Flow
    C -- "Verifies User Token (for trainers)" --> D
    C -- "CRUD Operations (Profile, Clients, Bookings)" --> F
    C -- "Manages Files" --> E
    C -- "Dispatches Notifications" --> H
    C -- "Reports Errors" --> S
```

**Flow Description:**

1.  **Client:** A user interacts with the **Next.js** frontend, which functions as an installable PWA for an app-like experience.
2.  **Authentication & Storage:** **Supabase** provides a complete solution for user management (Auth) and file storage (Storage for profile images).
3.  **Application Backend:** Core business logic resides in **Next.js Server Actions**. These type-safe functions handle all data mutation and are protected by verifying the user's session.
4.  **Database Interaction:** **Prisma** acts as the type-safe ORM between our application logic and the **PostgreSQL** database.
5.  **Notifications:** Upon a successful booking, the backend uses **Resend** to dispatch a transactional email notification to the trainer.
6.  **Error Tracking:** **Sentry** is integrated to capture and report exceptions, providing real-time observability into the application's health.

## 3. Core Tech Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14+ (App Router)** | Integrated architecture, performance optimizations (Server Components), and simplified data mutation patterns with Server Actions. |
| **Database** | **PostgreSQL** | A robust, reliable, and scalable open-source relational database that works seamlessly with Prisma. |
| **ORM** | **Prisma** | Provides unparalleled type-safety for database operations, declarative schema management, and an intuitive API. |
| **Authentication** | **Supabase Auth** | A secure, feature-rich, and easy-to-integrate solution for user management. |
| **File Storage** | **Supabase Storage** | Tightly integrated with Supabase Auth for simple, policy-based access control to user-uploaded files. |
| **Notifications** | **Resend** | A developer-focused, reliable, and simple API for sending transactional emails. |
| **Styling** | **Tailwind CSS** | A utility-first CSS framework that enables rapid development of custom, responsive user interfaces. |
| **Testing** | **Jest & React Testing Library** | For unit and integration testing to ensure code quality, prevent regressions, and verify business logic. |
| **Error Tracking**| **Sentry** | Provides production-grade, real-time error tracking and performance monitoring to quickly identify and resolve issues. |
| **Deployment** | **Docker / Vercel** | Dockerfiles are configured for consistent environments. Vercel is the ideal hosting platform for Next.js. |

## 4. Key NPM Libraries & Tooling

-   **Data Fetching & Mutation:** `SWR`, `Server Actions`
-   **Forms:** `react-dom`'s `useFormState` and `useActionState`
-   **Schema Validation:** `Zod`
-   **UI Components:** `@heroicons/react`, `react-chartjs-2`, `quill`
-   **Email:** `resend`
-   **Utilities:** `date-fns`, `clsx`, `tailwind-merge`

## 5. Monetization Strategy: Freemium (Proposed)

The app uses a **Freemium** model. Our primary strategy is to **provide a powerful free tier that solves core problems for trainers, building trust and a large user base, then converting dedicated users to a premium plan with advanced features**.

| Tier | Price | Key Features | Target Audience |
| :--- | :--- | :--- | :--- |
| **Starter** | Free | • Public Profile Page<br>• Basic Search Discovery<br>• Manage up to 5 Clients | Individual trainers just starting out or managing a small client base. |
| **Pro (Future)** | ~$29 / month | All Starter features, plus:<br>• Unlimited Clients<br>• Prominent Search Placement<br>• Calendar & Booking Management | Established trainers and small fitness businesses looking to scale. |

## 6. High-Level Database Schema

*This is the implemented schema based on `prisma/schema.prisma`.*

```prisma
// The primary user model, linked to Supabase Auth.
model User {
  id        String    @id @unique // Supabase Auth UUID
  name      String
  email     String    @unique
  username  String?   @unique
  role      String    @default("trainer")

  profile   Profile?
  clients   Client[]
  bookings  Booking[] // Relation to bookings made with this trainer
  
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

// Stores the trainer's public-facing information and availability.
model Profile {
  id               String   @id @default(cuid())
  userId           String   @unique
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  aboutMe          String?
  // ... other profile fields
  availability     Json?    // e.g., { "mon": ["09:00-17:00"], "wed": [...] }
  socialLinks      SocialLink[]
}

// Represents a booked appointment.
model Booking {
  id          String   @id @default(cuid())
  startTime   DateTime
  endTime     DateTime
  status      String   @default("CONFIRMED") // e.g., CONFIRMED, CANCELLED

  trainerId   String
  trainer     User     @relation(fields: [trainerId], references: [id], onDelete: Cascade)

  clientName  String
  clientEmail String
  clientNotes String?  @db.Text
  
  // ... and other booking fields
}
```

## 7. Development Epics & User Stories

### **Epic 1: Trainer Onboarding & Profile Management** (Complete)
- As a trainer, I can register, log in, and manage all aspects of my public profile.

### **Epic 2: Client Management & Tracking** (Complete)
- As a trainer, I can manage my clients and track their progress through logs, measurements, and photos.

### **Epic 3: Trainer Dashboard** (Complete)
- As a trainer, I have access to a dashboard summarizing my business and providing quick access to features.

### **Epic 4: Public Discovery & Search** (Complete)
- As a potential client, I can use a search bar to find trainers based on specialty and location.

### **Epic 5: Booking & Calendar Management** (Complete)
- As a trainer, I can set my availability. As a client, I can view available slots and book a session.



## 8. Development & Compliance Practices

### 8.1. UI/UX Philosophy
The application is built with a **mobile-first** philosophy. The user interface, particularly the trainer dashboard, is designed for the smallest viewport first, featuring a dedicated **bottom navigation bar on mobile** for optimal accessibility. The experience is then progressively enhanced for larger screen sizes using Tailwind CSS's responsive breakpoints.

### 8.2. Code Quality & Best Practices
-   **Folder Structure:** We follow a feature-based structure within the Next.js App Router.
-   **Component Scoping:** We default to Server Components, opting into Client Components only when interactivity is required.
-   **Type Safety:** We use Zod and Prisma to ensure end-to-end type safety.

### 8.3. Testing Strategy
-   **Unit & Integration Tests:** Core business logic, particularly Server Actions, are tested using Jest to verify their behavior and prevent regressions.
-   **Component Tests:** Critical UI components are tested with React Testing Library to ensure they render correctly and handle user interactions as expected.

### 8.4. Observability Strategy
-   **Error Tracking:** We integrate **Sentry** to capture and report all unhandled exceptions in production, enabling rapid diagnosis and resolution.
-   **Performance Monitoring:** We leverage **Vercel Analytics** to monitor Core Web Vitals and general application performance.
-   **Structured Logging:** Key backend processes use structured logging, drained to **Vercel Logs** for debugging and tracing.

