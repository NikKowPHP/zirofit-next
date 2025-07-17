import PublicLayout from "@/components/layouts/PublicLayout";
import TrainerSearch from "@/components/home/TrainerSearch";

import { Button } from "@/components/ui";
import Link from "next/link";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { type Locale } from '@/i18n'
interface HomePageProps {
  params: { locale: Locale }
}



export  async function generateMetadata({ params }: HomePageProps) {
  const { locale } = params;
  unstable_setRequestLocale(locale);
  const t = await getTranslations("HomePage");

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: "/",
    },
  };
}

export default async function Home({ params }: HomePageProps) {
  const { locale } = params;
  unstable_setRequestLocale(locale);
  const t = await getTranslations("HomePage");
  return (
    <PublicLayout>
      <div className="flex flex-col flex-grow">
        {/* Hero Section */}
        <div className="flex-grow flex items-center justify-center text-center  ">
          <div className="relative z-10 w-full">
            <TrainerSearch />
          </div>
        </div>

        {/* For Trainers Section */}
        <section className="py-20 sm:py-32 bg-neutral-50 dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {t("growBusinessHeading")}
            </h2>
            <p className="mt-6 text-lg text-neutral-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t("growBusinessSubheading")}
            </p>
            <div className="mt-10">
              <Button asChild size="lg">
                <Link href="/auth/register">{t("createFreeProfile")}</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}