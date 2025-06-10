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