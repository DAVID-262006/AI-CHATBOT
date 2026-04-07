import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

/* ── Icons ─────────────────────────────────── */
const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const WarningIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <triangle points="12 2 22 22 2 22"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

/* ── Markdown Parser ─────────────────────────
   Safe HTML renderer for AI responses.
   Handles: code blocks, inline code, bold,
   italic, links, lists, headings, newlines.
─────────────────────────────────────────── */
const parseMarkdown = (raw) => {
  if (!raw || typeof raw !== 'string') return '';

  // 1. Escape HTML (XSS protection)
  let out = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // 2. Code blocks ``` ... ```
  out = out.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const label = lang || 'code';
    return `<div class="dd-codeblock">
      <div class="dd-codeblock-header">
        <span class="dd-codelang">${label}</span>
        <button class="dd-copy-code" data-code="${encodeURIComponent(code.trim())}" title="Copy code">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copy
        </button>
      </div>
      <pre class="dd-pre"><code>${code.trim()}</code></pre>
    </div>`;
  });

  // 3. Inline code `...`
  out = out.replace(/`([^`\n]+)`/g,
    '<code class="dd-inline-code">$1</code>');

  // 4. Headings ### ## #
  out = out.replace(/^### (.+)$/gm, '<h3 class="dd-h3">$1</h3>');
  out = out.replace(/^## (.+)$/gm,  '<h2 class="dd-h2">$1</h2>');
  out = out.replace(/^# (.+)$/gm,   '<h1 class="dd-h1">$1</h1>');

  // 5. Bold **...**
  out = out.replace(/\*\*([^*\n]+)\*\*/g,
    '<strong class="dd-bold">$1</strong>');

  // 6. Italic *...*
  out = out.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g,
    '<em class="dd-em">$1</em>');

  // 7. Links [text](url)
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="dd-link">$1</a>');

  // 8. Unordered lists - item
  out = out.replace(/^[\-\*] (.+)$/gm, '<li class="dd-li">$1</li>');
  out = out.replace(/(<li class="dd-li">[\s\S]*?<\/li>)(\n(?!<li))/g,
    '<ul class="dd-ul">$1</ul>$2');
  out = out.replace(/(<li class="dd-li">[\s\S]*?<\/li>)$/g,
    '<ul class="dd-ul">$1</ul>');

  // 9. Ordered lists 1. item
  out = out.replace(/^\d+\. (.+)$/gm, '<li class="dd-li">$1</li>');

  // 10. Horizontal rule ---
  out = out.replace(/^---+$/gm, '<hr class="dd-hr"/>');

  // 11. Newlines → <br> (but not inside block elements)
  out = out.replace(/\n/g, '<br/>');

  // Clean up extra <br> after block-level elements
  out = out.replace(/(<\/(?:div|pre|ul|ol|h[1-6]|hr)>)<br\/>/g, '$1');
  out = out.replace(/<br\/>(<(?:div|pre|ul|ol|h[1-6]|hr))/g, '$1');

  return out;
};

/* ── Inline styles injected once ──────────────
   Using a style tag approach keeps Tailwind
   purge from removing dynamic class names.
─────────────────────────────────────────── */
const BUBBLE_STYLES = `
  .dd-prose { font-size: 15px; line-height: 1.7; word-break: break-word; overflow-wrap: break-word; }
  .dd-prose p, .dd-prose br { }
  .dd-h1 { font-size: 1.2em; font-weight: 700; margin: 10px 0 6px; }
  .dd-h2 { font-size: 1.1em; font-weight: 700; margin: 10px 0 5px; }
  .dd-h3 { font-size: 1em;   font-weight: 600; margin: 8px 0 4px; }
  .dd-bold { font-weight: 650; }
  .dd-em   { font-style: italic; opacity: 0.88; }
  .dd-link { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; word-break: break-all; }
  .dd-ul   { list-style: none; padding: 4px 0; margin: 4px 0; display: flex; flex-direction: column; gap: 4px; }
  .dd-li   { padding-left: 18px; position: relative; }
  .dd-li::before { content: '•'; position: absolute; left: 4px; color: var(--accent); font-weight: 700; }
  .dd-hr   { border: none; border-top: 1px solid var(--border-soft); margin: 10px 0; }
  .dd-inline-code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.82em;
    padding: 2px 6px;
    border-radius: 6px;
    background: var(--accent-soft);
    color: var(--accent);
    font-weight: 500;
  }
  .dd-codeblock {
    margin: 10px 0;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--border-soft);
    font-size: 13px;
  }
  .dd-codeblock-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 7px 12px;
    background: rgba(0,0,0,0.55);
    font-family: 'JetBrains Mono', monospace;
  }
  .dd-codelang { color: #94a3b8; font-size: 11px; text-transform: lowercase; }
  .dd-copy-code {
    display: flex; align-items: center; gap: 5px;
    font-size: 11px; color: #94a3b8;
    background: none; border: none; cursor: pointer;
    padding: 2px 6px; border-radius: 5px;
    transition: color 0.15s, background 0.15s;
    font-family: 'Sora', sans-serif;
  }
  .dd-copy-code:hover { color: #e2e8f0; background: rgba(255,255,255,0.08); }
  .dd-pre {
    padding: 14px 16px;
    overflow-x: auto;
    background: rgba(0,0,0,0.45);
    -webkit-overflow-scrolling: touch;
    line-height: 1.65;
  }
  .dd-pre code { color: #e2e8f0; font-family: 'JetBrains Mono', monospace; }
`;

/* Inject styles once */
if (typeof document !== 'undefined' && !document.getElementById('dd-bubble-styles')) {
  const el = document.createElement('style');
  el.id = 'dd-bubble-styles';
  el.textContent = BUBBLE_STYLES;
  document.head.appendChild(el);
}

/* Handle copy-code button clicks (event delegation) */
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.dd-copy-code');
    if (!btn) return;
    const code = decodeURIComponent(btn.dataset.code || '');
    navigator.clipboard?.writeText(code).then(() => {
      const orig = btn.innerHTML;
      btn.innerHTML = '✓ Copied';
      btn.style.color = '#22c55e';
      setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 2000);
    });
  });
}

/* ── Animation variants ─────────────────────── */
const bubbleVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ── MessageBubble ──────────────────────────── */
const MessageBubble = ({ message, isUser, timestamp, isError, isLatest }) => {
  const [copied, setCopied] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard?.writeText(message).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }, [message]);

  /* ── User bubble ── */
  if (isUser) {
    return (
      <motion.div
        className="flex justify-end w-full px-1 mb-1 mt-3"
        variants={bubbleVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col items-end" style={{ maxWidth: 'min(78vw, 420px)' }}>
          <div
            className="px-4 py-3 rounded-2xl rounded-tr-sm shadow-md select-text"
            style={{
              background: 'var(--bubble-user)',
              color: 'var(--bubble-user-text)',
              boxShadow: '0 2px 12px rgba(91,106,240,0.28)',
            }}
          >
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.65,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                margin: 0,
              }}
            >
              {message}
            </p>
          </div>

          {timestamp && (
            <span
              className="mt-1 px-1 text-[10px]"
              style={{ color: 'var(--text-muted)' }}
            >
              {timestamp}
            </span>
          )}
        </div>
      </motion.div>
    );
  }

  /* ── AI bubble ── */
  return (
    <motion.div
      className="flex items-end gap-2 w-full px-1 mb-1 mt-3 group"
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      onHoverStart={() => setShowActions(true)}
      onHoverEnd={() => setShowActions(false)}
      onTouchStart={() => setShowActions(true)}
    >
      {/* DD Avatar */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center relative overflow-hidden self-end mb-0.5"
        style={{
          background: 'var(--gradient)',
          boxShadow: '0 2px 8px rgba(91,106,240,0.3)',
        }}
      >
        <span className="text-white font-bold text-[10px] tracking-wider relative z-10">DD</span>
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.22) 0%,transparent 60%)' }}
        />
      </div>

      {/* Content column */}
      <div className="flex flex-col flex-1 min-w-0" style={{ maxWidth: 'min(80vw, 500px)' }}>

        {/* Error banner */}
        {isError && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl mb-2 text-xs font-medium"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#f87171',
            }}
          >
            <WarningIcon />
            Connection issue
          </div>
        )}

        {/* Message bubble */}
        <div
          className="rounded-2xl rounded-bl-sm px-4 py-3 select-text"
          style={{
            background: 'var(--bubble-ai)',
            border: '1px solid var(--bubble-ai-border)',
            boxShadow: 'var(--bubble-ai-shadow)',
          }}
        >
          <div
            className="dd-prose"
            style={{ color: 'var(--text-primary)' }}
            dangerouslySetInnerHTML={{ __html: parseMarkdown(message) }}
          />
        </div>

        {/* Footer: timestamp + copy */}
        <div className="flex items-center gap-2 mt-1.5 ml-1">
          {timestamp && (
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {timestamp}
            </span>
          )}

          {/* Copy button — always visible on mobile, hover on desktop */}
          <motion.button
            onClick={handleCopy}
            title="Copy message"
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium
                       transition-all duration-150 active:scale-90"
            style={{
              color: copied ? '#22c55e' : 'var(--text-muted)',
              background: copied
                ? 'rgba(34,197,94,0.1)'
                : showActions ? 'var(--bg-secondary)' : 'transparent',
              opacity: showActions || copied ? 1 : 0,
            }}
            animate={{ opacity: showActions || copied ? 1 : 0 }}
            transition={{ duration: 0.15 }}
          >
            {copied ? (
              <>
                <CheckIcon />
                <span>Copied</span>
              </>
            ) : (
              <>
                <CopyIcon />
                <span>Copy</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;