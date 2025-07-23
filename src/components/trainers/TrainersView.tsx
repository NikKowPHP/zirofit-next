"use client";
import { useState } from "react";
import { TrainerGrid } from "@/components/trainers/TrainerGrid";
import TrainersMapWrapper from "@/components/trainers/TrainersMapWrapper";
import ViewToggleButton from "@/components/trainers/ViewToggleButton";
import { Trainer } from "@/lib/api/trainers";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface TrainersViewProps {
  trainers: Trainer[];
  totalPages: number;
  currentPage: number;
}

export default function TrainersView({
  trainers,
  totalPages,
  currentPage,
}: TrainersViewProps) {
  const t = useTranslations("TrainersPage");
  const [view, setView] = useState<"list" | "map">("list");
  const searchParams = useSearchParams();

  const getPageUrl = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (p > 1) {
      params.set("page", p.toString());
    } else {
      params.delete("page");
    }
    const queryString = params.toString();
    return `/trainers${queryString ? `?${queryString}` : ""}`;
  };

  const pagination =
    totalPages > 1 ? (
      <div
        className={`mt-12 flex justify-center items-center space-x-2 lg:col-span-3`}
      >
        {currentPage > 1 && (
          <Button asChild variant="secondary" size="sm">
            <Link href={getPageUrl(currentPage - 1)}>{t("previous")}</Link>
          </Button>
        )}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Button
            key={p}
            asChild
            variant={p === currentPage ? "primary" : "secondary"}
            size="sm"
          >
            <Link href={getPageUrl(p)}>{p}</Link>
          </Button>
        ))}
        {currentPage < totalPages && (
          <Button asChild variant="secondary" size="sm">
            <Link href={getPageUrl(currentPage + 1)}>{t("next")}</Link>
          </Button>
        )}
      </div>
    ) : null;

  return (
    <>
      {/* Mobile and Tablet view */}
      <div className="lg:hidden">
        <TrainerGrid trainers={trainers} />
        {pagination}

        <AnimatePresence>
          {view === "map" && (
            <>
              {/* Overlay */}
              <motion.div
                className="fixed inset-0 bg-black/30 z-30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setView("list")}
              />
              {/* Bottom Sheet */}
              <motion.div
                className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-neutral-950 rounded-t-2xl border-t border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 400, damping: 40 }}
                style={{ height: "calc(100% - 100px)" }} // Leave 60px of space at the top
              >
                <div
                  className="p-4 flex-shrink-0 flex justify-center cursor-grab active:cursor-grabbing"
                  onClick={() => setView("list")}
                >
                  <div className="w-10 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </div>
                <div className="flex-grow min-h-0">
                  <TrainersMapWrapper trainers={trainers} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop view */}
      <div className="hidden lg:grid lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
          <TrainerGrid trainers={trainers} />
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-24 h-96 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl flex items-center justify-center border border-neutral-200 dark:border-neutral-700">
            <TrainersMapWrapper trainers={trainers} />
          </div>
        </div>
        {pagination}
      </div>

      {view === "list" && <ViewToggleButton view={view} setView={setView} />}
    </>
  );
}