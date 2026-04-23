import Link from "next/link";

export function HomeIconLink() {
  return (
    <Link
      aria-label="Ir a inicio"
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 text-slate-700 transition hover:bg-slate-100"
      href="/"
      title="Inicio"
    >
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3.75 10.5 12 4l8.25 6.5v8.25a1.5 1.5 0 0 1-1.5 1.5h-4.5v-5.25h-4.5v5.25h-4.5a1.5 1.5 0 0 1-1.5-1.5V10.5Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    </Link>
  );
}
