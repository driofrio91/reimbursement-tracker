import { ChangePasswordForm } from "@/app/change-password/ChangePasswordForm";
import { requireAuth } from "@/lib/auth/authorization";

export default async function ChangePasswordPage() {
  const actor = await requireAuth();

  return <ChangePasswordForm mustChangePasswordOnFirstLogin={actor.mustChangePasswordOnFirstLogin} />;
}
