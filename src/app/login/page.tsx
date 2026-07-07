"use client";

import { useState, useEffect, useCallback } from "react";
import type { SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { PasswordInput } from "@/app/_components/PasswordInput";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  const checkLockoutStatus = useCallback(async () => {
    const res = await fetch("/api/auth/lockout-status");
    const data = await res.json();
    if (data.lockedOut) {
      setLockoutSeconds(data.remainingSeconds);
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;

    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          setError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }
    return `${secs}s`;
  }
  const showDevelopmentCredentials = process.env.NODE_ENV !== "production";
  const passwordChanged =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("passwordChanged") === "1";

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Check if we got locked out
        await checkLockoutStatus();
        if (lockoutSeconds === 0) {
          setError("Credenciales invalidas. Revisa el email y la contrasena.");
        }
        setIsSubmitting(false);
        return;
      }
    } catch {
      // Rate limited by proxy (429)
      await checkLockoutStatus();
      setIsSubmitting(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-3">
          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600">
            Acceso interno
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Iniciar sesion</h1>
          <p className="text-sm leading-6 text-slate-600">Introduce tus credenciales para entrar en la aplicacion.</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {passwordChanged ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Contrasena actualizada. Inicia sesion con tu nueva contrasena.
            </p>
          ) : null}

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 outline-none transition focus:border-slate-400"
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <PasswordInput name="password" label="Contrasena" value={password} onChange={setPassword} required />

          {lockoutSeconds > 0 ? (
            <p className="text-sm text-red-600">
              Demasiados intentos. Prueba otra vez en {formatTime(lockoutSeconds)}
            </p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : null}

          <button
            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            type="submit"
            disabled={isSubmitting || lockoutSeconds > 0}
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {showDevelopmentCredentials ? (
          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-900">Usuarios de desarrollo</p>
            <p className="mt-2">
              <code>admin@local.test</code>
            </p>
            <p>
              <code>operator@local.test</code>
            </p>
            <p className="mt-2 text-xs text-slate-500">Define las contrasenas en tu archivo local `.env`.</p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
