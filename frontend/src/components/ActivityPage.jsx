import { useState } from 'react';
import { CATS, formatOrderId } from '../data.js';

const STATUS_ALL_LABEL = {
  awaiting_policy: 'Pending policy',
  finding:   'Finding courier',
  accepted:  'Courier accepted',
  picked:    'Picked up',
  in_progress: 'On the way',
  on_way:    'On the way',
  arriving:  'Arriving soon',
  delivered: 'Delivered',
  completed: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_ALL_CLS = {
  awaiting_policy: 'st-finding',
  finding:   'st-finding',
  accepted:  'st-accepted',
  picked:    'st-onway',
  in_progress: 'st-onway',
  on_way:    'st-onway',
  arriving:  'st-onway',
  delivered: 'st-delivered',
  completed: 'st-delivered',
  cancelled: 'st-cancelled',
};

const ONGOING = ['awaiting_policy', 'finding', 'accepted', 'picked', 'in_progress', 'on_way', 'arriving'];
const COMPLETED = ['delivered', 'completed'];
const CANCELLED = ['cancelled'];

export default function ActivityPage({ state, onNavigate }) {
  const [tab, setTab] = useState('all');
  const orders = state.orders || [];

  const filtered = tab === 'all'
    ? orders
    : tab === 'ongoing'
    ? orders.filter(o => ONGOING.includes(o.status))
    : tab === 'completed'
    ? orders.filter(o => COMPLETED.includes(o.status))
    : orders.filter(o => CANCELLED.includes(o.status));

  const stats = [
    { icon: 'fa-box',          bg: 'var(--navy-tint)',    color: 'var(--navy-soft)',  label: 'Total Orders',  value: orders.length, delta: '' },
    { icon: 'fa-circle-check', bg: 'var(--ok-bg)',        color: 'var(--ok)',         label: 'Completed',     value: orders.filter(o => COMPLETED.includes(o.status)).length, delta: '' },
    { icon: 'fa-peso-sign',    bg: 'var(--yellow-pale)',  color: 'var(--yellow-ink)', label: 'Total Spent',   value: `₱${orders.reduce((acc, o) => acc + (Number(o.fee) || 0) + (Number(o.tip) || 0), 0)}`, delta: '' },
  ];

  return (
    <section className="page active" id="page-activity">
      {/* Stat cards */}
      <div className="statgrid" id="statGrid">
        {stats.map(s => (
          <div key={s.label} className="statcard">
            <div className="sicon" style={{ background: s.bg, color: s.color }}>
              <i className={`fa-solid ${s.icon}`} />
            </div>
            <div>
              <b>{s.value}</b>
              <small>{s.label}</small>
              {s.delta && <span className="sdelta">{s.delta}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs" id="actTabs">
        {['all','ongoing','completed','cancelled'].map(t => (
          <button key={t} className={`filterchip${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="panel" style={{ paddingBottom: 10 }}>
        <div className="thead">
          <span>Order</span><span>Category</span><span>Status</span><span>Date</span><span>Total</span><span />
        </div>
        <div id="actList">
          {filtered.length === 0 ? (
            <div className="emptydesk" style={{ padding: '32px 20px' }}>
              <div className="esi"><i className="fa-solid fa-inbox" /></div>
              <h3>No orders here</h3>
            </div>
          ) : filtered.map(order => {
            const cat = CATS[order.cat];
            return (
              <div
                key={order.id}
                className="trow"
                style={{ cursor: onNavigate ? 'pointer' : 'default' }}
                onClick={() => onNavigate && onNavigate('tracking', order.id)}
              >
                <div className="tcell">
                  <b>{order.shortId || formatOrderId(order.id)}</b>
                  <small>{order.items}</small>
                </div>
                <div className="tcell">
                  <span className={`badge bg-${cat?.cls === 'food' ? 'yellow' : cat?.cls === 'errands' ? 'ok' : cat?.cls === 'printing' ? 'navy' : 'info'}`}>
                    <i className={`fa-solid fa-${cat?.desktop_icon || 'box'}`} />
                    {cat?.name || 'Other'}
                  </span>
                </div>
                <div className="tcell">
                  <span className={`status ${STATUS_ALL_CLS[order.status] || 'st-finding'}`}>
                    {STATUS_ALL_LABEL[order.status] || order.status}
                  </span>
                </div>
                <div className="tcell">
                  <span className="rdate">{order.time}</span>
                </div>
                <div className="tcell">
                  <span className="amount">₱{(order.fee || 0) + (order.tip || 0)}</span>
                </div>
                <div>
                  <button
                    className="minibtn"
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      if (onNavigate) onNavigate('tracking', order.id);
                    }}
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
