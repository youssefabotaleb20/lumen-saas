export const site = {
  name: "Lumen",
  title: "Lumen: uptime monitoring and status pages for small teams",
  description:
    "Lumen checks your sites and APIs every minute, alerts you the moment something breaks, and gives your users a status page. Start free, upgrade when you grow.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
  repo: "https://github.com/youssefabotaleb20/lumen-saas",
  author: { name: "Youssef Abotaleb", url: "https://youssefabotaleb20.github.io/Portfolio/" },
} as const;
