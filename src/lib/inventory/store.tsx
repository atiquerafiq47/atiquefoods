"use client";

import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import { saleLineCost } from "@/lib/inventory/kpis";
import { priceForGrams } from "@/lib/inventory/units";
import type {
  Customer,
  Item,
  ReturnRecord,
  Sale,
  SaleLine,
  StockEntry,
} from "@/lib/inventory/types";

type InventoryState = {
  items: Item[];
  customers: Customer[];
  sales: Sale[];
  returns: ReturnRecord[];
  stockEntries: StockEntry[];
};

type AddStockInput = {
  name: string;
  grams: number;
  purchasePricePerKg: number;
  salePricePerKg: number;
};

type CreateSaleInput = {
  customerId: string;
  lines: { itemId: string; grams: number }[];
};

type CreateReturnInput = {
  saleId: string;
  lines: { itemId: string; grams: number }[];
};

type Action =
  | { type: "add-stock"; payload: AddStockInput }
  | { type: "add-customer"; payload: { name: string; phone: string } }
  | { type: "create-sale"; payload: CreateSaleInput & { saleId: string } }
  | { type: "create-return"; payload: CreateReturnInput & { returnId: string } };

const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();
const seedDate = "2026-09-26T10:00:00.000Z";

const initialState: InventoryState = {
  items: [
    {
      id: "item-rice",
      name: "Basmati Rice",
      stockGrams: 54000,
      purchasePricePerKg: 220,
      salePricePerKg: 280,
    },
    {
      id: "item-flour",
      name: "Wheat Flour",
      stockGrams: 70000,
      purchasePricePerKg: 110,
      salePricePerKg: 140,
    },
    {
      id: "item-sugar",
      name: "White Sugar",
      stockGrams: 24500,
      purchasePricePerKg: 150,
      salePricePerKg: 180,
    },
    {
      id: "item-lentils",
      name: "Red Lentils",
      stockGrams: 15750,
      purchasePricePerKg: 210,
      salePricePerKg: 260,
    },
  ],
  customers: [
    { id: "cust-ali", name: "Ali General Store", phone: "0300-1111111" },
    { id: "cust-city", name: "City Mart", phone: "0300-2222222" },
    { id: "cust-fresh", name: "Fresh Hub", phone: "0300-3333333" },
  ],
  sales: [
    {
      id: "sale-1",
      customerId: "cust-city",
      createdAt: "2026-09-10T10:00:00.000Z",
      lines: [
        { itemId: "item-rice", grams: 5000, amount: 1400, cost: 1100, returnedGrams: 2000 },
        { itemId: "item-sugar", grams: 2500, amount: 450, cost: 375, returnedGrams: 0 },
      ],
      total: 1850,
    },
    {
      id: "sale-2",
      customerId: "cust-city",
      createdAt: "2026-09-20T10:00:00.000Z",
      lines: [
        { itemId: "item-flour", grams: 10000, amount: 1400, cost: 1100, returnedGrams: 0 },
      ],
      total: 1400,
    },
    {
      id: "sale-3",
      customerId: "cust-ali",
      createdAt: "2026-09-18T10:00:00.000Z",
      lines: [
        { itemId: "item-lentils", grams: 3000, amount: 780, cost: 630, returnedGrams: 0 },
      ],
      total: 780,
    },
  ],
  returns: [
    {
      id: "return-1",
      saleId: "sale-1",
      customerId: "cust-city",
      createdAt: seedDate,
      lines: [{ itemId: "item-rice", grams: 2000, amount: 560 }],
      total: 560,
    },
  ],
  stockEntries: [
    { id: "in-1", itemId: "item-rice", grams: 52000, createdAt: seedDate, type: "in", cost: 11440 },
    { id: "in-2", itemId: "item-flour", grams: 80000, createdAt: seedDate, type: "in", cost: 8800 },
    { id: "in-3", itemId: "item-sugar", grams: 27000, createdAt: seedDate, type: "in", cost: 4050 },
    { id: "in-4", itemId: "item-lentils", grams: 18750, createdAt: seedDate, type: "in", cost: 3938 },
    { id: "out-1", itemId: "item-rice", grams: 5000, createdAt: seedDate, type: "out", cost: 1100 },
    { id: "out-1b", itemId: "item-sugar", grams: 2500, createdAt: seedDate, type: "out", cost: 375 },
    { id: "out-2", itemId: "item-flour", grams: 10000, createdAt: "2026-09-20T10:00:00.000Z", type: "out", cost: 1100 },
    { id: "out-3", itemId: "item-lentils", grams: 3000, createdAt: "2026-09-18T10:00:00.000Z", type: "out", cost: 630 },
    { id: "ret-1", itemId: "item-rice", grams: 2000, createdAt: seedDate, type: "return", cost: 440 },
  ],
};

function reducer(state: InventoryState, action: Action): InventoryState {
  if (action.type === "add-stock") {
    const name = action.payload.name.trim();
    const existing = state.items.find(
      (item) => item.name.toLowerCase() === name.toLowerCase(),
    );
    const createdAt = now();

    if (existing) {
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === existing.id
            ? {
                ...item,
                stockGrams: item.stockGrams + action.payload.grams,
                purchasePricePerKg: action.payload.purchasePricePerKg,
                salePricePerKg: action.payload.salePricePerKg,
              }
            : item,
        ),
        stockEntries: [
          {
            id: id(),
            itemId: existing.id,
            grams: action.payload.grams,
            createdAt,
            type: "in",
            cost: priceForGrams(
              action.payload.purchasePricePerKg,
              action.payload.grams,
            ),
          },
          ...state.stockEntries,
        ],
      };
    }

    const itemId = id();

    return {
      ...state,
      items: [
        ...state.items,
        {
          id: itemId,
          name,
          stockGrams: action.payload.grams,
          purchasePricePerKg: action.payload.purchasePricePerKg,
          salePricePerKg: action.payload.salePricePerKg,
        },
      ],
      stockEntries: [
        {
          id: id(),
          itemId,
          grams: action.payload.grams,
          createdAt,
          type: "in",
          cost: priceForGrams(
            action.payload.purchasePricePerKg,
            action.payload.grams,
          ),
        },
        ...state.stockEntries,
      ],
    };
  }

  if (action.type === "add-customer") {
    return {
      ...state,
      customers: [
        ...state.customers,
        {
          id: id(),
          name: action.payload.name.trim(),
          phone: action.payload.phone.trim(),
        },
      ],
    };
  }

  if (action.type === "create-return") {
    return returnReducer(state, action.payload);
  }

  const lines: SaleLine[] = action.payload.lines.map((line) => {
    const item = state.items.find((entry) => entry.id === line.itemId);

    return {
      itemId: line.itemId,
      grams: line.grams,
      amount: item ? priceForGrams(item.salePricePerKg, line.grams) : 0,
      cost: item ? priceForGrams(item.purchasePricePerKg, line.grams) : 0,
      returnedGrams: 0,
    };
  });

  const nextItems = state.items.map((item) => {
    const used = lines
      .filter((line) => line.itemId === item.id)
      .reduce((sum, line) => sum + line.grams, 0);

    return { ...item, stockGrams: item.stockGrams - used };
  });

  const createdAt = now();
  const sale: Sale = {
    id: action.payload.saleId,
    customerId: action.payload.customerId,
    createdAt,
    lines,
    total: lines.reduce((sum, line) => sum + line.amount, 0),
  };

  return {
    ...state,
    items: nextItems,
    sales: [sale, ...state.sales],
    stockEntries: [
      ...lines.map((line) => ({
        id: id(),
        itemId: line.itemId,
        grams: line.grams,
        createdAt,
        type: "out" as const,
        cost: line.cost,
      })),
      ...state.stockEntries,
    ],
  };
}

function returnReducer(
  state: InventoryState,
  payload: CreateReturnInput & { returnId: string },
): InventoryState {
  const sale = state.sales.find((entry) => entry.id === payload.saleId);

  if (!sale) {
    return state;
  }

  const createdAt = now();
  const returnLines = payload.lines.map((line) => {
    const saleLine = sale.lines.find((entry) => entry.itemId === line.itemId);
    const amount = saleLine
      ? Math.round((saleLine.amount * line.grams) / saleLine.grams)
      : 0;

    return {
      itemId: line.itemId,
      grams: line.grams,
      amount,
    };
  });

  const returnRecord: ReturnRecord = {
    id: payload.returnId,
    saleId: sale.id,
    customerId: sale.customerId,
    createdAt,
    lines: returnLines,
    total: returnLines.reduce((sum, line) => sum + line.amount, 0),
  };

  return {
    ...state,
    items: state.items.map((item) => {
      const added = returnLines
        .filter((line) => line.itemId === item.id)
        .reduce((sum, line) => sum + line.grams, 0);

      return { ...item, stockGrams: item.stockGrams + added };
    }),
    sales: state.sales.map((entry) =>
      entry.id === sale.id
        ? {
            ...entry,
            lines: entry.lines.map((line) => {
              const returned = returnLines
                .filter((item) => item.itemId === line.itemId)
                .reduce((sum, item) => sum + item.grams, 0);

              return { ...line, returnedGrams: line.returnedGrams + returned };
            }),
          }
        : entry,
    ),
    returns: [returnRecord, ...state.returns],
    stockEntries: [
      ...returnLines.map((line) => ({
        id: id(),
        itemId: line.itemId,
        grams: line.grams,
        createdAt,
        type: "return" as const,
        cost: saleLineCost(sale, line.itemId, line.grams),
      })),
      ...state.stockEntries,
    ],
  };
}

type InventoryContextValue = InventoryState & {
  addStock: (input: AddStockInput) => void;
  addCustomer: (name: string, phone: string) => void;
  createSale: (input: CreateSaleInput) => { error: string } | { saleId: string };
  createReturn: (input: CreateReturnInput) => { error: string } | { returnId: string };
};

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo<InventoryContextValue>(
    () => ({
      ...state,
      addStock: (input) => dispatch({ type: "add-stock", payload: input }),
      addCustomer: (name, phone) =>
        dispatch({ type: "add-customer", payload: { name, phone } }),
      createSale: (input) => {
        if (input.lines.length === 0) {
          return { error: "Add at least one item." };
        }

        for (const line of input.lines) {
          const item = state.items.find((entry) => entry.id === line.itemId);

          if (!item) {
            return { error: "Item not found." };
          }

          if (line.grams <= 0) {
            return { error: `Enter kg or grams for ${item.name}.` };
          }

          if (line.grams > item.stockGrams) {
            return { error: `Not enough stock for ${item.name}.` };
          }
        }

        const saleId = id();
        dispatch({ type: "create-sale", payload: { ...input, saleId } });
        return { saleId };
      },
      createReturn: (input) => {
        const sale = state.sales.find((entry) => entry.id === input.saleId);

        if (!sale) {
          return { error: "Sale not found." };
        }

        if (input.lines.length === 0) {
          return { error: "Add at least one returned item." };
        }

        for (const line of input.lines) {
          const saleLine = sale.lines.find((entry) => entry.itemId === line.itemId);

          if (!saleLine) {
            return { error: "This item was not in the sale." };
          }

          if (line.grams <= 0) {
            return { error: "Enter kg or grams to return." };
          }

          const left = saleLine.grams - saleLine.returnedGrams;

          if (line.grams > left) {
            return { error: "Cannot return more than was sold." };
          }
        }

        const returnId = id();
        dispatch({ type: "create-return", payload: { ...input, returnId } });
        return { returnId };
      },
    }),
    [state],
  );

  return (
    <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);

  if (!context) {
    throw new Error("useInventory must be used inside InventoryProvider");
  }

  return context;
}
