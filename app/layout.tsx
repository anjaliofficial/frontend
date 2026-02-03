"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import SplashScreen from "./(public)/components/spalshScreen/SplashScreen";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") {
      setIsLoading(false);
      return;
    }
    const timer = setTimeout(() => setIsLoading(false), 250);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <html lang="en">
      <body className="m-0 p-0 font-sans">
        {isLoading ? <SplashScreen /> : children}
      </body>
    </html>
  );
}
