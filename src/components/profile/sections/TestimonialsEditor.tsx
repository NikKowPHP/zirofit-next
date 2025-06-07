"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { addTestimonial } from '@/app/profile/actions';
import { Input, Label, Textarea, Button } from '@/components/ui';
import { z } from 'zod';

interface Testimonial {
  id: string;
  clientName: string;
  testimonialText: string;
  createdAt: Date;
}

interface TestimonialsEditorProps {
  initialTestimonials: Testimonial[];
}

interface TestimonialFormState {
    message?: string | null;
    error?: string | null;
    errors?: z.ZodIssue[];
    success?: boolean;
    newTestimonial?: Testimonial;
}

const initialState: TestimonialFormState = {};

function AddTestimonialButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? 'Adding...' : 'Add Testimonial'}</Button>;
}

export default function TestimonialsEditor({ initialTestimonials }: TestimonialsEditorProps) {
  const [state, formAction] = useFormState(addTestimonial, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);

  useEffect(() => {
    if (state.success && state.newTestimonial) {
      setTestimonials(current => [state.newTestimonial!, ...current].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      formRef.current?.reset();
    }
    if (initialTestimonials !== testimonials && !state.success) {
         setTestimonials(initialTestimonials);
    }
  }, [state.success, state.newTestimonial, initialTestimonials, testimonials]);

  const getFieldError = (fieldName: 'clientName' | 'testimonialText') => {
    return state.errors?.find(err => err.path && err.path.includes(fieldName))?.message;
  };

  return (
    <div className="p-6 bg-white shadow-sm rounded-lg space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Manage Testimonials</h3>
        {state.success && state.message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{state.message}</div>
        )}
        {state.error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{state.error}</div>
        )}
        <form action={formAction} ref={formRef} className="space-y-4 border-b pb-6 mb-6">
          <div>
            <Label htmlFor="clientName">Client Name</Label>
            <Input id="clientName" name="clientName" type="text" required className="mt-1" />
            {getFieldError('clientName') && <p className="text-red-500 text-xs mt-1">{getFieldError('clientName')}</p>}
          </div>
          <div>
            <Label htmlFor="testimonialText">Testimonial Text</Label>
            <Textarea id="testimonialText" name="testimonialText" rows={5} required className="mt-1" />
            {getFieldError('testimonialText') && <p className="text-red-500 text-xs mt-1">{getFieldError('testimonialText')}</p>}
          </div>
          <div className="flex justify-end">
            <AddTestimonialButton />
          </div>
        </form>
      </div>

      <div>
        <h4 className="text-md font-medium text-gray-800 mb-3">Your Testimonials</h4>
        {testimonials.length === 0 ? (
          <p className="text-gray-500">No testimonials added yet.</p>
        ) : (
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="p-4 border rounded-md">
                <h5 className="font-semibold text-gray-800">{testimonial.clientName}</h5>
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">"{testimonial.testimonialText}"</p>
                {/* Delete/Edit buttons to be added next */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}