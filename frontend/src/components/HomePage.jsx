import { useState } from 'react';
import { CATS } from '../data.js';

export default function HomePage({ state, onNavigate, onDismissPromo }) {
  const { user, orders = [], promoDismissed } = state;
  const recentOrders = orders.slice(0, 3);

  const categoryCards = [
    { cat: 'food',     label: 'Food',     sub: 'Meals, snacks & drinks',    icon: 'fa-burger' },
    { cat: 'supplies', label: 'Supplies', sub: 'School & personal items',   icon: 'fa-backpack' },
    { cat: 'errands',  label: 'Errands',  sub: 'Pickups & quick tasks',     icon: 'fa-person-running' },
    { cat: 'printing', label: 'Printing', sub: 'Print, copy & thesis',      icon: 'fa-print' },
  ];

  const statusLabel = {
    finding:   'Finding courier',
    accepted:  'Courier accepted',
    picked:    'Picked up',
    on_way:    'On the way',
    arriving:  'Arriving soon',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  const statusCls = {
    finding:   'st-finding',
    accepted:  'st-accepted',
    picked:    'st-onway',
    on_way:    'st-onway',
    arriving:  'st-onway',
    delivered: 'st-delivered',
    cancelled: 'st-cancelled',
  };

  return (
    <section className="page active" id="page-home">
      {/* Greeting */}
      <div className="greetrow">
        <div>
          <h1 id="homeGreet">Hey {user.first} 👋</h1>
          <div className="locline">
            <i className="fa-solid fa-location-dot" />
            Ateneo De Naga University
          </div>
        </div>
      </div>

      {/* Search bar */}
      <button className="hero-search" id="homeSearch" onClick={() => onNavigate('search')}>
        <i className="fa-solid fa-magnifying-glass" />
        What do you need? Try "lechon manok" or "photocopy"
        <kbd>Ctrl K</kbd>
      </button>

      {/* Category grid */}
      <div className="catgrid" id="catGrid">
        {categoryCards.map(({ cat, label, sub, icon }) => (
          <div key={cat} className={`catcard c-${cat}`} onClick={() => onNavigate('create', cat)}>
            <span className="cic"><i className={`fa-solid ${icon}`} /></span>
            <div><b>{label}</b><small>{sub}</small></div>
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div className="cols">
        {/* Left: promo + recent orders */}
        <div>
          {/* Promo banner */}
          {!promoDismissed && (
            <div className="promo" id="homePromo">
              <button className="pclose" onClick={onDismissPromo} type="button">
                <i className="fa-solid fa-xmark" style={{ fontSize: 10 }} />
              </button>
              <div className="pic"><i className="fa-solid fa-gift" /></div>
              <div className="grow">
                <h4>Free delivery on request #1</h4>
                <p>Use code <b>KNIGHT1</b> at checkout</p>
              </div>
              <button className="claim" onClick={() => onNavigate('create')} type="button">Order now</button>
            </div>
          )}

          {/* Recent orders panel */}
          <div className="panel">
            <div className="panel-head">
              <h2>Recent Orders <i className="fa-solid fa-clock" style={{ fontSize: 16, color: 'var(--muted)' }} /></h2>
              <button className="link" onClick={() => onNavigate('requests')} type="button">
                See all <i className="fa-solid fa-chevron-right" style={{ fontSize: 12, verticalAlign: -1 }} />
              </button>
            </div>
            {recentOrders.length === 0 ? (
              <div className="emptydesk">
                <div className="esi"><i className="fa-solid fa-box-open" /></div>
                <h3>No orders yet</h3>
                <p>Create your first request and it'll appear here.</p>
              </div>
            ) : (
              recentOrders.map(order => {
                const cat = CATS[order.cat];
                return (
                  <div key={order.id} className="listrow" onClick={() => onNavigate('tracking', order.id)}>
                    <div className={`tile t-${cat?.cls || 'neutral'}`} style={{ width: 44, height: 44 }}>
                      <i className={`fa-solid fa-${cat?.desktop_icon || 'box'}`} style={{ fontSize: 18 }} />
                    </div>
                    <div>
                      <b style={{ fontFamily: 'var(--font-display)', fontSize: 14.5, color: 'var(--ink)' }}>
                        {order.items}
                      </b>
                      <div className={`status ${statusCls[order.status]}`}>
                        {statusLabel[order.status]}
                      </div>
                    </div>
                    <span className="rdate">{order.time}</span>
                    <div className="row-actions">
                      <button className="minibtn" type="button">Track</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: live card + help */}
        <div>
          {/* Live order card if active */}
          {orders.find(o => ['finding','accepted','picked','on_way','arriving'].includes(o.status)) && (() => {
            const live = orders.find(o => ['finding','accepted','picked','on_way','arriving'].includes(o.status));
            return (
              <div className="trackcard" style={{ marginBottom: 20 }}>
                <div className="tk-top">
                  <b>Active order</b>
                  <span className="livechip">
                    <span className="pulse-dot" />
                    LIVE
                  </span>
                </div>
                <div className="tk-eta">~18 min</div>
                <p className="tk-sub">{live.items}</p>
                <div className="progress"><i style={{ width: '55%' }} /></div>
                <div className="tk-btns">
                  <button className="tk-main" onClick={() => onNavigate('tracking', live.id)}>
                    <i className="fa-solid fa-person-running" /> Track Live
                  </button>
                  <button className="tk-ghost">
                    <i className="fa-solid fa-comment" />
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Help panel */}
          <div className="panel">
            <div className="panel-head"><h2>Need help?</h2></div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', lineHeight: 1.55, marginBottom: 14 }}>
              Chat with Knight Support, call the hotline, or browse FAQs — we're here 8am to 8pm.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="minibtn primary" style={{ flex: 1, padding: '11px 16px' }}>Chat with support</button>
              <button className="minibtn" style={{ padding: '11px 16px' }}>FAQs</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
