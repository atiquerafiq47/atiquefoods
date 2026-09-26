"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { getSiteName } from "@/lib/env";
import { buildBillData, createBillPdf, downloadBillPdf } from "@/lib/inventory/bill-pdf";
import { useInventory } from "@/lib/inventory/store";

export function BillPage() {
  const params = useParams<{ id: string }>();
  const { items, customers, sales } = useInventory();
  const sale = sales.find((entry) => entry.id === params.id);
  const customer = customers.find((entry) => entry.id === sale?.customerId);
  const siteName = getSiteName();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const bill = useMemo(() => {
    if (!sale || !customer) {
      return null;
    }

    return buildBillData({
      siteName,
      saleId: sale.id,
      createdAt: sale.createdAt,
      customerName: customer.name,
      customerPhone: customer.phone,
      lines: sale.lines.map((line) => ({
        name: items.find((item) => item.id === line.itemId)?.name ?? "Item",
        grams: line.grams,
        amount: line.amount,
      })),
      total: sale.total,
    });
  }, [customer, items, sale, siteName]);

  if (!sale || !customer || !bill) {
    return (
      <main className="px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="text-3xl font-semibold">Bill not found</h1>
        <Link href="/sales" className="mt-4 inline-block text-emerald-700">
          Back to new sale
        </Link>
      </main>
    );
  }

  return (
    <main className="flex w-full flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Sale bill</h1>
          <p className="mt-1 text-zinc-600">Preview the bill or download it as PDF.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
                return;
              }

              setPreviewUrl(URL.createObjectURL(createBillPdf(bill)));
            }}
            className="h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium"
          >
            {previewUrl ? "Hide PDF preview" : "Preview PDF"}
          </button>
          <button
            type="button"
            onClick={() => downloadBillPdf(bill)}
            className="h-11 rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Download PDF
          </button>
        </div>
      </header>

      <section className="w-full rounded-2xl border border-zinc-200 bg-white p-8">
        <p className="text-sm font-medium text-zinc-500">{bill.siteName}</p>
        <h2 className="mt-1 text-2xl font-semibold">Sale Bill</h2>
        <div className="mt-4 grid gap-1 text-sm text-zinc-600">
          <p>Bill No: {bill.billNo}</p>
          <p>Date: {bill.date}</p>
          <p>Customer: {bill.customerName}</p>
          <p>Phone: {bill.customerPhone}</p>
        </div>

        <table className="mt-6 w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500">
            <tr>
              <th className="py-2 font-medium">Item</th>
              <th className="py-2 font-medium">Weight</th>
              <th className="py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bill.lines.map((line) => (
              <tr key={`${line.name}-${line.weight}`} className="border-b border-zinc-100">
                <td className="py-3 font-medium">{line.name}</td>
                <td className="py-3">{line.weight}</td>
                <td className="py-3 text-right">{line.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex items-center justify-between">
          <p className="font-medium">Total</p>
          <p className="text-2xl font-semibold text-emerald-700">{bill.total}</p>
        </div>
      </section>

      {previewUrl && (
        <section className="w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <iframe
            title="Bill PDF preview"
            src={previewUrl}
            className="h-[80vh] w-full"
          />
        </section>
      )}
    </main>
  );
}
