"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { InventoryProvider } from "@/lib/inventory/store";

type AppShellProps = {
  siteName: string;
  children: React.ReactNode;
};

export function AppShell({ siteName, children }: AppShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <InventoryProvider>
      <div className="flex min-h-full">
        <div className="hidden md:block">
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
            <div className="relative z-50 h-full">
              <Sidebar siteName={siteName} onNavigate={() => setOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center border-b border-zinc-200 bg-white px-4 py-3 md:hidden">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium"
            >
              Menu
            </button>
            <p className="ml-3 font-semibold">{siteName}</p>
          </div>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </InventoryProvider>
  );
}
