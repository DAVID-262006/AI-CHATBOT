import axios from 'axios';

/* ── Base URL ────────────────────────────────────
   Reads from .env → VITE_API_URL
   Falls back to localhost for local dev
─────────────────────────────────────────────── */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL  = `${BASE_URL}/api/v1/chat`;

/* ── Axios instance ─────────────────────────────
   Shared config: timeout, headers, base URL
─────────────────────────────────────────────── */
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,          // 30s — generous for AI responses
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
});

/* ── Response interceptor ───────────────────────
   Normalizes all error shapes into a clean
   Error object with a user-friendly message.
─────────────────────────────────────────────── */
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const status  = err.response?.status;
    const server  = err.response?.data?.message || err.response?.data?.error;

    let message;

    if (!err.response) {
      // Network / CORS / server down
      message = 'Cannot reach the server. Please check your connection.';
    } else if (status === 429) {
      message = 'Too many requests — please wait a moment and try again.';
    } else if (status === 401 || status === 403) {
      message = 'Session expired. Please refresh the page.';
    } else if (status >= 500) {
      message = 'The server ran into an issue. Please try again shortly.';
    } else if (err.code === 'ECONNABORTED') {
      message = 'Request timed out. The server took too long to respond.';
    } else {
      message = server || 'Something went wrong. Please try again.';
    }

    const error     = new Error(message);
    error.status    = status;
    error.raw       = err;
    return Promise.reject(error);
  }
);

/* ── Retry helper ───────────────────────────────
   Retries a fn up to `attempts` times with
   exponential back-off. Only retries on network
   errors or 5xx, never on 4xx client errors.
─────────────────────────────────────────────── */
const withRetry = async (fn, attempts = 2, delay = 800) => {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const status = err.status;
      // Don't retry on client errors (4xx) — they won't change
      if (status && status >= 400 && status < 500) throw err;
      if (i < attempts - 1) {
        await new Promise(r => setTimeout(r, delay * (i + 1)));
      }
    }
  }
  throw lastError;
};

/* ── createNewChat ──────────────────────────────
   POST /api/v1/chat/new
   Returns: chatId string | null
─────────────────────────────────────────────── */
export const createNewChat = async () => {
  try {
    const res = await withRetry(() =>
      client.post('/api/v1/chat/new', {})
    );
    // Support multiple response shapes
    return (
      res.data?.data?.id   ||
      res.data?.id         ||
      res.data?.chatId     ||
      null
    );
  } catch (err) {
    console.warn('[DD] createNewChat failed:', err.message);
    return null;   // Non-fatal — ChatPage handles null gracefully
  }
};

/* ── sendMessageToAPI ───────────────────────────
   POST /api/v1/chat
   Returns: response data object
   Throws:  Error with user-friendly message
─────────────────────────────────────────────── */
export const sendMessageToAPI = async (chatId, message) => {
  if (!chatId)  throw new Error('No active chat session. Please refresh.');
  if (!message?.trim()) throw new Error('Message cannot be empty.');

  const res = await withRetry(() =>
    client.post('/api/v1/chat', {
      chatId,
      message: message.trim(),
    })
  );

  return res.data;
};

/* ── healthCheck ────────────────────────────────
   GET /api/v1/health
   Optional — can be used to check server status
   before sending a message.
─────────────────────────────────────────────── */
export const healthCheck = async () => {
  try {
    const res = await client.get('/api/v1/health', { timeout: 5000 });
    return res.status === 200;
  } catch {
    return false;
  }
};