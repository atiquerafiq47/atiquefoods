export type Item = {
  id: string;
  name: string;
  stockGrams: number;
  purchasePricePerKg: number;
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
  cost: number;
  returnedGrams: number;
};

export type ReturnLine = {
  itemId: string;
  grams: number;
  amount: number;
};

export type ReturnRecord = {
  id: string;
  saleId: string;
  customerId: string;
  createdAt: string;
  lines: ReturnLine[];
  total: number;
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
  type: "in" | "out" | "return";
  cost: number;
};
