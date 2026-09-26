"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/dashboard/sample-data";
import { useInventory } from "@/lib/inventory/store";
import { formatWeight } from "@/lib/inventory/units";

export function DataPage() {
  const { items, customers, sales, returns, stockEntries } = useInventory();

  function itemName(itemId: string) {
    return items.find((item) => item.id === itemId)?.name ?? "Item";
  }

  function customerName(customerId: string) {
    return customers.find((customer) => customer.id === customerId)?.name ?? "Customer";
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Data</h1>
        <p className="mt-1 text-zinc-600">Sales and stock movement in kg and grams.</p>
      </header>

      <section className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
        <h2 className="border-b border-zinc-100 px-4 py-3 font-medium">Sales</h2>
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Bill</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="border-t border-zinc-100">
                <td className="px-4 py-3 font-medium">{customerName(sale.customerId)}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {sale.lines
                    .map((line) => `${itemName(line.itemId)} ${formatWeight(line.grams)}`)
                    .join(", ")}
                </td>
                <td className="px-4 py-3">{formatMoney(sale.total)}</td>
                <td className="px-4 py-3">
                  <Link href={`/sales/${sale.id}/bill`} className="text-emerald-700">
                    View bill
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
        <h2 className="border-b border-zinc-100 px-4 py-3 font-medium">Returns</h2>
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {returns.map((entry) => (
              <tr key={entry.id} className="border-t border-zinc-100">
                <td className="px-4 py-3 font-medium">{customerName(entry.customerId)}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {entry.lines
                    .map((line) => `${itemName(line.itemId)} ${formatWeight(line.grams)}`)
                    .join(", ")}
                </td>
                <td className="px-4 py-3">{formatMoney(entry.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
        <h2 className="border-b border-zinc-100 px-4 py-3 font-medium">Stock movement</h2>
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Weight</th>
            </tr>
          </thead>
          <tbody>
            {stockEntries.map((entry) => (
              <tr key={entry.id} className="border-t border-zinc-100">
                <td className="px-4 py-3 font-medium capitalize">
                  {entry.type === "in"
                    ? "Stock in"
                    : entry.type === "return"
                      ? "Return in"
                      : "Sale out"}
                </td>
                <td className="px-4 py-3">{itemName(entry.itemId)}</td>
                <td className="px-4 py-3">{formatWeight(entry.grams)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
