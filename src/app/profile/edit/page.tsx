import ProfileEditorLayout from '@/components/profile/ProfileEditorLayout';
import { getCurrentUserProfileData } from '@/app/profile/actions';
import { redirect } from 'next/navigation';

export default async function EditProfilePage() {
  const initialProfileData = await getCurrentUserProfileData();

  if (!initialProfileData) {
    // Handle case where user or profile data couldn't be fetched
    // This could be a redirect to login or an error message page
    // Assuming middleware handles auth, this might mean a DB issue or new user without profile yet.
    // For now, a simple error or redirect. Let's redirect to dashboard for simplicity.
    // Or show an error message component.
    console.error("EditProfilePage: Failed to load initial profile data.");
    // Consider creating a default profile entry if user exists but profile doesn't, via an action call.
    // For now, redirect if something is critically wrong.
    return redirect('/dashboard?error=profile_load_failed');
  }

  return <ProfileEditorLayout initialData={initialProfileData} />;
}