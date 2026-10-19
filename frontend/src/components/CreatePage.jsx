import { useState } from 'react';
import { CATS, FEE_BASE, TIME_OPTIONS } from '../data.js';

const DROP_CHIPS = ['Phelan P217 Lab', 'Library 3rd Floor', 'Xavier Hall Lobby', 'Santos Hall S104'];

export default function CreatePage({ state, onSubmit }) {
  const [items, setItems] = useState('');
  const [cat, setCat] = useState('');
  const [drop, setDrop] = useState('');
  const [notes, setNotes] = useState('');
  const [payment, setPayment] = useState('GCash');
  const [express, setExpress] = useState(false);
  const [timeIdx, setTimeIdx] = useState(0);
  const [showCatSheet, setShowCatSheet] = useState(false);
  const [showTimeSheet, setShowTimeSheet] = useState(false);
  const [errors, setErrors] = useState({});

  const fee = cat ? FEE_BASE[cat] + (express ? 15 : 0) : 20;

  function validate() {
    const e = {};
    if (!items.trim()) e.items = 'Tell us what to get or do.';
    if (!cat) e.cat = 'Please pick a category.';
    if (!drop.trim()) e.drop = 'Where should we deliver it?';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handlePost() {
    if (!validate()) return;
    onSubmit({ items, cat, drop, notes, payment, express, time: TIME_OPTIONS[timeIdx] });
    // reset
    setItems(''); setCat(''); setDrop(''); setNotes('');
  }

  const catInfo = CATS[cat];

  const catOptions = [
    { id: 'food',     icon: 'fa-burger',          label: 'Food',     cls: 'c-food' },
    { id: 'supplies', icon: 'fa-backpack',         label: 'Supplies', cls: 'c-supplies' },
    { id: 'errands',  icon: 'fa-person-running',   label: 'Errands',  cls: 'c-errands' },
    { id: 'printing', icon: 'fa-print',            label: 'Printing', cls: 'c-printing' },
  ];

  return (
    <section className="page active" id="page-create">
      <div className="formcols">
        {/* Left: request details */}
        <div className="panel">
          <div className="panel-head" style={{ marginBottom: 14 }}><h2>What do you need?</h2></div>

          {/* Category chips */}
          <div className="catrow" id="createCats" style={{ marginTop: 0 }}>
            {catOptions.map(opt => (
              <div
                key={opt.id}
                className={`cat ${opt.cls}${cat === opt.id ? ' sel' : ''}`}
                onClick={() => { setCat(opt.id); setErrors(e => ({ ...e, cat: '' })); }}
              >
                <span className="catcheck"><i className="fa-solid fa-check" style={{ fontSize: 11 }} /></span>
                <i className={`fa-solid ${opt.icon}`} />
                <span>{opt.label}</span>
              </div>
            ))}
          </div>
          {errors.cat && <div className="hint show">{errors.cat}</div>}

          {/* Items description */}
          <div className="field">
            <label>Items description <span className="req">*</span></label>
            <textarea
              className={`input${errors.items ? ' invalid' : ''}`}
              id="cs-items" rows={3}
              placeholder="e.g 2 pcs. lechon manok, 1 rice"
              value={items} onChange={e => { setItems(e.target.value); setErrors(er => ({ ...er, items: '' })); }}
            />
            {errors.items && <div className="hint show">{errors.items}</div>}
          </div>

          {/* Category select row */}
          <div className="field">
            <label>Category <span className="req">*</span></label>
            <div className="selectrow" onClick={() => setShowCatSheet(true)}>
              <div className={`tile ${catInfo ? `t-${catInfo.cls}` : 't-neutral'}`} style={{ width: 42, height: 42, borderRadius: 13 }}>
                <i className={`fa-solid fa-${catInfo ? catInfo.desktop_icon : 'box'}`} style={{ fontSize: 20 }} />
              </div>
              <div className={`grow${!cat ? ' ph' : ''}`}>
                {cat ? catInfo.name : 'Select a category'}
              </div>
              <i className="fa-solid fa-chevron-down" style={{ color: 'var(--muted)', fontSize: 18 }} />
            </div>
          </div>

          {/* Drop-off */}
          <div className="field">
            <label>Drop-off location <span className="req">*</span></label>
            <div className="inputwrap">
              <span className="lead"><i className="fa-solid fa-location-dot" /></span>
              <input
                className={`input has-lead${errors.drop ? ' invalid' : ''}`}
                id="cs-drop"
                placeholder="e.g Phelan P217 Lab (2nd Floor)"
                value={drop}
                onChange={e => { setDrop(e.target.value); setErrors(er => ({ ...er, drop: '' })); }}
              />
            </div>
            {/* Quick chips */}
            <div className="chips" style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginTop: 10 }}>
              {DROP_CHIPS.map(chip => (
                <button
                  key={chip}
                  className="chip-soft"
                  style={{ background: 'var(--bg-soft)', border: '1.5px solid var(--line)', borderRadius: 999, padding: '9px 16px', fontSize: 13, fontWeight: 800, color: 'var(--text-2)', cursor: 'pointer' }}
                  onClick={() => setDrop(chip)}
                  type="button"
                >
                  {chip}
                </button>
              ))}
            </div>
            {errors.drop && <div className="hint show">{errors.drop}</div>}
          </div>

          {/* Preferred time */}
          <div className="field">
            <label>Preferred time <span className="req">*</span></label>
            <div className="selectrow" onClick={() => setShowTimeSheet(true)}>
              <div className="tile t-neutral" style={{ width: 42, height: 42, borderRadius: 13 }}>
                <i className="fa-solid fa-clock" style={{ fontSize: 20 }} />
              </div>
              <div className="grow">{TIME_OPTIONS[timeIdx]}</div>
              <i className="fa-solid fa-chevron-right" style={{ color: 'var(--muted)', fontSize: 18 }} />
            </div>
          </div>

          {/* Notes */}
          <div className="field">
            <label>Notes <span style={{ color: 'var(--muted)', fontWeight: 700 }}>(optional)</span></label>
            <textarea
              className="input" id="cs-notes" rows={2}
              placeholder="e.g Please get extra chilli oil. Thanks!"
              value={notes} onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Right: order setup */}
        <div className="stickycol">
          <div className="panel">
            <div className="panel-head"><h2>Order setup</h2></div>

            {/* Payment */}
            <div className="field" style={{ marginTop: 4 }}>
              <label>Payment method</label>
              <div className="payseg">
                {[
                  { id: 'GCash', icon: 'fa-wallet', label: 'GCash' },
                  { id: 'Cash on Delivery', icon: 'fa-money-bill-wave', label: 'Cash' },
                  { id: 'Maya', icon: 'fa-credit-card', label: 'Maya' },
                ].map(p => (
                  <button
                    key={p.id}
                    className={payment === p.id ? 'sel' : ''}
                    onClick={() => setPayment(p.id)}
                    type="button"
                  >
                    <i className={`fa-solid ${p.icon}`} /> {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Express toggle */}
            <div className="switchline" style={{ marginTop: 12 }}>
              <div className="sic" style={{ background: 'var(--yellow-pale)', color: 'var(--yellow-ink)' }}>
                <i className="fa-solid fa-bolt" />
              </div>
              <div>
                <b>Express delivery</b>
                <p>Rush in 30–45 min · +₱15</p>
              </div>
              <button
                className={`toggle${express ? ' on' : ''}`}
                onClick={() => setExpress(v => !v)}
                style={{ marginLeft: 'auto' }}
                type="button"
              />
            </div>

            {/* Fee box */}
            <div className="feebox">
              <div>
                <small>Estimated delivery fee</small>
                <b id="cs-fee">₱{fee} – ₱{fee + 10}</b>
              </div>
              <i className="fa-solid fa-receipt" style={{ fontSize: 24, color: 'var(--yellow-ink)' }} />
            </div>

            <button className="btn btn-primary" onClick={handlePost} style={{ marginTop: 18 }} type="button">
              <i className="fa-solid fa-box" />Post Request
            </button>
            <p className="smallnote">Free cancellation until a courier picks up your items.</p>
          </div>

          {/* Why Knights panel */}
          <div className="panel">
            <div className="panel-head"><h2>Why Knights?</h2></div>
            {[
              { icon: 'fa-person-running', title: 'Live tracking, no map needed', sub: 'Step-by-step journey & arrival countdown' },
              { icon: 'fa-shield-halved', title: 'Secure PIN handoff', sub: 'Only you can confirm the drop-off' },
              { icon: 'fa-comment', title: 'Chat & call the courier', sub: 'Built into every order' },
            ].map(item => (
              <div key={item.title} className="mrowz">
                <span className="mic"><i className={`fa-solid ${item.icon}`} /></span>
                <div className="grow">
                  <b>{item.title}</b>
                  <small>{item.sub}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category sheet overlay */}
      {showCatSheet && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(14,12,36,.5)', backdropFilter: 'blur(2px)' }}
          onClick={() => setShowCatSheet(false)}>
          <div style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', background: 'var(--surface)', borderRadius: 24, padding: '24px 24px 28px', width: 380, maxWidth: '95vw', boxShadow: 'var(--shadow-pop)' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--ink)', marginBottom: 16 }}>Select category</h2>
            {catOptions.map(opt => (
              <div key={opt.id} className="mrowz" style={{ cursor: 'pointer', padding: '13px 6px' }}
                onClick={() => { setCat(opt.id); setShowCatSheet(false); setErrors(e => ({ ...e, cat: '' })); }}>
                <span className={`tile t-${opt.id}`} style={{ width: 44, height: 44 }}>
                  <i className={`fa-solid ${opt.icon}`} style={{ fontSize: 20 }} />
                </span>
                <div className="grow"><b>{opt.label}</b></div>
                {cat === opt.id && <i className="fa-solid fa-check" style={{ color: 'var(--navy)', fontSize: 16 }} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time sheet overlay */}
      {showTimeSheet && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(14,12,36,.5)', backdropFilter: 'blur(2px)' }}
          onClick={() => setShowTimeSheet(false)}>
          <div style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', background: 'var(--surface)', borderRadius: 24, padding: '24px 24px 28px', width: 380, maxWidth: '95vw', boxShadow: 'var(--shadow-pop)' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--ink)', marginBottom: 16 }}>Preferred time</h2>
            {TIME_OPTIONS.map((opt, i) => (
              <div key={opt} className="mrowz" style={{ cursor: 'pointer', padding: '13px 6px' }}
                onClick={() => { setTimeIdx(i); setShowTimeSheet(false); }}>
                <span className="tile t-neutral" style={{ width: 44, height: 44 }}>
                  <i className="fa-solid fa-clock" style={{ fontSize: 20 }} />
                </span>
                <div className="grow"><b>{opt}</b></div>
                {timeIdx === i && <i className="fa-solid fa-check" style={{ color: 'var(--navy)', fontSize: 16 }} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
