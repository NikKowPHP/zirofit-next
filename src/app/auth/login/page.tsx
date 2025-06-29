import { Metadata } from "next";
import LoginPage from "../login/page.client";

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
      <LoginPage />
    </>
  );
}
