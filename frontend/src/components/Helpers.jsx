import { CATS, STATUS_UI } from '../data.js';

// Helper: category tile classes
function catCls(cat) {
  return `t-${CATS[cat]?.cls || 'neutral'}`;
}

// Category icon display
function CatIcon({ cat, size = 20 }) {
  const c = CATS[cat];
  return c ? <i className={`fa-solid fa-${c.desktop_icon}`} style={{ fontSize: size }} /> : null;
}

// Status badge chip
function StatusBadge({ status }) {
  const ui = STATUS_UI[status] || STATUS_UI.finding;
  return (
    <span className={`status ${ui.cls}`}>
      {ui.icon && <i className={`fa-solid fa-${ui.icon}`} />}
      {ui.label}
    </span>
  );
}

// Mini toggle switch component
function Toggle({ on, onChange }) {
  return (
    <button
      className={`toggle${on ? ' on' : ''}`}
      onClick={() => onChange(!on)}
      aria-checked={on}
      role="switch"
      type="button"
    />
  );
}

export { catCls, CatIcon, StatusBadge, Toggle };
