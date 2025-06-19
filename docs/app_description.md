# App Description: ZIRO.FIT - Trainer Business Platform

## 1. Vision

ZIRO.FIT is a comprehensive, all-in-one platform designed to empower personal trainers by providing them with the tools to build their brand, manage their clients, and showcase their results. It serves as both a private administrative dashboard for trainers and a public-facing portfolio to attract new clients.

## 2. Core User

The primary user is a **Personal Trainer**.

## 3. Key Features

### Trainer-Facing Dashboard & Tools

*   **Secure Authentication:** Trainers must be able to register for a new account and log in to a secure area.
*   **Central Dashboard:** Upon login, the trainer is presented with a dashboard that provides an at-a-glance view of their business. This includes:
    *   Key statistics (e.g., number of active clients, sessions this month).
    *   A real-time activity feed showing recent events (new measurements, upcoming sessions, etc.).
    *   Data visualization charts, including a line chart for a spotlight client's progress and a bar chart for monthly activity.
    *   Quick action links to common tasks like adding a new client.
    *   A checklist to guide the trainer in completing their public profile.
*   **Real-time Notifications:** A system-wide notification indicator that alerts trainers to important events (e.g., client milestones) in real-time.
*   **Dark Mode:** The entire authenticated application must support a light and dark theme, with the user's preference saved locally.

### Public Profile & Client Acquisition

*   **Customizable Public Profile:** Each trainer gets a unique, public-facing URL (e.g., `ziro.fit/trainer/username`). This profile is the trainer's main marketing tool and must be fully editable from their dashboard.
*   **Profile Content Sections:** The profile must display:
    *   **Branding:** A banner image and a profile photo.
    *   **Core Info:** Name, certifications, and location.
    *   **Detailed Sections:** Rich text sections for "About Me," "Training Philosophy," and "Methodology."
    *   **Services:** A list of services offered, with titles and descriptions.
    *   **Benefits:** A list of key benefits of training with them (e.g., "Personalized Plans").
    *   **Client Transformations:** A gallery of before-and-after photos with captions.
    *   **Testimonials:** A list of client testimonials.
    *   **Social & External Links:** A section for links to social media or other websites.
*   **Trainer Discovery Page:** A public, paginated directory (`/trainers`) where potential customers can browse all published trainer profiles.
*   **Contact Form:** A contact form on each trainer's profile page that allows prospective clients to send inquiries directly to the trainer.

### Client Management & Tracking

*   **Client List:** A full CRUD (Create, Read, Update, Delete) interface for managing a list of their clients.
*   **Detailed Client View:** Each client has a detailed page with tabbed navigation for managing their data.
*   **Client Data Logging:** For each client, the trainer must be able to log and manage:
    *   **Measurements:** Weight, body fat, and custom-defined metrics over time.
    *   **Progress Photos:** A gallery of dated progress photos.
    *   **Session Logs:** Records of training sessions, including duration and notes.
*   **Client Statistics:** The detailed client view should feature charts visualizing the client's measurement history over time.

## 4. Primary Goal

The system's primary goal is to provide a seamless experience for a trainer to manage their entire business online, from client acquisition and marketing (via the public profile) to day-to-day client tracking and administration (via the private dashboard).
