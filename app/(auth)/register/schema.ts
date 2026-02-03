import { z } from "zod";

// FIX: Changed z.z.object to z.object
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  role: z.enum(["User", "Hosts"]),
});

export type RegisterValues = z.infer<typeof registerSchema>;