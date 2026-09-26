"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type OrbitItem = {
  title: string;
  subtitle: string;
  value: number;
};

type OrbitChartProps = {
  heading: string;
  items: OrbitItem[];
  centerValue: string;
};

const COLORS = ["#be185d", "#f59e0b", "#06b6d4"];
const RADII = [78, 122, 166];

function polar(cx: number, cy: number, radius: number, angle: number) {
  const radian = ((angle - 90) * Math.PI) / 180;
  return {
    x: Number((cx + radius * Math.cos(radian)).toFixed(2)),
    y: Number((cy + radius * Math.sin(radian)).toFixed(2)),
  };
}

function arcPath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polar(cx, cy, radius, endAngle);
  const end = polar(cx, cy, radius, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export function OrbitChart({ heading, items, centerValue }: OrbitChartProps) {
  const [ready, setReady] = useState(false);
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
  const size = 440;
  const cx = size / 2;
  const cy = size / 2;

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <section className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-5">
      <h2 className="text-sm font-medium text-zinc-500">{heading}</h2>

      <div className="mt-4 flex min-h-0 flex-1 flex-col items-center gap-6">
        {!ready ? (
          <div className="h-72 w-full max-w-[28rem] rounded-full bg-zinc-100 sm:h-[28rem]" />
        ) : (
        <svg viewBox={`0 0 ${size} ${size}`} className="h-72 w-full max-w-[28rem] sm:h-[28rem]">
          <circle cx={cx} cy={cy} r="196" fill="#f4f4f5" />
          {RADII.map((radius) => (
            <circle
              key={radius}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="#e4e4e7"
              strokeWidth="24"
            />
          ))}

          {items.slice(0, 3).map((item, index) => {
            const share = item.value / total;
            const sweep = Math.max(28, share * 270);
            const start = index * 18;
            const end = start + sweep;

            return (
              <path
                key={item.title}
                d={arcPath(cx, cy, RADII[index] ?? 78, start, end)}
                fill="none"
                stroke={COLORS[index]}
                strokeWidth="24"
                strokeLinecap="round"
              />
            );
          })}

          <circle cx={cx} cy={cy} r="58" fill="url(#orbitCore)" />
          <defs>
            <radialGradient id="orbitCore" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#d4d4d8" />
            </radialGradient>
          </defs>
          <text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            className="fill-zinc-500"
            fontSize="11"
          >
            Revenue
          </text>
          <text
            x={cx}
            y={cy + 14}
            textAnchor="middle"
            className="fill-zinc-900"
            fontSize="13"
            fontWeight="600"
          >
            {centerValue}
          </text>
        </svg>
        )}

        <ol className="w-full space-y-3">
          {items.slice(0, 3).map((item, index) => (
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
                <p className="text-sm text-zinc-500">{item.subtitle}</p>
              </div>
            </li>
          ))}
        </ol>

        <Link
          href="/inventory"
          className="mt-auto inline-flex h-11 w-full items-center justify-center rounded-xl border border-zinc-200 text-sm font-medium hover:bg-zinc-50"
        >
          View all
        </Link>
      </div>
    </section>
  );
}
