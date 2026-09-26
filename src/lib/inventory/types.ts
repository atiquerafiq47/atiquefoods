export type Item = {
  id: string;
  name: string;
  stockGrams: number;
  salePricePerKg: number;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
};

export type SaleLine = {
  itemId: string;
  grams: number;
  amount: number;
};

export type Sale = {
  id: string;
  customerId: string;
  createdAt: string;
  lines: SaleLine[];
  total: number;
};

export type StockEntry = {
  id: string;
  itemId: string;
  grams: number;
  createdAt: string;
  type: "in" | "out";
};
