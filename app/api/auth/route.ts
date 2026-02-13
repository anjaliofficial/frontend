// app/api/auth/route.ts
import { NextRequest, NextResponse } from "next/server";

type Role = "admin" | "user" | "guest";

const allowedRoles: Role[] = ["admin"]; // change per route

export async function GET(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value;
  const userData = req.cookies.get("user_data")?.value;

  if (!token || !userData) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = JSON.parse(userData) as { role: Role };
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const res = await fetch("http://localhost:5050/api/users", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  return NextResponse.json(data);
}
