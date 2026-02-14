import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:5050/api";

export async function GET(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get("token")?.value;
    const headerAuth = req.headers.get("authorization");
    const authHeader = cookieToken ? `Bearer ${cookieToken}` : headerAuth;

    const response = await fetch(`${API_BASE}/admin/dashboard/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Admin dashboard stats API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
