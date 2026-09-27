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
};

type CreateSaleInput = {
  customerId: string;
  lines: { itemId: string; grams: number; salePricePerKg: number }[];
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

const initialState: InventoryState = {
  items: [],
  customers: [],
  sales: [],
  returns: [],
  stockEntries: [],
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
          salePricePerKg: 0,
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
      amount: priceForGrams(line.salePricePerKg, line.grams),
      cost: item ? priceForGrams(item.purchasePricePerKg, line.grams) : 0,
      returnedGrams: 0,
    };
  });

  const lastSalePrice = new Map<string, number>();
  action.payload.lines.forEach((line) => {
    lastSalePrice.set(line.itemId, line.salePricePerKg);
  });

  const nextItems = state.items.map((item) => {
    const used = lines
      .filter((line) => line.itemId === item.id)
      .reduce((sum, line) => sum + line.grams, 0);

    return {
      ...item,
      stockGrams: item.stockGrams - used,
      salePricePerKg: lastSalePrice.get(item.id) ?? item.salePricePerKg,
    };
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
        if (!input.customerId) {
          return { error: "Add a customer first." };
        }

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

          if (!line.salePricePerKg || line.salePricePerKg <= 0) {
            return { error: `Add sale price per kg for ${item.name}.` };
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
