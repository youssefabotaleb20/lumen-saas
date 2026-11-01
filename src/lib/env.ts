import "server-only";

/**
 * Feature flags derived from environment variables, so the app runs with
 * no keys at all (billing and GitHub sign-in show as "not configured").
 */
export const env = {
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  githubClientId: process.env.GITHUB_CLIENT_ID,
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
};

export const features = {
  billing: Boolean(env.stripeSecretKey),
  github: Boolean(env.githubClientId && env.githubClientSecret),
};
