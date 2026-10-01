import { PROD_API_BASE } from '../env';

/**
 * TuNe AI flags: the chat widget is currently disabled site-wide, and its API
 * base is derived from the resolved `window.__API_BASE`.
 *
 * (No try/catch here, matching the original IIFE.)
 */
export function install(): void {
  window.__TUNE_AI_ENABLED = false;
  window.__CHAT_API_BASE = (window.__API_BASE || PROD_API_BASE) + '/api/tune-ai';
}
