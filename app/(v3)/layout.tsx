import type { Metadata, Viewport } from "next";
import { content } from "@/lib/content";
import "./v3.css";

const pageTitle = `${content.brand.name} | Building Enduring Businesses`;

export const metadata: Metadata = {
  title: pageTitle,
  description: content.hero.lede,
  openGraph: {
    title: pageTitle,
    description: content.hero.lede,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#fafaf8",
};

export default function V3RootLayout({
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
