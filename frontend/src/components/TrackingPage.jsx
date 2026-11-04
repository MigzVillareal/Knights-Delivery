import { CATS, STAGES, formatOrderId } from '../data.js';

export default function TrackingPage({ state, onOpenChat, onSelectOrder }) {
  const orders = state.orders || [];
  const trackedId = state.trackingOrderId;
  const activeOrder = (trackedId ? orders.find(o => o.id === trackedId) : null)
    || orders.find(o => ['finding', 'accepted', 'picked', 'in_progress', 'on_way', 'arriving'].includes(o.status))
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
  const isDelivered = activeOrder.status === 'delivered' || activeOrder.status === 'completed' || (activeOrder.stage !== undefined && activeOrder.stage >= 3);
  const stageIdx = isDelivered ? 3 : (activeOrder.stage ?? 0);

  const courierAssigned = Boolean(activeOrder.runnerId || activeOrder.courierName || stageIdx > 0);
  const realCourierName = activeOrder.courierName || activeOrder.runnerName || null;
  const displayCourierName = realCourierName || (courierAssigned ? 'A Knight Courier' : 'Finding a Courier...');
  const courierInitials = realCourierName
    ? (realCourierName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'KC')
    : 'KC';

  function handleChat() {
    if (onOpenChat) {
      onOpenChat({
        name: courierAssigned ? displayCourierName : 'Knight Support',
        subtitle: `Courier · ${activeOrder.shortId || formatOrderId(activeOrder.id)}`,
        avatar: courierInitials,
      });
    }
  }

  const STEP_ICONS = ['fa-inbox', 'fa-user', 'fa-location-dot', 'fa-circle-check'];

  return (
    <section className="page active" id="page-tracking">
      {orders.length > 1 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 14 }}>
          {orders.map(o => {
            const isSel = o.id === activeOrder.id;
            const oDelivered = o.status === 'delivered' || o.status === 'completed';
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => onSelectOrder && onSelectOrder(o.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 800,
                  border: isSel ? '2px solid var(--navy)' : '1px solid var(--line)',
                  background: isSel ? 'var(--navy)' : 'var(--surface)',
                  color: isSel ? '#fff' : 'var(--ink)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{o.shortId || formatOrderId(o.id)}</span>
                <span style={{ fontSize: 11, opacity: isSel ? 0.9 : 0.65 }}>
                  {oDelivered ? '✓ Delivered' : '• Live'}
                </span>
              </button>
            );
          })}
        </div>
      )}
      <div className="trackgrid">
        {/* Left column */}
        <div>
          <div className="trackcard" id="tr-hero">
            <div className="tk-top">
              <b>{activeOrder.shortId || formatOrderId(activeOrder.id)} · {cat?.name}</b>
              {isDelivered ? (
                <span className="livechip" style={{ background: '#dcfce7', color: '#166534' }}>
                  <i className="fa-solid fa-check" style={{ fontSize: 10, marginRight: 4 }} />
                  DELIVERED
                </span>
              ) : (
                <span className="livechip">
                  <span className="pulse-dot" />
                  LIVE
                </span>
              )}
            </div>
            <div className="tk-eta">{isDelivered ? 'Delivered' : (STAGES[stageIdx]?.label || 'On the way')}</div>
            <p className="tk-sub">
              {isDelivered ? `Successfully delivered to ${activeOrder.dropoff}` : `Delivering to ${activeOrder.dropoff}`}
            </p>
            <div className="progress">
              <i style={{ width: isDelivered ? '100%' : `${((stageIdx + 1) / STAGES.length) * 100}%` }} />
            </div>
            <div className="tk-btns">
              {isDelivered ? (
                <button className="tk-main" onClick={handleChat} type="button" style={{ width: '100%', background: 'var(--navy)' }}>
                  <i className="fa-solid fa-circle-check" /> Order Complete
                </button>
              ) : (
                <button className="tk-main" onClick={handleChat} type="button" style={{ width: '100%' }}>
                  <i className="fa-solid fa-comment" /> Chat with courier
                </button>
              )}
            </div>
          </div>

          <div className="panel" style={{ marginBottom: 18 }}>
            <div className="jhead">
              <h2>Live journey</h2>
              {isDelivered ? (
                <span className="livechip" id="tr-livechip" style={{ background: '#dcfce7', color: '#166534' }}>
                  <i className="fa-solid fa-check" style={{ fontSize: 10, marginRight: 4 }} />
                  COMPLETED
                </span>
              ) : (
                <span className="livechip" id="tr-livechip">
                  <span className="pulse-dot" />
                  LIVE
                </span>
              )}
            </div>
            <div className="stepper" id="tr-steps">
              {STAGES.map((stage, i) => {
                const done = isDelivered ? true : (i < stageIdx);
                const current = isDelivered ? false : (i === stageIdx);
                return (
                  <div key={i} className={`step${done ? ' done' : current ? ' current' : ''}`}>
                    {i < STAGES.length - 1 && <div className="line" />}
                    <div className="dot">
                      <i className={`fa-solid ${STEP_ICONS[i]}`} />
                    </div>
                    <div className="sinfo">
                      <h4>{stage.label}</h4>
                      <p>
                        {stage.sub
                          .replace('A Knight Courier', realCourierName || 'A Knight Courier')
                          .replace('{courier}', realCourierName || 'A Knight Courier')
                          .replace('{dropoff}', activeOrder.dropoff)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="feedline" id="tr-feed" style={isDelivered ? { background: '#dcfce7', color: '#166534' } : {}}>
              <i className={`fa-solid ${isDelivered ? 'fa-circle-check' : 'fa-bell'}`} style={isDelivered ? { color: '#16a34a' } : {}} />
              <span>
                {isDelivered
                  ? 'Order delivered successfully! Thank you for using Knights Delivery.'
                  : stageIdx === 2
                  ? `Courier is heading to ${activeOrder.dropoff}`
                  : stageIdx === 1
                  ? `${realCourierName ? `${realCourierName} has` : 'A Knight Courier has'} accepted your order`
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
                {courierAssigned ? courierInitials : <i className="fa-solid fa-person-running" style={{ fontSize: 20 }} />}
                {courierAssigned && (
                  <span className="vbadge"><i className="fa-solid fa-check" /></span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--ink)' }}>
                  {displayCourierName}
                </h3>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 700 }}>
                  {courierAssigned ? 'Verified Knight Courier' : 'Awaiting assignment'}
                </p>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <button className="minibtn primary" onClick={handleChat} style={{ width: '100%', padding: '10px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} type="button">
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
