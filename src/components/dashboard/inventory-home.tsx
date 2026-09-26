"use client";

import { useMemo, useState } from "react";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { OrbitChart } from "@/components/dashboard/orbit-chart";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { CustomerBars } from "@/components/dashboard/customer-bars";
import { formatMoney, getMonthOptions } from "@/lib/dashboard/sample-data";
import {
  ALL_TIME,
  getMonthDailySales,
  getMonthKpis,
  getMonthTopCustomers,
  getMonthTopItems,
} from "@/lib/inventory/kpis";
import { useInventory } from "@/lib/inventory/store";
import { formatWeight } from "@/lib/inventory/units";

type InventoryHomeProps = {
  siteName: string;
};

export function InventoryHome({ siteName }: InventoryHomeProps) {
  const now = new Date();
  const year = now.getFullYear();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const { sales, returns, items, customers, stockEntries } = useInventory();
  const options = useMemo(() => getMonthOptions(year), [year]);
  const allTime = month === ALL_TIME;
  const kpis = useMemo(
    () => getMonthKpis(sales, returns, stockEntries, year, month),
    [month, returns, sales, stockEntries, year],
  );
  const topItems = useMemo(
    () => getMonthTopItems(sales, items, year, month),
    [items, month, sales, year],
  );
  const topCustomers = useMemo(
    () => getMonthTopCustomers(sales, customers, year, month),
    [customers, month, sales, year],
  );
  const days = useMemo(
    () => getMonthDailySales(sales, year, month),
    [month, sales, year],
  );
  const topItemsRevenue = topItems.reduce((sum, item) => sum + item.revenue, 0);
  const monthLabel = allTime
    ? "All time"
    : options.find((option) => option.month === month)?.label ?? "";
  const totalSales = kpis.totalMonthlySale;

  return (
    <main className="flex w-full flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="hidden text-sm font-medium text-zinc-500 md:block">{siteName}</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Home</h1>
          <p className="text-sm text-zinc-600 sm:text-base">
            Sales, profit, investment, top items, and top customers.
          </p>
        </div>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
          Month
          <select
            value={month}
            onChange={(event) => setMonth(Number(event.target.value))}
            className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-zinc-900 outline-none focus:border-emerald-500 sm:min-w-48"
          >
            <option value={ALL_TIME}>All time</option>
            {options.map((option) => (
              <option key={option.month} value={option.month}>
                {option.label} {year}
              </option>
            ))}
          </select>
        </label>
      </header>

      <KpiCards kpis={kpis} allTime={allTime} />

      <section className="w-full rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-medium text-zinc-500">
              {allTime ? "Yearly sales" : "Monthly sales"}
            </h2>
            <p className="text-xl font-semibold">
              {allTime ? `${year}` : `${monthLabel} ${year}`}
            </p>
          </div>
          <p className="text-2xl font-semibold text-emerald-700">
            {formatMoney(totalSales)}
          </p>
        </div>
        <div className="w-full">
          <SalesChart days={days} />
        </div>
      </section>

      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        <OrbitChart
          heading="Top 3 selling items"
          centerValue={formatMoney(topItemsRevenue)}
          items={topItems.map((item) => ({
            title: item.name,
            subtitle: `${formatWeight(item.soldGrams)} sold · ${formatMoney(item.revenue)}`,
            value: item.revenue,
          }))}
        />
        <CustomerBars
          heading="Top 3 customers"
          items={topCustomers.map((customer) => ({
            title: customer.name,
            subtitle: `${customer.orders} ${customer.orders === 1 ? "order" : "orders"}`,
            value: customer.spent,
          }))}
        />
      </div>
    </main>
  );
}
