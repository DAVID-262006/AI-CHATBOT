import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Icons ─────────────────────────────────── */
const SendIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"/>
    <polyline points="5 12 12 5 19 12"/>
  </svg>
);

const StopIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="3"/>
  </svg>
);

/* ── Spinner ────────────────────────────────── */
const Spinner = () => (
  <svg
    className="animate-spin-smooth"
    width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round"
  >
    <path d="M12 2a10 10 0 0 1 10 10" opacity="0.3"/>
    <path d="M12 2a10 10 0 0 1 10 10"/>
  </svg>
);

/* ── Max textarea height (px) ───────────────── */
const MAX_HEIGHT = 160;
const MIN_HEIGHT = 48;

/* ── ChatInput ──────────────────────────────── */
const ChatInput = ({ onSendMessage, isLoading }) => {
  const [value, setValue]       = useState('');
  const [focused, setFocused]   = useState(false);
  const [sending, setSending]   = useState(false);
  const textareaRef             = useRef(null);
  const containerRef            = useRef(null);

  const hasText = value.trim().length > 0;
  const canSend = hasText && !isLoading && !sending;

  /* ── Auto-resize textarea ── */
  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const next = Math.min(el.scrollHeight, MAX_HEIGHT);
    el.style.height = `${Math.max(next, MIN_HEIGHT)}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  /* ── Focus on mount (desktop only) ── */
  useEffect(() => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    if (!isMobile && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  /* ── Refocus after AI reply ── */
  useEffect(() => {
    if (!isLoading && !sending) {
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      if (!isMobile) {
        textareaRef.current?.focus();
      }
    }
  }, [isLoading, sending]);

  /* ── Send ── */
  const handleSend = useCallback(async () => {
    if (!canSend) return;
    const text = value.trim();
    setValue('');
    setSending(true);

    // Reset textarea height immediately
    if (textareaRef.current) {
      textareaRef.current.style.height = `${MIN_HEIGHT}px`;
    }

    try {
      await onSendMessage(text);
    } finally {
      setSending(false);
    }
  }, [canSend, value, onSendMessage]);

  /* ── Keyboard: Enter sends, Shift+Enter = newline ── */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  /* ── Character count threshold ── */
  const charCount = value.length;
  const showCount = charCount > 200;

  /* ── Derived states ── */
  const isActive = isLoading || sending;
  const ringColor = focused
    ? 'var(--accent)'
    : 'var(--border-soft)';

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ isolation: 'isolate' }}
    >
      {/* ── Main input container ── */}
      <motion.div
        className="relative flex items-end w-full rounded-2xl overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          border: `1.5px solid ${ringColor}`,
          boxShadow: focused
            ? `0 0 0 3px var(--accent-soft), var(--shadow-sm)`
            : 'var(--shadow-sm)',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        }}
        animate={{ scale: sending ? 0.995 : 1 }}
        transition={{ duration: 0.12 }}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Message DD…"
          disabled={isActive}
          rows={1}
          autoComplete="off"
          autoCorrect="on"
          autoCapitalize="sentences"
          spellCheck
          className="chat-textarea flex-1 bg-transparent outline-none
                     placeholder-[var(--text-muted)] no-scrollbar"
          style={{
            color: 'var(--text-primary)',
            fontSize: 15,          // ≥16 prevents iOS zoom, but 15 with explicit zoom:1 workaround
            lineHeight: 1.65,
            padding: '13px 14px 13px 16px',
            minHeight: MIN_HEIGHT,
            maxHeight: MAX_HEIGHT,
            /* iOS zoom prevention at font-size 15 */
            transform: 'scale(1)',
            WebkitTextSizeAdjust: '100%',
            opacity: isActive ? 0.6 : 1,
            transition: 'opacity 0.2s ease',
            caretColor: 'var(--accent)',
          }}
        />

        {/* ── Send / Loading button ── */}
        <div className="flex-shrink-0 flex items-end pb-2 pr-2">
          <AnimatePresence mode="wait" initial={false}>
            {isActive ? (
              /* Loading state */
              <motion.div
                key="loading"
                className="w-9 h-9 flex items-center justify-center rounded-xl"
                style={{
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                }}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1,   opacity: 1 }}
                exit={{   scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Spinner />
              </motion.div>
            ) : canSend ? (
              /* Active send button */
              <motion.button
                key="send-active"
                onClick={handleSend}
                title="Send message"
                className="w-9 h-9 flex items-center justify-center rounded-xl
                           text-white active:scale-90 transition-transform"
                style={{
                  background: 'var(--gradient)',
                  boxShadow: 'var(--shadow-glow)',
                  WebkitTapHighlightColor: 'transparent',
                }}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1,   opacity: 1 }}
                exit={{   scale: 0.6, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                whileTap={{ scale: 0.88 }}
              >
                <SendIcon />
              </motion.button>
            ) : (
              /* Inactive send button — subtle, always visible */
              <motion.button
                key="send-idle"
                disabled
                title="Type a message"
                className="w-9 h-9 flex items-center justify-center rounded-xl"
                style={{
                  color: 'var(--text-muted)',
                  background: 'transparent',
                  cursor: 'default',
                  WebkitTapHighlightColor: 'transparent',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{   opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <SendIcon />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Char count (shows at 200+) ── */}
      <AnimatePresence>
        {showCount && (
          <motion.div
            className="absolute right-14 bottom-3 text-[10px] pointer-events-none"
            style={{ color: charCount > 800 ? '#f87171' : 'var(--text-muted)' }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {charCount}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Keyboard hint (desktop only) ── */}
      <AnimatePresence>
        {focused && !hasText && (
          <motion.p
            className="hidden sm:block text-center mt-2 text-[11px] pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.5 }}
          >
            Press <kbd
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-soft)',
                borderRadius: 4,
                padding: '0px 5px',
                fontSize: 10,
                fontFamily: 'inherit',
              }}
            >Enter</kbd> to send &nbsp;·&nbsp;
            <kbd
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-soft)',
                borderRadius: 4,
                padding: '0px 5px',
                fontSize: 10,
                fontFamily: 'inherit',
              }}
            >Shift + Enter</kbd> for new line
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatInput;