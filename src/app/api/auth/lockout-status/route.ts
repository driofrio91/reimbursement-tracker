import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { isLockedOut } from "@/lib/auth/login-rate-limit";

export async function GET() {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1";
  
  const lockoutSeconds = await isLockedOut(ip);
  
  return NextResponse.json({
    lockedOut: lockoutSeconds !== null,
    remainingSeconds: lockoutSeconds ?? 0,
  });
}
