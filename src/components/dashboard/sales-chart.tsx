import { formatMoney } from "@/lib/dashboard/sample-data";
import type { DailySale } from "@/lib/dashboard/types";

type SalesChartProps = {
  days: DailySale[];
};

export function SalesChart({ days }: SalesChartProps) {
  const width = 800;
  const height = 240;
  const padding = { top: 16, right: 16, bottom: 28, left: 16 };
  const maxAmount = Math.max(...days.map((day) => day.amount), 1);
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = days.map((day, index) => {
    const x =
      padding.left +
      (days.length === 1 ? chartWidth / 2 : (index / (days.length - 1)) * chartWidth);
    const y =
      padding.top + chartHeight - (day.amount / maxAmount) * chartHeight;

    return { ...day, x, y };
  });

  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`)
    .join(" ");

  const area = `${line} L${points[points.length - 1]?.x ?? 0} ${padding.top + chartHeight} L${points[0]?.x ?? 0} ${padding.top + chartHeight} Z`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full">
        <path d={area} fill="#d1fae5" />
        <path d={line} fill="none" stroke="#10b981" strokeWidth="3" />
        {points.map((point) => (
          <circle
            key={point.day}
            cx={point.x}
            cy={point.y}
            r="3.5"
            fill="#059669"
          >
            <title>{`${point.day}: ${formatMoney(point.amount)}`}</title>
          </circle>
        ))}
        {points.map((point) =>
          point.day === 1 || point.day % 5 === 0 || point.day === days.length ? (
            <text
              key={`label-${point.day}`}
              x={point.x}
              y={height - 6}
              textAnchor="middle"
              className="fill-zinc-500"
              fontSize="10"
            >
              {point.day}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}
