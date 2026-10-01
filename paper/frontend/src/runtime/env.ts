/**
 * Production backend origin: the last-resort API base when nothing else
 * resolves (config.js), and the fallback for the TuNe AI chat base and the
 * navbar auth helper (auth.js).
 *
 * The legacy scripts hard-coded 'http://0.0.0.0:10000'. It is now injected at
 * bundle time by scripts/build-runtime.mjs through esbuild `define`
 * (NEXT_PUBLIC_API_BASE from the shell, .env.local or .env), and keeps the
 * original value when the variable is unset.
 */
export const PROD_API_BASE: string = process.env.NEXT_PUBLIC_API_BASE || 'http://0.0.0.0:10000';
