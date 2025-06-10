"use client"; // If using client-side state for a library

import React, { TextareaHTMLAttributes } from 'react';
import { Textarea } from './Textarea'; // Use your existing Textarea component

interface RichTextEditorProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  initialValue?: string;
  // Add more props if integrating a real library
}

// For MVP, this is just a styled textarea.
// In a real app, you'd integrate a proper rich text editor library here.
const RichTextEditor = React.forwardRef<HTMLTextAreaElement, RichTextEditorProps>(
  ({ label, initialValue, name, id, className, ...props }, ref) => {
    return (
      <div>
        <label htmlFor={id || name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <Textarea
          id={id || name}
          name={name}
          defaultValue={initialValue} // Use defaultValue for uncontrolled or manage state
          rows={8} // Default rows
          className={`mt-1 ${className || ''}`}
          ref={ref}
          {...props}
        />
        <p className="mt-1 text-xs text-gray-500">
          Basic text input for now. Rich text features (bold, italics, lists) will be added later.
          For now, you can use simple line breaks.
        </p>
      </div>
    );
  }
);
RichTextEditor.displayName = 'RichTextEditor';
export { RichTextEditor };