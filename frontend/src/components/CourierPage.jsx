import { useState } from 'react';
import { CATS } from '../data.js';

export default function CourierPage({ state, onUpdate, onNavigate }) {
  const [subTab, setSubTab] = useState('available');
  const { courierOnline, courierEarnings, courierTrips, availableOrders = [], courierTripsLog = [], activeCourierOrderId } = state;

  function toggleOnline() {
    onUpdate({ courierOnline: !courierOnline });
  }

  function acceptOrder(orderId) {
    onUpdate({
      activeCourierOrderId: orderId,
      availableOrders: availableOrders.map(o => o.id === orderId ? { ...o, status: 'accepted', stage: 1 } : o),
    });
    setSubTab('active');
  }

  function declineOrder(orderId) {
    onUpdate({ availableOrders: availableOrders.filter(o => o.id !== orderId) });
  }

  function addSimulatedOrder() {
    const id = `KD-${2440 + availableOrders.length}`;
    onUpdate({
      availableOrders: [...availableOrders, {
        id, title: 'Simulated Test Order', cat: 'food',
        items: '1x Rice Meal Combo, 1 Iced Latte',
        pickup: "Xavier Cafe (Admin Bldg)", dropoff: 'Library 3rd Floor',
        fee: 25, tip: 5, student: 'Test Student', phone: '+63 900 000 0000',
        time: 'just now', etaWalk: '2 min walk',
        notes: 'No notes.', pin: '0000', status: 'finding', stage: 0,
      }],
    });
  }

  const activeOrder = activeCourierOrderId
    ? availableOrders.find(o => o.id === activeCourierOrderId)
    : null;

  const openCount = availableOrders.filter(o => o.status === 'finding').length;
  const walletBalance = courierEarnings + courierTripsLog.reduce((a, t) => a + t.fee + (t.tip || 0), 0);

  return (
    <section className="page active" id="page-courier">
      {/* Hero card */}
      <div className="courier-hero-card">
        <div className="courier-topline">
          <div className="courier-id">
            <div className="avatar" style={{ width: 52, height: 52, background: 'var(--yellow)', color: 'var(--navy)', fontSize: 18 }}>
              JD
              <span className="vbadge"><i className="fa-solid fa-check" /></span>
            </div>
            <div>
              <h2>Juan Dela Cruz <span style={{ fontSize: 14, color: 'var(--yellow)', fontWeight: 800, verticalAlign: 1 }}>★ 4.9</span></h2>
              <p>Knight Courier · Honda Click MC 4821 · Ateneo de Naga</p>
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
            { label: 'Deliveries Today', val: courierTrips, sub: '100% on time' },
            { label: 'Available Nearby', val: openCount, sub: 'orders waiting' },
            { label: 'Acceptance Rate', val: '98%', sub: '★ Top rated' },
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
        <button className={`courier-tab${subTab === 'available' ? ' active' : ''}`} onClick={() => setSubTab('available')} type="button">
          <i className="fa-solid fa-star" /> Available Orders
          {openCount > 0 && <span className="c-badge">{openCount}</span>}
        </button>
        <button className={`courier-tab${subTab === 'active' ? ' active' : ''}`} onClick={() => setSubTab('active')} type="button">
          <i className="fa-solid fa-person-running" /> Active Delivery
          {activeOrder && <span className="c-badge">1</span>}
        </button>
        <button className={`courier-tab${subTab === 'earnings' ? ' active' : ''}`} onClick={() => setSubTab('earnings')} type="button">
          <i className="fa-solid fa-receipt" /> Earnings &amp; History
        </button>
      </div>

      {/* Available orders panel */}
      {subTab === 'available' && (
        <div id="cpanel-available">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)' }}>Campus Radar</h2>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 700 }}>Orders ready for pickup around ADNU campus</p>
            </div>
            <button className="minibtn" onClick={addSimulatedOrder} style={{ padding: '9px 16px', background: 'var(--navy-tint)', color: 'var(--navy-soft)' }} type="button">
              <i className="fa-solid fa-plus" style={{ fontSize: 13, verticalAlign: -1 }} /> Post simulated test request
            </button>
          </div>
          <div id="c-available-list">
            {availableOrders.filter(o => o.status === 'finding').length === 0 ? (
              <div className="emptydesk">
                <div className="esi"><i className="fa-solid fa-radar" style={{ fontSize: 28 }} /></div>
                <h3>No orders nearby</h3>
                <p>New requests will appear here automatically. Stay online to receive them.</p>
              </div>
            ) : (
              availableOrders.filter(o => o.status === 'finding').map(order => {
                const cat = CATS[order.cat];
                return (
                  <div key={order.id} className="order-accept-card">
                    <div className="order-card-header">
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{order.id} · {order.time}</span>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--ink)', marginTop: 2 }}>{order.title}</h3>
                      </div>
                      <div className="order-payout">
                        <span className="earn-val">₱{order.fee + order.tip}</span>
                        <span className="earn-breakdown">₱{order.fee} + ₱{order.tip} tip</span>
                      </div>
                    </div>

                    <div className="route-container">
                      <div className="route-step">
                        <span className="route-dot pickup"><i className="fa-solid fa-circle-dot" style={{ fontSize: 7 }} /></span>
                        <small>Pickup · {order.etaWalk}</small>
                        <b>{order.pickup}</b>
                      </div>
                      <div className="route-step">
                        <span className="route-dot drop"><i className="fa-solid fa-location-dot" style={{ fontSize: 8 }} /></span>
                        <small>Drop-off</small>
                        <b>{order.dropoff}</b>
                      </div>
                    </div>

                    <div className="order-items-snippet">
                      <i className="fa-solid fa-box" />
                      {order.items}
                    </div>

                    <div className="order-accept-actions">
                      <button className="btn-accept" onClick={() => acceptOrder(order.id)} type="button">
                        <i className="fa-solid fa-check" /> Accept Order
                      </button>
                      <button className="btn-decline" onClick={() => declineOrder(order.id)} type="button">Decline</button>
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
                  <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 800 }}>{activeOrder.id} · ACTIVE</span>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)', marginTop: 2 }}>{activeOrder.title}</h2>
                </div>
                <div className="order-payout">
                  <span className="earn-val">₱{activeOrder.fee + activeOrder.tip}</span>
                </div>
              </div>
              <div style={{ background: 'var(--bg-soft)', borderRadius: 18, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <b style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>{activeOrder.student}</b>
                  <small style={{ display: 'block', color: 'var(--muted)', fontWeight: 700 }}>{activeOrder.phone}</small>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="minibtn" type="button"><i className="fa-solid fa-phone" /> Call</button>
                  <button className="minibtn primary" type="button"><i className="fa-solid fa-comment" /> Chat</button>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                <button className="cact call" type="button"><i className="fa-solid fa-phone" />Call</button>
                <button className="cact chat" type="button"><i className="fa-solid fa-comment" />Chat</button>
                <button className="btn btn-primary btn-sm" type="button" style={{ borderRadius: 14, width: 'auto', fontSize: 13 }}>
                  <i className="fa-solid fa-circle-check" />Delivered
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Earnings panel */}
      {subTab === 'earnings' && (
        <div id="cpanel-earnings">
          <div className="panel" style={{ marginBottom: 20 }}>
            <div className="panel-head">
              <h2>Courier Wallet &amp; Payouts</h2>
              <button className="btn btn-primary btn-sm" style={{ width: 'auto', padding: '8px 18px' }} type="button">
                <i className="fa-solid fa-wallet" /> Cash Out to GCash
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginTop: 12 }}>
              {[
                { label: 'Available Balance', val: `₱${walletBalance}.00`, bg: 'var(--navy-tint)', color: 'var(--navy)', labelColor: 'var(--navy-soft)' },
                { label: 'Base Delivery Fees', val: '₱280.00', bg: 'var(--ok-bg)', color: 'var(--ok)', labelColor: 'var(--ok)' },
                { label: 'Customer Tips', val: '₱65.00', bg: 'var(--yellow-pale)', color: 'var(--yellow-ink)', labelColor: 'var(--yellow-ink)' },
              ].map(s => (
                <div key={s.label} className="c-stat-box" style={{ background: s.bg }}>
                  <small style={{ color: s.labelColor }}>{s.label}</small>
                  <b style={{ color: s.color, fontSize: 28 }}>{s.val}</b>
                </div>
              ))}
            </div>
          </div>
          <div className="panel">
            <div className="panel-head"><h2>Today's Completed Trips</h2></div>
            <div id="c-earnings-list">
              {courierTripsLog.map(trip => {
                const cat = CATS[trip.cat];
                return (
                  <div key={trip.id} className="listrow">
                    <div className={`tile t-${cat?.cls || 'neutral'}`} style={{ width: 44, height: 44 }}>
                      <i className={`fa-solid fa-${cat?.desktop_icon || 'box'}`} style={{ fontSize: 18 }} />
                    </div>
                    <div className="tcell">
                      <b>{trip.title}</b>
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
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
