import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';
import TypingIndicator from '../components/TypingIndicator';
import BackgroundEffects from '../components/BackgroundEffects';
import { useTheme } from '../context/ThemeContext';
import { sendMessageToAPI, createNewChat } from '../services/api';

/* ── Icons ─────────────────────────────────── */
const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

/* ── Prompt cards ───────────────────────────── */
const PROMPTS = [
  { icon: '🤖', label: 'AI Basics',    text: 'What is AI and how does it work?',          gradient: 'linear-gradient(135deg,#7c8cff22,#d65af022)', border: 'rgba(124,140,255,0.25)' },
  { icon: '✍️', label: 'Creative',     text: 'Write a short poem about the ocean',        gradient: 'linear-gradient(135deg,#fb923c22,#d65af022)', border: 'rgba(251,146,60,0.25)'  },
  { icon: '💡', label: 'Productivity', text: 'Give me 5 ideas to boost my productivity',  gradient: 'linear-gradient(135deg,#4ade8022,#06b6d422)', border: 'rgba(74,222,128,0.25)'  },
  { icon: '🧑‍💻', label: 'Code Help', text: 'How do I center a div in CSS?',             gradient: 'linear-gradient(135deg,#22d3ee22,#7c8cff22)', border: 'rgba(34,211,238,0.25)'  },
];

/* ── Shared fast spring ─────────────────────── */
const FAST = { type: 'spring', stiffness: 420, damping: 28 };
const FAST_EASE = { duration: 0.18, ease: [0.25, 1, 0.5, 1] };

/* ── Header button ──────────────────────────── */
const HeaderBtn = ({ onClick, title, children }) => (
  <motion.button onClick={onClick} title={title}
    className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors duration-150"
    style={{ color: 'var(--text-secondary)', WebkitTapHighlightColor: 'transparent' }}
    whileHover={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
    whileTap={{ scale: 0.85 }}
    transition={{ duration: 0.1 }}>
    {children}
  </motion.button>
);

/* ── Clear modal ────────────────────────────── */
const ClearModal = ({ onConfirm, onCancel }) => (
  <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    transition={FAST_EASE}>
    <motion.div className="absolute inset-0"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onCancel} />
    <motion.div className="relative w-full max-w-sm rounded-2xl p-6 z-10"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-lg)' }}
      initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }} transition={FAST}>
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}><TrashIcon /></div>
        <h3 className="font-semibold text-[17px]" style={{ color: 'var(--text-primary)' }}>Clear conversation?</h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>All messages will be deleted. This cannot be undone.</p>
        <div className="flex gap-3 w-full mt-2">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-soft)' }}>
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
            Clear
          </button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

/* ── Welcome Screen ─────────────────────────── */
const WelcomeScreen = ({ onPromptClick }) => (
  <motion.div
    className="flex flex-col items-center justify-center w-full px-4"
    style={{ minHeight: '72vh', paddingTop: 28, paddingBottom: 20 }}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
  >
    {/* Avatar */}
    <motion.div className="relative mb-6"
      initial={{ scale: 0.75, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.22, ease: [0.34, 1.4, 0.64, 1] }}>
      {/* Spinning ring */}
      <motion.div className="absolute rounded-[28px]"
        style={{ inset: -3, background: 'var(--gradient)', zIndex: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} />
      {/* Mask */}
      <div className="absolute rounded-[26px]"
        style={{ inset: -1, background: 'var(--bg-primary)', zIndex: 1 }} />
      {/* Box */}
      <div className="relative z-10 w-20 h-20 rounded-3xl flex items-center justify-center overflow-hidden"
        style={{ background: 'var(--gradient)', boxShadow: '0 4px 24px rgba(124,140,255,0.45)' }}>
        <span className="text-white font-bold text-2xl tracking-wider">DD</span>
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.28) 0%,transparent 60%)' }} />
      </div>
      {/* Online dot */}
      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[2.5px] z-20 flex items-center justify-center"
        style={{ background: '#22c55e', borderColor: 'var(--bg-primary)' }}>
        <div className="w-2 h-2 rounded-full bg-white" />
      </div>
    </motion.div>

    {/* Heading */}
    <motion.h1 className="font-extrabold text-center tracking-tight mb-2"
      style={{ fontSize: 'clamp(26px, 7vw, 46px)', color: 'var(--text-primary)', lineHeight: 1.15 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: 0.06, ease: [0.25, 1, 0.5, 1] }}>
      Hi, I'm <span className="text-gradient">DD</span>{' '}
      <motion.span style={{ display: 'inline-block' }}
        animate={{ rotate: [0, 20, -8, 16, 0] }}
        transition={{ delay: 0.3, duration: 0.6, ease: 'easeInOut' }}>
        👋
      </motion.span>
    </motion.h1>

    {/* Subtitle */}
    <motion.p className="text-center text-sm sm:text-base max-w-xs mb-8"
      style={{ color: 'var(--text-secondary)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.16, delay: 0.10 }}>
      Your intelligent AI assistant — ask me anything.
    </motion.p>

    {/* Prompt cards — all appear together, fast */}
    <motion.div
      className="grid grid-cols-2 gap-3 w-full max-w-lg"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.20, delay: 0.14, ease: [0.25, 1, 0.5, 1] }}>
      {PROMPTS.map((p, i) => (
        <motion.button key={i} onClick={() => onPromptClick(p.text)}
          className="prompt-card flex flex-col items-start gap-2 p-4 text-left w-full"
          style={{
            background: p.gradient,
            border: `1px solid ${p.border}`,
            boxShadow: 'var(--shadow-sm)',
          }}
          whileHover={{ y: -3, boxShadow: 'var(--shadow-md)' }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.12 }}>
          <span className="text-xl leading-none">{p.icon}</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--text-muted)' }}>{p.label}</span>
          <span className="text-[13px] font-medium leading-snug"
            style={{ color: 'var(--text-primary)' }}>{p.text}</span>
        </motion.button>
      ))}
    </motion.div>
  </motion.div>
);

/* ── ChatPage ───────────────────────────────── */
const ChatPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [messages, setMessages]   = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId]       = useState(null);
  const [showClear, setShowClear] = useState(false);
  const [isInit, setIsInit]       = useState(true);

  const messagesEndRef  = useRef(null);
  const scrollAreaRef   = useRef(null);
  const isUserScrolling = useRef(false);
  const scrollTimeout   = useRef(null);

  useEffect(() => {
    const init = async () => {
      try { const id = await createNewChat(); if (id) setChatId(id); } catch (_) {}
      finally { setIsInit(false); }
    };
    init();
  }, []);

  const scrollToBottom = useCallback(() => {
    if (!messagesEndRef.current || isUserScrolling.current) return;
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isLoading, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    isUserScrolling.current = (el.scrollHeight - el.scrollTop - el.clientHeight) > 80;
    clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => { isUserScrolling.current = false; }, 2000);
  }, []);

  const handleSendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;
    let sessionId = chatId;
    if (!sessionId) { sessionId = await createNewChat(); setChatId(sessionId); }

    setMessages(prev => [...prev, {
      id: `u-${Date.now()}`, text: text.trim(), isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setIsLoading(true);
    isUserScrolling.current = false;

    try {
      if (!sessionId) throw new Error('Oops! We’re having trouble connecting right now. Please try again in a moment.');
      const res = await sendMessageToAPI(sessionId, text.trim());
      const aiText =
        res?.data?.assistantMessage?.content ||
        res?.reply || res?.answer || res?.message || res?.data || String(res);
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`, text: aiText, isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `e-${Date.now()}`, text: `**Error:** ${err.message}`,
        isUser: false, isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally { setIsLoading(false); }
  }, [chatId, isLoading]);

  const handleClearConfirm = useCallback(async () => {
    setShowClear(false); setMessages([]); setIsLoading(false);
    try { const id = await createNewChat(); if (id) setChatId(id); } catch (_) {}
  }, []);

  return (
    <div className="flex flex-col w-full overflow-hidden"
      style={{ height: '100dvh', backgroundColor: 'var(--bg-primary)', position: 'relative' }}>

      <BackgroundEffects />

      {/* ── Header ── */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 z-30 glass-deep"
        style={{ height: 'var(--header-h)', paddingTop: 'env(safe-area-inset-top)', borderBottom: '1px solid var(--border-soft)' }}>
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden relative"
              style={{ background: 'var(--gradient)', boxShadow: '0 2px 12px rgba(124,140,255,0.4)' }}>
              <span className="text-white font-bold text-xs tracking-widest relative z-10">DD</span>
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.25) 0%,transparent 55%)' }} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 block"
              style={{ background: '#22c55e', borderColor: 'var(--bg-primary)' }} />
          </div>
          <div className="flex flex-col leading-none gap-0.5">
            <span className="font-bold text-[15px] tracking-wide text-gradient">DD</span>
            <span className="text-[10px] font-medium" style={{ color: '#22c55e' }}>● Online</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <HeaderBtn onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={theme}
                initial={{ rotate: -20, opacity: 0, scale: 0.8 }}
                animate={{ rotate: 0,   opacity: 1, scale: 1 }}
                exit={{   rotate:  20, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}>
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </motion.span>
            </AnimatePresence>
          </HeaderBtn>

          <AnimatePresence>
            {messages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.75 }}
                transition={{ duration: 0.15 }}>
                <HeaderBtn onClick={() => setShowClear(true)} title="Clear chat">
                  <TrashIcon />
                </HeaderBtn>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ── Messages ── */}
      <div ref={scrollAreaRef} onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar scroll-momentum relative z-10"
        style={{ paddingBottom: 'calc(var(--input-area-h) + 32px + env(safe-area-inset-bottom))' }}>
        <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 pt-2 pb-2 flex flex-col">

          <AnimatePresence mode="sync">
            {messages.length === 0 && !isInit ? (
              <WelcomeScreen key="welcome" onPromptClick={handleSendMessage} />
            ) : (
              <motion.div key="messages" className="flex flex-col gap-1"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
                {messages.map((msg, idx) => (
                  <MessageBubble key={msg.id} message={msg.text} isUser={msg.isUser}
                    isError={msg.isError} timestamp={msg.timestamp}
                    isLatest={idx === messages.length - 1} />
                ))}
                <AnimatePresence>
                  {isLoading && (
                    <motion.div key="typing" className="flex items-end gap-2.5 mb-2 mt-1"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.16 }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                        style={{ background: 'var(--gradient)', boxShadow: '0 2px 10px rgba(124,140,255,0.35)' }}>
                        <span className="text-white font-bold text-[10px] tracking-wider relative z-10">DD</span>
                      </div>
                      <div className="px-4 py-3 rounded-2xl rounded-bl-sm"
                        style={{ background: 'var(--bubble-ai)', border: '1px solid var(--bubble-ai-border)', boxShadow: 'var(--bubble-ai-shadow)' }}>
                        <TypingIndicator />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} style={{ height: 1 }} />
        </div>
      </div>

      {/* ── Input ── */}
      <div className="flex-shrink-0 relative z-30 glass-deep"
        style={{ borderTop: '1px solid var(--border-soft)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="w-full h-px" style={{ background: 'var(--gradient)', opacity: 0.4 }} />
        <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-3">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          <p className="hidden sm:block text-center mt-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
            DD may make mistakes. Always verify important information.
          </p>
        </div>
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {showClear && <ClearModal onConfirm={handleClearConfirm} onCancel={() => setShowClear(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;