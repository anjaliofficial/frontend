import { NextRequest, NextResponse } from "next/server";

// Define which roles can access which paths
const roleAccessMap: Record<string, string[]> = {
  "/dashboard/admin": ["admin"],
  "/dashboard/host": ["host", "admin"], // admin can also access host
  "/dashboard/user": ["user", "host", "admin"], // everyone can access user
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect dashboard routes
  if (!pathname.startsWith("/dashboard")) return NextResponse.next();

  // Read cookies (HTTP-only cookies set by login)
  const token = req.cookies.get("accessToken")?.value;
  const userData = req.cookies.get("user_data")?.value;

  if (!token || !userData) {
    // Not logged in → redirect to login
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const user = JSON.parse(userData) as { role: string };
  const allowedRoles = roleAccessMap[pathname];

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in but unauthorized → redirect to user dashboard or 403 page
    const redirectUrl = new URL("/dashboard/user", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Authorized → continue
  return NextResponse.next();
}

// Apply middleware to all dashboard paths
export const config = {
  matcher: ["/dashboard/:path*"],
};
