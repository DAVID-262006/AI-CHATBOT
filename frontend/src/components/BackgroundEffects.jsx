import React from 'react';
import { useTheme } from '../context/ThemeContext';

const BackgroundEffects = () => {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden="true">

      {/* ── Blob 1 — top-left blue glow ── */}
      <div className="blob-1 absolute rounded-full"
        style={{
          width: 'clamp(380px, 65vw, 700px)',
          height: 'clamp(380px, 65vw, 700px)',
          top: '-22%', left: '-16%',
          background: dark
            ? 'radial-gradient(circle at 40% 40%, #7c8cff 0%, #5b6af088 35%, transparent 70%)'
            : 'radial-gradient(circle at 40% 40%, #5b6af0 0%, #818cf866 35%, transparent 70%)',
          opacity: dark ? 0.28 : 0.16,
          filter: 'blur(1px)',
          willChange: 'transform',
        }}
      />

      {/* ── Blob 2 — bottom-right violet glow ── */}
      <div className="blob-2 absolute rounded-full"
        style={{
          width: 'clamp(320px, 55vw, 600px)',
          height: 'clamp(320px, 55vw, 600px)',
          bottom: '-18%', right: '-12%',
          background: dark
            ? 'radial-gradient(circle at 60% 60%, #d65af0 0%, #a855f788 35%, transparent 70%)'
            : 'radial-gradient(circle at 60% 60%, #c45af0 0%, #e879f966 35%, transparent 70%)',
          opacity: dark ? 0.24 : 0.13,
          filter: 'blur(1px)',
          willChange: 'transform',
        }}
      />

      {/* ── Blob 3 — mid-right accent ── */}
      <div className="blob-3 absolute rounded-full"
        style={{
          width: 'clamp(200px, 32vw, 380px)',
          height: 'clamp(200px, 32vw, 380px)',
          top: '28%', right: '5%',
          background: dark
            ? 'radial-gradient(circle, #22d3ee88 0%, transparent 70%)'
            : 'radial-gradient(circle, #06b6d466 0%, transparent 70%)',
          opacity: dark ? 0.18 : 0.10,
          willChange: 'transform',
        }}
      />

      {/* ── Blob 4 — bottom-left warm glow ── */}
      <div className="absolute rounded-full"
        style={{
          width: 'clamp(160px, 25vw, 300px)',
          height: 'clamp(160px, 25vw, 300px)',
          bottom: '12%', left: '4%',
          background: dark
            ? 'radial-gradient(circle, #fb923c66 0%, transparent 70%)'
            : 'radial-gradient(circle, #f9731644 0%, transparent 70%)',
          opacity: dark ? 0.16 : 0.09,
          animation: 'blobDrift2 30s ease-in-out infinite reverse',
          willChange: 'transform',
        }}
      />

      {/* ── Subtle centre vignette — adds depth ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: dark
          ? 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(8,9,18,0.55) 100%)'
          : 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(245,246,251,0.45) 100%)',
      }} />

      {/* ── Noise grain — premium texture ── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '160px 160px',
        opacity: dark ? 0.030 : 0.020,
        mixBlendMode: 'overlay',
      }} />
    </div>
  );
};

export default BackgroundEffects;