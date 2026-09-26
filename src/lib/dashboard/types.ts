export type DailySale = {
  day: number;
  amount: number;
};

export type TopItem = {
  name: string;
  sold: number;
  revenue: number;
};

export type TopCustomer = {
  name: string;
  orders: number;
  spent: number;
};

export type MonthDashboard = {
  year: number;
  month: number;
  days: DailySale[];
  topItems: TopItem[];
  topCustomers: TopCustomer[];
};
