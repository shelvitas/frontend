import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import { ProgressBar } from "@/components/layout/progress-bar";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });
const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-merriweather",
});

export const metadata: Metadata = {
  title: {
    default: "Shelvitas — Track books you've read. Discover what to read next.",
    template: "%s | Shelvitas",
  },
  description:
    "Shelvitas is a social book tracking and discovery platform. Log the books you've read, save those you want to read, and discover what your friends are reading.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "Shelvitas",
    description:
      "A social book tracking and discovery platform. The Letterboxd for books.",
    type: "website",
  },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" className="dark">
    <body className={`${inter.className} ${merriweather.variable}`}>
      <Providers>
        <ProgressBar />
        {children}
      </Providers>
    </body>
  </html>
);

export default RootLayout;
