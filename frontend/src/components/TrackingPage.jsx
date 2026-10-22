import { CATS, STAGES, COURIER } from '../data.js';

export default function TrackingPage({ state, onOpenChat }) {
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
  const stageIdx = activeOrder.stage ?? 0;

  const STEP_ICONS = ['fa-inbox', 'fa-user', 'fa-location-dot', 'fa-circle-check'];

  return (
    <section className="page active" id="page-tracking">
      <div className="trackgrid">
        {/* Left column */}
        <div>
          <div className="trackcard" id="tr-hero">
            <div className="tk-top">
              <b>{activeOrder.id} · {cat?.name}</b>
              <span className="livechip">
                <span className="pulse-dot" />
                LIVE
              </span>
            </div>
            <div className="tk-eta">{STAGES[stageIdx]?.label || 'On the way'}</div>
            <p className="tk-sub">Delivering to {activeOrder.dropoff}</p>
            <div className="progress">
              <i style={{ width: `${((stageIdx + 1) / STAGES.length) * 100}%` }} />
            </div>
            <div className="tk-btns">
              <button className="tk-main" onClick={onOpenChat} type="button" style={{ width: '100%' }}>
                <i className="fa-solid fa-comment" /> Chat with courier
              </button>
            </div>
          </div>

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
              <span>
                {stageIdx === 3
                  ? 'Order delivered successfully!'
                  : stageIdx === 2
                  ? `Courier is heading to ${activeOrder.dropoff}`
                  : stageIdx === 1
                  ? `${COURIER.name} has accepted your order`
                  : 'Finding an active student courier nearby'}
              </span>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div>
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
                <p style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 700 }}>Knight Courier</p>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <button className="minibtn primary" onClick={onOpenChat} style={{ width: '100%', padding: '10px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} type="button">
                <i className="fa-solid fa-comment" /> Chat with courier
              </button>
            </div>
          </div>

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
        </div>
      </div>
    </section>
  );
}
