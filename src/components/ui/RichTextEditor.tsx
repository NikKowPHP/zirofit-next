"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface RichTextEditorProps {
  label: string;
  name: string;
  initialValue?: string;
  id?: string;
  className?: string;
}

const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  ({ label, initialValue, name, id, className }, ref) => {
    const [content, setContent] = useState(initialValue || '');

    useEffect(() => {
      if (initialValue !== undefined && initialValue !== content) {
        setContent(initialValue);
      }
    }, [initialValue, content]);

    const modules = {
      toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{'list': 'ordered'}, {'list': 'bullet'}],
        ['link'],
        ['clean']
      ],
    };

    return (
      <div className={`rich-text-editor-container ${className || ''}`} ref={ref}>
        <label htmlFor={id || name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
        <input type="hidden" name={name} value={content} />
        <div className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            className="quill-editor"
          />
        </div>
        <style jsx global>{`
          .quill-editor .ql-toolbar { border-top-left-radius: 0.375rem; border-top-right-radius: 0.375rem; border-color: #d1d5db; }
          .dark .quill-editor .ql-toolbar { border-color: #4b5563; }
          .quill-editor .ql-container { border-bottom-left-radius: 0.375rem; border-bottom-right-radius: 0.375rem; border-color: #d1d5db; min-height: 150px; }
          .dark .quill-editor .ql-container { border-color: #4b5563; }
          .dark .ql-snow .ql-stroke { stroke: #d1d5db; }
          .dark .ql-snow .ql-picker-label { color: #d1d5db; }
          .dark .ql-snow .ql-fill { fill: #d1d5db; }
          .dark .ql-editor.ql-blank::before { color: rgba(209, 213, 219, 0.7); }
        `}</style>
      </div>
    );
  }
);
RichTextEditor.displayName = 'RichTextEditor';
export { RichTextEditor };
