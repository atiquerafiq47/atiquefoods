import type { MonthDashboard, TopCustomer, TopItem } from "@/lib/dashboard/types";

const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const ITEM_NAMES = [
  "Basmati Rice 5kg",
  "Cooking Oil 1L",
  "Wheat Flour 10kg",
  "White Sugar 1kg",
  "Green Tea 200g",
  "Laundry Soap",
  "Salt 800g",
  "Red Lentils 1kg",
];

const CUSTOMER_NAMES = [
  "Ali General Store",
  "City Mart",
  "Fresh Hub",
  "Saeed Traders",
  "Corner Shop",
  "Green Valley",
];

function daysInMonth(year: number, month: number) {
  if (month === 2 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
    return 29;
  }

  return MONTH_DAYS[month - 1] ?? 30;
}

function seeded(year: number, month: number, salt: number) {
  const value = Math.sin(year * 12 + month * 17 + salt) * 10000;
  return value - Math.floor(value);
}

export function getMonthDashboard(year: number, month: number): MonthDashboard {
  const totalDays = daysInMonth(year, month);

  const days = Array.from({ length: totalDays }, (_, index) => {
    const day = index + 1;
    const weekendBoost = day % 7 === 0 || day % 7 === 6 ? 1.25 : 1;
    const amount = Math.round(
      (4200 + seeded(year, month, day) * 6800) * weekendBoost,
    );

    return { day, amount };
  });

  const itemOrder = [...ITEM_NAMES].sort(
    (a, b) =>
      seeded(year, month, a.length + 3) - seeded(year, month, b.length + 8),
  );

  const topItems: TopItem[] = itemOrder.slice(0, 3).map((name, index) => {
    const sold = Math.round(180 - index * 36 + seeded(year, month, index + 20) * 40);
    return {
      name,
      sold,
      revenue: sold * (220 + index * 45),
    };
  });

  const customerOrder = [...CUSTOMER_NAMES].sort(
    (a, b) =>
      seeded(year, month, a.charCodeAt(0)) - seeded(year, month, b.charCodeAt(0)),
  );

  const topCustomers: TopCustomer[] = customerOrder.slice(0, 3).map((name, index) => {
    const orders = Math.round(28 - index * 6 + seeded(year, month, index + 40) * 8);
    return {
      name,
      orders,
      spent: orders * (1850 + index * 320),
    };
  });

  return { year, month, days, topItems, topCustomers };
}

export function getMonthOptions(year: number) {
  return Array.from({ length: 12 }, (_, index) => ({
    year,
    month: index + 1,
    label: new Date(year, index, 1).toLocaleString("en-US", { month: "long" }),
  }));
}

export function formatMoney(amount: number) {
  return `Rs ${amount.toLocaleString("en-PK")}`;
}
