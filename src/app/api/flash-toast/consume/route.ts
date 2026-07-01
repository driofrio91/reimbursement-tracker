import { NextResponse } from "next/server";

import { consumeFlashToast } from "@/lib/ui/flash-toast";

export async function GET() {
  const flashToast = await consumeFlashToast();

  return NextResponse.json({ flashToast });
}
