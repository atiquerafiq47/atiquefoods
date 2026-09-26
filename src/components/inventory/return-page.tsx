"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { WeightInput } from "@/components/ui/weight-input";
import { formatMoney } from "@/lib/dashboard/sample-data";
import { useInventory } from "@/lib/inventory/store";
import { formatWeight, toGrams } from "@/lib/inventory/units";

export function ReturnPage() {
  const router = useRouter();
  const { sales, items, customers, createReturn } = useInventory();
  const [saleId, setSaleId] = useState(sales[0]?.id ?? "");
  const [weights, setWeights] = useState<Record<string, { kg: string; grams: string }>>(
    {},
  );
  const [error, setError] = useState("");

  const sale = sales.find((entry) => entry.id === saleId);
  const customer = customers.find((entry) => entry.id === sale?.customerId);

  const lines = useMemo(
    () =>
      (sale?.lines ?? []).map((line) => {
        const weight = weights[line.itemId] ?? { kg: "", grams: "" };
        const grams = toGrams(Number(weight.kg), Number(weight.grams));
        const left = line.grams - line.returnedGrams;
        const amount = line.grams > 0 ? Math.round((line.amount * grams) / line.grams) : 0;

        return {
          itemId: line.itemId,
          soldGrams: line.grams,
          returnedGrams: line.returnedGrams,
          name: items.find((item) => item.id === line.itemId)?.name ?? "Item",
          left,
          grams,
          amount,
          kg: weight.kg,
          gramsInput: weight.grams,
        };
      }),
    [items, sale, weights],
  );

  function submit(event: React.FormEvent) {
    event.preventDefault();

    const result = createReturn({
      saleId,
      lines: lines
        .filter((line) => line.grams > 0)
        .map((line) => ({ itemId: line.itemId, grams: line.grams })),
    });

    if ("error" in result) {
      setError(result.error);
      return;
    }

    router.push("/data");
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Returns</h1>
        <p className="mt-1 text-zinc-600">
          If goods came back, return them here. Stock goes back in kg and grams.
        </p>
      </header>

      <form noValidate onSubmit={submit} className="space-y-4">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5">
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
            Sale
            <select
              value={saleId}
              onChange={(event) => {
                setSaleId(event.target.value);
                setWeights({});
                setError("");
              }}
              className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:border-emerald-500"
            >
              {sales.map((entry) => {
                const name =
                  customers.find((item) => item.id === entry.customerId)?.name ??
                  "Customer";

                return (
                  <option key={entry.id} value={entry.id}>
                    {name} · {formatMoney(entry.total)}
                  </option>
                );
              })}
            </select>
          </label>
          {customer && (
            <p className="mt-3 text-sm text-zinc-500">Customer: {customer.name}</p>
          )}
        </section>

        {lines.map((line) => (
          <section
            key={line.itemId}
            className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5"
          >
            <div>
              <h2 className="font-medium">{line.name}</h2>
              <p className="text-sm text-zinc-500">
                Sold {formatWeight(line.soldGrams)} · already returned{" "}
                {formatWeight(line.returnedGrams)} · left {formatWeight(line.left)}
              </p>
            </div>

            <WeightInput
              kg={line.kg}
              grams={line.gramsInput}
              onKgChange={(value) =>
                setWeights((current) => ({
                  ...current,
                  [line.itemId]: { kg: value, grams: current[line.itemId]?.grams ?? "" },
                }))
              }
              onGramsChange={(value) =>
                setWeights((current) => ({
                  ...current,
                  [line.itemId]: { kg: current[line.itemId]?.kg ?? "", grams: value },
                }))
              }
            />

            <p className="text-sm text-zinc-500">Return amount: {formatMoney(line.amount)}</p>
          </section>
        ))}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="h-11 w-full rounded-xl bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Save return
        </button>
      </form>
    </main>
  );
}
