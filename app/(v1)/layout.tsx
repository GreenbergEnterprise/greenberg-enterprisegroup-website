import type { Metadata } from "next";
import { content } from "@/lib/content";
import "./v1.css";

const pageTitle = `${content.brand.name} | Building Enduring Businesses`;

export const metadata: Metadata = {
  title: pageTitle,
  description: content.hero.lede,
  openGraph: {
    title: pageTitle,
    description: content.hero.lede,
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
