"use client";

import { useMemo, useState } from "react";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { TopList } from "@/components/dashboard/top-list";
import {
  formatMoney,
  getMonthDashboard,
  getMonthOptions,
} from "@/lib/dashboard/sample-data";

type InventoryHomeProps = {
  siteName: string;
};

export function InventoryHome({ siteName }: InventoryHomeProps) {
  const now = new Date();
  const year = now.getFullYear();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const options = useMemo(() => getMonthOptions(year), [year]);
  const dashboard = useMemo(() => getMonthDashboard(year, month), [year, month]);
  const monthLabel = options.find((option) => option.month === month)?.label ?? "";
  const totalSales = dashboard.days.reduce((sum, day) => sum + day.amount, 0);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-zinc-500">{siteName}</p>
          <h1 className="text-3xl font-semibold tracking-tight">Home</h1>
          <p className="text-zinc-600">
            Monthly sales line graph, top items, and top customers.
          </p>
        </div>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
          Month
          <select
            value={month}
            onChange={(event) => setMonth(Number(event.target.value))}
            className="h-11 min-w-48 rounded-xl border border-zinc-200 bg-white px-3 text-zinc-900 outline-none focus:border-emerald-500"
          >
            {options.map((option) => (
              <option key={option.month} value={option.month}>
                {option.label} {year}
              </option>
            ))}
          </select>
        </label>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-medium text-zinc-500">Monthly sales</h2>
            <p className="text-xl font-semibold">{monthLabel} {year}</p>
          </div>
          <p className="text-2xl font-semibold text-emerald-700">
            {formatMoney(totalSales)}
          </p>
        </div>
        <SalesChart days={dashboard.days} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <TopList
          heading="Top 3 selling items"
          items={dashboard.topItems.map((item) => ({
            title: item.name,
            subtitle: `${item.sold} kg sold · ${formatMoney(item.revenue)}`,
          }))}
        />
        <TopList
          heading="Top 3 customers"
          items={dashboard.topCustomers.map((customer) => ({
            title: customer.name,
            subtitle: `${customer.orders} orders · ${formatMoney(customer.spent)}`,
          }))}
        />
      </div>
    </main>
  );
}
