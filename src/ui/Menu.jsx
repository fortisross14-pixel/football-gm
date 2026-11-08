import React, { useState } from 'react';
import { Crest } from './Art.jsx';
import Sheet from './Sheet.jsx';
import { listSlots, deleteSlot, exportSlot, importSave } from '../state/storage.js';
import { Segmented } from './Home.jsx';
import ManagersSheet from './Managers.jsx';

// Main menu: three save slots, settings, backups.
export default function Menu({ onContinue, onNew, onImport, settings, setSettings }) {
  const [slots, setSlots] = useState(listSlots);
  const [backup, setBackup] = useState(null); // { n, mode: 'export' | 'import' }
  const [showSettings, setShowSettings] = useState(false);
  const [showManagers, setShowManagers] = useState(false);
  const refresh = () => setSlots(listSlots());

  return (
    <div className="menu">
      <div className="menu__hero">
        <div className="menu__logo" aria-hidden="true">
          <span className="menu__card c1" /><span className="menu__card c2" /><span className="menu__card c3" />
        </div>
        <h1>Football Cards</h1>
        <p>Build a club from cards. Win your league, conquer your continent, become a legendary GM.</p>
      </div>

      <div className="slots">
        {slots.map((slot) => (
          <div key={slot.n} className={`slot${slot.summary ? '' : ' slot--empty'}`}>
            {slot.summary ? (
              <>
                <button type="button" className="slot__main" onClick={() => onContinue(slot.n)}>
                  <Crest colors={slot.summary.colors} short={slot.summary.short} size={44} id={slot.summary.clubId} />
                  <span className="slot__body">
                    <b>{slot.summary.club}</b>
                    <span>{slot.summary.gmName} · Season {slot.summary.season} · Rep {slot.summary.reputation}{slot.summary.trophies ? ` · 🏆 ${slot.summary.trophies}` : ''}</span>
                    <span className="muted">{slot.summary.division} · {new Date(slot.summary.updated).toLocaleDateString()}</span>
                  </span>
                  <span className="slot__go">Continue ›</span>
                </button>
                <div className="slot__tools">
                  <button type="button" className="link-btn" onClick={() => setBackup({ n: slot.n, mode: 'export' })}>Back up</button>
                  <button type="button" className="link-btn" onClick={() => {
                    if (window.confirm(`Delete ${slot.summary.club} (slot ${slot.n})? This can't be undone.`)) { deleteSlot(slot.n); refresh(); }
                  }}>Delete</button>
                </div>
              </>
            ) : (
              <div className="slot__new">
                <span className="muted">Slot {slot.n} · empty</span>
                <div className="slot__actions">
                  <button type="button" className="btn btn--small btn--primary" onClick={() => onNew(slot.n)}>New career</button>
                  <button type="button" className="btn btn--small btn--ghost" onClick={() => setBackup({ n: slot.n, mode: 'import' })}>Restore</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button type="button" className="btn btn--ghost btn--block menu__managers" onClick={() => setShowManagers(true)}>Managers · all your careers</button>
      <button type="button" className="btn btn--ghost btn--block" onClick={() => setShowSettings(true)}>Settings</button>

      {backup && (
        <BackupSheet
          backup={backup}
          onClose={() => setBackup(null)}
          onImport={(state) => { onImport(backup.n, state); setBackup(null); }}
        />
      )}
      {showManagers && <ManagersSheet onClose={() => setShowManagers(false)} />}
      {showSettings && <SettingsSheet settings={settings} setSettings={setSettings} onClose={() => setShowSettings(false)} />}
    </div>
  );
}

function BackupSheet({ backup, onClose, onImport }) {
  const [text, setText] = useState(backup.mode === 'export' ? exportSlot(backup.n) || '' : '');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const download = () => {
    const blob = new Blob([text], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `football-cards-slot-${backup.n}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); } catch { setCopied(false); }
  };
  const pickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then(setText);
  };
  return (
    <Sheet title={backup.mode === 'export' ? `Back up slot ${backup.n}` : `Restore into slot ${backup.n}`} onClose={onClose}>
      {backup.mode === 'export' ? (
        <>
          <p className="hint">Save this file (or copy the text) to move your career to another device, or keep it as a backup.</p>
          <div className="cta-row cta-row--tight">
            <button type="button" className="btn btn--primary" onClick={download}>Download file</button>
            <button type="button" className="btn btn--ghost" onClick={copy}>{copied ? 'Copied ✓' : 'Copy text'}</button>
          </div>
        </>
      ) : (
        <>
          <p className="hint">Choose a backup file, or paste the backup text.</p>
          <input type="file" accept="application/json,.json,.txt" onChange={pickFile} className="file-input" />
          <textarea className="backup-text" value={text} onChange={(e) => { setText(e.target.value); setError(''); }} placeholder="Paste backup text here" rows={5} />
          {error && <p className="hint hint--warn">{error}</p>}
          <button type="button" className="btn btn--primary btn--block" disabled={!text.trim()} onClick={() => {
            const r = importSave(text.trim());
            if (r.ok) onImport(r.state); else setError(r.error);
          }}>Restore</button>
        </>
      )}
    </Sheet>
  );
}

export function SettingsSheet({ settings, setSettings, onClose }) {
  const set = (patch) => setSettings({ ...settings, ...patch });
  return (
    <Sheet title="Settings" onClose={onClose}>
      <div className="settings">
        <Segmented
          label="Match speed"
          value={settings.speed}
          options={[{ id: 'normal', label: 'Normal' }, { id: 'fast', label: 'Fast' }, { id: 'instant', label: 'Instant' }]}
          onChange={(v) => set({ speed: v })}
        />
        <Toggle label="Auto-play matches" hint="Matches run on their own; you can still pause to make changes." value={settings.autoplay} onChange={(v) => set({ autoplay: v })} />
        <Toggle label="Reduce motion" hint="Fewer animations (goal banners, card flips)." value={settings.reduceMotion} onChange={(v) => set({ reduceMotion: v })} />
        <Toggle label="Show tips" hint="Short hints the first time you open each screen." value={settings.tips} onChange={(v) => set({ tips: v })} />
        <Toggle label="Real club badges" hint="Load real club badges from the internet. Off: generated crests in club colours." value={settings.realBadges !== false} onChange={(v) => set({ realBadges: v })} />
      </div>
    </Sheet>
  );
}

function Toggle({ label, hint, value, onChange }) {
  return (
    <label className="toggle">
      <span className="toggle__text"><b>{label}</b><span>{hint}</span></span>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle__track" aria-hidden="true"><i /></span>
    </label>
  );
}
