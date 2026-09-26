"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/dashboard/sample-data";
import { useInventory } from "@/lib/inventory/store";
import { formatWeight } from "@/lib/inventory/units";

export function InventoryPage() {
  const { items } = useInventory();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Inventory</h1>
          <p className="mt-1 text-zinc-600">All items in kilograms and grams.</p>
        </div>
        <Link
          href="/inventory/add"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Add stock
        </Link>
      </header>

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Price / kg</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-zinc-100">
                <td className="px-4 py-3 font-medium">{item.name}</td>
                <td className="px-4 py-3">{formatWeight(item.stockGrams)}</td>
                <td className="px-4 py-3">{formatMoney(item.salePricePerKg)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
