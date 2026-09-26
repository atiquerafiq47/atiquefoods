type TopListItem = {
  title: string;
  subtitle: string;
};

type TopListProps = {
  heading: string;
  items: TopListItem[];
};

export function TopList({ heading, items }: TopListProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5">
      <h2 className="text-sm font-medium text-zinc-500">{heading}</h2>
      <ol className="mt-4 space-y-3">
        {items.map((item, index) => (
          <li
            key={item.title}
            className="flex items-start gap-3 rounded-xl bg-zinc-50 px-3 py-3"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium">{item.title}</p>
              <p className="text-sm text-zinc-500">{item.subtitle}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
