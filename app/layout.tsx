import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Cornerstone Home Fellowship Groups",
    template: "%s | Cornerstone HFG",
  },
  description:
    "Plan meetings and coordinate attendance for a Cornerstone home fellowship group",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
