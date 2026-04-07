import React from 'react';

/* ── TypingIndicator ────────────────────────────
   Three dots with the smooth custom bounce from
   index.css (.typing-dot keyframes).
   Used inside the AI bubble in ChatPage.
─────────────────────────────────────────────── */
const TypingIndicator = () => {
  return (
    <div
      className="flex items-center gap-[5px]"
      aria-label="DD is typing"
      role="status"
      style={{ padding: '2px 2px' }}
    >
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
};

export default TypingIndicator;