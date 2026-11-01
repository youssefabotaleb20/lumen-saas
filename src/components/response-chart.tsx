/** Small bar chart of response times. Server-rendered SVG, no chart library. */
export function ResponseChart({ values, label }: { values: number[]; label: string }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const width = 100 / values.length;

  return (
    <figure>
      <svg
        role="img"
        aria-label={`${label}: average ${avg} ms, fastest ${min} ms, slowest ${max} ms over the last 24 hours.`}
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="h-32 w-full"
      >
        {values.map((v, i) => {
          const h = (v / max) * 38;
          return (
            <rect
              key={i}
              x={i * width + width * 0.15}
              y={40 - h}
              width={width * 0.7}
              height={h}
              rx="0.6"
              className="fill-accent"
              opacity={v === max ? 1 : 0.55}
            />
          );
        })}
      </svg>
      <figcaption className="mt-3 flex justify-between font-mono text-xs text-muted">
        <span>24 hours ago</span>
        <span>avg {avg} ms</span>
        <span>now</span>
      </figcaption>
    </figure>
  );
}
