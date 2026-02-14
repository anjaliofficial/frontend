import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5050/api";

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const body = await req.json();

    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Authorization required" },
        { status: 401 },
      );
    }

    const response = await fetch(`${BACKEND_URL}/auth/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to update profile" },
        { status: response.status },
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: data.user,
        message: "Profile updated successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
