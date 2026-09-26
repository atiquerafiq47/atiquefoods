"use client";

import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import { priceForGrams } from "@/lib/inventory/units";
import type { Customer, Item, Sale, SaleLine, StockEntry } from "@/lib/inventory/types";

type InventoryState = {
  items: Item[];
  customers: Customer[];
  sales: Sale[];
  stockEntries: StockEntry[];
};

type AddStockInput = {
  name: string;
  grams: number;
  salePricePerKg: number;
};

type CreateSaleInput = {
  customerId: string;
  lines: { itemId: string; grams: number }[];
};

type Action =
  | { type: "add-stock"; payload: AddStockInput }
  | { type: "add-customer"; payload: { name: string; phone: string } }
  | { type: "create-sale"; payload: CreateSaleInput };

const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();

const initialState: InventoryState = {
  items: [
    { id: "item-rice", name: "Basmati Rice", stockGrams: 52000, salePricePerKg: 280 },
    { id: "item-flour", name: "Wheat Flour", stockGrams: 80000, salePricePerKg: 140 },
    { id: "item-sugar", name: "White Sugar", stockGrams: 24500, salePricePerKg: 180 },
    { id: "item-lentils", name: "Red Lentils", stockGrams: 18750, salePricePerKg: 260 },
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
      createdAt: now(),
      lines: [
        { itemId: "item-rice", grams: 5000, amount: 1400 },
        { itemId: "item-sugar", grams: 2500, amount: 450 },
      ],
      total: 1850,
    },
  ],
  stockEntries: [
    { id: "in-1", itemId: "item-rice", grams: 52000, createdAt: now(), type: "in" },
    { id: "in-2", itemId: "item-flour", grams: 80000, createdAt: now(), type: "in" },
    { id: "in-3", itemId: "item-sugar", grams: 27000, createdAt: now(), type: "in" },
    { id: "out-1", itemId: "item-rice", grams: 5000, createdAt: now(), type: "out" },
    { id: "out-1b", itemId: "item-sugar", grams: 2500, createdAt: now(), type: "out" },
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

  const lines: SaleLine[] = action.payload.lines.map((line) => {
    const item = state.items.find((entry) => entry.id === line.itemId);

    return {
      itemId: line.itemId,
      grams: line.grams,
      amount: item ? priceForGrams(item.salePricePerKg, line.grams) : 0,
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
    id: id(),
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
      })),
      ...state.stockEntries,
    ],
  };
}

type InventoryContextValue = InventoryState & {
  addStock: (input: AddStockInput) => void;
  addCustomer: (name: string, phone: string) => void;
  createSale: (input: CreateSaleInput) => string | null;
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
          return "Add at least one item.";
        }

        for (const line of input.lines) {
          const item = state.items.find((entry) => entry.id === line.itemId);

          if (!item) {
            return "Item not found.";
          }

          if (line.grams <= 0) {
            return `Enter kg or grams for ${item.name}.`;
          }

          if (line.grams > item.stockGrams) {
            return `Not enough stock for ${item.name}.`;
          }
        }

        dispatch({ type: "create-sale", payload: input });
        return null;
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
