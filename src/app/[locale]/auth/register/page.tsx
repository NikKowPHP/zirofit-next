
import { Metadata } from "next";
import RegisterPage from "./page.client";

export const metadata: Metadata = {
  title: "Trainer Register",
  robots: {
    index: false,
    follow: true,
  },
};

export default function PageWrapper() {
  return (
    <>
      <RegisterPage />
    </>
  );
}