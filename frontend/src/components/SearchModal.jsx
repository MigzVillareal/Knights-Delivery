// Quick Search Modal

import { useState, useEffect } from 'react';

const POPULAR_SEARCHES = [
  { name: "Lechon Manok (whole)", cat: "food", price: "₱120", shop: "Bam-Bam's Canteen", icon: "fa-burger" },
  { name: "Rice Meal Combo", cat: "food", price: "₱85", shop: "Bam-Bam's Canteen", icon: "fa-burger" },
  { name: "Iced Latte", cat: "food", price: "₱95", shop: "Xavier Cafe", icon: "fa-mug-hot" },
  { name: "Notebook & Pens Set", cat: "supplies", price: "₱75", shop: "ADNU Bookstore", icon: "fa-backpack" },
  { name: "Bond Paper (A4, 100s)", cat: "supplies", price: "₱95", shop: "ADNU Bookstore", icon: "fa-file" },
  { name: "Photocopy (10 pages)", cat: "printing", price: "₱20", shop: "Print Hub, Phelan", icon: "fa-print" },
  { name: "Thesis Printing (colored)", cat: "printing", price: "₱150", shop: "Print Hub, Phelan", icon: "fa-print" },
  { name: "Claim documents", cat: "errands", price: "₱30", shop: "Registrar's Office", icon: "fa-person-running" },
];

export default function SearchModal({ isOpen, onClose, onSelectSearch }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? POPULAR_SEARCHES.filter(
        item =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.shop.toLowerCase().includes(query.toLowerCase()) ||
          item.cat.toLowerCase().includes(query.toLowerCase())
      )
    : POPULAR_SEARCHES;

  return (
    <div className={`modal-wrap${isOpen ? ' open' : ''}`} onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="sm-head">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            type="text"
            placeholder="Search food, supplies, printing, campus spots..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <kbd>ESC</kbd>
        </div>
        <div className="sm-body">
          <div className="sm-title">{query ? 'Search Results' : 'Popular Campus Requests'}</div>
          {filtered.length === 0 ? (
            <div style={{ padding: '24px 10px', color: 'var(--muted)', textAlign: 'center', fontWeight: 600 }}>
              No matches found for "{query}". Try "food", "print", or "bookstore".
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={idx}
                className="sm-row"
                onClick={() => {
                  onSelectSearch(item);
                  onClose();
                }}
              >
                <div className={`tile t-${item.cat}`} style={{ width: 40, height: 40, borderRadius: 12 }}>
                  <i className={`fa-solid ${item.icon}`} />
                </div>
                <div className="grow">
                  <h4>{item.name}</h4>
                  <p>{item.shop} · {item.price}</p>
                </div>
                <button className="minibtn primary" type="button">
                  Request <i className="fa-solid fa-arrow-right" style={{ fontSize: 10, marginLeft: 4 }} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
