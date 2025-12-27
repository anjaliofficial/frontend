"use client";
import { useState, useEffect } from "react";
import SplashScreen from "./public/_components/spalshScreen/SplashScreen";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulates initial app loading
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en">
      <body>
        {isLoading ? <SplashScreen /> : children}
      </body>
    </html>
  );
}