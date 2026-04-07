import React from 'react';
import ChatPage from './pages/ChatPage';
import { ThemeProvider } from './context/ThemeContext';

/* ── Error Boundary ─────────────────────────────
   Catches any runtime crash and shows a clean
   recovery screen instead of a blank white page.
─────────────────────────────────────────────── */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[DD Error]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            height: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            fontFamily: 'Sora, sans-serif',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          {/* Logo */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'var(--gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.5px',
            }}
          >
            DD
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, maxWidth: 280 }}>
            DD ran into an unexpected error. Tap below to reload and try again.
          </p>

          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 8,
              padding: '12px 28px',
              borderRadius: 999,
              background: 'var(--gradient)',
              color: '#fff',
              fontFamily: 'Sora, sans-serif',
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            Reload DD
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/* ── App Root ─────────────────────────────────── */
export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ChatPage />
      </ThemeProvider>
    </ErrorBoundary>
  );
}