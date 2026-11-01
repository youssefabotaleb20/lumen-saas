import { SAMPLE_MONITORS } from "@/lib/sample-data";
import { Badge } from "./ui";

/** Static product preview for the landing page. Pure HTML and CSS, no images. */
export function StatusPreview() {
  return (
    <figure className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">acme.dev status</p>
        <Badge tone="ok">All systems operational</Badge>
      </div>
      <ul className="mt-4 space-y-4">
        {SAMPLE_MONITORS.slice(0, 3).map((m) => (
          <li key={m.name}>
            <div className="flex items-center justify-between text-sm">
              <span>{m.name}</span>
              <span className="font-mono text-xs text-muted">{m.uptime}% uptime</span>
            </div>
            <div className="mt-2 flex gap-[3px]" aria-hidden="true">
              {m.history.map((ok, i) => (
                <span key={i} className={`h-6 flex-1 rounded-sm ${ok ? "bg-ok/70" : "bg-danger/80"}`} />
              ))}
            </div>
          </li>
        ))}
      </ul>
      <figcaption className="sr-only">
        Example status page showing three services with their uptime over the last 30 days.
      </figcaption>
    </figure>
  );
}
