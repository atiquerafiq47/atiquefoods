import Link from "next/link";
import { formatMoney } from "@/lib/dashboard/sample-data";

type CustomerBar = {
  title: string;
  subtitle: string;
  value: number;
};

type CustomerBarsProps = {
  heading: string;
  items: CustomerBar[];
};

const COLORS = ["#059669", "#0d9488", "#14b8a6"];

export function CustomerBars({ heading, items }: CustomerBarsProps) {
  const rows = items.slice(0, 3);
  const max = Math.max(...rows.map((item) => item.value), 1);
  const width = 420;
  const height = 380;
  const padding = { top: 40, right: 16, bottom: 58, left: 16 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const slot = chartWidth / Math.max(rows.length, 1);
  const barWidth = Math.min(70, slot * 0.48);

  return (
    <section className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-5">
      <h2 className="text-sm font-medium text-zinc-500">{heading}</h2>

      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-6">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-72 w-full flex-1 sm:min-h-[22rem]"
        >
          <defs>
            {COLORS.map((color, index) => (
              <linearGradient
                key={color}
                id={`customerBar-${index}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={color} />
                <stop offset="100%" stopColor={color} stopOpacity="0.7" />
              </linearGradient>
            ))}
          </defs>

          {[0.25, 0.5, 0.75, 1].map((line) => {
            const y = padding.top + chartHeight * (1 - line);
            return (
              <line
                key={line}
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="#f4f4f5"
                strokeWidth="1"
              />
            );
          })}

          {rows.map((item, index) => {
            const barHeight = Math.max(12, (item.value / max) * chartHeight);
            const x = padding.left + slot * index + (slot - barWidth) / 2;
            const y = padding.top + chartHeight - barHeight;
            const label = item.title.split(" ")[0] ?? item.title;

            return (
              <g key={item.title}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="16"
                  fill={`url(#customerBar-${index})`}
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 12}
                  textAnchor="middle"
                  className="fill-zinc-900"
                  fontSize="13"
                  fontWeight="600"
                >
                  {formatMoney(item.value)}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={height - 28}
                  textAnchor="middle"
                  className="fill-zinc-800"
                  fontSize="13"
                  fontWeight="600"
                >
                  {label}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={height - 10}
                  textAnchor="middle"
                  className="fill-zinc-500"
                  fontSize="11"
                >
                  {item.subtitle}
                </text>
              </g>
            );
          })}
        </svg>

        <ol className="space-y-3">
          {rows.map((item, index) => (
            <li
              key={item.title}
              className="flex items-start gap-3 rounded-xl bg-zinc-50 px-3 py-3"
            >
              <span
                className="mt-1 h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: COLORS[index] }}
              />
              <div className="min-w-0">
                <p className="truncate font-medium">{item.title}</p>
                <p className="text-sm text-zinc-500">
                  {item.subtitle} · {formatMoney(item.value)}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <Link
          href="/customers"
          className="mt-auto inline-flex h-11 w-full items-center justify-center rounded-xl border border-zinc-200 text-sm font-medium hover:bg-zinc-50"
        >
          View all
        </Link>
      </div>
    </section>
  );
}
