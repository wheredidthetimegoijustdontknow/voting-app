import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Real-Time Voting App",
  description: "A modern real-time voting application with light and dark themes",
};

import { ToastProvider } from "@/components/ui/ToastContext";
import { VoteToastListener } from "@/components/polls/VoteToastListener";
import AppLayout from "@/components/AppLayout";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/app/actions/profile";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  let initialUsername: string | undefined;
  if (user) {
    const profileRes = await getCurrentProfile();
    initialUsername = profileRes.data?.username;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <ToastProvider>
            <VoteToastListener />
            <AppLayout userId={user?.id || null} initialUsername={initialUsername}>
              {children}
            </AppLayout>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
