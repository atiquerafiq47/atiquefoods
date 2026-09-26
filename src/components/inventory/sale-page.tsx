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
};

export function SalePage() {
  const router = useRouter();
  const { items, customers, createSale } = useInventory();
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [lines, setLines] = useState<DraftLine[]>([
    { key: "line-1", itemId: items[0]?.id ?? "", kg: "", grams: "" },
  ]);
  const [error, setError] = useState("");

  const preview = useMemo(
    () =>
      lines.map((line) => {
        const item = items.find((entry) => entry.id === line.itemId);
        const grams = toGrams(Number(line.kg), Number(line.grams));
        return {
          ...line,
          item,
          grams,
          amount: item ? priceForGrams(item.salePricePerKg, grams) : 0,
        };
      }),
    [items, lines],
  );

  const total = preview.reduce((sum, line) => sum + line.amount, 0);

  function updateLine(key: string, patch: Partial<DraftLine>) {
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const message = createSale({
      customerId,
      lines: preview
        .filter((line) => line.grams > 0)
        .map((line) => ({ itemId: line.itemId, grams: line.grams })),
    });

    if (message) {
      setError(message);
      return;
    }

    router.push("/data");
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">New sale</h1>
        <p className="mt-1 text-zinc-600">
          Sell items by kg and grams. Stock goes down after you save.
        </p>
      </header>

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
                onChange={(event) => updateLine(line.key, { itemId: event.target.value })}
                className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:border-emerald-500"
              >
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {formatWeight(item.stockGrams)} in stock
                  </option>
                ))}
              </select>
            </label>

            <WeightInput
              kg={line.kg}
              grams={line.grams}
              onKgChange={(value) => updateLine(line.key, { kg: value })}
              onGramsChange={(value) => updateLine(line.key, { grams: value })}
            />

            <p className="text-sm text-zinc-500">
              Line total: {formatMoney(line.amount)}
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
                itemId: items[0]?.id ?? "",
                kg: "",
                grams: "",
              },
            ])
          }
          className="h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium"
        >
          Add another item
        </button>

        <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-5 py-4">
          <p className="font-medium">Sale total</p>
          <p className="text-xl font-semibold text-emerald-700">{formatMoney(total)}</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="h-11 w-full rounded-xl bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Complete sale
        </button>
      </form>
    </main>
  );
}
