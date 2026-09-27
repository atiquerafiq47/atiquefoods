"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { WeightInput } from "@/components/ui/weight-input";
import { formatMoney } from "@/lib/dashboard/sample-data";
import { useInventory } from "@/lib/inventory/store";
import { formatWeight, priceForGrams, toGrams } from "@/lib/inventory/units";

type DraftLine = {
  key: string;
  itemId: string;
  kg: string;
  grams: string;
  salePrice: string;
};

function lastSalePrice(items: { id: string; salePricePerKg: number }[], itemId: string) {
  const item = items.find((entry) => entry.id === itemId);
  return item && item.salePricePerKg > 0 ? String(item.salePricePerKg) : "";
}

export function SalePage() {
  const router = useRouter();
  const { items, customers, createSale } = useInventory();
  const firstItemId =
    items.find((item) => item.stockGrams > 0)?.id ?? items[0]?.id ?? "";
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [lines, setLines] = useState<DraftLine[]>([
    {
      key: "line-1",
      itemId: firstItemId,
      kg: "",
      grams: "",
      salePrice: lastSalePrice(items, firstItemId),
    },
  ]);
  const [error, setError] = useState("");

  const preview = useMemo(
    () =>
      lines.map((line) => {
        const item = items.find((entry) => entry.id === line.itemId);
        const weightGrams = toGrams(Number(line.kg), Number(line.grams));
        const salePricePerKg = Number(line.salePrice);
        return {
          ...line,
          item,
          weightGrams,
          salePricePerKg,
          amount: salePricePerKg > 0 ? priceForGrams(salePricePerKg, weightGrams) : 0,
          cost: item ? priceForGrams(item.purchasePricePerKg, weightGrams) : 0,
        };
      }),
    [items, lines],
  );

  const total = preview.reduce((sum, line) => sum + line.amount, 0);
  const profit = preview.reduce((sum, line) => sum + (line.amount - line.cost), 0);

  function updateLine(key: string, patch: Partial<DraftLine>) {
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const soldLines = preview.filter((line) => line.weightGrams > 0);

    if (soldLines.some((line) => !line.salePricePerKg || line.salePricePerKg <= 0)) {
      setError("Add sale price per kg for each item.");
      return;
    }

    const result = createSale({
      customerId,
      lines: preview
        .filter((line) => line.weightGrams > 0)
        .map((line) => ({
          itemId: line.itemId,
          grams: line.weightGrams,
          salePricePerKg: line.salePricePerKg,
        })),
    });

    if ("error" in result) {
      setError(result.error);
      return;
    }

    router.push(`/sales/${result.saleId}/bill`);
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">New sale</h1>
        <p className="mt-1 text-zinc-600">
          Sell items by kg and grams. Type the sale price for each item.
        </p>
      </header>

      {customers.length === 0 || items.length === 0 ? (
        <p className="rounded-2xl border border-zinc-200 bg-white px-4 py-8 text-center text-zinc-500">
          {customers.length === 0
            ? "Add a customer first."
            : "Add stock first."}
        </p>
      ) : (
      <form noValidate onSubmit={submit} className="space-y-4">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5">
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
            Customer
            <select
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
              className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:border-emerald-500"
            >
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </label>
        </section>

        {preview.map((line, index) => (
          <section
            key={line.key}
            className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Item {index + 1}</h2>
              {lines.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setLines((current) => current.filter((entry) => entry.key !== line.key))
                  }
                  className="text-sm text-zinc-500 hover:text-zinc-800"
                >
                  Remove
                </button>
              )}
            </div>

            <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
              Item
              <select
                value={line.itemId}
                onChange={(event) =>
                  updateLine(line.key, {
                    itemId: event.target.value,
                    salePrice: lastSalePrice(items, event.target.value),
                  })
                }
                className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:border-emerald-500"
              >
                {items.map((item) => (
                  <option key={item.id} value={item.id} disabled={item.stockGrams <= 0}>
                    {item.stockGrams <= 0
                      ? `${item.name} · Out of stock`
                      : `${item.name} · ${formatWeight(item.stockGrams)} in stock`}
                  </option>
                ))}
              </select>
            </label>
            {line.item && line.item.stockGrams <= 0 && (
              <p className="text-sm font-medium text-red-600">Out of stock</p>
            )}

            <WeightInput
              kg={line.kg}
              grams={line.grams}
              onKgChange={(value) => updateLine(line.key, { kg: value })}
              onGramsChange={(value) => updateLine(line.key, { grams: value })}
            />

            <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
              Sale price per kg
              <input
                type="number"
                min="1"
                value={line.salePrice}
                onChange={(event) =>
                  updateLine(line.key, { salePrice: event.target.value })
                }
                className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:border-emerald-500"
              />
            </label>

            <p className="text-sm text-zinc-500">
              Line total: {formatMoney(line.amount)} · Profit:{" "}
              {formatMoney(line.amount - line.cost)}
            </p>
          </section>
        ))}

        <button
          type="button"
          onClick={() =>
            setLines((current) => [
              ...current,
              {
                key: crypto.randomUUID(),
                itemId: items.find((item) => item.stockGrams > 0)?.id ?? items[0]?.id ?? "",
                kg: "",
                grams: "",
                salePrice: lastSalePrice(
                  items,
                  items.find((item) => item.stockGrams > 0)?.id ?? items[0]?.id ?? "",
                ),
              },
            ])
          }
          className="h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium"
        >
          Add another item
        </button>

        <div className="space-y-2 rounded-2xl border border-zinc-200 bg-white px-5 py-4">
          <div className="flex items-center justify-between">
            <p className="font-medium">Sale total</p>
            <p className="text-xl font-semibold text-emerald-700">
              {formatMoney(total)}
            </p>
          </div>
          <div className="flex items-center justify-between text-sm">
            <p className="text-zinc-500">Profit</p>
            <p className="font-medium text-zinc-800">{formatMoney(profit)}</p>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="h-11 w-full rounded-xl bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Complete sale
        </button>
      </form>
      )}
    </main>
  );
}
