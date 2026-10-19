import { useState } from 'react';
import { CATS, STAGES, COURIER } from '../data.js';

export default function TrackingPage({ state, onOpenChat }) {
  const [pinHidden, setPinHidden] = useState(true);
  const orders = state.orders || [];
  const activeOrder = orders.find(o => ['finding','accepted','picked','on_way','arriving'].includes(o.status))
    || orders[0];

  if (!activeOrder) {
    return (
      <section className="page active" id="page-tracking">
        <div className="emptydesk" style={{ padding: '80px 20px' }}>
          <div className="esi"><i className="fa-solid fa-person-running" /></div>
          <h3>No active delivery</h3>
          <p>Create a request to start tracking your courier in real time.</p>
        </div>
      </section>
    );
  }

  const cat = CATS[activeOrder.cat];
  const stageIdx = activeOrder.stage ?? 3;
  const pin = activeOrder.pin || '7341';
  const eta = 18;

  const STEP_ICONS = ['fa-inbox', 'fa-user', 'fa-box', 'fa-person-running', 'fa-location-dot', 'fa-circle-check'];

  return (
    <section className="page active" id="page-tracking">
      <div className="trackgrid">
        {/* Left column */}
        <div>
          {/* Hero tracking card */}
          <div className="trackcard" id="tr-hero">
            <div className="tk-top">
              <b>{activeOrder.id} · {cat?.name}</b>
              <span className="livechip">
                <span className="pulse-dot" />
                LIVE
              </span>
            </div>
            <div className="tk-eta">~{eta} min</div>
            <p className="tk-sub">ETA: arriving soon at {activeOrder.dropoff}</p>
            <div className="progress">
              <i style={{ width: `${((stageIdx + 1) / STAGES.length) * 100}%` }} />
            </div>
            <div className="tk-btns">
              <button className="tk-main" onClick={onOpenChat} type="button">
                <i className="fa-solid fa-comment" /> Chat with courier
              </button>
              <button className="tk-ghost" type="button" onClick={() => window.open(`tel:${activeOrder.phone || '09175554821'}`)}>
                <i className="fa-solid fa-phone" />
              </button>
            </div>
          </div>

          {/* Journey steps */}
          <div className="panel" style={{ marginBottom: 18 }}>
            <div className="jhead">
              <h2>Live journey</h2>
              <span className="livechip" id="tr-livechip">
                <span className="pulse-dot" />
                LIVE
              </span>
            </div>
            <div className="stepper" id="tr-steps">
              {STAGES.map((stage, i) => {
                const done = i < stageIdx;
                const current = i === stageIdx;
                return (
                  <div key={i} className={`step${done ? ' done' : current ? ' current' : ''}`}>
                    {i < STAGES.length - 1 && <div className="line" />}
                    <div className="dot">
                      <i className={`fa-solid ${STEP_ICONS[i]}`} />
                    </div>
                    <div className="sinfo">
                      <h4>{stage.label}</h4>
                      <p>{stage.sub.replace('{courier}', COURIER.name).replace('{dropoff}', activeOrder.dropoff)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="feedline" id="tr-feed">
              <i className="fa-solid fa-star" />
              <span>Courier is near your drop-off point</span>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* Courier card */}
          <div className="panel" style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="avatar" style={{ width: 56, height: 56, position: 'relative' }}>
                {COURIER.initials}
                <span className="vbadge"><i className="fa-solid fa-check" /></span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--ink)' }}>
                  {COURIER.name} <span style={{ fontSize: 13, color: 'var(--yellow-ink)' }}>★ {COURIER.rating}</span>
                </h3>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 700 }}>{COURIER.vehicle}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button className="minibtn" style={{ flex: 1, padding: '10px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} type="button">
                <i className="fa-solid fa-phone" /> Call
              </button>
              <button className="minibtn primary" style={{ flex: 1, padding: '10px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} type="button">
                <i className="fa-solid fa-comment" /> Chat
              </button>
            </div>
          </div>

          {/* PIN Card */}
          <div className="pin-card" id="tr-pin">
            <div className="pic"><i className="fa-solid fa-shield-halved" /></div>
            <div className="grow">
              <h4>Delivery PIN</h4>
              <p>Show this to your courier at handoff</p>
            </div>
            <div className="pindigits" id="tr-pindigits">
              {(pinHidden ? '••••' : pin).split('').map((d, i) => (
                <b key={i}>{d}</b>
              ))}
            </div>
            <button className="eyebtn" onClick={() => setPinHidden(v => !v)} id="tr-pineye" type="button">
              <i className={`fa-solid fa-${pinHidden ? 'eye' : 'eye-slash'}`} />
            </button>
          </div>

          {/* Order summary */}
          <div className="panel" id="tr-summary">
            <div className="panel-head"><h2>Order summary</h2></div>
            <div style={{ marginTop: 8 }}>
              {[
                { icon: 'fa-box', label: 'Items', val: activeOrder.items },
                { icon: 'fa-location-dot', label: 'Drop-off', val: activeOrder.dropoff },
                { icon: 'fa-receipt', label: 'Delivery fee', val: `₱${activeOrder.fee || 20}` },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1.5px dashed var(--line-2)', alignItems: 'flex-start' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--navy-tint)', color: 'var(--navy-soft)', display: 'grid', placeItems: 'center' }}>
                    <i className={`fa-solid ${row.icon}`} />
                  </div>
                  <div>
                    <small style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{row.label}</small>
                    <b style={{ fontSize: 14, color: 'var(--text)' }}>{row.val}</b>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div id="tr-actions" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
            <button className="btn btn-primary btn-sm" type="button" style={{ width: 'auto' }}>
              <i className="fa-solid fa-circle-check" /> Confirm delivery
            </button>
            <button className="btn btn-soft" type="button" style={{ borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 18px', fontSize: 14 }}>
              <i className="fa-solid fa-triangle-exclamation" /> Report an issue
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
