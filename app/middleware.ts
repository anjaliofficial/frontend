import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const userData = req.cookies.get("user_data")?.value;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    if (!userData) return NextResponse.redirect(new URL("/login", req.url));
    
    const user = JSON.parse(userData);
    if (pathname.includes("/admin") && user.role !== "admin") 
        return NextResponse.redirect(new URL("/dashboard/customer", req.url));
    if (pathname.includes("/host") && user.role !== "host" && user.role !== "admin")
        // Note: Admin can usually see host areas
        return NextResponse.redirect(new URL("/dashboard/customer", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };