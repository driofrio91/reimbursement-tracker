import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { PrivateSidebar } from "@/app/(private)/_components/PrivateSidebar";
import { PrivateToaster } from "@/app/(private)/_components/PrivateToaster";
import { AuthorizationError, requireAuth } from "@/lib/auth/authorization";

export default async function PrivateLayout({ children }: { children: ReactNode }) {
  let actor;

  try {
    actor = await requireAuth();
  } catch (error) {
    if (error instanceof AuthorizationError) {
      redirect("/login");
    }

    throw error;
  }

  if (!actor) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 md:grid md:grid-cols-[260px_1fr]">
      <PrivateSidebar userName={actor.name} />
      <div>{children}</div>
      <PrivateToaster />
    </div>
  );
}
