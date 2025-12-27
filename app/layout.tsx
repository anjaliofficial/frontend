"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import SplashScreen from "./public/components/spalshScreen/SplashScreen"; // Use the new non-private path

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Only show splash screen on the main landing page
    if (pathname !== "/") {
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'sans-serif' }}>
        {isLoading ? <SplashScreen /> : children}
      </body>
    </html>
  );
}