import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit {
  if (ratelimit) {
    return ratelimit;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url?.startsWith("https://")) {
    throw new Error(
      "Invalid Upstash Redis configuration: UPSTASH_REDIS_REST_URL must start with https://."
    );
  }

  if (!token) {
    throw new Error(
      "Invalid Upstash Redis configuration: UPSTASH_REDIS_REST_TOKEN is required."
    );
  }

  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
    analytics: true,
  });

  return ratelimit;
}

export async function proxy(request: NextRequest) {
  // Only rate limit auth endpoints
  if (request.nextUrl.pathname.startsWith("/api/auth")) {
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success, remaining } = await getRatelimit().limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/auth/:path*"],
};
