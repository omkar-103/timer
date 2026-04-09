import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Deep Work — Study Timer",
  description:
    "A calming, premium Deep Work Study Timer to help you achieve focused, distraction-free study sessions with built-in break tracking.",
  keywords: ["study timer", "deep work", "pomodoro", "focus timer", "productivity"],
  authors: [{ name: "Deep Work" }],
  openGraph: {
    title: "Deep Work — Study Timer",
    description: "Premium focus timer for distraction-free deep work sessions.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f5ee" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0e17" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="deep-work-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
