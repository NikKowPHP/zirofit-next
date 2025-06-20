// src/components/trainer/ContactForm.tsx
"use client";

import { z } from "zod";
import { useFormState, useFormStatus } from "react-dom";
import { submitContactForm } from "@/app/trainer/actions"; // Adjust path if actions.ts is elsewhere
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useEffect, useRef } from "react";

interface ContactFormProps {
  trainerEmail: string;
  trainerName: string;
}

interface ContactFormState {
  message?: string | null;
  error?: string | null;
  errors?: z.ZodIssue[];
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
      {pending ? "Sending..." : "Send Message"}
    </Button>
  );
}

export default function ContactForm({
  trainerEmail,
  trainerName,
}: ContactFormProps) {
  const [state, formAction] = useFormState(submitContactForm, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset(); // Reset form on success
    }
  }, [state.success]);

  // Helper to get error message for a specific field
  const getFieldError = (fieldName: string) => {
    // ZodIssue has a path array, so we need to check if the fieldName matches any part of the path
    // For simplicity, assuming fieldName directly matches the first element of the path for now.
    return state.errors?.find((err) => err.path && err.path[0] === fieldName)
      ?.message;
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg shadow-md">
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
          <Label htmlFor="contact-name" className="dark:text-gray-200">
            Your Name
          </Label>
          <Input
            type="text"
            id="contact-name"
            name="name"
            required
            className="mt-1"
          />
          {getFieldError("name") && (
            <p className="text-red-500 text-xs mt-1">{getFieldError("name")}</p>
          )}
        </div>
        <div>
          <Label htmlFor="contact-email" className="dark:text-gray-200">
            Your Email
          </Label>
          <Input
            type="email"
            id="contact-email"
            name="email"
            required
            className="mt-1"
          />
          {getFieldError("email") && (
            <p className="text-red-500 text-xs mt-1">
              {getFieldError("email")}
            </p>
          )}
        </div>
        {/* Honeypot field to deter bots */}
        <div className="hidden">
          <Label htmlFor="website_url">Website URL</Label>
          <Input
            type="text"
            id="website_url"
            name="website_url"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
        <div>
          <Label htmlFor="contact-message" className="dark:text-gray-200">
            Message
          </Label>
          <Textarea
            id="contact-message"
            name="message"
            rows={5}
            required
            className="mt-1"
          />
          {getFieldError("message") && (
            <p className="text-red-500 text-xs mt-1">
              {getFieldError("message")}
            </p>
          )}
        </div>
        <SubmitButton />
      </form>
    </div>
  );
}
