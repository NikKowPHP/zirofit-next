'use client';

import { useState, useEffect, useRef } from 'react';
import { useFormState } from 'react-dom';
import { addTestimonial, updateTestimonial, deleteTestimonial } from '@/app/profile/actions';
import { revalidateProfilePath } from '@/app/profile/revalidate';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

interface Testimonial {
  id: string;
  clientName: string;
  testimonialText: string;
  createdAt: Date;
  updatedAt: Date;   
  profileId: string; 
}


type FormState = {
  success: boolean;
  error: string | null;
  newTestimonial?: Testimonial;
  updatedTestimonial?: Testimonial;
};

type FormAction = (
  prevState: FormState,
  formData: FormData
) => Promise<FormState>;

const initialAddState: FormState = { 
  success: false, 
  error: null 
};

const initialUpdateState: FormState = { 
  success: false, 
  error: null 
};

export default function TestimonialsEditor({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [_deleteError, setDeleteError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [addState, addFormAction] = useFormState<FormState, FormData>(
    addTestimonial as FormAction,
    initialAddState
  );

  const [updateState, updateFormAction] = useFormState<FormState, FormData>(
    (prevState, formData) => updateTestimonial(editingTestimonialId || '', prevState, formData) as Promise<FormState>,
    initialUpdateState
  );

  const isEditing = !!editingTestimonialId;

  const handleStartEdit = (testimonial: Testimonial) => {
    setEditingTestimonialId(testimonial.id);
  };

  const handleCancelEdit = () => {
    setEditingTestimonialId(null);
    formRef.current?.reset();
  };

  // Effect for add testimonial
  useEffect(() => {
    const handleEffect = async () => {
      if (addState?.success && addState?.newTestimonial) {
        setTestimonials(current => [addState.newTestimonial!, ...current].sort((a,b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
        formRef.current?.reset();
        await revalidateProfilePath();
      }
    };
    handleEffect();
  }, [addState?.success, addState?.newTestimonial]);

  // Effect for update testimonial
  useEffect(() => {
    const handleEffect = async () => {
      if (updateState?.success && updateState?.updatedTestimonial) {
        setTestimonials(current =>
          current.map(t => t.id === updateState.updatedTestimonial!.id ? updateState.updatedTestimonial! : t)
            .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
        handleCancelEdit();
        await revalidateProfilePath();
      }
    };
    handleEffect();
  }, [updateState?.success, updateState?.updatedTestimonial]);

  const handleDeleteTestimonial = async (testimonialId: string) => {
    if (!window.confirm("Are you sure?")) return;
    setDeletingId(testimonialId);
    setDeleteError(null);
    const result = await deleteTestimonial(testimonialId, undefined);
    if (result?.success && result?.deletedId) {
      setTestimonials(current => current.filter(t => t.id !== result?.deletedId));
      await revalidateProfilePath();
    } else if (result?.error) {
      setDeleteError(result.error);
    }
    setDeletingId(null);
  };

  const currentFormState = isEditing ? updateState : addState;
  const getFieldError = (_fieldName: 'clientName' | 'testimonialText') => {
    return currentFormState?.error ? currentFormState?.error?.toString() : undefined;
  };

  return (
    <div className="space-y-4">
      <form 
        ref={formRef}
        action={isEditing ? updateFormAction : addFormAction}
        className="space-y-4"
      >
        <div className="grid gap-4">
          <Input
            name="clientName"
            placeholder="Client name"
            defaultValue={isEditing ? testimonials.find(t => t.id === editingTestimonialId)?.clientName : ''}
            className={getFieldError('clientName') ? 'border-red-500' : ''}
          />
          {getFieldError('clientName') && (
            <p className="text-sm text-red-500">{getFieldError('clientName')}</p>
          )}
          <RichTextEditor
            label="Testimonial Text"
            name="testimonialText"
            initialValue={isEditing ? testimonials.find(t => t.id === editingTestimonialId)?.testimonialText ?? '' : ''}
            className={getFieldError('testimonialText') ? 'border border-red-500 rounded-md' : ''}
          />
          {getFieldError('testimonialText') && (
            <p className="text-sm text-red-500">{getFieldError('testimonialText')}</p>
          )}
          <div className="flex gap-2">
            <Button type="submit" variant="primary">
              {isEditing ? 'Update' : 'Add'} Testimonial
            </Button>
            {isEditing && (
              <Button type="button" variant="secondary" onClick={handleCancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </form>

      <div className="space-y-2">
        {testimonials.map(testimonial => (
          <div key={testimonial.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{testimonial.clientName}</h4>
                <p className="text-sm text-gray-600">{testimonial.testimonialText}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button"
                  variant="secondary" 
                  size="sm"
                  onClick={() => handleStartEdit(testimonial)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteTestimonial(testimonial.id)}
                  disabled={deletingId === testimonial.id}
                >
                  {deletingId === testimonial.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
