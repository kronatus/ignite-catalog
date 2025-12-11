import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ignite & Re:Invent 2025 Sessions Explorer",
  description: "Explore and discover Microsoft Ignite and Re:Invent sessions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
