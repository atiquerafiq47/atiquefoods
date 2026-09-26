import { formatMoney } from "@/lib/dashboard/sample-data";
import type { DailySale } from "@/lib/dashboard/types";

type Point = {
  day: number;
  amount: number;
  x: number;
  y: number;
};

type SalesChartProps = {
  days: DailySale[];
};

function curvePath(points: Point[]) {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  const dx = points.slice(0, -1).map((point, index) => points[index + 1].x - point.x);
  const slope = points.slice(0, -1).map((point, index) => {
    const run = dx[index] || 1;
    return (points[index + 1].y - point.y) / run;
  });
  const tangents = points.map((_, index) => {
    if (index === 0) {
      return slope[0] ?? 0;
    }

    if (index === points.length - 1) {
      return slope[index - 1] ?? 0;
    }

    if ((slope[index - 1] ?? 0) * (slope[index] ?? 0) <= 0) {
      return 0;
    }

    return ((slope[index - 1] ?? 0) + (slope[index] ?? 0)) / 2;
  });

  slope.forEach((value, index) => {
    if (Math.abs(value) < 0.0001) {
      tangents[index] = 0;
      tangents[index + 1] = 0;
      return;
    }

    const a = (tangents[index] ?? 0) / value;
    const b = (tangents[index + 1] ?? 0) / value;
    const hyp = a * a + b * b;

    if (hyp > 9) {
      const scale = 3 / Math.sqrt(hyp);
      tangents[index] = scale * a * value;
      tangents[index + 1] = scale * b * value;
    }
  });

  const segments = points.slice(0, -1).map((point, index) => {
    const next = points[index + 1];
    const run = dx[index] || 1;
    const c1x = point.x + run / 3;
    const c1y = point.y + ((tangents[index] ?? 0) * run) / 3;
    const c2x = next.x - run / 3;
    const c2y = next.y - ((tangents[index + 1] ?? 0) * run) / 3;

    return `C ${c1x} ${c1y} ${c2x} ${c2y} ${next.x} ${next.y}`;
  });

  return `M ${points[0].x} ${points[0].y} ${segments.join(" ")}`;
}

export function SalesChart({ days }: SalesChartProps) {
  const width = 1200;
  const height = 360;
  const padding = { top: 24, right: 24, bottom: 36, left: 24 };
  const maxAmount = Math.max(...days.map((day) => day.amount), 1);
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const baseline = padding.top + chartHeight;

  const points = days.map((day, index) => {
    const x =
      padding.left +
      (days.length === 1 ? chartWidth / 2 : (index / (days.length - 1)) * chartWidth);
    const y = padding.top + chartHeight - (day.amount / maxAmount) * chartHeight;

    return { ...day, x, y };
  });

  const curvePoints = points.filter(
    (point, index) =>
      index === 0 || index === points.length - 1 || point.amount > 0,
  );
  const line = curvePath(curvePoints);
  const area = `${line} L ${curvePoints[curvePoints.length - 1]?.x ?? 0} ${baseline} L ${curvePoints[0]?.x ?? 0} ${baseline} Z`;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-56 w-full sm:h-80 md:h-96"
      >
        <defs>
          <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ecfdf5" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#salesFill)" />
        <path
          d={line}
          fill="none"
          stroke="#059669"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points
          .filter((point) => point.amount > 0)
          .map((point) => (
            <circle
              key={point.day}
              cx={point.x}
              cy={point.y}
              r="5"
              fill="#047857"
              stroke="#ffffff"
              strokeWidth="2"
            >
              <title>{`${point.day}: ${formatMoney(point.amount)}`}</title>
            </circle>
          ))}
        {points.map((point) =>
          point.day === 1 || point.day % 5 === 0 || point.day === days.length ? (
            <text
              key={`label-${point.day}`}
              x={point.x}
              y={height - 8}
              textAnchor="middle"
              className="fill-zinc-500"
              fontSize="12"
            >
              {point.day}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}
