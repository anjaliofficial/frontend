"use server";
import { login } from "@/lib/api/auth";
import { setAuthToken, setUserData, clearAuthCookies } from "@/lib/cookie";
import { redirect } from "next/navigation";
import { Role } from "@/context/AuthContext";

// ...existing code...
// allowedRoles = which roles can access this login/route
export const handleLogin = async (data: { email: string; password: string }, allowedRoles: Role[]) => {
  const res = await login(data);

  if (res.success && allowedRoles.includes(res.data.role)) {
    await setAuthToken(res.token);
    await setUserData(res.data);
    return { success: true };
  }

  return { success: false, message: "You are not authorized for this role" };
};

export const handleLogout = async () => {
  await clearAuthCookies();
  redirect("/login");
};