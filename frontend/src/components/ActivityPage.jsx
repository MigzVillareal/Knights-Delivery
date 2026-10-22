import { useState } from 'react';
import { CATS } from '../data.js';

const STATUS_ALL_LABEL = {
  finding:   'Finding courier',
  accepted:  'Courier accepted',
  picked:    'Picked up',
  on_way:    'On the way',
  arriving:  'Arriving soon',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_ALL_CLS = {
  finding:   'st-finding',
  accepted:  'st-accepted',
  picked:    'st-onway',
  on_way:    'st-onway',
  arriving:  'st-onway',
  delivered: 'st-delivered',
  cancelled: 'st-cancelled',
};

const ONGOING = ['finding','accepted','picked','on_way','arriving'];

export default function ActivityPage({ state }) {
  const [tab, setTab] = useState('all');
  const orders = state.orders || [];

  const filtered = tab === 'all' ? orders
    : tab === 'ongoing' ? orders.filter(o => ONGOING.includes(o.status))
    : orders.filter(o => o.status === tab);

  const stats = [
    { icon: 'fa-box',          bg: 'var(--navy-tint)',    color: 'var(--navy-soft)',  label: 'Total Orders',  value: orders.length, delta: '+2 this week' },
    { icon: 'fa-circle-check', bg: 'var(--ok-bg)',        color: 'var(--ok)',         label: 'Completed',     value: orders.filter(o => o.status === 'delivered').length, delta: '' },
    { icon: 'fa-peso-sign',    bg: 'var(--yellow-pale)',  color: 'var(--yellow-ink)', label: 'Total Spent',   value: `₱${orders.reduce((acc, o) => acc + (o.fee || 0), 0)}`, delta: '' },
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
              <div key={order.id} className="trow">
                <div className="tcell">
                  <b>{order.id}</b>
                  <small>{order.items}</small>
                </div>
                <div className="tcell">
                  <span className={`badge bg-${cat?.cls === 'food' ? 'yellow' : cat?.cls === 'errands' ? 'ok' : cat?.cls === 'printing' ? 'navy' : 'info'}`}>
                    <i className={`fa-solid fa-${cat?.desktop_icon || 'box'}`} />
                    {cat?.name || 'Other'}
                  </span>
                </div>
                <div className="tcell">
                  <span className={`status ${STATUS_ALL_CLS[order.status]}`}>
                    {STATUS_ALL_LABEL[order.status]}
                  </span>
                </div>
                <div className="tcell">
                  <span className="rdate">{order.time}</span>
                </div>
                <div className="tcell">
                  <span className="amount">₱{(order.fee || 0) + (order.tip || 0)}</span>
                </div>
                <div>
                  <button className="minibtn" type="button">View</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
