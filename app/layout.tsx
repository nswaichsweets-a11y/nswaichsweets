import type { Metadata, Viewport } from "next";
import { PwaRegister } from "@/components/app/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Namdhari Swaich Sweets",
    template: "%s | Namdhari Swaich Sweets"
  },
  description:
    "Personalized business management suite for sweets, dairy, billing, ledgers, inventory, salaries, and reports.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico"
  },
  appleWebApp: {
    capable: true,
    title: "Namdhari Swaich Sweets",
    statusBarStyle: "default"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#141b18"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
