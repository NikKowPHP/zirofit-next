I understand. You've encountered a serialization error, which is a common issue in Next.js when passing complex data types like Prisma's `Decimal` from Server Components to Client Components. The server can handle these types, but they must be converted to plain JavaScript objects (like strings or numbers) before being sent to the browser.

I will correct this by ensuring that all `Decimal` price values are converted to strings before they are passed as props to any Client Component.

Here is my plan:

1.  **Backend Data Fetching (`lib/api/trainers.ts`):** I will modify the `getPublishedTrainers` and `getTrainerProfileByUsername` functions. After fetching data from the database, I will map through the results and convert the `price` field of each service from a `Decimal` object to a plain `string`. I'll also update the related TypeScript interfaces.
2.  **Profile Data Fetching (`src/app/[locale]/profile/actions/_utils.ts`):** Similarly, I will update the `getCurrentUserProfileData` function to serialize the `price` field in the services list before returning the data. This will fix the error on the profile edit page.
3.  **Client Components:** I will update the `ServicesEditor.tsx` and `TrainerResultCard.tsx` components to expect the `price` as a `string` and adjust their internal type definitions and rendering logic accordingly, removing any now-redundant `.toString()` calls.

This will resolve the serialization error and ensure the application runs correctly.

-------------------------------------------------------------------------------
### src/app/[locale]/profile/actions/_utils.ts
```typescript
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { transformImagePath } from "@/lib/utils";
import * as profileService from "@/lib/services/profileService";

// Export types for client components to consume, avoiding direct imports that can fail in some build contexts.
export type User = Prisma.UserGetPayload<{}>;
export type Profile = Prisma.ProfileGetPayload<{}>;
export type Service = Prisma.ServiceGetPayload<{}>;
export type Testimonial = Prisma.TestimonialGetPayload<{}>;
export type TransformationPhoto = Prisma.TransformationPhotoGetPayload<{}>;
export type ExternalLink = Prisma.ExternalLinkGetPayload<{}>;
export type Benefit = Prisma.BenefitGetPayload<{}>;
export type SocialLink = Prisma.SocialLinkGetPayload<{}>;

export type TransformationPhotoWithPublicUrl = TransformationPhoto & {
  publicUrl: string;
};

// Helper function to get user and profile, creating profile if it doesn't exist.
export async function getUserAndProfile() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) {
    throw new Error("User not authenticated.");
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!user) {
    throw new Error("User not found in database.");
  }

  let profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    profile = await prisma.profile.create({
      data: { userId: user.id },
    });
  }

  return { user, profile, authUser }; // Return authUser as well
}

// Action for fetching all profile data, used on the edit page.
export async function getCurrentUserProfileData() {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return null;

    let userWithProfile = await profileService.getFullUserProfile(authUser.id);

    if (userWithProfile && !userWithProfile.profile) {
      await prisma.profile.create({ data: { userId: userWithProfile.id } });
      // Re-fetch to get the new profile and its relations (which will be empty)
      userWithProfile = await profileService.getFullUserProfile(authUser.id);
    }

    if (!userWithProfile) return null;

    if (userWithProfile.profile) {
      userWithProfile.profile.bannerImagePath = transformImagePath(
        userWithProfile.profile.bannerImagePath,
      );
      userWithProfile.profile.profilePhotoPath = transformImagePath(
        userWithProfile.profile.profilePhotoPath,
      );
      userWithProfile.profile.transformationPhotos.forEach((photo) => {
        (photo as any).imagePath = transformImagePath(photo.imagePath);
      });
      // Serialize Decimal price in services to string for client components
      if (userWithProfile.profile.services) {
        (userWithProfile.profile.services as any) = userWithProfile.profile.services.map(service => ({
            ...service,
            price: service.price ? service.price.toString() : null
        }));
      }
    }

    return userWithProfile;
  } catch (error) {
    console.error("Error fetching user profile data:", error);
    return null;
  }
}
```
-------------------------------------------------------------------------------
### src/lib/api/trainers.ts
```typescript
// src/lib/api/trainers.ts
import { prisma } from "@/lib/prisma";
import { transformImagePath, normalizeLocation } from "../utils";
import type { Prisma } from '@prisma/client';

export async function getPublishedTrainers(page = 1, pageSize = 15, query?: string, location?: string, sortBy?: string) {
  const skip = (page - 1) * pageSize;

  const whereClause: Prisma.UserWhereInput = {
    role: "trainer",
    profile: {
      isNot: null,
    },
  };

  if (query) {
    whereClause.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { username: { contains: query, mode: 'insensitive' } },
      { profile: { certifications: { contains: query, mode: 'insensitive' } } },
      { profile: { aboutMe: { contains: query, mode: 'insensitive' } } },
      { profile: { methodology: { contains: query, mode: 'insensitive' } } },
      { profile: { philosophy: { contains: query, mode: 'insensitive' } } },
    ];
  }

  if (location) {
    const locationFilter: Prisma.UserWhereInput = {
      profile: {
        locationNormalized: { contains: normalizeLocation(location) },
      },
    };
    if (whereClause.AND) {
      if (Array.isArray(whereClause.AND)) {
        whereClause.AND.push(locationFilter);
      } else {
        whereClause.AND = [whereClause.AND, locationFilter];
      }
    } else {
      whereClause.AND = [locationFilter];
    }
  }

  let orderBy: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[] = { name: "asc" }; // Default sort
  if (sortBy === 'name_desc') {
    orderBy = { name: 'desc' };
  } else if (sortBy === 'newest') {
    orderBy = { createdAt: 'desc' };
  } else if (sortBy === 'price_asc') {
    orderBy = { profile: { services: { _min: { price: 'asc' } } } };
  } else if (sortBy === 'price_desc') {
    orderBy = { profile: { services: { _min: { price: 'desc' } } } };
  }

  try {
    const trainers = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        username: true,
        profile: {
          select: {
            profilePhotoPath: true,
            location: true,
            certifications: true,
            latitude: true,
            longitude: true,
            services: {
              where: { price: { not: null } },
              orderBy: { price: 'asc' },
              take: 1,
              select: {
                price: true,
                currency: true,
                duration: true,
              },
            },
          },
        },
      },
      orderBy,
      skip,
      take: pageSize,
    });

    // Transform image paths and serialize Decimal prices
    const trainersWithUrls = trainers.map((trainer) => {
      if (trainer.profile) {
        return {
          ...trainer,
          profile: {
            ...trainer.profile,
            profilePhotoPath: transformImagePath(trainer.profile.profilePhotoPath),
            services: trainer.profile.services.map(s => ({
              ...s,
              price: s.price?.toString() ?? null,
            })),
          },
        };
      }
      return trainer;
    });

    const totalTrainers = await prisma.user.count({ where: whereClause });
    return {
      trainers: trainersWithUrls,
      totalTrainers,
      currentPage: page,
      totalPages: Math.ceil(totalTrainers / pageSize),
    };
  } catch (error) {
    console.error("Failed to fetch published trainers:", error);
    // In a real app, you might throw a custom error or return a specific error structure
    return {
      trainers: [],
      totalTrainers: 0,
      currentPage: 1,
      totalPages: 0,
      error: "Failed to load trainers.",
    };
  }
}

export interface Trainer {
  id: string;
  name: string;
  username: string | null;
  profile: {
    profilePhotoPath: string | null;
    location: string | null;
    certifications: string | null;
    latitude: number | null;
    longitude: number | null;
    services: {
        price: string | null;
        currency: string | null;
        duration: number | null;
    }[];
  } | null;
}

export async function getTrainerProfileByUsername(username: string) {
  try {
    const userWithProfile = await prisma.user.findUnique({
      where: { username },
      include: {
        profile: {
          include: {
            services: { orderBy: { createdAt: "asc" } },
            testimonials: { orderBy: { createdAt: "desc" } },
            transformationPhotos: { orderBy: { createdAt: "desc" } },
            externalLinks: { orderBy: { createdAt: "asc" } },
            benefits: { orderBy: { orderColumn: "asc" } },
            socialLinks: { orderBy: { createdAt: "asc" } },
          },
        },
      },
    });

    if (!userWithProfile || !userWithProfile.profile) {
      return null; // Or throw a NotFound error
    }

    // Transform all image paths in the profile
    const profile = userWithProfile.profile;
    profile.bannerImagePath = transformImagePath(profile.bannerImagePath);
    profile.profilePhotoPath = transformImagePath(profile.profilePhotoPath);
    profile.transformationPhotos.forEach((photo) => {
      // Note: Here we transform the path directly on the object.
      // The component will just use `photo.imagePath`.
      photo.imagePath = transformImagePath(photo.imagePath);
    });

    // Serialize Decimal prices for services
    if (profile.services) {
        (profile.services as any) = profile.services.map(service => ({
            ...service,
            price: service.price ? service.price.toString() : null
        }));
    }

    return userWithProfile; // Contains user and their full profile
  } catch (error) {
    console.error(`Failed to fetch profile for username ${username}:`, error);
    return null; // Or throw
  }
}
```
-------------------------------------------------------------------------------
### src/components/profile/sections/ServicesEditor.tsx
```typescript
"use client";

import React, { useState } from "react";
import { useFormStatus } from "react-dom";
import { useEditableList } from "@/hooks/useEditableListManager";
import {
  addService,
  deleteService,
  updateService,
} from "@/app/[locale]/profile/actions/service-actions";
import type { Service as PrismaService } from "@prisma/client";
import { Input, Label, Button, Card, CardHeader, CardTitle, CardContent, RichTextEditor } from "@/components/ui";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import { DeleteConfirmationModal } from "@/components/ui/DeleteConfirmationModal";
import { useServerActionToast } from "@/hooks/useServerActionToast";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

// Type that is safe to pass from Server to Client Components
type Service = Omit<PrismaService, 'price'> & {
  price: string | null;
};

interface ServicesEditorProps {
  initialServices: Service[];
}

export default function ServicesEditor({
  initialServices,
}: ServicesEditorProps) {
  const t = useTranslations("ProfileEditor");
  const t_server = useTranslations("ServerActions");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const {
    items: services,
    editingItemId,
    deletingId,
    formRef,
    addState,
    addFormAction,
    updateState,
    updateFormAction,
    isEditing,
    currentEditingItem: currentEditingService,
    handleEdit,
    handleCancelEdit,
    handleDelete,
  } = useEditableList<Service>({
    initialItems: initialServices,
    addAction: addService,
    updateAction: updateService,
    deleteAction: deleteService,
  });

  useServerActionToast({ formState: addState, onSuccess: () => formRef.current?.reset() });
  useServerActionToast({ formState: updateState, onSuccess: handleCancelEdit });

  const formStatus = useFormStatus();
  const currentFormState = isEditing ? updateState : addState;
  const getFieldError = (fieldName: "title" | "description" | "price" | "currency" | "duration") => {
    return currentFormState.errors?.find(
      (err: any) => err.path && err.path.includes(fieldName),
    )?.message;
  };
  
  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      const result = await handleDelete(itemToDelete);
      if (result?.success && result.messageKey) {
        toast.success(t_server(result.messageKey as any));
      } else if (result?.error) {
        toast.error(result.error);
      }
      setItemToDelete(null);
    }
  };

  return (
    <>
      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        setIsOpen={(isOpen) => !isOpen && setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        isPending={!!deletingId}
        title={t("serviceDeleteTitle")}
        description={t("serviceDeleteDesc")}
      />
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? t("servicesEditTitle") : t("servicesTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={isEditing ? updateFormAction : addFormAction}
            key={editingItemId || "add"}
            ref={formRef}
            className="space-y-4 border-b dark:border-gray-700 pb-6 mb-6"
          >
            {isEditing && (
              <input type="hidden" name="serviceId" value={editingItemId ?? ""} />
            )}
            <div>
              <Label htmlFor="title">{t("serviceTitleLabel")}</Label>
              <Input
                id="title"
                name="title"
                type="text"
                required
                defaultValue={currentEditingService?.title ?? ""}
                className="mt-1"
              />
              {getFieldError("title") && (
                <p className="text-red-500 text-xs mt-1">
                  {getFieldError("title")}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">{t("servicePriceLabel")}</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 50.00"
                  defaultValue={currentEditingService?.price ?? ""}
                  className="mt-1"
                />
                {getFieldError("price") && (
                  <p className="text-red-500 text-xs mt-1">
                    {getFieldError("price")}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="currency">{t("serviceCurrencyLabel")}</Label>
                <Input
                  id="currency"
                  name="currency"
                  type="text"
                  placeholder="e.g., PLN"
                  defaultValue={currentEditingService?.currency ?? ""}
                  className="mt-1"
                />
                {getFieldError("currency") && (
                  <p className="text-red-500 text-xs mt-1">
                    {getFieldError("currency")}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="duration">{t("serviceDurationLabel")}</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  placeholder="e.g., 60"
                  defaultValue={currentEditingService?.duration?.toString() ?? ""}
                  className="mt-1"
                />
                {getFieldError("duration") && (
                  <p className="text-red-500 text-xs mt-1">
                    {getFieldError("duration")}
                  </p>
                )}
              </div>
            </div>
            <div>
              <RichTextEditor
                label={t("serviceDescLabel")}
                name="description"
                initialValue={currentEditingService?.description ?? ""}
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
                  {t("cancel")}
                </Button>
              )}
              <Button type="submit">
                {isEditing
                  ? formStatus.pending
                    ? t("saving")
                    : t("serviceSaveButton")
                  : formStatus.pending
                    ? t("adding")
                    : t("serviceAddButton")}
              </Button>
            </div>
          </form>

        <div>
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
            {t("serviceYourServices")}
          </h4>
          {services.length === 0 ? (
            <p className="text-gray-500">
              {t("serviceNone")}
            </p>
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="p-4 bg-neutral-100 dark:bg-neutral-800/50 rounded-md flex justify-between items-start transition-all duration-200"
                >
                  <div>
                    <h5 className="font-semibold text-gray-800 dark:text-gray-100">
                      {service.title}
                    </h5>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      {service.price && (
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {service.price} {service.currency}
                        </span>
                      )}
                      {service.duration && (
                        <span> / {service.duration} min</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: service.description }} />
                  </div>
                  <div className="flex space-x-2 flex-shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(service)}
                      aria-label={`Edit ${service.title}`}
                      disabled={
                        deletingId === service.id ||
                        (isEditing && editingItemId === service.id)
                      }
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setItemToDelete(service.id)}
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
        </CardContent>
      </Card>
    </>
  );
}
```
-------------------------------------------------------------------------------
### src/components/trainers/TrainerResultCard.tsx
```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui";
import { MapPinIcon } from "@heroicons/react/24/solid";
import { useTranslations } from "next-intl";

interface TrainerCardProps {
  trainer: {
    id: string;
    name: string;
    username: string | null;
    profile: {
      location: string | null;
      certifications: string | null;
      profilePhotoPath: string | null;
      services: {
        price: string | null;
        currency: string | null;
        duration: number | null;
      }[];
    } | null;
  };
}

export default function TrainerResultCard({ trainer }: TrainerCardProps) {
  const t = useTranslations('TrainerResultCard');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  if (!trainer.profile) return null;

  const handleClick = () => {
    setIsLoading(true);
    router.push(`/trainer/${trainer.username}`);
  };

  const firstService = trainer.profile.services?.[0];

  return (
    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 transition-shadow duration-300 hover:shadow-md flex flex-col sm:flex-row items-center gap-6" data-testid="trainer-card">
      <div className="flex-shrink-0">
        <Image
          src={trainer.profile.profilePhotoPath || "/default-profile.jpg"}
          alt={trainer.name}
          width={100}
          height={100}
          className="rounded-full object-cover w-24 h-24 border-2 border-white dark:border-neutral-800 shadow-sm"
        />
      </div>
      <div className="flex-grow text-center sm:text-left">
        <Link href={`/trainer/${trainer.username}`}>
          <h2 className="text-xl font-bold text-[var(--primary-blue)] hover:underline" data-testid="trainer-card-name">
            {trainer.name}
          </h2>
        </Link>
        <p className="font-semibold text-neutral-700 dark:text-neutral-300 mt-1">
          {trainer.profile.certifications}
        </p>
        {firstService && firstService.price && (
            <p className="mt-2 text-lg font-bold text-neutral-800 dark:text-neutral-200">
                {t('fromPrice', { price: firstService.price, currency: firstService.currency || 'PLN' })}
                {firstService.duration && ` / ${firstService.duration} min`}
            </p>
        )}
        {trainer.profile.location && (
          <div className="flex items-center justify-center sm:justify-start text-sm text-neutral-500 dark:text-neutral-400 mt-2">
            <MapPinIcon className="w-4 h-4 mr-1.5" />
            <span>{trainer.profile.location}</span>
          </div>
        )}
      </div>
      <div className="flex-shrink-0 sm:ml-auto">
        <Button variant="secondary" onClick={handleClick} disabled={isLoading} data-testid="view-profile-button">
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-neutral-900 dark:text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {t('loading')}
            </>
          ) : (
            t('viewProfile')
          )}
        </Button>
      </div>
    </div>
  );
}
```