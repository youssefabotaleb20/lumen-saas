import { ImageResponse } from "next/og";

export const alt = "Lumen: uptime monitoring and status pages for small teams";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#12110f",
          color: "#f2efe9",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 44, fontWeight: 600 }}>
          <div style={{ width: 44, height: 44, borderRadius: 22, background: "#f59e0b" }} />
          Lumen
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 76, fontWeight: 600, lineHeight: 1.05, maxWidth: 980 }}>
            Know your site is down before your users do.
          </div>
          <div style={{ fontSize: 32, color: "#b0a99c" }}>Uptime monitoring and status pages for small teams</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {Array.from({ length: 40 }, (_, i) => (
            <div key={i} style={{ flex: 1, height: 36, borderRadius: 4, background: i === 27 ? "#f87171" : "#4ade80", opacity: 0.8 }} />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
