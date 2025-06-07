"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { addTestimonial, deleteTestimonial, updateTestimonial } from '@/app/profile/actions';
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

const initialAddTestimonialState: TestimonialFormState = {};
const initialUpdateTestimonialState: UpdateTestimonialFormState = {};

function AddTestimonialButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? 'Adding...' : 'Add Testimonial'}</Button>;
}

export default function TestimonialsEditor({ initialTestimonials }: TestimonialsEditorProps) {
  const [addState, addFormAction] = useFormState(addTestimonial, initialAddTestimonialState);
  const [updateState, updateFormAction] = useFormState(updateTestimonial, initialUpdateTestimonialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);

  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const isEditing = !!editingTestimonialId;
  const currentEditingTestimonial = isEditing ? testimonials.find(t => t.id === editingTestimonialId) : null;

  // Effect for add testimonial
  useEffect(() => {
    if (addState.success && addState.newTestimonial) {
      setTestimonials(current => [addState.newTestimonial!, ...current].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      formRef.current?.reset(); // Only reset if it was the add form submission
    }
  }, [addState.success, addState.newTestimonial]);

  // Effect for update testimonial
  useEffect(() => {
    if (updateState.success && updateState.updatedTestimonial) {
      setTestimonials(current =>
        current.map(t => t.id === updateState.updatedTestimonial!.id ? updateState.updatedTestimonial! : t)
               .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      );
      handleCancelEdit();
    }
  }, [updateState.success, updateState.updatedTestimonial]);
  
  // Effect to sync with initial props (if not adding/editing/deleting)
  useEffect(() => {
    if (initialTestimonials !== testimonials && !addState.success && !updateState.success && !deletingId && !isEditing) {
         setTestimonials(initialTestimonials);
    }
  }, [initialTestimonials, addState.success, updateState.success, deletingId, isEditing, testimonials]);


  const handleEditClick = (testimonial: Testimonial) => {
    setEditingTestimonialId(testimonial.id);
    // Form inputs will use defaultValue, keyed by editingTestimonialId
  };

  const handleCancelEdit = () => {
    setEditingTestimonialId(null);
  };

  const handleDeleteTestimonial = async (testimonialId: string) => {
    if (!window.confirm("Are you sure?")) return;
    setDeletingId(testimonialId);
    setDeleteError(null);
    const result = await deleteTestimonial(testimonialId);
    if (result.success && result.deletedId) {
      setTestimonials(current => current.filter(t => t.id !== result.deletedId));
    } else if (result.error) {
      setDeleteError(result.error);
    }
    setDeletingId(null);
  };
  
  const currentFormState = isEditing ? updateState : addState;
  const getFieldError = (fieldName: 'clientName' | 'testimonialText') => {
    return currentFormState.errors?.find(err => err.path && err.path.includes(fieldName))?.message;
  };

  return (
    <div className="p-6 bg-white shadow-sm rounded-lg space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {isEditing ? `Edit Testimonial from ${currentEditingTestimonial?.clientName}` : 'Add New Testimonial'}
        </h3>
        {currentFormState.success && currentFormState.message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{currentFormState.message}</div>
        )}
        {currentFormState.error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{currentFormState.error}</div>
        )}

        <form
            action={isEditing ? updateFormAction : addFormAction}
            key={editingTestimonialId || 'add-testimonial'} // Key to reset form when switching modes
            ref={formRef}
            className="space-y-4 border-b pb-6 mb-6"
        >
          {isEditing && <input type="hidden" name="testimonialId" value={editingTestimonialId} />}
          <div>
            <Label htmlFor="clientName">Client Name</Label>
            <Input id="clientName" name="clientName" type="text" required className="mt-1"
                   defaultValue={isEditing ? currentEditingTestimonial?.clientName : ''} />
            {getFieldError('clientName') && <p className="text-red-500 text-xs mt-1">{getFieldError('clientName')}</p>}
          </div>
          <div>
            <Label htmlFor="testimonialText">Testimonial Text</Label>
            <Textarea id="testimonialText" name="testimonialText" rows={5} required className="mt-1"
                      defaultValue={isEditing ? currentEditingTestimonial?.testimonialText : ''} />
            {getFieldError('testimonialText') && <p className="text-red-500 text-xs mt-1">{getFieldError('testimonialText')}</p>}
          </div>
          <div className="flex justify-end space-x-3">
            {isEditing && (
              <Button type="button" variant="secondary" onClick={handleCancelEdit}>Cancel</Button>
            )}
            <Button type="submit">
              {isEditing
                ? (useFormStatus().pending ? 'Saving...' : 'Save Changes')
                : (useFormStatus().pending ? 'Adding...' : 'Add Testimonial')}
            </Button>
          </div>
        </form>
      </div>

      {deleteError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{deleteError}</div>}
      
      <div>
        <h4 className="text-md font-medium text-gray-800 mb-3">Your Testimonials</h4>
        {testimonials.length === 0 ? (
          <p className="text-gray-500">No testimonials added yet.</p>
        ) : (
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="p-4 border rounded-md flex justify-between items-start">
                <div>
                  <h5 className="font-semibold text-gray-800">{testimonial.clientName}</h5>
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">"{testimonial.testimonialText}"</p>
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                  <Button variant="secondary" size="sm" onClick={() => handleEditClick(testimonial)} disabled={deletingId === testimonial.id || (isEditing && editingTestimonialId === testimonial.id)}>
                    <PencilIcon className="h-4 w-4 mr-1.5" /> Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteTestimonial(testimonial.id)} disabled={deletingId === testimonial.id}>
                    <TrashIcon className="h-4 w-4 mr-1.5" /> {deletingId === testimonial.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}