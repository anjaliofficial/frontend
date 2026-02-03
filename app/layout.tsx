"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import SplashScreen from "./(public)/components/spalshScreen/SplashScreen";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Show splash only on home page on first visit
    if (pathname === "/") {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 250);
      return () => clearTimeout(timer);
    } else {
      // Don't show splash on auth pages
      setIsLoading(false);
    }
  }, []);

  return (
    <html lang="en">
      <body className="m-0 p-0 font-sans">
        {isLoading ? <SplashScreen /> : children}
      </body>
    </html>
  );
}
