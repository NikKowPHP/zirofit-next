

**Phase 4: Public Trainer Profile Display & Discovery**

**TODO #32:**
Objective: Create API utilities or server-side functions to fetch trainer data for public display.
File(s) To Create/Modify: `src/lib/api/trainers.ts` (new file, or integrate into existing service/lib structure).
Specific Instructions:
1.  Create a new file, e.g., `src/lib/api/trainers.ts`.
2.  **Function `getPublishedTrainers`:**
    *   This function will fetch a paginated list of trainers who have a profile.
    *   It should select user `id`, `name`, `username`, and their associated profile's `location` and `profilePhotoPath`.
    *   Similar to `PublicProfileController::index()` in the Laravel app.
    *   Uses Prisma to query.
    *   Implement basic pagination (e.g., take, skip).
    ```typescript
    // src/lib/api/trainers.ts
    import { prisma } from '@/lib/prisma';

    export async function getPublishedTrainers(page = 1, pageSize = 15) {
      const skip = (page - 1) * pageSize;
      try {
        const trainers = await prisma.user.findMany({
          where: {
            role: 'trainer',
            profile: {
              // Add conditions for a "published" profile if that becomes a feature
              // For now, any user with a profile is considered.
              isNot: null,
            },
          },
          select: {
            id: true,
            name: true,
            username: true,
            profile: {
              select: {
                location: true,
                profilePhotoPath: true, // For display on the list
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
          skip: skip,
          take: pageSize,
        });

        const totalTrainers = await prisma.user.count({
          where: {
            role: 'trainer',
            profile: {
              isNot: null,
            },
          },
        });
        
        return {
          trainers,
          totalTrainers,
          currentPage: page,
          totalPages: Math.ceil(totalTrainers / pageSize),
        };
      } catch (error) {
        console.error("Failed to fetch published trainers:", error);
        // In a real app, you might throw a custom error or return a specific error structure
        return { trainers: [], totalTrainers: 0, currentPage: 1, totalPages: 0, error: "Failed to load trainers." };
      }
    }
    ```
3.  **Function `getTrainerProfileByUsername`:**
    *   This function will fetch a single trainer's details by their username, including their profile and all related entities (services, testimonials, transformationPhotos, externalLinks, benefits).
    *   Similar to `PublicProfileController::show()` in the Laravel app.
    *   Uses Prisma to query.
    ```typescript
    // Add to src/lib/api/trainers.ts
    export async function getTrainerProfileByUsername(username: string) {
      try {
        const userWithProfile = await prisma.user.findUnique({
          where: { username },
          include: {
            profile: {
              include: {
                services: { orderBy: { createdAt: 'asc' } },
                testimonials: { orderBy: { createdAt: 'desc' } },
                transformationPhotos: { orderBy: { createdAt: 'desc' } },
                externalLinks: { orderBy: { createdAt: 'asc' } },
                benefits: { orderBy: { orderColumn: 'asc' } },
              },
            },
          },
        });

        if (!userWithProfile || !userWithProfile.profile) {
          return null; // Or throw a NotFound error
        }
        return userWithProfile; // Contains user and their full profile
      } catch (error) {
        console.error(`Failed to fetch profile for username ${username}:`, error);
        return null; // Or throw
      }
    }
    ```
Expected Outcome: Utility functions are available to fetch necessary trainer data for public pages.
Best Practice Reminders: Ensure Prisma queries are efficient and only select necessary data. Handle potential errors (e.g., trainer not found).

**TODO #33:**
Objective: Create the Trainer Discovery page (`/trainers`).
File(s) To Create/Modify: `src/app/trainers/page.tsx` (new).
Specific Instructions:
1.  Create the directory `src/app/trainers/`.
2.  Create `src/app/trainers/page.tsx`.
3.  This page will be a Server Component that uses `getPublishedTrainers` to fetch and display a list of trainers.
4.  Use the `PublicLayout` component.
5.  Display trainer cards with their name, profile photo (placeholder if none), location, and a link to their full profile page (e.g., `/trainer/[username]`).
6.  Implement basic pagination if time permits (or a "Load More" button). For MVP, a simple list is fine.
    ```tsx
    // src/app/trainers/page.tsx
    import PublicLayout from '@/components/layouts/PublicLayout';
    import { getPublishedTrainers } from '@/lib/api/trainers';
    import Image from 'next/image';
    import Link from 'next/link';

    // Placeholder for default profile image if none is set
    const DEFAULT_PROFILE_IMAGE = '/next.svg'; // Replace with an actual placeholder image later

    export default async function TrainersPage({
      searchParams,
    }: {
      searchParams?: { page?: string };
    }) {
      const currentPage = Number(searchParams?.page) || 1;
      const data = await getPublishedTrainers(currentPage);

      // Handle error case from getPublishedTrainers
      if (data.error) {
        return (
          <PublicLayout>
            <div className="py-12">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold mb-6 text-center">Find a Trainer</h1>
                <p className="text-red-500 text-center">{data.error}</p>
              </div>
            </div>
          </PublicLayout>
        );
      }
      
      const { trainers, totalTrainers, totalPages } = data;

      return (
        <PublicLayout>
          <div className="py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
                Meet Our Trainers
              </h1>

              {trainers.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {trainers.map((trainer) => (
                      <div
                        key={trainer.id}
                        className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
                      >
                        <div className="flex-shrink-0 mb-4 text-center">
                          <Image
                            src={trainer.profile?.profilePhotoPath || DEFAULT_PROFILE_IMAGE}
                            alt={`${trainer.name}'s profile photo`}
                            width={128}
                            height={128}
                            className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-indigo-100"
                            onError={(e) => (e.currentTarget.src = DEFAULT_PROFILE_IMAGE)} // Fallback for broken image links
                          />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1 text-center">
                          {trainer.name}
                        </h3>
                        {trainer.profile?.location && (
                          <p className="text-sm text-gray-500 mb-4 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="inline-block h-4 w-4 mr-1 text-gray-400">
                              <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001zm.612-1.426a.75.75 0 01-.001-1.061C10.294 16.126 10 15.837 10 15.5c0-.338.293-.626.31-.647a.75.75 0 111.04 1.083C11.293 16.063 11 16.427 11 16.75c0 .322.293.626.309.647a.75.75 0 01-1.04 1.083zM10 2a.75.75 0 01.75.75v.008c0 .005 0 .01 0 .016l.002.005a.75.75 0 01-1.502-.026l-.002-.005A.75.75 0 0110 2z" clipRule="evenodd" />
                              <path fillRule="evenodd" d="M10 1a9 9 0 100 18 9 9 0 000-18zM2.407 9.51a.75.75 0 010 1.058 7.5 7.5 0 0010.246 8.332.75.75 0 11.01-1.06 5.996 5.996 0 01-8.18-6.696.75.75 0 01-1.018-.028A7.46 7.46 0 002.5 10c0-.026.002-.052.005-.078a.75.75 0 01-.098-.412z" clipRule="evenodd" />
                            </svg>
                            {trainer.profile.location}
                          </p>
                        )}
                        <div className="mt-auto text-center">
                          <Link
                            href={`/trainer/${trainer.username}`}
                            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg text-sm font-semibold transition-colors shadow hover:shadow-md"
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Basic Pagination (Example) */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex justify-center space-x-2">
                      {currentPage > 1 && (
                        <Link href={`/trainers?page=${currentPage - 1}`} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">
                          Previous
                        </Link>
                      )}
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Link key={page} href={`/trainers?page=${page}`}
                              className={`px-4 py-2 border rounded-md text-sm font-medium ${page === currentPage ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 hover:bg-gray-50'}`}>
                          {page}
                        </Link>
                      ))}
                      {currentPage < totalPages && (
                        <Link href={`/trainers?page=${currentPage + 1}`} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">
                          Next
                        </Link>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-center italic">No trainers found at the moment. Check back soon!</p>
              )}
            </div>
          </div>
        </PublicLayout>
      );
    }
    ```
Expected Outcome: A public page at `/trainers` lists available trainers with links to their profiles.
Best Practice Reminders: Ensure fallback for missing images/data. Style for good readability and accessibility.







**TODO #34:**
Objective: Create the dynamic Public Trainer Profile page (`/trainer/[username]`).
File(s) To Create/Modify: `src/app/trainer/[username]/page.tsx` (new).
Specific Instructions:
1.  Create the directory `src/app/trainer/[username]/`.
2.  Create `src/app/trainer/[username]/page.tsx`.
3.  This page will be a Server Component that uses `getTrainerProfileByUsername` to fetch data.
4.  Use the `PublicLayout` component.
5.  Structure the page to display all relevant trainer information:
    *   Hero section (Banner image, profile photo, name, certifications, location). (Similar to `resources/views/trainers/show.blade.php` Hero section).
    *   About Me, Philosophy, Methodology sections (if available, render purified HTML if stored as such).
    *   Benefits section.
    *   Services list.
    *   Transformation Photos gallery.
    *   Testimonials list.
    *   External Links.
    *   Contact form section (form itself will be a separate component/action).
6.  Use Tailwind CSS for styling. For now, focus on structure and data display. Detailed styling can be refined later.
    ```tsx
    // src/app/trainer/[username]/page.tsx
    import PublicLayout from '@/components/layouts/PublicLayout';
    import { getTrainerProfileByUsername } from '@/lib/api/trainers';
    import { notFound } from 'next/navigation';
    import Image from 'next/image';
    import { PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';
    // Import your UI components (Button, etc.) if needed for CTAs
    // import { Button } from '@/components/ui/Button';

    // Placeholder for default images
    const DEFAULT_BANNER_IMAGE = '/next.svg'; // Replace with actual default banner
    const DEFAULT_PROFILE_IMAGE = '/next.svg'; // Replace with actual default profile image

    interface TrainerProfilePageProps {
      params: { username: string };
    }

    export default async function TrainerProfilePage({ params }: TrainerProfilePageProps) {
      const { username } = params;
      const userWithProfile = await getTrainerProfileByUsername(username);

      if (!userWithProfile || !userWithProfile.profile) {
        notFound(); // Or return a custom "Profile not found" component
      }

      const { profile, name, email } = userWithProfile;

      // Helper to render HTML content safely
      const renderHTML = (htmlString: string | null | undefined) => {
        if (!htmlString) return null;
        // In a real app, ensure this HTML is sanitized if it comes from user input.
        // For Prisma data that was purified on input, this is okay.
        return <div dangerouslySetInnerHTML={{ __html: htmlString }} />;
      };

      return (
        <PublicLayout>
          {/* Hero Section */}
          <section id="hero-section" className="relative bg-gray-800 text-white">
            <Image
              src={profile.bannerImagePath || DEFAULT_BANNER_IMAGE}
              alt={`${name}'s banner`}
              layout="fill"
              objectFit="cover"
              quality={85}
              className="absolute inset-0 opacity-40"
              onError={(e) => (e.currentTarget.src = DEFAULT_BANNER_IMAGE)}
            />
            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
              <div className="mb-8">
                <Image
                  src={profile.profilePhotoPath || DEFAULT_PROFILE_IMAGE}
                  alt={`${name}'s profile photo`}
                  width={160}
                  height={160}
                  className="w-40 h-40 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
                  onError={(e) => (e.currentTarget.src = DEFAULT_PROFILE_IMAGE)}
                />
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3">
                {name}
              </h1>
              {profile.certifications && (
                <p className="text-lg sm:text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
                  {profile.certifications}
                </p>
              )}
              {/* Contact Button - placeholder for now */}
              {/* <Button size="lg" onClick={() => document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' })}>
                Get In Touch
              </Button> */}
              <a href="#contact-section" className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-8 rounded-lg text-lg font-semibold transition-colors shadow-md">
                Book a Session
              </a>
              {profile.location && (
                <p className="text-gray-400 mt-6 text-sm flex items-center justify-center">
                  <MapPinIcon className="w-4 h-4 mr-1.5" />
                  {profile.location}
                </p>
              )}
            </div>
          </section>

          {/* About, Philosophy, Methodology Section */}
          {(profile.aboutMe || profile.philosophy || profile.methodology) && (
            <section id="about-section" className="py-16 md:py-24 bg-white text-gray-800">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose lg:prose-xl">
                {profile.aboutMe && (
                  <>
                    <h2 className="text-2xl font-semibold mb-3">About Me</h2>
                    {renderHTML(profile.aboutMe)}
                  </>
                )}
                {profile.philosophy && (
                  <>
                    <h2 className="text-2xl font-semibold mt-8 mb-3">My Philosophy</h2>
                    {renderHTML(profile.philosophy)}
                  </>
                )}
                {profile.methodology && (
                  <>
                    <h2 className="text-2xl font-semibold mt-8 mb-3">My Methodology</h2>
                    {renderHTML(profile.methodology)}
                  </>
                )}
              </div>
            </section>
          )}

          {/* Benefits Section */}
          {profile.benefits && profile.benefits.length > 0 && (
            <section id="benefits-section" className="py-16 md:py-24 bg-gray-50 text-gray-800">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center mb-12">Why Train With Me?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {profile.benefits.map((benefit) => (
                    <div key={benefit.id} className="bg-white p-6 rounded-lg shadow-md text-center">
                      {/* Add icon rendering here if you have an icon component */}
                      <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-gray-600 text-sm">{benefit.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Services Section */}
          {profile.services && profile.services.length > 0 && (
            <section id="services-section" className="py-16 md:py-24 bg-white text-gray-800">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center mb-12">Services Offered</h2>
                <div className="space-y-8">
                  {profile.services.map((service) => (
                    <div key={service.id} className="bg-gray-50 p-6 rounded-lg shadow">
                      <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                      <p className="text-gray-600 whitespace-pre-wrap">{service.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Transformation Photos Section */}
          {profile.transformationPhotos && profile.transformationPhotos.length > 0 && (
            <section id="transformations-section" className="py-16 md:py-24 bg-gray-50 text-gray-800">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center mb-12">Client Transformations</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {profile.transformationPhotos.map((photo) => (
                    <div key={photo.id} className="rounded-lg overflow-hidden shadow-lg">
                      <Image
                        src={photo.imagePath} // This will be a Supabase Storage URL
                        alt={photo.caption || 'Transformation photo'}
                        width={400}
                        height={300}
                        className="w-full h-auto object-cover"
                        onError={(e) => (e.currentTarget.style.display = 'none')} // Hide if image fails to load
                      />
                      {photo.caption && (
                        <p className="p-3 text-sm text-gray-600 bg-white text-center">{photo.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Testimonials Section */}
          {profile.testimonials && profile.testimonials.length > 0 && (
            <section id="testimonials-section" className="py-16 md:py-24 bg-white text-gray-800">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center mb-12">What Clients Say</h2>
                <div className="space-y-8">
                  {profile.testimonials.map((testimonial) => (
                    <blockquote key={testimonial.id} className="p-6 bg-gray-50 rounded-lg shadow">
                      <p className="text-gray-600 italic mb-4">"{testimonial.testimonialText}"</p>
                      <footer className="text-right font-semibold text-gray-700">- {testimonial.clientName}</footer>
                    </blockquote>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* External Links Section */}
          {profile.externalLinks && profile.externalLinks.length > 0 && (
             <section id="links-section" className="py-16 md:py-24 bg-gray-50 text-gray-800">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-8">Find Me Online</h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        {profile.externalLinks.map(link => (
                            <a
                                key={link.id}
                                href={link.linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                </div>
            </section>
          )}

          {/* Contact Form Section placeholder - actual form in next TODO */}
          <section id="contact-section" className="py-16 md:py-24 bg-white text-gray-800">
            <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center mb-8">Get In Touch</h2>
              {/* Contact form will be implemented in a subsequent step */}
              <div className="bg-gray-100 p-8 rounded-lg shadow-md text-center">
                <p className="text-gray-600">Contact form coming soon! For now, please reach out via details provided above.</p>
                {/* Display email/phone again if available */}
                {email && (
                    <p className="mt-4">
                        <EnvelopeIcon className="inline-block h-5 w-5 mr-2 text-gray-500" />
                        <a href={`mailto:${email}`} className="text-indigo-600 hover:underline">{email}</a>
                    </p>
                )}
                {profile.phone && (
                     <p className="mt-2">
                        <PhoneIcon className="inline-block h-5 w-5 mr-2 text-gray-500" />
                        <a href={`tel:${profile.phone}`} className="text-indigo-600 hover:underline">{profile.phone}</a>
                    </p>
                )}
              </div>
            </div>
          </section>
        </PublicLayout>
      );
    }
    ```
Expected Outcome: A dynamic page at `/trainer/[username]` displays the full profile of the specified trainer. It should gracefully handle cases where data (like testimonials or photos) is missing.
Best Practice Reminders: Use Server Components for data fetching. Ensure good SEO practices (metadata can be added later). Sanitize HTML if it's user-generated and not pre-sanitized. Image components should use appropriate `width`, `height`, and `alt` tags.

**TODO #35:**
Objective: Implement the Contact Form functionality on the public trainer profile page.
File(s) To Create/Modify: `src/app/trainer/[username]/page.tsx` (modify), `src/app/auth/actions.ts` (add new server action, or a dedicated `src/app/trainer/actions.ts`).
Specific Instructions:
1.  **Create a new Server Action for handling contact form submissions.** Let's put this in a new file for organization, e.g., `src/app/trainer/actions.ts`:
    ```typescript
    // src/app/trainer/actions.ts
    "use server";

    import { z } from 'zod';
    import { prisma } from '@/lib/prisma';
    // Import a mail sending library/service SDK if you were to actually send emails.
    // For this migration, we'll simulate it. In a real app, you'd use Resend, SendGrid, etc.
    // import { Resend } from 'resend'; (Example)

    const contactFormSchema = z.object({
      name: z.string().min(1, { message: "Name is required." }),
      email: z.string().email({ message: "Invalid email address." }),
      message: z.string().min(10, { message: "Message must be at least 10 characters." }),
      trainerEmail: z.string().email(), // Hidden field with trainer's email
      trainerName: z.string(), // Hidden field with trainer's name
    });

    interface ContactFormState {
      message?: string | null;
      error?: string | null;
      errors?: z.ZodIssue[];
      success?: boolean;
    }

    export async function submitContactForm(prevState: ContactFormState | undefined, formData: FormData): Promise<ContactFormState> {
      const validatedFields = contactFormSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message'),
        trainerEmail: formData.get('trainerEmail'),
        trainerName: formData.get('trainerName'),
      });

      if (!validatedFields.success) {
        return {
          errors: validatedFields.error.issues,
          error: "Please correct the errors below.",
          success: false,
        };
      }

      const { name, email: senderEmail, message, trainerEmail, trainerName } = validatedFields.data;

      console.log(`Simulating email send:
        To: ${trainerEmail} (Trainer: ${trainerName})
        From: ${name} <${senderEmail}>
        Subject: New Inquiry via ZIRO.FIT Profile
        Message: ${message}
      `);

      // In a real application, you would use your email service here:
      // try {
      //   const resend = new Resend(process.env.RESEND_API_KEY);
      //   await resend.emails.send({
      //     from: `ZIRO.FIT Inquiry <inquiries@yourdomain.com>`, // Use a verified sending domain
      //     to: trainerEmail,
      //     reply_to: senderEmail,
      //     subject: `New Inquiry from ${name} via ZIRO.FIT`,
      //     html: `<p>Name: ${name}</p><p>Email: ${senderEmail}</p><p>Message: ${message}</p>`,
      //   });
      //   return { success: true, message: "Your message has been sent successfully!" };
      // } catch (error) {
      //   console.error("Email sending error:", error);
      //   return { error: "Sorry, there was an issue sending your message. Please try again later.", success: false };
      // }
      
      // Simulate success for now
      return { success: true, message: "Your message has been sent successfully! (Simulated)" };
    }
    ```
2.  **Create a client component for the contact form** to use `useFormState` and `useFormStatus`.
    File: `src/components/trainer/ContactForm.tsx` (new)
    ```tsx
    // src/components/trainer/ContactForm.tsx
    "use client";

    import { useFormState, useFormStatus } from 'react-dom';
    import { submitContactForm } from '@/app/trainer/actions'; // Adjust path if actions.ts is elsewhere
    import { Input } from '@/components/ui/Input';
    import { Label } from '@/components/ui/Label';
    import { Textarea } from '@/components/ui/Textarea';
    import { Button } from '@/components/ui/Button';
    import { useEffect, useRef } from 'react';

    interface ContactFormProps {
      trainerEmail: string;
      trainerName: string;
    }
    
    interface ContactFormState {
        message?: string | null;
        error?: string | null;
        errors?: { field: string; message: string }[]; // Simplified error structure for client
        success?: boolean;
    }

    const initialState: ContactFormState = {
      message: null,
      error: null,
      errors: undefined,
      success: false,
    };

    function SubmitButton() {
      const { pending } = useFormStatus();
      return (
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? 'Sending...' : 'Send Message'}
        </Button>
      );
    }

    export default function ContactForm({ trainerEmail, trainerName }: ContactFormProps) {
      const [state, formAction] = useFormState(submitContactForm, initialState);
      const formRef = useRef<HTMLFormElement>(null);

      useEffect(() => {
        if (state.success) {
          formRef.current?.reset(); // Reset form on success
        }
      }, [state.success]);
      
      // Helper to get error message for a specific field
      const getFieldError = (fieldName: string) => {
        return state.errors?.find(err => err.field === fieldName)?.message;
      };

      return (
        <div className="bg-gray-100 p-8 rounded-lg shadow-md">
          {state.success && state.message && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm border border-green-200">
              {state.message}
            </div>
          )}
          {state.error && !state.errors && (
             <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm border border-red-200">
              {state.error}
            </div>
          )}

          <form ref={formRef} action={formAction} className="space-y-6">
            <input type="hidden" name="trainerEmail" value={trainerEmail} />
            <input type="hidden" name="trainerName" value={trainerName} />
            <div>
              <Label htmlFor="contact-name">Your Name</Label>
              <Input type="text" id="contact-name" name="name" required className="mt-1" />
              {getFieldError('name') && <p className="text-red-500 text-xs mt-1">{getFieldError('name')}</p>}
            </div>
            <div>
              <Label htmlFor="contact-email">Your Email</Label>
              <Input type="email" id="contact-email" name="email" required className="mt-1" />
              {getFieldError('email') && <p className="text-red-500 text-xs mt-1">{getFieldError('email')}</p>}
            </div>
            {/* Honeypot field (optional but good practice) */}
            <div className="hidden" style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true">
              <label htmlFor="website_url">Do not fill this out</label>
              <input type="text" id="website_url" name="website_url" tabIndex={-1} autoComplete="off" />
            </div>
            <div>
              <Label htmlFor="contact-message">Message</Label>
              <Textarea id="contact-message" name="message" rows={5} required className="mt-1" />
              {getFieldError('message') && <p className="text-red-500 text-xs mt-1">{getFieldError('message')}</p>}
            </div>
            <SubmitButton />
          </form>
        </div>
      );
    }
    ```
3.  **Modify `src/app/trainer/[username]/page.tsx` to include the `ContactForm` component:**
    *   Import the `ContactForm` component.
    *   Replace the placeholder contact section with the actual form.
    ```tsx
    // src/app/trainer/[username]/page.tsx
    // ... (other imports)
    import ContactForm from '@/components/trainer/ContactForm'; // Import the form

    // ... (TrainerProfilePageProps and component definition)

    export default async function TrainerProfilePage({ params }: TrainerProfilePageProps) {
      // ... (data fetching logic remains the same)
      if (!userWithProfile || !userWithProfile.profile) {
        notFound();
      }
      const { profile, name, email: trainerActualEmail } = userWithProfile; // Get trainer's actual email

      // ... (rest of the component rendering logic)

      return (
        <PublicLayout>
          {/* ... (other sections: Hero, About, Services, etc.) ... */}

          {/* Contact Form Section - MODIFIED */}
          <section id="contact-section" className="py-16 md:py-24 bg-white text-gray-800">
            <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center mb-8">Get In Touch</h2>
              <ContactForm trainerEmail={trainerActualEmail} trainerName={name} />
            </div>
          </section>
        </PublicLayout>
      );
    }
    ```
Expected Outcome: The public trainer profile page now includes a functional contact form that submits data via a Server Action. Form validation errors and success messages are displayed. Email sending is simulated via `console.log`.
Best Practice Reminders: Implement rate limiting for the contact form action in a production environment to prevent abuse (can be done at middleware or action level). Ensure proper error handling and user feedback. Add a honeypot field for basic spam prevention. The Zod error structure in the server action needs to be mapped to a simpler structure for the client or handled directly by the client if preferred. For simplicity, the `ContactFormState` was adjusted to expect `ZodIssue[]`.

---

Please have @roo start with TODO #32.
Let me know when this phase is complete.