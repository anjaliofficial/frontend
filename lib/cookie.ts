"use server";

import { cookies } from "next/headers";

export interface UserData {
  _id: string;
  email: string;
  username?: string;
  role: "admin" | "host" | "customer";
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

// Set auth token (HTTP-only)
export const setAuthToken = async (token: string) => {
  const cookieStore = cookies();
  (await cookieStore).set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
};

// Get auth token
export const getAuthToken = async (): Promise<string | null> => {
  const cookieStore = cookies();
  return (await cookieStore).get("auth_token")?.value || null;
};

// Set user data
export const setUserData = async (userData: UserData) => {
  const cookieStore = cookies();
  (await cookieStore).set({
    name: "user_data",
    value: JSON.stringify(userData),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
};

// Get user data
export const getUserData = async (): Promise<UserData | null> => {
  const cookieStore = cookies();
  const userData = (await cookieStore).get("user_data")?.value || null;
  return userData ? JSON.parse(userData) : null;
};

// Clear cookies
export const clearAuthCookies = async () => {
  const cookieStore = cookies();
  (await cookieStore).delete("auth_token");
  (await cookieStore).delete("user_data");
};
