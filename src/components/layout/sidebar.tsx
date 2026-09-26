"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth/actions";

const links = [
  { href: "/", label: "Home" },
  { href: "/inventory", label: "Inventory" },
  { href: "/inventory/add", label: "Add stock" },
  { href: "/sales", label: "New sale" },
  { href: "/returns", label: "Returns" },
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
    <aside className="flex h-dvh w-64 shrink-0 flex-col overflow-hidden border-r border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-5 py-5">
        <p className="font-hand text-3xl font-bold leading-tight">{siteName}</p>
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
      <form action={logout} className="border-t border-zinc-200 p-3">
        <button
          type="submit"
          className="h-11 w-full rounded-xl border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
        >
          Log out
        </button>
      </form>
    </aside>
  );
}
