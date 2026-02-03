"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import SplashScreen from "./(public)/components/spalshScreen/SplashScreen";
import "./globals.css";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasShown, setHasShown] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Show splash only once on first load
    if (hasShown) {
      setIsLoading(false);
      return;
    }

    // Only show splash on home page
    if (pathname !== "/") {
      setIsLoading(false);
      setHasShown(true);
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
      setHasShown(true);
    }, 250);
    return () => clearTimeout(timer);
  }, [pathname, hasShown]);

  return (
    <html lang="en">
      <body className="m-0 p-0 font-sans">
        {isLoading ? <SplashScreen /> : children}
      </body>
    </html>
  );
}
