import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:5050/api";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; action: string } },
) {
  try {
    const { id, action } = params;
    const token = req.cookies.get("token")?.value;
    const body = await req.json();

    const response = await fetch(`${API_BASE}/admin/listings/${id}/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Admin listing action API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
