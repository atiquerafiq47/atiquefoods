"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WeightInput } from "@/components/ui/weight-input";
import { useInventory } from "@/lib/inventory/store";
import { toGrams } from "@/lib/inventory/units";

export function AddStockPage() {
  const router = useRouter();
  const { items, addStock } = useInventory();
  const [name, setName] = useState(items[0]?.name ?? "");
  const [kg, setKg] = useState("");
  const [grams, setGrams] = useState("");
  const [price, setPrice] = useState(String(items[0]?.salePricePerKg ?? ""));
  const [error, setError] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const itemName = name.trim();
    const weight = toGrams(Number(kg), Number(grams));
    const salePricePerKg = Number(price);

    if (!itemName) {
      setError("Write the item name.");
      return;
    }

    if (weight <= 0) {
      setError("Add weight in kg or grams.");
      return;
    }

    if (!salePricePerKg || salePricePerKg <= 0) {
      setError("Add sale price per kg.");
      return;
    }

    addStock({ name: itemName, grams: weight, salePricePerKg });
    router.push("/inventory");
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-6 py-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Add stock</h1>
        <p className="mt-1 text-zinc-600">
          Add a new item or put more stock on an old item. Use kg and grams.
        </p>
      </header>

      <form
        onSubmit={submit}
        className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5"
      >
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
          Item name
          <input
            list="item-names"
            value={name}
            onChange={(event) => {
              const nextName = event.target.value;
              setName(nextName);
              const match = items.find(
                (item) => item.name.toLowerCase() === nextName.toLowerCase(),
              );
              if (match) {
                setPrice(String(match.salePricePerKg));
              }
            }}
            className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:border-emerald-500"
            placeholder="Basmati Rice"
          />
          <datalist id="item-names">
            {items.map((item) => (
              <option key={item.id} value={item.name} />
            ))}
          </datalist>
        </label>

        <WeightInput
          kg={kg}
          grams={grams}
          onKgChange={setKg}
          onGramsChange={setGrams}
        />

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
          Sale price per kg
          <input
            type="number"
            min="1"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:border-emerald-500"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="h-11 w-full rounded-xl bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Save stock
        </button>
      </form>
    </main>
  );
}
