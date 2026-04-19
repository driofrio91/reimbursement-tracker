import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";

export default async function PrivateLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <>{children}</>;
}
