import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

/* ── ThemeContext ────────────────────────────────
   - Reads system preference on first visit
   - Persists user choice in localStorage
   - Applies class to <html> instantly (no flash)
   - Listens for OS theme changes in real-time
─────────────────────────────────────────────── */

const ThemeContext = createContext(null);

/* ── Reads initial theme synchronously ─────────
   Called once before first render to avoid the
   white-flash-then-dark flicker on page load.
─────────────────────────────────────────────── */
const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = localStorage.getItem('dd-theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch (_) {}
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/* ── Apply theme to <html> instantly ─────────── */
const applyTheme = (theme) => {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  // Also set color-scheme for native browser UI (scrollbars, inputs)
  root.style.colorScheme = theme;
};

/* ── Provider ─────────────────────────────────── */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  /* Apply on every theme change */
  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem('dd-theme', theme);
    } catch (_) {}
  }, [theme]);

  /* Listen for OS theme changes (e.g. auto dark mode at sunset) */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      // Only follow OS if user hasn't manually set a preference
      const saved = (() => {
        try { return localStorage.getItem('dd-theme'); } catch (_) { return null; }
      })();
      if (!saved) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    // Modern browsers
    if (mq.addEventListener) {
      mq.addEventListener('change', handleChange);
      return () => mq.removeEventListener('change', handleChange);
    } else {
      // Safari <14 fallback
      mq.addListener(handleChange);
      return () => mq.removeListener(handleChange);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  /* Reset to OS preference and clear saved choice */
  const resetToSystem = useCallback(() => {
    try { localStorage.removeItem('dd-theme'); } catch (_) {}
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, resetToSystem }}>
      {children}
    </ThemeContext.Provider>
  );
};

/* ── Hook ─────────────────────────────────────── */
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
};