### docs/app_description.md
# **ZIRO.FIT: Technical Application Description (v1)**

## 1. Vision & Architectural Philosophy

**ZIRO.FIT** is a **SaaS Marketplace and Platform** designed to connect clients with personal trainers and provide trainers with an all-in-one digital toolkit to manage and grow their business. Our architecture prioritizes **end-to-end type-safety** (Prisma, Zod), **rapid iteration** using a modern web stack (Next.js Server Actions), and a **seamless, marketplace-driven user experience**.

The core philosophy is to **bridge the gap between clients seeking fitness guidance and professional trainers, while simultaneously empowering those trainers by consolidating their administrative and marketing needs into a single, intuitive platform**. We believe that by simplifying client management, progress tracking, and public brand-building, trainers can dedicate more time to what they do best: transforming lives. This application is designed not as a simple utility, but as a **business-in-a-box and discovery platform** to help trainers attract clients, showcase results, and grow their independent fitness careers.

Furthermore, we are committed to **providing tangible value upfront**. Our **value-based freemium model** directly addresses this by ensuring that the core features needed to manage a business and build an online presence are available to all trainers. The premium tier will fund the app's continued development and offer advanced analytics, automation, and client engagement tools.

## 2. Architectural Overview

The system is designed around a **clean separation of concerns** within a **Next.js App Router structure**. This approach leverages **server components for performance and SEO** on public-facing pages and **client components with server actions for rich, interactive dashboard experiences**, creating a cohesive yet modular development environment.

```mermaid
graph TD
    subgraph User Device
        A[Trainer App on Browser]
        PublicClient[Public Client]
    end

    subgraph Hosting / Frontend Layer (Vercel)
        B([Next.js App])
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
```

**Flow Description:**

1.  **Public Client:** A visitor uses the **Next.js** frontend to search for trainers based on specialty, location, and training type (online vs. in-person). They can view public profiles and book sessions.
2.  **Trainer Client:** A registered trainer logs in and interacts with their dashboard to manage their profile, availability, clients, and bookings.
3.  **Authentication & Storage:** **Supabase** provides a complete solution for user management (Auth) and file storage (Storage for profile images, etc.).
4.  **Application Backend:** Core business logic resides in **Next.js Server Actions**. These type-safe functions handle all data mutation (e.g., updating a profile, creating a booking) and are protected by verifying the user's session with Supabase Auth.
5.  **Database Interaction:** **Prisma** acts as the type-safe ORM between our application logic and the **PostgreSQL** database, ensuring data integrity and developer efficiency.
6.  **Notifications:** Upon a successful booking, the backend uses **Resend** to dispatch a transactional email notification to the trainer.

## 3. Core Tech Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14+ (App Router)** | Chosen for its integrated architecture, performance optimizations (Server Components), and simplified data mutation patterns with Server Actions. |
| **Database** | **PostgreSQL** | A robust, reliable, and scalable open-source relational database that works seamlessly with Prisma. |
| **ORM** | **Prisma** | Provides unparalleled type-safety for database operations, declarative schema management, and an intuitive API, reducing boilerplate and bugs. |
| **Authentication** | **Supabase Auth** | A secure, feature-rich, and easy-to-integrate solution that handles user registration, login, and session management out of the box. |
| **File Storage** | **Supabase Storage** | Tightly integrated with Supabase Auth for simple, policy-based access control to user-uploaded files like profile photos and banners. |
| **Notifications** | **Resend** | A developer-focused, reliable, and simple API for sending transactional emails for key events like new bookings. |
| **Styling** | **Tailwind CSS** | A utility-first CSS framework that enables rapid development of custom, responsive user interfaces without leaving the HTML. |
| **Deployment** | **Docker / Vercel** | Dockerfiles are configured for consistent development and production environments. Vercel is the ideal hosting platform for Next.js. |

## 4. Key NPM Libraries & Tooling

-   **Data Fetching & Mutation:** `SWR` (Client-side fetching for dashboards), `Server Actions` (Primary method for mutations)
-   **Forms:** `react-dom`'s `useFormState` and `useActionState` for handling form submissions with Server Actions.
-   **Schema Validation:** `Zod` for end-to-end type-safe validation of form data and API inputs.
-   **UI Components:** In-house component library (`Button`, `Input`, etc.), `@heroicons/react` for icons, `react-chartjs-2` for data visualizations, `quill` for rich text editing.
-   **Email:** `resend` for sending transactional email notifications.
-   **Utilities:** `date-fns` for date manipulation, `clsx` & `tailwind-merge` for constructing class names.

## 5. Monetization Strategy: Freemium (Proposed)

The app will use a **Freemium** model. Our primary strategy is to **provide a powerful free tier that solves core problems for trainers, building trust and a large user base, then converting dedicated users to a premium plan with advanced features**.

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

// Represents a client of a trainer.
model Client {
  id          String   @id @default(cuid())
  trainerId   String
  trainer     User     @relation(fields: [trainerId], references: [id], onDelete: Cascade)
  // ... other client fields
}

// Represents a booked appointment.
model Booking {
  id          String   @id @default(cuid())
  startTime   DateTime
  endTime     DateTime
  status      String   @default("CONFIRMED") // e.g., CONFIRMED, CANCELLED

  trainerId   String
  trainer     User     @relation(fields: [trainerId], references: [id], onDelete: Cascade)

  // Details of the person who booked, not a formal client record yet
  clientName  String
  clientEmail String
  clientNotes String?  @db.Text

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([trainerId, startTime, endTime])
}
```

## 7. Development Epics & User Stories

### **Epic 1: Trainer Onboarding & Profile Management**
- **[PROJ-001]:** As a new user, I can register as a trainer.
- **[PROJ-002]:** As a trainer, I can log in and out.
- **[PROJ-003]:** As a trainer, I can edit all sections of my public profile from my dashboard, including core info, branding, services, and testimonials.

### **Epic 2: Client Management & Tracking**
- **[PROJ-010]:** As a trainer, I can add, view, edit, and delete clients in my dashboard.
- **[PROJ-011]:** As a trainer, for each client, I can log sessions, measurements, and progress photos.

### **Epic 3: Trainer Dashboard**
- **[PROJ-020]:** As a trainer, I can see an "at-a-glance" summary of my key business metrics.
- **[PROJ-021]:** As a trainer, I can see a feed of recent activity.
- **[PROJ-022]:** As a trainer, I can visualize a client's progress over time using charts.

### **Epic 4: Public Discovery & Search**
- **[PROJ-030]:** As a visitor, I can use a prominent search bar on the homepage to find trainers.
- **[PROJ-031]:** As a visitor, I can filter my search by "In-Person" or "Online" training.
- **[PROJ-032]:** As a visitor, I can search by trainer specialty, name, or location.
- **[PROJ-033]:** As a visitor, I can view a search results page with a list of matching trainers.
- **[PROJ-034]:** As a visitor, I can click through to view a trainer's detailed public profile.

### **Epic 5: Booking & Calendar Management**
- **[PROJ-040]:** As a trainer, I can define my weekly availability schedule in my dashboard.
- **[PROJ-041]:** As a trainer, I can view my upcoming bookings in my dashboard.
- **[PROJ-042]:** As a trainer, I receive an email notification for new bookings.
- **[PROJ-043]:** As a potential client, I can see a trainer's availability on their public profile.
- **[PROJ-044]:** As a potential client, I can select an available time slot and book a session with a trainer.

## 8. Development & Compliance Practices

### 8.1. UI/UX Philosophy
The application is built with a responsive-first philosophy. All UI is designed to be functional and intuitive on both mobile and desktop viewports, using Tailwind CSS's responsive breakpoints.

### 8.2. Code Quality & Best Practices
-   **Folder Structure:** We follow a feature-based structure within the Next.js App Router (`/src/app/clients`, `/src/app/profile`, etc.).
-   **Component Scoping:** We default to Server Components for content and SEO, opting into Client Components only when interactivity is required.
-   **Type Safety:** We use Zod for validating all `formData` in Server Actions and Prisma to ensure type safety from the API layer down to the database.

### 8.3. Accessibility (A11y)
-   **Goal:** The application strives to meet WCAG 2.1 AA standards.
-   **Implementation:** We use semantic HTML, ensure keyboard navigability, and use libraries like Heroicons that support ARIA attributes. Form inputs are paired with labels.

### 8.4. Observability Strategy
-   **Error Tracking:** Future integration with a service like Sentry is planned to capture and report all unhandled exceptions in production.
-   **Performance Monitoring:** We will leverage Vercel Analytics to monitor Core Web Vitals.
-   **Structured Logging:** Key Server Actions include `console.error` logging for debugging, which can be connected to a log management service.

## 9. MVP Scope & Phasing

### Phase 1: Foundational Platform (Complete)
-   **Focus:** Core trainer authentication, comprehensive profile creation, public profile pages, and client management tools.
-   **Epics Completed:** Epic 1, Epic 2, Epic 3.

### Phase 2: Marketplace & Booking Engine (Complete)
-   **Focus:** Implementation of the public-facing search and booking functionality.
-   **Epics Completed:** Epic 4, Epic 5.

### Phase 3: Post-Launch (Next Steps)
-   **Focus:** Monetization and enhanced client interaction.
-   **Potential Epics:**
    -   **Payment Integration:** Integrate Stripe to allow trainers to accept payments for sessions.
    -   **Client Portal:** A separate login for clients to view their bookings and progress.
    -   **Advanced Calendar Sync:** Two-way synchronization with Google Calendar.

## 10. Potential Risks & Mitigation

| Risk Category | Risk Description | Mitigation Strategy |
| :--- | :--- | :--- |
| **Technical** | Calendar logic can be complex. The current MVP implementation for availability is basic and may not cover all edge cases (e.g., holidays, one-off changes). | The current system is a solid foundation. For future phases, we will integrate a more robust date/time library (like `date-fns-tz`) for timezone handling and build a more granular UI for managing calendar exceptions. |
| **Product** | The platform may struggle to attract enough clients to provide value to trainers, creating a "chicken-and-egg" problem. | Focus initial marketing efforts on attracting a critical mass of high-quality trainers in target locations. Use SEO and content marketing to draw in potential clients searching for trainers. |
| **Dependency**| Heavy reliance on the Supabase ecosystem. A significant pricing change or outage could impact the service. | The core business logic is abstracted in Server Actions. While a migration would be non-trivial, it's not impossible. Maintain a clean separation between Supabase SDK calls and application logic. |

## 11. Future Scope & Roadmap Ideas

*A parking lot for ideas to be considered post-MVP.*

-   Direct payment processing for booked sessions via Stripe.
-   Full 2-way synchronization with Google Calendar & Outlook Calendar.
-   Dedicated client accounts for managing bookings and viewing progress.
-   Group session bookings and class scheduling.
-   In-app messaging between trainer and client.
-   B2B offering for gyms to manage all their trainers under one account.