
import ClientDashboardLayout from "@/components/clients/dashboard/ClientDashboardLayout";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

export default async function ClientDashboardSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  const locale = await getLocale();

  if (!user) {
    return redirect(`/${locale}/auth/login`);
  }

  const prismaUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (prismaUser?.role !== 'client') {
    return redirect(`/${locale}/dashboard`);
  }


  return (
    <ClientDashboardLayout userEmail={user?.email}>
      {children}
    </ClientDashboardLayout>
  );
}