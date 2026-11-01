/** Deterministic sample data so pages render identically on server and client. */
function history(seed: number, length = 30): boolean[] {
  return Array.from({ length }, (_, i) => ((i + 1) * 7919 * seed) % 97 > 3);
}

function series(seed: number, length = 24): number[] {
  return Array.from({ length }, (_, i) => 120 + Math.round(60 * Math.sin((i + seed) / 3) + ((i * seed * 31) % 40)));
}

export type SampleMonitor = {
  name: string;
  url: string;
  status: "up" | "down";
  uptime: number;
  responseMs: number;
  history: boolean[];
  responseSeries: number[];
};

export const SAMPLE_MONITORS: SampleMonitor[] = [
  { name: "Marketing site", url: "https://acme.dev", status: "up", uptime: 99.98, responseMs: 142, history: history(3), responseSeries: series(1) },
  { name: "Public API", url: "https://api.acme.dev/health", status: "up", uptime: 99.91, responseMs: 188, history: history(5), responseSeries: series(4) },
  { name: "Checkout", url: "https://acme.dev/checkout", status: "up", uptime: 100, responseMs: 231, history: Array(30).fill(true), responseSeries: series(7) },
  { name: "Docs", url: "https://docs.acme.dev", status: "down", uptime: 98.7, responseMs: 0, history: history(13), responseSeries: series(9) },
];
