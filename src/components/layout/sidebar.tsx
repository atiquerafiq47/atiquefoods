"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/inventory", label: "Inventory" },
  { href: "/inventory/add", label: "Add stock" },
  { href: "/sales", label: "New sale" },
  { href: "/customers", label: "Customers" },
  { href: "/data", label: "Data" },
];

type SidebarProps = {
  siteName: string;
  onNavigate?: () => void;
};

export function Sidebar({ siteName, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-5 py-5">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Inventory
        </p>
        <p className="mt-1 text-lg font-semibold">{siteName}</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium ${
                active
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
