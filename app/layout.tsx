import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Shelves — Track books you've read. Discover what to read next.",
    template: "%s | Shelves",
  },
  description:
    "Shelves is a social book tracking and discovery platform. Log the books you've read, save those you want to read, and discover what your friends are reading.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "Shelves",
    description:
      "A social book tracking and discovery platform. The Letterboxd for books.",
    type: "website",
  },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" className="dark">
    <body className={inter.className}>
      <Providers>{children}</Providers>
    </body>
  </html>
);

export default RootLayout;
