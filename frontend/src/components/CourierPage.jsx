import { CATS, formatOrderId } from '../data.js';

export default function CourierPage({ state, onUpdate, onAccept, onAdvance, onNavigate, onOpenChat, onRefreshQueue }) {
  const subTab = state.courierSubTab || 'available';
  const { courierOnline = true, courierEarnings = 0, courierTrips = 0, availableOrders = [], courierTripsLog = [], activeCourierOrderId } = state;

  const courierUser = state.user || {};
  const courierName = courierUser.fullName || courierUser.first || 'Knight Courier';
  const courierInitials = (courierName || 'KC')
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'KC';

  function toggleOnline() {
    if (onUpdate) onUpdate({ courierOnline: !courierOnline });
  }

  function handleAccept(orderId) {
    if (onAccept) {
      onAccept(orderId);
    } else if (onUpdate) {
      onUpdate({
        activeCourierOrderId: orderId,
        availableOrders: availableOrders.map(o => o?.id === orderId ? { ...o, status: 'accepted', stage: 1 } : o),
      });
      onNavigate('courier', 'active');
    }
  }

  function handleDecline(orderId) {
    if (onUpdate) {
      onUpdate({ availableOrders: availableOrders.filter(o => o?.id !== orderId) });
    }
  }

  const activeOrder = activeCourierOrderId
    ? availableOrders.find(o => o?.id === activeCourierOrderId)
    : null;

  const myOrderIds = new Set((state.orders || []).map(o => o?.id));
  const openOrders = (availableOrders || []).filter(o => {
    if (!o || o.status !== 'finding') return false;
    if (myOrderIds.has(o.id)) return false;
    if (courierUser?.id && o.customerId && o.customerId === courierUser.id) return false;
    return true;
  });
  const openCount = openOrders.length;

  return (
    <section className="page active" id="page-courier">
      {/* Hero card */}
      <div className="courier-hero-card">
        <div className="courier-topline">
          <div className="courier-id">
            <div className="avatar" style={{ width: 52, height: 52, background: 'var(--yellow)', color: 'var(--navy)', fontSize: 18, fontWeight: 800 }}>
              {courierInitials}
              <span className="vbadge"><i className="fa-solid fa-check" /></span>
            </div>
            <div>
              <h2>{courierName}</h2>
              <p>Knight Courier · Ateneo de Naga</p>
            </div>
          </div>
          <button
            className={`courier-status-btn${courierOnline ? ' online' : ''}`}
            onClick={toggleOnline}
            type="button"
          >
            <span className="pulse-dot" />
            <span>{courierOnline ? 'Online · Receiving Orders' : 'Offline'}</span>
          </button>
        </div>

        <div className="courier-stat-grid">
          {[
            { label: "Today's Earnings", val: `₱${courierEarnings}`, sub: `${courierTrips} completed runs` },
            { label: 'Deliveries Today', val: courierTrips, sub: 'Completed' },
            { label: 'Available Nearby', val: openCount, sub: 'orders waiting' },
            { label: 'Acceptance Rate', val: '98%', sub: 'Top rated' },
          ].map(s => (
            <div key={s.label} className="c-stat-box">
              <small>{s.label}</small>
              <b>{s.val}</b>
              <span className="c-sub">{s.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="courier-tabs" id="courierSubTabs">
        <button className={`courier-tab${subTab === 'available' ? ' active' : ''}`} onClick={() => onNavigate('courier', 'available')} type="button">
          <i className="fa-solid fa-star" /> Available Orders
          {openCount > 0 && <span className="c-badge">{openCount}</span>}
        </button>
        <button className={`courier-tab${subTab === 'active' ? ' active' : ''}`} onClick={() => onNavigate('courier', 'active')} type="button">
          <i className="fa-solid fa-person-running" /> Active Delivery
          {activeOrder && <span className="c-badge">1</span>}
        </button>
        <button className={`courier-tab${subTab === 'earnings' ? ' active' : ''}`} onClick={() => onNavigate('courier', 'earnings')} type="button">
          <i className="fa-solid fa-receipt" /> Earnings &amp; History
        </button>
      </div>

      {/* Available orders panel */}
      {subTab === 'available' && (
        <div id="cpanel-available">
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)' }}>Campus Radar</h2>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 700 }}>Orders ready for pickup around ADNU campus</p>
            </div>
            {onRefreshQueue && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={onRefreshQueue}
                type="button"
                style={{ borderRadius: 10, padding: '6px 12px', fontSize: 13 }}
              >
                <i className="fa-solid fa-rotate-right" /> Refresh
              </button>
            )}
          </div>
          <div id="c-available-list">
            {state.loadingCourierQueue ? (
              <div className="emptydesk" style={{ padding: '48px 20px' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: 'var(--yellow-ink)', marginBottom: 14 }} />
                <h3>Scanning campus radar...</h3>
                <p>Checking for open delivery orders</p>
              </div>
            ) : state.courierQueueError ? (
              <div className="emptydesk">
                <div className="esi" style={{ background: '#fee2e2' }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ef4444' }} />
                </div>
                <h3>Unable to load queue</h3>
                <p>{state.courierQueueError}</p>
                {onRefreshQueue && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={onRefreshQueue}
                    type="button"
                    style={{ marginTop: 14, borderRadius: 10 }}
                  >
                    Try Again
                  </button>
                )}
              </div>
            ) : openOrders.length === 0 ? (
              <div className="emptydesk">
                <div className="esi"><i className="fa-solid fa-radar" style={{ fontSize: 28 }} /></div>
                <h3>No orders nearby</h3>
                <p>New requests will appear here automatically. Stay online to receive them.</p>
              </div>
            ) : (
              openOrders.map(order => {
                const cat = CATS[order.cat] || CATS.food;
                const fee = order.fee === null || order.fee === undefined ? null : Number(order.fee);
                const tip = Number(order.tip) || 0;
                return (
                  <div key={order.id} className="order-accept-card">
                    <div className="order-card-header">
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{order.shortId || formatOrderId(order.id)} · {order.time}</span>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--ink)', marginTop: 2 }}>{order.title || order.items}</h3>
                      </div>
                      <div className="order-payout">
                        {fee === null ? (
                          <span className="earn-breakdown">Payout not configured</span>
                        ) : (
                          <>
                            <span className="earn-val">₱{fee + tip}</span>
                            <span className="earn-breakdown">₱{fee} + ₱{tip} tip</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="route-container">
                      <div className="route-step">
                        <span className="route-dot pickup"><i className="fa-solid fa-circle-dot" style={{ fontSize: 7 }} /></span>
                        <small>Pickup</small>
                        <b>{order.pickup || 'Location not specified'}</b>
                      </div>
                      <div className="route-step">
                        <span className="route-dot drop"><i className="fa-solid fa-location-dot" style={{ fontSize: 8 }} /></span>
                        <small>Drop-off</small>
                        <b>{order.dropoff || 'Location not specified'}</b>
                      </div>
                    </div>

                    <div className="order-items-snippet">
                      <i className="fa-solid fa-box" />
                      {order.items}
                    </div>

                    <div className="order-accept-actions">
                      <button className="btn-accept" onClick={() => handleAccept(order.id)} type="button">
                        <i className="fa-solid fa-check" /> Accept Order
                      </button>
                      <button className="btn-decline" onClick={() => handleDecline(order.id)} type="button">Decline</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Active delivery panel */}
      {subTab === 'active' && (
        <div id="cpanel-active">
          {!activeOrder ? (
            <div className="emptydesk">
              <div className="esi"><i className="fa-solid fa-person-running" /></div>
              <h3>No active delivery</h3>
              <p>Accept an available order to start a delivery run.</p>
            </div>
          ) : (
            <div style={{ background: 'var(--surface)', borderRadius: 24, border: '2px solid var(--navy-soft)', boxShadow: 'var(--shadow-card)', padding: 24, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18, paddingBottom: 16, borderBottom: '1.5px solid var(--line)' }}>
                <div>
                  <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 800 }}>{activeOrder.shortId || formatOrderId(activeOrder.id)} · ACTIVE</span>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)', marginTop: 2 }}>{activeOrder.title || activeOrder.items}</h2>
                </div>
                <div className="order-payout">
                  {activeOrder.fee === null || activeOrder.fee === undefined ? (
                    <span className="earn-breakdown">Payout not configured</span>
                  ) : (
                    <>
                      <span className="earn-val">₱{Number(activeOrder.fee) + (Number(activeOrder.tip) || 0)}</span>
                      <span className="earn-breakdown">Estimate only · payout rules not configured</span>
                    </>
                  )}
                </div>
              </div>
              <div style={{ background: 'var(--bg-soft)', borderRadius: 18, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <b style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>{activeOrder.student || 'Student'}</b>
                  <small style={{ display: 'block', color: 'var(--muted)', fontWeight: 700 }}>{activeOrder.phone || 'No phone provided'}</small>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="minibtn primary"
                    type="button"
                    onClick={() => {
                      if (onOpenChat) {
                        onOpenChat({
                          name: activeOrder.student || 'Student',
                          subtitle: `Student · ${activeOrder.shortId || formatOrderId(activeOrder.id)}`,
                          avatar: (activeOrder.student || 'ST')
                            .split(' ')
                            .map(w => w[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase(),
                          placeholder: `Message ${activeOrder.student || 'student'}...`,
                          isCourierMode: true,
                        });
                      }
                    }}
                  >
                    <i className="fa-solid fa-comment" /> Chat
                  </button>
                </div>
              </div>
              <div className="route-container">
                <div className="route-step">
                  <span className="route-dot pickup"><i className="fa-solid fa-circle-dot" style={{ fontSize: 7 }} /></span>
                  <small>Pickup</small><b>{activeOrder.pickup}</b>
                </div>
                <div className="route-step">
                  <span className="route-dot drop"><i className="fa-solid fa-location-dot" style={{ fontSize: 8 }} /></span>
                  <small>Drop-off</small><b>{activeOrder.dropoff}</b>
                </div>
              </div>
              {activeOrder.notes && (
                <div style={{ background: 'var(--yellow-pale)', borderRadius: 14, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--yellow-ink)', fontWeight: 700 }}>
                  <i className="fa-solid fa-note-sticky" /> {activeOrder.notes}
                </div>
              )}
              <div>
                {activeOrder.status === 'accepted' ? (
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => onAdvance && onAdvance(activeOrder.id, 'start')}
                    style={{ width: '100%', borderRadius: 14, fontSize: 14, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    <i className="fa-solid fa-person-running" /> Start delivery
                  </button>
                ) : (
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => onAdvance && onAdvance(activeOrder.id, 'mark_delivered')}
                  style={{ width: '100%', borderRadius: 14, fontSize: 14, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <i className="fa-solid fa-circle-check" /> Delivered
                </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Earnings panel */}
      {subTab === 'earnings' && (
        <div id="cpanel-earnings">
          <div className="panel">
            <div className="panel-head"><h2>Today's Completed Trips</h2></div>
            <div id="c-earnings-list">
              {courierTripsLog.length === 0 ? (
                <div className="emptydesk" style={{ padding: '36px 16px' }}>
                  <div className="esi"><i className="fa-solid fa-receipt" style={{ fontSize: 24 }} /></div>
                  <h3>No completed deliveries today</h3>
                  <p>Completed deliveries and earnings will show up here.</p>
                </div>
              ) : (
                courierTripsLog.map(trip => {
                  const cat = CATS[trip.cat] || CATS.food;
                  return (
                    <div key={trip.id} className="listrow">
                      <div className={`tile t-${cat?.cls || 'neutral'}`} style={{ width: 44, height: 44 }}>
                        <i className={`fa-solid fa-${cat?.desktop_icon || 'box'}`} style={{ fontSize: 18 }} />
                      </div>
                      <div className="tcell">
                        <b>{trip.title || trip.items}</b>
                        <small>{trip.dropoff}</small>
                      </div>
                      <span className="rdate">{trip.time}</span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--ok)', fontSize: 15 }}>
                          ₱{trip.fee}
                        </span>
                        {trip.tip > 0 && (
                          <span style={{ background: 'var(--yellow-pale)', color: 'var(--yellow-ink)', fontSize: 11, fontWeight: 800, borderRadius: 999, padding: '2px 8px' }}>
                            +₱{trip.tip} tip
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
