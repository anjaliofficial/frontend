// app/proxy.ts
import { NextRequest, NextResponse } from "next/server";
// import { getAuthToken, getUserData } from "@/lib/auth"; // adjust path

export default async function proxy(request: NextRequest) {
  // Example: extract token from cookies
  const token = request.cookies.get("authToken")?.value;

  // If no token, redirect to login
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If you want role-based checks:
  // const user = await getUserData(token);
  // if (request.nextUrl.pathname.startsWith("/admin") && user?.role !== "admin") {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }

  return NextResponse.next();
}
