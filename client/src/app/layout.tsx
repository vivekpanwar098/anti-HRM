import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/context/AuthContext";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: (process.env.NEXT_PUBLIC_TITLE || "HRMS") + " | Anti Bikli HRMS",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Toaster richColors position="top-center" closeButton />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
