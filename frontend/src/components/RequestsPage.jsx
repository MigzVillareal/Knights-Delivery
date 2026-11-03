import { useState } from 'react';
import { CATS } from '../data.js';

const STATUS_GROUPS = {
  ongoing: ['finding', 'accepted', 'picked', 'on_way', 'arriving'],
  completed: ['delivered'],
  cancelled: ['cancelled'],
};

const STATUS_LABEL = {
  finding:   'Finding courier',
  accepted:  'Courier accepted',
  picked:    'Picked up',
  on_way:    'On the way',
  arriving:  'Arriving soon',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_CLS = {
  finding:   'st-finding',
  accepted:  'st-accepted',
  picked:    'st-onway',
  on_way:    'st-onway',
  arriving:  'st-onway',
  delivered: 'st-delivered',
  cancelled: 'st-cancelled',
};

export default function RequestsPage({ state, onNavigate, onRefresh }) {
  const [tab, setTab] = useState('ongoing');
  const orders = state.orders || [];

  const filtered = orders.filter(o => STATUS_GROUPS[tab]?.includes(o.status));

  return (
    <section className="page active" id="page-requests">
      <div className="tabs" id="reqTabs">
        {['ongoing', 'completed', 'cancelled'].map(t => (
          <button key={t} className={`filterchip${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="panel" id="reqList">
        {state.loadingRequests ? (
          <div className="emptydesk" style={{ padding: '48px 20px' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32, color: 'var(--yellow-ink)', marginBottom: 14 }} />
            <h3>Loading requests...</h3>
            <p>Fetching your latest delivery updates</p>
          </div>
        ) : state.requestsError ? (
          <div className="emptydesk">
            <div className="esi" style={{ background: '#fee2e2' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ef4444' }} />
            </div>
            <h3>Unable to connect</h3>
            <p>{state.requestsError}</p>
            {onRefresh && (
              <button className="btn btn-primary btn-sm" onClick={onRefresh} style={{ marginTop: 14 }} type="button">
                <i className="fa-solid fa-rotate-right" /> Retry
              </button>
            )}
          </div>
        ) : filtered.length === 0 ? (
          <div className="emptydesk">
            <div className="esi">
              <i className={`fa-solid ${tab === 'ongoing' ? 'fa-box-open' : tab === 'completed' ? 'fa-circle-check' : 'fa-circle-xmark'}`} />
            </div>
            <h3>No {tab} requests</h3>
            <p>
              {tab === 'ongoing'
                ? 'Create your first request to get started.'
                : `Your ${tab} orders will appear here.`}
            </p>
          </div>
        ) : (
          filtered.map(order => {
            const cat = CATS[order.cat];
            return (
              <div key={order.id} className="listrow" onClick={() => onNavigate('tracking', order.id)}>
                <div className={`tile t-${cat?.cls || 'neutral'}`} style={{ width: 48, height: 48 }}>
                  <i className={`fa-solid fa-${cat?.desktop_icon || 'box'}`} style={{ fontSize: 20 }} />
                </div>
                <div className="tcell">
                  <b>{order.items}</b>
                  <small>{order.dropoff}</small>
                </div>
                <span className={`status ${STATUS_CLS[order.status]}`}>
                  {STATUS_LABEL[order.status]}
                </span>
                <span className="rdate">{order.time}</span>
                <div className="row-actions">
                  {tab === 'ongoing' && (
                    <button className="minibtn primary" type="button" onClick={e => { e.stopPropagation(); onNavigate('tracking', order.id); }}>
                      Track
                    </button>
                  )}
                  <button className="minibtn" type="button">Details</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
