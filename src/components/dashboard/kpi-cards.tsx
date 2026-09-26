import { formatMoney } from "@/lib/dashboard/sample-data";

type Kpi = {
  label: string;
  value: string;
  hint: string;
};

type KpiCardsProps = {
  allTime?: boolean;
  kpis: {
    totalMonthlySale: number;
    newSale: number;
    upSale: number;
    returns: number;
    returnedGrams: number;
    profit: number;
    investment: number;
  };
};

export function KpiCards({ kpis, allTime = false }: KpiCardsProps) {
  const scope = allTime ? "all time" : "this month";
  const cards: Kpi[] = [
    {
      label: "Total sale",
      value: formatMoney(kpis.totalMonthlySale),
      hint: `All sales ${scope}`,
    },
    {
      label: "Profit",
      value: formatMoney(kpis.profit),
      hint: `Sale money minus buy cost ${scope}`,
    },
    {
      label: "Investment",
      value: formatMoney(kpis.investment),
      hint: `Money spent on stock ${scope}`,
    },
    {
      label: "New sale",
      value: formatMoney(kpis.newSale),
      hint: "First sale to a customer",
    },
    {
      label: "Up sale",
      value: formatMoney(kpis.upSale),
      hint: "Extra sale to an old customer",
    },
    {
      label: "Returns",
      value: formatMoney(kpis.returns),
      hint: "Money for returned goods",
    },
  ];

  return (
    <section className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <article
          key={card.label}
          title={card.hint}
          className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-3 sm:p-4"
        >
          <p className="text-xs font-medium text-zinc-500 sm:text-sm">{card.label}</p>
          <p className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">
            {card.value}
          </p>
        </article>
      ))}
    </section>
  );
}
