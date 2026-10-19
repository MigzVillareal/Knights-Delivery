// Chat Drawer for Courier & Student Communication

import { useState, useRef, useEffect } from 'react';

export default function ChatDrawer({ isOpen, onClose, chatMessages = [], onSendMessage }) {
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, chatMessages]);

  if (!isOpen) return null;

  function handleSend(e) {
    e?.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
  }

  const QUICK_REPLIES = [
    "I'm at the drop-off location!",
    "Where are you currently?",
    "Thank you so much!",
  ];

  return (
    <>
      <div className="drawer-backdrop open" onClick={onClose} />
      <div className="drawer chat-drawer open" style={{ zIndex: 92 }}>
        <div className="drawer-head" style={{ gap: 12 }}>
          <div className="avatar" style={{ width: 40, height: 40, fontSize: 14 }}>JD</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: 15, margin: 0 }}>Juan Dela Cruz</h2>
            <small style={{ color: 'var(--ok)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="pulse-dot" style={{ background: 'var(--ok)', width: 6, height: 6 }} /> Courier · Active Delivery
            </small>
          </div>
          <button className="iconbtn ghost" onClick={onClose} type="button" aria-label="Close">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Message body */}
        <div className="drawer-body" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px' }}>
          {chatMessages.map((m, i) => {
            const isMe = m.from === 'me';
            return (
              <div
                key={i}
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    background: isMe ? 'var(--navy)' : 'var(--bg-soft)',
                    color: isMe ? '#fff' : 'var(--text)',
                    padding: '10px 14px',
                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    fontSize: 14,
                    lineHeight: 1.4,
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  {m.text}
                </div>
                <span style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, fontWeight: 600 }}>
                  {m.time}
                </span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Quick reply chips */}
        <div style={{ padding: '8px 14px', display: 'flex', gap: 8, overflowX: 'auto', borderTop: '1px solid var(--line)' }}>
          {QUICK_REPLIES.map((reply, i) => (
            <button
              key={i}
              className="minibtn"
              onClick={() => {
                onSendMessage(reply);
              }}
              type="button"
              style={{ fontSize: 12, padding: '6px 12px', flexShrink: 0 }}
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Chat input */}
        <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, padding: '12px 14px 18px', borderTop: '1.5px solid var(--line)' }}>
          <input
            className="input"
            type="text"
            placeholder="Type a message to courier..."
            value={text}
            onChange={e => setText(e.target.value)}
            style={{ borderRadius: 999, padding: '12px 16px', fontSize: 14 }}
          />
          <button
            className="btn btn-primary"
            type="submit"
            style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, padding: 0 }}
            aria-label="Send message"
          >
            <i className="fa-solid fa-paper-plane" style={{ fontSize: 14 }} />
          </button>
        </form>
      </div>
    </>
  );
}
