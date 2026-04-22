import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { PrivateSidebar } from "@/app/(private)/_components/PrivateSidebar";
import { auth } from "@/lib/auth/auth";

export default async function PrivateLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 md:grid md:grid-cols-[260px_1fr]">
      <PrivateSidebar userName={session.user.name} />
      <div>{children}</div>
    </div>
  );
}
