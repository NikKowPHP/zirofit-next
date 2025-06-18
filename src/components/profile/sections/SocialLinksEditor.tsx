"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { addSocialLink, updateSocialLink, deleteSocialLink } from '@/app/profile/actions';
import { Input, Label, Button } from '@/components/ui';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { z } from 'zod';

export interface SocialLink {
  id: string;
  profileId: string;
  platform: string;
  username: string;
  profileUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SocialLinksEditorProps {
  initialSocialLinks: SocialLink[];
}

interface SocialLinkFormState {
  message?: string | null;
  error?: string | null;
  errors?: z.ZodIssue[];
  success?: boolean;
  newLink?: SocialLink;
  updatedLink?: SocialLink;
}

const initialFormState: SocialLinkFormState = { };

export default function SocialLinksEditor({ initialSocialLinks }: SocialLinksEditorProps) {
  const [addState, addFormAction] = useFormState(addSocialLink, initialFormState);
  const [updateState, updateFormAction] = useFormState(updateSocialLink, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const [links, setLinks] = useState<SocialLink[]>(initialSocialLinks);

  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isEditing = !!editingLinkId;
  const currentEditingLink = isEditing ? links.find(link => link.id === editingLinkId) : null;
  const formStatus = useFormStatus();

  // Effect for add link
  useEffect(() => {
    if (addState.success && addState.newLink) {
      setLinks(current => [addState.newLink!, ...current].sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
      formRef.current?.reset();
    }
  }, [addState.success, addState.newLink]);

  // Effect for update link
  useEffect(() => {
    if (updateState.success && updateState.updatedLink) {
      setLinks(current => 
        current.map(link => link.id === updateState.updatedLink!.id ? updateState.updatedLink! : link)
               .sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      );
      handleCancelEdit();
    }
  }, [updateState.success, updateState.updatedLink]);
  
  // Sync with initial props
  useEffect(() => {
    if (initialSocialLinks !== links && !addState.success && !updateState.success && !deletingId && !isEditing) {
         setLinks(initialSocialLinks);
    }
  }, [initialSocialLinks, addState.success, updateState.success, deletingId, isEditing, links]);

  const handleEditClick = (link: SocialLink) => setEditingLinkId(link.id);
  const handleCancelEdit = () => setEditingLinkId(null);

  const handleDeleteLink = async (linkId: string) => {
    if (!window.confirm("Are you sure?")) return;
    setDeletingId(linkId);
    setDeleteError(null);
    const result = await deleteSocialLink(linkId);
    if (result.success && result.deletedId) {
      setLinks(current => current.filter(l => l.id !== result.deletedId));
    } else if (result.error) {
      setDeleteError(result.error);
    }
    setDeletingId(null);
  };
  
  const currentFormState = isEditing ? updateState : addState;
  const getFieldError = (fieldName: 'platform' | 'username' | 'profileUrl') => {
    return currentFormState.errors?.find(err => err.path && err.path.includes(fieldName))?.message;
  };
 
   return (
    <div className="p-6 bg-white dark:bg-gray-800 shadow-sm rounded-lg space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          {isEditing ? `Edit Social Link: ${currentEditingLink?.platform}` : 'Add New Social Link'}
        </h3>
        {currentFormState.success && currentFormState.message && (
          <div className="rounded-md bg-green-50 dark:bg-green-900/50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                {/* Success icon */}
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-300">{currentFormState.message}</h3>
              </div>
            </div>
          </div>
        )}
        {currentFormState.error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                {/* Error icon */}
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">{currentFormState.error}</h3>
              </div>
            </div>
          </div>
        )}

        <form
            action={isEditing ? updateFormAction : addFormAction} 
            key={editingLinkId || 'add-link'}
            ref={formRef}
            className="space-y-4 border-b pb-6 mb-6"
        >
          {isEditing && <input type="hidden" name="linkId" value={editingLinkId} />}
          <div>
            <Label htmlFor="platform">Platform</Label>
            <Input id="platform" name="platform" type="text" required className="mt-1"
                   defaultValue={isEditing ? currentEditingLink?.platform : ''} />
            {getFieldError('platform') && <p className="text-red-500 text-xs mt-1">{getFieldError('platform')}</p>}
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" type="text" required className="mt-1"
                   defaultValue={isEditing ? currentEditingLink?.username : ''} />
            {getFieldError('username') && <p className="text-red-500 text-xs mt-1">{getFieldError('username')}</p>}
          </div>
          <div>
            <Label htmlFor="profileUrl">Profile URL</Label>
            <Input id="profileUrl" name="profileUrl" type="url" required className="mt-1"
                   placeholder="https://example.com/username"
                   defaultValue={isEditing ? currentEditingLink?.profileUrl : ''} />
            {getFieldError('profileUrl') && <p className="text-red-500 text-xs mt-1">{getFieldError('profileUrl')}</p>}
          </div>
          <div className="flex justify-end space-x-3">
            {isEditing && <Button type="button" variant="secondary" onClick={handleCancelEdit}>Cancel</Button>}
            <Button type="submit">
              {isEditing
                ? (formStatus.pending ? 'Saving...' : 'Save Changes')
                : (formStatus.pending ? 'Adding...' : 'Add Link')}
            </Button>
          </div>
        </form>
      </div>

      {deleteError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              {/* Error icon */}
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{deleteError}</h3>
            </div>
          </div>
        </div>
      )}
      
      <div>
        <h4 className="text-md font-medium text-gray-800 mb-3">Your Social Links</h4>
        {links.length === 0 ? (
          <p className="text-gray-500">No social links added yet.</p>
        ) : (
          <div className="space-y-3">
            {links.map((link) => (
              <div key={link.id} className="p-3 border rounded-md flex justify-between items-center">
                <div>
                  <span className="font-medium text-gray-700">{link.platform}</span>: {' '}
                  <span className="text-gray-600">@{link.username}</span>
                  <a href={link.profileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm block truncate">
                    {link.profileUrl}
                  </a>
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                  <Button variant="secondary" size="sm" onClick={() => handleEditClick(link)} disabled={deletingId === link.id || (isEditing && editingLinkId === link.id)}>
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteLink(link.id)} disabled={deletingId === link.id}>
                    <TrashIcon className="h-4 w-4" />
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
