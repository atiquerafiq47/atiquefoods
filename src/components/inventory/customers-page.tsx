"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/dashboard/sample-data";
import { useInventory } from "@/lib/inventory/store";

export function CustomersPage() {
  const { customers, sales, addCustomer } = useInventory();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Write the customer name.");
      return;
    }

    addCustomer(name, phone);
    setName("");
    setPhone("");
    setError("");
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Customers</h1>
        <p className="mt-1 text-zinc-600">People and shops you sell to.</p>
      </header>

      <form
        onSubmit={submit}
        className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-5 md:grid-cols-[1fr_1fr_auto]"
      >
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Customer name"
          className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:border-emerald-500"
        />
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Phone"
          className="h-11 rounded-xl border border-zinc-200 px-3 outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          className="h-11 rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Add customer
        </button>
        {error && <p className="text-sm text-red-600 md:col-span-3">{error}</p>}
      </form>

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Spent</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => {
              const customerSales = sales.filter((sale) => sale.customerId === customer.id);
              const spent = customerSales.reduce((sum, sale) => sum + sale.total, 0);

              return (
                <tr key={customer.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3 font-medium">{customer.name}</td>
                  <td className="px-4 py-3">{customer.phone || "-"}</td>
                  <td className="px-4 py-3">{customerSales.length}</td>
                  <td className="px-4 py-3">{formatMoney(spent)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </main>
  );
}
