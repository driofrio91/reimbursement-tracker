"use client";

import { useId, useState } from "react";

interface PasswordInputProps {
  name: string;
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  className?: string;
}

const defaultInputClassName =
  "w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 text-sm text-slate-950 placeholder:text-slate-400 outline-none transition focus:border-slate-400";

export function PasswordInput({
  name,
  label,
  value,
  onChange,
  placeholder,
  required,
  minLength,
  className,
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const inputId = useId();

  return (
    <label className="block space-y-2" htmlFor={inputId}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="relative">
        <input
          id={inputId}
          className={className ?? defaultInputClassName}
          type={isVisible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-xl text-slate-500 transition hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          aria-label={isVisible ? "Ocultar contrasena" : "Mostrar contrasena"}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((current) => !current)}
        >
          {isVisible ? <EyeClosedIcon /> : <EyeOpenIcon />}
        </button>
      </div>
    </label>
  );
}

function EyeOpenIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.25 12S5.25 6.75 12 6.75 21.75 12 21.75 12 18.75 17.25 12 17.25 2.25 12 2.25 12Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.25 12S5.25 6.75 12 6.75c2.25 0 4.089.584 5.571 1.407" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M21.75 12s-3 5.25-9.75 5.25c-2.17 0-3.973-.543-5.438-1.319" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M3 3l18 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}
