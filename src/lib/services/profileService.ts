
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Fetches the full user profile including all related entities.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<User & { profile: Profile & { ...relations... } } | null>} A promise that resolves to the full user profile.
 */
export const getFullUserProfile = async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId },
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
};

/**
 * Updates the availability for a profile.
 * @param {string} profileId - The ID of the profile.
 * @param {Prisma.JsonObject} availability - The new availability JSON object.
 * @returns {Promise<Profile>} A promise that resolves to the updated profile.
 */
export const updateAvailability = async (
  profileId: string,
  availability: Prisma.JsonObject,
) => {
  return prisma.profile.update({
    where: { id: profileId },
    data: { availability },
  });
};

/**
 * Creates a new benefit for a profile.
 * @param {Prisma.BenefitUncheckedCreateInput} data - The data for the new benefit.
 * @returns {Promise<Benefit>} A promise that resolves to the created benefit.
 */
export const createBenefit = async (
  data: Prisma.BenefitUncheckedCreateInput,
) => {
  return prisma.benefit.create({ data });
};

/**
 * Gets the maximum order column value for benefits in a profile.
 * @param {string} profileId - The ID of the profile.
 * @returns {Promise<{_max: {orderColumn: number | null}}>} The maximum order value.
 */
export const getMaxBenefitOrder = async (profileId: string) => {
  return prisma.benefit.aggregate({
    _max: { orderColumn: true },
    where: { profileId },
  });
};

/**
 * Updates a benefit.
 * @param {string} id - The ID of the benefit.
 * @param {string} profileId - The ID of the profile for authorization.
 * @param {Prisma.BenefitUncheckedUpdateInput} data - The data to update.
 * @returns {Promise<Benefit>} A promise that resolves to the updated benefit.
 */
export const updateBenefit = async (
  id: string,
  profileId: string,
  data: Prisma.BenefitUncheckedUpdateInput,
) => {
  return prisma.benefit.update({ where: { id, profileId }, data });
};

/**
 * Deletes a benefit.
 * @param {string} id - The ID of the benefit.
 * @param {string} profileId - The ID of the profile for authorization.
 * @returns {Promise<Benefit>} A promise that resolves to the deleted benefit.
 */
export const deleteBenefit = async (id: string, profileId: string) => {
  return prisma.benefit.delete({ where: { id, profileId } });
};

/**
 * Updates the order of benefits for a profile.
 * @param {string} profileId - The ID of the profile.
 * @param {string[]} ids - An array of benefit IDs in the new order.
 * @returns {Promise<Prisma.BatchPayload>} A promise that resolves when the transaction is complete.
 */
export const updateBenefitOrder = async (profileId: string, ids: string[]) => {
  const updates = ids.map((id, index) =>
    prisma.benefit.update({
      where: { id, profileId },
      data: { orderColumn: index + 1 },
    }),
  );
  return prisma.$transaction(updates);
};

/**
 * Updates the branding image paths for a profile.
 * @param {string} profileId - The ID of the profile.
 * @param {{ bannerImagePath?: string; profilePhotoPath?: string }} data - The new image paths.
 * @returns {Promise<Profile>} A promise that resolves to the updated profile.
 */
export const updateBrandingPaths = async (
  profileId: string,
  data: { bannerImagePath?: string; profilePhotoPath?: string },
) => {
  return prisma.profile.update({ where: { id: profileId }, data });
};

/**
 * Finds a user by their username.
 * @param {string} username - The username to search for.
 * @returns {Promise<User | null>} A promise that resolves to the user or null.
 */
export const findUserByUsername = (username: string) => {
  return prisma.user.findUnique({ where: { username } });
};

/**
 * Updates user and profile information in a transaction.
 * @param {string} userId - The ID of the user.
 * @param {Prisma.UserUpdateInput} userData - The user data to update.
 * @param {Prisma.ProfileUpdateInput} profileData - The profile data to update.
 * @returns {Promise<[User, Profile]>} A promise that resolves to the updated user and profile.
 */
export const updateUserAndProfile = (
  userId: string,
  userData: Prisma.UserUpdateInput,
  profileData: Prisma.ProfileUpdateInput,
) => {
  return prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: userData }),
    prisma.profile.update({ where: { userId: userId }, data: profileData }),
  ]);
};

/**
 * Creates a new external link for a profile.
 * @param {Prisma.ExternalLinkUncheckedCreateInput} data - The data for the new link.
 * @returns {Promise<ExternalLink>} A promise that resolves to the created link.
 */
export const createExternalLink = async (
  data: Prisma.ExternalLinkUncheckedCreateInput,
) => {
  return prisma.externalLink.create({ data });
};

/**
 * Updates an external link.
 * @param {string} id - The ID of the link.
 * @param {string} profileId - The ID of the profile for authorization.
 * @param {Prisma.ExternalLinkUncheckedUpdateInput} data - The data to update.
 * @returns {Promise<ExternalLink>} A promise that resolves to the updated link.
 */
export const updateExternalLink = async (
  id: string,
  profileId: string,
  data: Prisma.ExternalLinkUncheckedUpdateInput,
) => {
  return prisma.externalLink.update({ where: { id, profileId }, data });
};

/**
 * Deletes an external link.
 * @param {string} id - The ID of the link.
 * @param {string} profileId - The ID of the profile for authorization.
 * @returns {Promise<ExternalLink>} A promise that resolves to the deleted link.
 */
export const deleteExternalLink = async (id: string, profileId: string) => {
  return prisma.externalLink.delete({ where: { id, profileId } });
};

/**
 * Creates a new transformation photo for a profile.
 * @param {Prisma.TransformationPhotoUncheckedCreateInput} data - The data for the new photo.
 * @returns {Promise<TransformationPhoto>} A promise that resolves to the created photo.
 */
export const createTransformationPhoto = async (
  data: Prisma.TransformationPhotoUncheckedCreateInput,
) => {
  return prisma.transformationPhoto.create({ data });
};

/**
 * Finds a transformation photo by its ID.
 * @param {string} id - The ID of the photo.
 * @param {string} profileId - The ID of the profile for authorization.
 * @returns {Promise<TransformationPhoto>} A promise that resolves to the photo.
 */
export const findTransformationPhoto = async (id: string, profileId: string) => {
  return prisma.transformationPhoto.findFirstOrThrow({
    where: { id, profileId },
  });
};

/**
 * Deletes a transformation photo.
 * @param {string} id - The ID of the photo.
 * @returns {Promise<TransformationPhoto>} A promise that resolves to the deleted photo.
 */
export const deleteTransformationPhoto = async (id: string) => {
  return prisma.transformationPhoto.delete({ where: { id } });
};

/**
 * Creates a new service for a profile.
 * @param {Prisma.ServiceUncheckedCreateInput} data - The data for the new service.
 * @returns {Promise<Service>} A promise that resolves to the created service.
 */
export const createService = async (
  data: Prisma.ServiceUncheckedCreateInput,
) => {
  return prisma.service.create({ data });
};

/**
 * Updates a service.
 * @param {string} id - The ID of the service.
 * @param {string} profileId - The ID of the profile for authorization.
 * @param {Prisma.ServiceUncheckedUpdateInput} data - The data to update.
 * @returns {Promise<Service>} A promise that resolves to the updated service.
 */
export const updateService = async (
  id: string,
  profileId: string,
  data: Prisma.ServiceUncheckedUpdateInput,
) => {
  return prisma.service.update({ where: { id, profileId }, data });
};

/**
 * Deletes a service.
 * @param {string} id - The ID of the service.
 * @param {string} profileId - The ID of the profile for authorization.
 * @returns {Promise<Service>} A promise that resolves to the deleted service.
 */
export const deleteService = async (id: string, profileId: string) => {
  return prisma.service.delete({ where: { id, profileId } });
};

/**
 * Creates a new social link for a profile.
 * @param {Prisma.SocialLinkUncheckedCreateInput} data - The data for the new social link.
 * @returns {Promise<SocialLink>} A promise that resolves to the created social link.
 */
export const createSocialLink = async (
  data: Prisma.SocialLinkUncheckedCreateInput,
) => {
  return prisma.socialLink.create({ data });
};

/**
 * Updates a social link.
 * @param {string} id - The ID of the social link.
 * @param {string} profileId - The ID of the profile for authorization.
 * @param {Prisma.SocialLinkUncheckedUpdateInput} data - The data to update.
 * @returns {Promise<SocialLink>} A promise that resolves to the updated social link.
 */
export const updateSocialLink = async (
  id: string,
  profileId: string,
  data: Prisma.SocialLinkUncheckedUpdateInput,
) => {
  return prisma.socialLink.update({ where: { id, profileId }, data });
};

/**
 * Deletes a social link.
 * @param {string} id - The ID of the social link.
 * @param {string} profileId - The ID of the profile for authorization.
 * @returns {Promise<SocialLink>} A promise that resolves to the deleted social link.
 */
export const deleteSocialLink = async (id: string, profileId: string) => {
  return prisma.socialLink.delete({ where: { id, profileId } });
};

/**
 * Creates a new testimonial for a profile.
 * @param {Prisma.TestimonialUncheckedCreateInput} data - The data for the new testimonial.
 * @returns {Promise<Testimonial>} A promise that resolves to the created testimonial.
 */
export const createTestimonial = async (
  data: Prisma.TestimonialUncheckedCreateInput,
) => {
  return prisma.testimonial.create({ data });
};

/**
 * Updates a testimonial.
 * @param {string} id - The ID of the testimonial.
 * @param {string} profileId - The ID of the profile for authorization.
 * @param {Prisma.TestimonialUncheckedUpdateInput} data - The data to update.
 * @returns {Promise<Testimonial>} A promise that resolves to the updated testimonial.
 */
export const updateTestimonial = async (
  id: string,
  profileId: string,
  data: Prisma.TestimonialUncheckedUpdateInput,
) => {
  return prisma.testimonial.update({ where: { id, profileId }, data });
};

/**
 * Deletes a testimonial.
 * @param {string} id - The ID of the testimonial.
 * @param {string} profileId - The ID of the profile for authorization.
 * @returns {Promise<Testimonial>} A promise that resolves to the deleted testimonial.
 */
export const deleteTestimonial = async (id: string, profileId: string) => {
  return prisma.testimonial.delete({ where: { id, profileId } });
};

/**
 * Updates a specific text field on a profile.
 * @param {string} profileId - The ID of the profile.
 * @param {"aboutMe" | "philosophy" | "methodology"} fieldName - The name of the field to update.
 * @param {string} content - The new content for the field.
 * @returns {Promise<Profile>} A promise that resolves to the updated profile.
 */
export const updateProfileTextField = async (
  profileId: string,
  fieldName: "aboutMe" | "philosophy" | "methodology",
  content: string,
) => {
  return prisma.profile.update({
    where: { id: profileId },
    data: { [fieldName]: content },
  });
};