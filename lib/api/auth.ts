import { LoginFormData, RegisterFormData } from "@/app/(auth)/schema"
import axios from "./axios"
import { API } from "./endpoints"
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

export async function register(data: any) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Registration failed");
  }

  return json;
}

export async function login(data: { email: string; password: string }) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Login failed");
  }
  console.log("Login response data:", json);
  return json; // ✅ return the data so LoginForm can use it
}

