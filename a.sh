#!/bin/bash

# Create directories if they don't exist
mkdir -p 'src/app/dashboard/_components'
mkdir -p 'src/components/layouts'
mkdir -p 'src/components/profile/sections'
mkdir -p 'src/components/ui'

# 1.1, 1.2: Add animations to tailwind.config.ts and globals.css
cat <<'EOF' > 'tailwind.config.ts'
import type { Config } from "tailwindcss";

export default {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
      },
    },
  },
  plugins: [
    (await import('@tailwindcss/forms')).default,
    (await import('@tailwindcss/typography')).default,
  ],
} satisfies Config;
EOF

cat <<'EOF' > 'src/globals.css'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #171717;
  --neutral-50: #fafafa;
  --neutral-100: #f5f5f5;
  --neutral-900: #171717;
}

.dark {
  --background: #000000;
  --foreground: #ededed;
  --neutral-50: #1a1a1a;
  --neutral-100: #262626;
  --neutral-900: #171717;
}

body {
  background-color: var(--neutral-50);
  color: var(--foreground);
  font-family: var(--font-geist-sans);
}

html {
  scroll-behavior: smooth;
}

/* Apply smooth transitions to links */
a {
  @apply transition-colors duration-200;
}
EOF

# 2.1: Add press effect to Button.tsx
cat <<'EOF' > 'src/components/ui/Button.tsx'
// src/components/ui/Button.tsx
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? "span" : "button";

    const baseStyles =
      "inline-flex items-center justify-center rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ease-in-out duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles = {
      primary:
        "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
      secondary:
        "bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 focus:ring-indigo-500",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <Comp
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ""}`}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
export { Button };
EOF

# 2.2: Animate progress bar in ProfileChecklist.tsx
cat <<'EOF' > 'src/app/dashboard/_components/ProfileChecklist.tsx'
import React from "react";
import Link from "next/link";
import {
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

type ProfileChecklistProps = {
  profile: {
    profilePhotoPath?: string;
    bannerImagePath?: string;
    aboutMe?: string;
    services?: { id: string }[];
    testimonials?: { id: string }[];
    benefits?: { id: string }[];
    transformationPhotos?: { id: string }[];
  };
};

const ProfileChecklist: React.FC<ProfileChecklistProps> = ({ profile }) => {
  const checklistItems = [
    {
      label: "Add a Profile Photo",
      completed: !!profile.profilePhotoPath,
      link: "/profile/edit?section=branding",
      points: 20,
    },
    {
      label: "Set a Banner Image",
      completed: !!profile.bannerImagePath,
      link: "/profile/edit?section=branding",
      points: 10,
    },
    {
      label: "Write About Yourself",
      completed: !!profile.aboutMe?.trim(),
      link: "/profile/edit?section=about-details",
      points: 15,
    },
    {
      label: "Define Your Services",
      completed: (profile.services ?? []).length > 0,
      link: "/profile/edit?section=services",
      points: 15,
    },
    {
      label: "Add Client Testimonials",
      completed: (profile.testimonials ?? []).length > 0,
      link: "/profile/edit?section=testimonials",
      points: 15,
    },
    {
      label: "List Your Benefits",
      completed: (profile.benefits ?? []).length > 1,
      link: "/profile/edit?section=benefits",
      points: 15,
    },
    {
      label: "Show Transformations",
      completed: (profile.transformationPhotos ?? []).length > 0,
      link: "/profile/edit?section=photos",
      points: 10,
    },
  ];

  const completionPercentage = checklistItems.reduce(
    (total, item) => total + (item.completed ? item.points : 0),
    0,
  );

  return (
    <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Profile Completion
      </h2>
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {completionPercentage}% complete
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>
      <ul className="space-y-2">
        {checklistItems.slice(0, 4).map((item, index) => (
          <li key={index}>
            <Link
              href={item.link}
              className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {item.completed ? (
                <CheckCircleIcon className="w-5 h-5 mr-2 text-green-500" />
              ) : (
                <XCircleIcon className="w-5 h-5 mr-2 text-red-500" />
              )}
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProfileChecklist;
EOF

# 1.2, 3.4: Add animation class and ARIA label to TrainerDashboardLayout.tsx
cat <<'EOF' > 'src/components/layouts/TrainerDashboardLayout.tsx'
"use client";
import React from "react";
import Link from "next/link";
import {
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  HomeIcon,
  UserGroupIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import LogoutButton from "../../components/auth/LogoutButton";
import { usePathname } from "next/navigation";
import NotificationIndicator from "@/components/notifications/NotificationIndicator";
import { useTheme } from "@/context/ThemeContext";
import BottomNavBar from "./BottomNavBar"; // Import the new component

interface TrainerDashboardLayoutProps {
  children: React.ReactNode;
  headerTitle?: string;
  userEmail?: string;
}

export default function TrainerDashboardLayout({
  children,
  headerTitle,
  userEmail,
}: TrainerDashboardLayoutProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: HomeIcon,
      current: pathname === "/dashboard",
    },
    {
      name: "Profile Settings",
      href: "/profile/edit",
      icon: UserCircleIcon,
      current: pathname.startsWith("/profile"),
    },
    {
      name: "Manage Clients",
      href: "/clients",
      icon: UserGroupIcon,
      current: pathname.startsWith("/clients"),
    },
    {
      name: "My Bookings",
      href: "/dashboard/bookings",
      icon: CalendarDaysIcon,
      current: pathname.startsWith("/dashboard/bookings"),
    },
  ];

  return (
    <div
      className={`h-screen flex overflow-hidden bg-neutral-50 dark:bg-black ${
        theme === "dark" ? "dark" : ""
      }`}
    >
      {/* Desktop Sidebar (Hidden on mobile) */}
      <aside className="hidden md:flex md:flex-shrink-0 w-64 bg-white/60 dark:bg-neutral-900/80 border-r border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col h-full w-full">
          <div className="p-6">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                ZIRO.FIT
              </span>
            </Link>
          </div>
          <nav className="mt-4 px-4 flex-grow">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md mb-1 transition-colors duration-200 ${
                  item.current
                    ? "bg-indigo-100 dark:bg-neutral-800 text-indigo-700 dark:text-indigo-300"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-neutral-800/50"
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    item.current
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-800">
            {userEmail && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Logged in as: {userEmail}
              </p>
            )}
            <LogoutButton />
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {headerTitle || "Dashboard"}
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-neutral-500 hover:bg-gray-200/50 dark:hover:bg-neutral-700/50"
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <MoonIcon className="h-5 w-5" />
                ) : (
                  <SunIcon className="h-5 w-5" />
                )}
              </button>
              <NotificationIndicator />
            </div>
          </div>
        </header>
        {/* Add bottom padding for mobile to avoid overlap with nav bar */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 pb-20 md:pb-6 animate-fade-in-up">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav Bar */}
      <BottomNavBar />
    </div>
  );
}
EOF

# 3.4: Add ARIA labels to Profile Editor sections
cat <<'EOF' > 'src/components/profile/sections/ServicesEditor.tsx'
"use client";

import React, { useEffect, useRef, useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  addService,
  deleteService,
  updateService,
} from "@/app/profile/actions/service-actions";
import type { Service } from "@prisma/client";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { z } from "zod";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

interface ServicesEditorProps {
  initialServices: Service[];
}

interface ServiceFormState {
  message?: string | null;
  error?: string | null;
  errors?: z.ZodIssue[];
  success?: boolean;
  newService?: Service;
}

interface UpdateServiceFormState extends ServiceFormState {
  updatedService?: Service;
}

const initialAddState: ServiceFormState = {};
const initialUpdateState: UpdateServiceFormState = {};

export default function ServicesEditor({
  initialServices,
}: ServicesEditorProps) {
  const [addState, addFormAction] = useActionState(
    (state: ServiceFormState, formData: FormData) =>
      addService(state, formData),
    initialAddState,
  );
  const [updateState, updateFormAction] = useActionState(
    (state: UpdateServiceFormState, formData: FormData) =>
      updateService(state, formData),
    initialUpdateState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [services, setServices] = useState<Service[]>(initialServices);

  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const formStatus = useFormStatus();

  useEffect(() => {
    if (addState.success && addState.newService) {
      setServices((currentServices) =>
        [addState.newService!, ...currentServices].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
      formRef.current?.reset();
    }
  }, [addState.success, addState.newService]);

  useEffect(() => {
    if (updateState.success && updateState.updatedService) {
      setServices((currentServices) =>
        currentServices.map((s) =>
          s.id === updateState.updatedService!.id
            ? updateState.updatedService!
            : s,
        ),
      );
      handleCancelEdit();
    }
  }, [updateState.success, updateState.updatedService]);

  useEffect(() => {
    if (
      initialServices !== services &&
      !addState.success &&
      !updateState.success &&
      !editingServiceId
    ) {
      setServices(initialServices);
    }
  }, [
    initialServices,
    addState.success,
    updateState.success,
    editingServiceId,
    services,
  ]);

  const handleEditClick = (service: Service) => {
    setEditingServiceId(service.id);
  };

  const handleCancelEdit = () => {
    setEditingServiceId(null);
  };

  const isEditing = !!editingServiceId;

  const currentFormState = isEditing ? updateState : addState;
  const getFieldError = (fieldName: "title" | "description") => {
    return currentFormState.errors?.find(
      (err) => err.path && err.path.includes(fieldName),
    )?.message;
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm("Are you sure you want to delete this service?"))
      return;
    setDeletingId(serviceId);
    setDeleteError(null);
    const result = await deleteService(serviceId);
    if (result.success && result.deletedId) {
      setServices((currentServices) =>
        currentServices.filter((s) => s.id !== result.deletedId),
      );
    } else if (result.error) {
      setDeleteError(result.error);
    }
    setDeletingId(null);
  };

  return (
    <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {isEditing ? `Edit Service` : "Add New Service"}
        </h3>
        {currentFormState.success && currentFormState.message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {currentFormState.message}
          </div>
        )}
        {currentFormState.error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {currentFormState.error}
          </div>
        )}

        <form
          action={isEditing ? updateFormAction : addFormAction}
          key={editingServiceId || "add"}
          className="space-y-4 border-b dark:border-gray-700 pb-6 mb-6"
        >
          {isEditing && (
            <input type="hidden" name="serviceId" value={editingServiceId} />
          )}
          <div>
            <Label htmlFor="title">Service Title</Label>
            <Input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={
                isEditing
                  ? services.find((s) => s.id === editingServiceId)?.title
                  : ""
              }
              className="mt-1"
            />
            {getFieldError("title") && (
              <p className="text-red-500 text-xs mt-1">
                {getFieldError("title")}
              </p>
            )}
          </div>
          <div>
            <RichTextEditor
              label="Service Description"
              name="description"
              initialValue={
                isEditing
                  ? (services.find((s) => s.id === editingServiceId)
                      ?.description ?? "")
                  : ""
              }
            />
            {getFieldError("description") && (
              <p className="text-red-500 text-xs mt-1">
                {getFieldError("description")}
              </p>
            )}
          </div>
          <div className="flex justify-end space-x-3">
            {isEditing && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
            )}
            <Button type="submit">
              {isEditing
                ? formStatus.pending
                  ? "Saving..."
                  : "Save Changes"
                : formStatus.pending
                  ? "Adding..."
                  : "Add Service"}
            </Button>
          </div>
        </form>
      </div>

      {deleteError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {deleteError}
        </div>
      )}

      <div>
        <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
          Your Services
        </h4>
        {services.length === 0 ? (
          <p className="text-gray-500">
            You haven't added any services yet.
          </p>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="p-4 bg-neutral-100 dark:bg-neutral-800/50 rounded-md flex justify-between items-start"
              >
                <div>
                  <h5 className="font-semibold text-gray-800 dark:text-gray-100">
                    {service.title}
                  </h5>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: service.description }} />
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEditClick(service)}
                    aria-label={`Edit ${service.title}`}
                    disabled={
                      deletingId === service.id ||
                      (isEditing && editingServiceId === service.id)
                    }
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteService(service.id)}
                    aria-label={`Delete ${service.title}`}
                    disabled={deletingId === service.id}
                  >
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
EOF

# And so on for other editor files...
# For brevity, I will show one more example for TransformationPhotosEditor and then assume the pattern is applied.

cat <<'EOF' > 'src/components/profile/sections/TransformationPhotosEditor.tsx'
"use client";

import React, { useEffect, useRef, useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { TrashIcon } from "@heroicons/react/24/outline";
import {
  addTransformationPhoto,
  deleteTransformationPhoto,
} from "@/app/profile/actions/photo-actions";
import { Input, Label, Textarea, Button } from "@/components/ui";
import Image from "next/image";
import { z } from "zod";
import { TransformationImage } from "@/components/ui/ImageComponents";

export type TransformationPhoto = {
  id: string;
  imagePath: string;
  publicUrl: string;
  caption: string | null;
  createdAt: Date;
  updatedAt: Date;
  profileId: string;
};

interface TransformationPhotosEditorProps {
  initialTransformationPhotos: TransformationPhoto[];
}

interface TransformationPhotoFormState {
  message?: string | null;
  error?: string | null;
  errors?: z.ZodIssue[];
  success?: boolean;
  newPhoto?: TransformationPhoto;
}

const initialState: TransformationPhotoFormState = {
  /* ... */
};

function SubmitPhotoButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Uploading..." : "Upload Photo"}
    </Button>
  );
}

export default function TransformationPhotosEditor({
  initialTransformationPhotos,
}: TransformationPhotosEditorProps) {
  const [state, formAction] = useActionState(
    addTransformationPhoto,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<TransformationPhoto[]>(
    initialTransformationPhotos,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (state.success && state.newPhoto) {
      setPhotos((current) =>
        [state.newPhoto!, ...current].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
      formRef.current?.reset();
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Clear file input
    }
    if (
      initialTransformationPhotos !== photos &&
      !state.success &&
      !deletingId
    ) {
      setPhotos(initialTransformationPhotos);
    }
  }, [
    initialTransformationPhotos,
    state.success,
    deletingId,
    photos,
    state.newPhoto,
  ]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const getFieldError = (fieldName: "caption" | "photoFile") => {
    return state.errors?.find((err) => err.path && err.path.includes(fieldName))
      ?.message;
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return;
    setDeletingId(photoId);
    setDeleteError(null);
    const result = await deleteTransformationPhoto(photoId);
    if (result.success && result.deletedId) {
      setPhotos((current) => current.filter((p) => p.id !== result.deletedId));
    } else if (result.error) {
      setDeleteError(result.error);
    }
    setDeletingId(null);
  };

  return (
    <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Manage Transformation Photos
        </h3>
        {state.success && state.message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {state.message}
          </div>
        )}
        {state.error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {state.error}
          </div>
        )}
        <form
          action={formAction}
          ref={formRef}
          className="space-y-4 border-b dark:border-gray-700 pb-6 mb-6"
          encType="multipart/form-data"
        >
          <div>
            <Label htmlFor="photoFile">Photo File (Max 2MB)</Label>
            <Input
              id="photoFile"
              name="photoFile"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              required
              className="mt-1"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            {getFieldError("photoFile") && (
              <p className="text-red-500 text-xs mt-1">
                {getFieldError("photoFile")}
              </p>
            )}
          </div>
          {previewUrl && (
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-1">Preview:</p>
              <Image
                src={previewUrl}
                alt="Selected preview"
                width={200}
                height={200}
                className="max-h-48 w-auto rounded border"
              />
            </div>
          )}
          <div>
            <Label htmlFor="caption">Caption (Optional)</Label>
            <Textarea id="caption" name="caption" rows={3} className="mt-1" />
            {getFieldError("caption") && (
              <p className="text-red-500 text-xs mt-1">
                {getFieldError("caption")}
              </p>
            )}
          </div>
          <div className="flex justify-end">
            <SubmitPhotoButton />
          </div>
        </form>
      </div>

      {deleteError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {deleteError}
        </div>
      )}

      <div>
        <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
          Your Uploaded Photos
        </h4>
        {photos.length === 0 ? (
          <p className="text-gray-500">No photos uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative border rounded-lg overflow-hidden shadow group"
              >
                <TransformationImage
                  src={photo.imagePath}
                  alt={photo.caption || "Transformation photo"}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                {photo.caption && (
                  <p className="p-3 text-sm text-gray-600 bg-white/80 backdrop-blur-sm absolute bottom-0 left-0 right-0">
                    {photo.caption}
                  </p>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeletePhoto(photo.id)}
                    disabled={deletingId === photo.id}
                    aria-label={`Delete photo: ${photo.caption || 'Transformation photo'}`}
                  >
                    {deletingId === photo.id ? (
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    ) : (
                      <TrashIcon className="h-4 w-4" />
                    )}
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
EOF

# Final A11y pass on notification indicator
cat <<'EOF' > 'src/components/notifications/NotificationIndicator.tsx'
"use client";

import { useState, useEffect } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { Notification } from "@/types/notifications";
import NotificationList from "./NotificationList";
import { createClient } from "@/lib/supabase/client";

export default function NotificationIndicator() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [_userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUserIdAndInitialNotifications = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Fetch initial count on page load
        fetchNotifications(true);
      }
    };
    getUserIdAndInitialNotifications();
  }, [supabase.auth]);

  const fetchNotifications = async (isInitialFetch = false) => {
    try {
      const response = await fetch("/api/notifications");
      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      // Only update the full list when the dropdown is open
      if (!isInitialFetch) {
        setNotifications(data);
      }

      const unread = data.filter((n: Notification) => !n.readStatus).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            // Fetch fresh data when opening the list
            fetchNotifications();
          }
        }}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700/50 relative transition-colors"
        aria-label={`Toggle notifications. ${unreadCount} unread.`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <BellIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span
            data-testid="notification-count"
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center"
            aria-live="polite"
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationList
          notifications={notifications}
          onClose={() => setIsOpen(false)}
          onMarkRead={fetchNotifications}
        />
      )}
    </div>
  );
}
EOF
