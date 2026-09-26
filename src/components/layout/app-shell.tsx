"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { InventoryProvider } from "@/lib/inventory/store";

type AppShellProps = {
  siteName: string;
  children: React.ReactNode;
};

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function AppShell({ siteName, children }: AppShellProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <InventoryProvider>
      <div className="flex h-dvh overflow-hidden">
        <div className="hidden h-dvh shrink-0 md:block">
          <Sidebar siteName={siteName} />
        </div>

        {open && (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/30"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-0 top-0 z-50 h-dvh shadow-xl">
              <Sidebar siteName={siteName} onNavigate={() => setOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 md:hidden">
            <p className="truncate font-hand text-2xl font-bold">{siteName}</p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-800"
              aria-label="Open menu"
            >
              <MenuIcon />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </InventoryProvider>
  );
}
