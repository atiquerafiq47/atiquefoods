import { clampGrams } from "@/lib/inventory/units";

type WeightInputProps = {
  kg: string;
  grams: string;
  onKgChange: (value: string) => void;
  onGramsChange: (value: string) => void;
};

export function WeightInput({
  kg,
  grams,
  onKgChange,
  onGramsChange,
}: WeightInputProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
        Kilograms
        <input
          type="number"
          min="0"
          step="1"
          value={kg}
          onChange={(event) => onKgChange(event.target.value)}
          className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-zinc-900 outline-none focus:border-emerald-500"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
        Grams
        <input
          type="number"
          min="0"
          step="1"
          value={grams}
          onChange={(event) => onGramsChange(clampGrams(event.target.value))}
          className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-zinc-900 outline-none focus:border-emerald-500"
        />
      </label>
    </div>
  );
}
