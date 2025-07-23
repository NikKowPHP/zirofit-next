import { prismaMock } from "@tests/singleton";
import * as profileService from "./profileService";
import { Prisma } from "@prisma/client";

describe("Profile Service", () => {
  const userId = "test-user-id";
  const profileId = "test-profile-id";

  beforeEach(() => {
    // Mock the aggregate call that is now used by service CUD operations
    prismaMock.service.aggregate.mockResolvedValue({
      _min: { price: new Prisma.Decimal(10.0) },
      _avg: null,
      _count: null,
      _max: null,
      _sum: null,
    });
  });

  it("getFullUserProfile should include all relations", async () => {
    await profileService.getFullUserProfile(userId);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
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
  });

  it("updateUserAndProfile should call transaction", async () => {
    const userData = { name: "New Name" };
    const profileData = { location: "New Location" };
    await profileService.updateUserAndProfile(userId, userData, profileData);
    expect(prismaMock.$transaction).toHaveBeenCalledWith([
      prismaMock.user.update({ where: { id: userId }, data: userData }),
      prismaMock.profile.update({
        where: { userId: userId },
        data: profileData,
      }),
    ]);
  });

  it("createService should call prisma.service.create", async () => {
    const serviceData = {
      profileId,
      title: "Test Service",
      description: "Desc",
    };
    await profileService.createService(serviceData as any);
    expect(prismaMock.service.create).toHaveBeenCalledWith({ data: serviceData });
  });

  it("updateService should call prisma.service.update", async () => {
    const serviceId = "service-1";
    const data = { title: "Updated" };
    await profileService.updateService(serviceId, profileId, data);
    expect(prismaMock.service.update).toHaveBeenCalledWith({
      where: { id: serviceId, profileId },
      data,
    });
  });

  it("deleteService should call prisma.service.delete", async () => {
    const serviceId = "service-1";
    await profileService.deleteService(serviceId, profileId);
    expect(prismaMock.service.delete).toHaveBeenCalledWith({
      where: { id: serviceId, profileId },
    });
  });

  it("getMaxBenefitOrder should call aggregate", async () => {
    await profileService.getMaxBenefitOrder(profileId);
    expect(prismaMock.benefit.aggregate).toHaveBeenCalledWith({
      _max: { orderColumn: true },
      where: { profileId },
    });
  });

  it("updateBenefitOrder should call transaction with multiple updates", async () => {
    const ids = ["benefit-1", "benefit-2"];
    await profileService.updateBenefitOrder(profileId, ids);
    expect(prismaMock.$transaction).toHaveBeenCalledWith([
      prismaMock.benefit.update({
        where: { id: "benefit-1", profileId },
        data: { orderColumn: 1 },
      }),
      prismaMock.benefit.update({
        where: { id: "benefit-2", profileId },
        data: { orderColumn: 2 },
      }),
    ]);
  });

  it("updateBrandingPaths should call prisma.profile.update", async () => {
    const data = { bannerImagePath: "new/path" };
    await profileService.updateBrandingPaths(profileId, data);
    expect(prismaMock.profile.update).toHaveBeenCalledWith({
      where: { id: profileId },
      data,
    });
  });

  it("findUserByUsername should call prisma.user.findUnique", async () => {
    const username = "test-user";
    await profileService.findUserByUsername(username);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { username },
    });
  });

  it("createTestimonial should call prisma.testimonial.create", async () => {
    const data = {
      profileId,
      clientName: "Client",
      testimonialText: "Great!",
    };
    await profileService.createTestimonial(data as any);
    expect(prismaMock.testimonial.create).toHaveBeenCalledWith({ data });
  });

  it("updateProfileTextField should call prisma.profile.update", async () => {
    const fieldName = "aboutMe";
    const content = "New about me text";
    await profileService.updateProfileTextField(profileId, fieldName, content);
    expect(prismaMock.profile.update).toHaveBeenCalledWith({
      where: { id: profileId },
      data: { [fieldName]: content },
    });
  });

  it("createSocialLink should call prisma.socialLink.create", async () => {
    const data = { profileId, platform: "twitter", username: "test" };
    await profileService.createSocialLink(data as any);
    expect(prismaMock.socialLink.create).toHaveBeenCalledWith({ data });
  });

  it("createExternalLink should call prisma.externalLink.create", async () => {
    const data = { profileId, label: "website", linkUrl: "https://test.com" };
    await profileService.createExternalLink(data as any);
    expect(prismaMock.externalLink.create).toHaveBeenCalledWith({ data });
  });
});