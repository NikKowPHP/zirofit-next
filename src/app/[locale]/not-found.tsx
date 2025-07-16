
import PublicLayout from "@/components/layouts/PublicLayout";
import { Button } from "@/components/ui";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function NotFoundPage() {
  const t = await getTranslations("NotFound");

  return (
    <PublicLayout>
      <div className="flex-grow flex items-center justify-center text-center px-4">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">404</h1>
          <h2 className="text-2xl font-semibold">{t("title")}</h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-md">
            {t("description")}
          </p>
          <Button asChild>
            <Link href="/">{t("goHome")}</Link>
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}