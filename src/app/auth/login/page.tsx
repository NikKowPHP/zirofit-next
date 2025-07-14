import { Metadata } from "next";
import LoginPage from "../login/page.client";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Trainer Login",
  robots: {
    index: false,
    follow: true,
  },
};

export default function PageWrapper() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginPage />
      </Suspense>
    </>
  );
}
