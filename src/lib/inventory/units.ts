export function toGrams(kg: number, grams: number) {
  const safeKg = Number.isFinite(kg) ? Math.max(0, kg) : 0;
  const safeGrams = Number.isFinite(grams) ? Math.max(0, grams) : 0;
  return Math.round(safeKg * 1000 + safeGrams);
}

export function formatWeight(grams: number) {
  const safe = Math.max(0, Math.round(grams));
  const kg = Math.floor(safe / 1000);
  const remaining = safe % 1000;

  if (kg > 0 && remaining > 0) {
    return `${kg} kg ${remaining} g`;
  }

  if (kg > 0) {
    return `${kg} kg`;
  }

  return `${remaining} g`;
}

export function priceForGrams(pricePerKg: number, grams: number) {
  return Math.round((pricePerKg * grams) / 1000);
}
