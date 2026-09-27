"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/dashboard/sample-data";
import { useInventory } from "@/lib/inventory/store";
import { formatWeight } from "@/lib/inventory/units";

function StockStatus({ grams }: { grams: number }) {
  if (grams <= 0) {
    return <span className="font-medium text-red-600">Out of stock</span>;
  }

  return <span>{formatWeight(grams)}</span>;
}

export function InventoryPage() {
  const { items } = useInventory();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Inventory</h1>
          <p className="mt-1 text-zinc-600">All items in kilograms and grams.</p>
        </div>
        <Link
          href="/inventory/add"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Add stock
        </Link>
      </header>

      {items.length === 0 && (
        <p className="rounded-2xl border border-zinc-200 bg-white px-4 py-8 text-center text-zinc-500">
          No items yet. Add stock to start.
        </p>
      )}

      <section className="space-y-3 md:hidden">
        {items.map((item) => {
          const empty = item.stockGrams <= 0;

          return (
            <article
              key={item.id}
              className={`rounded-2xl border p-4 ${
                empty ? "border-red-200 bg-red-50" : "border-zinc-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className={`font-medium ${empty ? "text-red-700" : ""}`}>{item.name}</p>
                <StockStatus grams={item.stockGrams} />
              </div>
              <p className="mt-2 text-sm text-zinc-500">
                Buy {formatMoney(item.purchasePricePerKg)} / kg
              </p>
            </article>
          );
        })}
      </section>

      <section className="hidden overflow-x-auto rounded-2xl border border-zinc-200 bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Buy / kg</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const empty = item.stockGrams <= 0;

              return (
                <tr
                  key={item.id}
                  className={`border-t ${empty ? "border-red-100 bg-red-50" : "border-zinc-100"}`}
                >
                  <td className={`px-4 py-3 font-medium ${empty ? "text-red-700" : ""}`}>
                    {item.name}
                  </td>
                  <td className="px-4 py-3">
                    <StockStatus grams={item.stockGrams} />
                  </td>
                  <td className="px-4 py-3">{formatMoney(item.purchasePricePerKg)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </main>
  );
}
