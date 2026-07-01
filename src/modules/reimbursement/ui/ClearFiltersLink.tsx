"use client";

import { useRouter } from "next/navigation";

interface ClearFiltersLinkProps {
  href: string;
  hasActiveFilters: boolean;
  className?: string;
  children: React.ReactNode;
}

export function ClearFiltersLink({ href, hasActiveFilters, className, children }: ClearFiltersLinkProps) {
  const router = useRouter();

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form;
    form?.reset();

    if (hasActiveFilters) {
      router.push(href);
    }
  }

  return (
    <button type="button" className={className} onClick={handleClick}>
      {children}
    </button>
  );
}
