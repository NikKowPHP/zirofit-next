
import ProfileEditorLayout from "@/components/profile/ProfileEditorLayout";
import { getCurrentUserProfileData } from "../actions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic"; // Force dynamic rendering

export default async function EditProfilePage() {
  const initialProfileData = await getCurrentUserProfileData();

  if (!initialProfileData?.profile) {
    console.error("EditProfilePage: Missing profile data");
    return redirect("/dashboard?error=missing_profile");
  }

  const safeData = {
    ...initialProfileData,
    username: initialProfileData.username || "",
    profile: {
      ...initialProfileData.profile,
      // We are sure `availability` is of this shape or null. We cast it to satisfy TypeScript.
      availability: initialProfileData.profile.availability as
        | { [key: string]: string[] }
        | null,
    },
  };

  return <ProfileEditorLayout initialData={safeData} />;
}