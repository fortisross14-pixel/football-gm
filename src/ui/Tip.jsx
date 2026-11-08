import React from 'react';

// A one-time hint bubble above the tab bar (or at the top during pack opening).
export default function Tip({ text, onClose, top }) {
  return (
    <div className={`tip${top ? ' tip--top' : ''}`} role="note">
      <span className="tip__icon" aria-hidden="true">💡</span>
      <p>{text}</p>
      <button type="button" className="tip__ok" onClick={onClose}>Got it</button>
    </div>
  );
}
