import { CATS } from '../data.js';

export default function HomePage({ state, onNavigate }) {
  const { user, orders = [] } = state;
  const recentOrders = orders.slice(0, 3);

  const categoryCards = [
    { cat: 'food',     label: 'Food',     sub: 'Meals, snacks & drinks',    icon: 'fa-burger' },
    { cat: 'supplies', label: 'Supplies', sub: 'School & personal items',   icon: 'fa-pen-ruler' },
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
          <h1 id="homeGreet">Hey, {user.first || 'Juan'} 👋</h1>
          <div className="locline">
            <i className="fa-solid fa-location-dot" />
            Ateneo De Naga University
          </div>
        </div>
      </div>

      {/* Search bar */}
      <button className="hero-search" id="homeSearch" onClick={() => onNavigate('create')}>
        <i className="fa-solid fa-magnifying-glass" />
        What do you need? Tap to create a request
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
                      <i className={`fa-solid fa-${(cat?.desktop_icon || 'box').replace(/^fa-/, '')}`} style={{ fontSize: 18 }} />
                    </div>
                    <div>
                      <b style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 14.5, color: 'var(--ink)', marginBottom: 3 }}>
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
      </div>
    </section>
  );
}
