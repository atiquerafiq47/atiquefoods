import type {
  Customer,
  Item,
  ReturnRecord,
  Sale,
  StockEntry,
} from "@/lib/inventory/types";

export const ALL_TIME = 0;

function inMonth(iso: string, year: number, month: number) {
  const date = new Date(iso);
  return date.getFullYear() === year && date.getMonth() + 1 === month;
}

function inPeriod(iso: string, year: number, month: number) {
  if (month === ALL_TIME) {
    return true;
  }

  return inMonth(iso, year, month);
}

function isNewSale(sale: Sale, allSales: Sale[]) {
  return !allSales.some(
    (entry) =>
      entry.customerId === sale.customerId &&
      entry.createdAt < sale.createdAt,
  );
}

export function saleLineCost(sale: Sale, itemId: string, grams: number) {
  const line = sale.lines.find((entry) => entry.itemId === itemId);

  if (!line || line.grams <= 0) {
    return 0;
  }

  return Math.round((line.cost * grams) / line.grams);
}

export function getMonthKpis(
  sales: Sale[],
  returns: ReturnRecord[],
  stockEntries: StockEntry[],
  year: number,
  month: number,
) {
  const monthSales = sales.filter((sale) =>
    inPeriod(sale.createdAt, year, month),
  );
  const monthReturns = returns.filter((entry) =>
    inPeriod(entry.createdAt, year, month),
  );
  const monthStockIn = stockEntries.filter(
    (entry) => entry.type === "in" && inPeriod(entry.createdAt, year, month),
  );

  const newSales = monthSales.filter((sale) => isNewSale(sale, sales));
  const upSales = monthSales.filter((sale) => !isNewSale(sale, sales));
  const saleAmount = monthSales.reduce((sum, sale) => sum + sale.total, 0);
  const saleCost = monthSales.reduce(
    (sum, sale) =>
      sum + sale.lines.reduce((lineSum, line) => lineSum + line.cost, 0),
    0,
  );
  const returnAmount = monthReturns.reduce((sum, entry) => sum + entry.total, 0);
  const returnCost = monthReturns.reduce((sum, entry) => {
    const sale = sales.find((item) => item.id === entry.saleId);

    if (!sale) {
      return sum;
    }

    return (
      sum +
      entry.lines.reduce(
        (lineSum, line) => lineSum + saleLineCost(sale, line.itemId, line.grams),
        0,
      )
    );
  }, 0);

  return {
    totalMonthlySale: saleAmount,
    newSale: newSales.reduce((sum, sale) => sum + sale.total, 0),
    upSale: upSales.reduce((sum, sale) => sum + sale.total, 0),
    returns: returnAmount,
    returnedGrams: monthReturns.reduce(
      (sum, entry) =>
        sum + entry.lines.reduce((lineSum, line) => lineSum + line.grams, 0),
      0,
    ),
    profit: saleAmount - saleCost - returnAmount + returnCost,
    investment: monthStockIn.reduce((sum, entry) => sum + entry.cost, 0),
  };
}

export function getMonthTopItems(
  sales: Sale[],
  items: Item[],
  year: number,
  month: number,
) {
  const totals = new Map<string, { grams: number; revenue: number }>();

  sales
    .filter((sale) => inPeriod(sale.createdAt, year, month))
    .forEach((sale) => {
      sale.lines.forEach((line) => {
        const current = totals.get(line.itemId) ?? { grams: 0, revenue: 0 };
        totals.set(line.itemId, {
          grams: current.grams + line.grams,
          revenue: current.revenue + line.amount,
        });
      });
    });

  return [...totals.entries()]
    .map(([itemId, total]) => ({
      id: itemId,
      name: items.find((item) => item.id === itemId)?.name ?? "Item",
      soldGrams: total.grams,
      revenue: total.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3);
}

export function getMonthTopCustomers(
  sales: Sale[],
  customers: Customer[],
  year: number,
  month: number,
) {
  const totals = new Map<string, { orders: number; spent: number }>();

  sales
    .filter((sale) => inPeriod(sale.createdAt, year, month))
    .forEach((sale) => {
      const current = totals.get(sale.customerId) ?? { orders: 0, spent: 0 };
      totals.set(sale.customerId, {
        orders: current.orders + 1,
        spent: current.spent + sale.total,
      });
    });

  return [...totals.entries()]
    .map(([customerId, total]) => ({
      id: customerId,
      name:
        customers.find((customer) => customer.id === customerId)?.name ??
        "Customer",
      orders: total.orders,
      spent: total.spent,
    }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 3);
}

export function getMonthDailySales(
  sales: Sale[],
  year: number,
  month: number,
) {
  if (month === ALL_TIME) {
    return Array.from({ length: 12 }, (_, index) => ({
      day: index + 1,
      amount: sales
        .filter((sale) => {
          const date = new Date(sale.createdAt);
          return date.getFullYear() === year && date.getMonth() === index;
        })
        .reduce((sum, sale) => sum + sale.total, 0),
    }));
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const amounts = Array.from({ length: daysInMonth }, () => 0);

  sales
    .filter((sale) => inMonth(sale.createdAt, year, month))
    .forEach((sale) => {
      const day = new Date(sale.createdAt).getDate();
      amounts[day - 1] += sale.total;
    });

  return amounts.map((amount, index) => ({
    day: index + 1,
    amount,
  }));
}
