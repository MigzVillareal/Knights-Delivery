// Responsive Topbar Header (Desktop topbar & Mobile app header)

const PAGE_META = {
  home:     { title: 'Home',           sub: 'Get it. Delivered on campus.' },
  create:   { title: 'Create Request', sub: 'Tell us what you need.' },
  requests: { title: 'My Requests',    sub: 'View all your orders.' },
  activity: { title: 'Activity',       sub: 'Your delivery history.' },
  tracking: { title: 'Live Tracking',  sub: 'Real-time order updates.' },
  profile:  { title: 'Profile',        sub: 'Manage your account.' },
  courier:  { title: 'Courier Portal', sub: 'Accept orders & earn.' },
};

export default function Topbar({
  page,
  role,
  state,
  onNavigate,
  onRoleSwitch,
  onToggleSidebar,
  onOpenNotifs,
}) {
  const meta = PAGE_META[page] || PAGE_META.home;
  const { availableOrders = [], notifs = [] } = state;
  const openCount = availableOrders.filter(o => o.status === 'finding').length;
  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <header className="topbar">
      <div className="top-brand-area">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          className="mob-menu-btn"
          onClick={onToggleSidebar}
          type="button"
          aria-label="Open menu"
        >
          <i className="fa-solid fa-bars" />
        </button>

        <div className="top-title-wrap">
          <h1 id="pageTitle">{meta.title}</h1>
          <p id="pageSub">{meta.sub}</p>
        </div>
      </div>

      <div className="top-actions">
        {/* Role toggle button */}
        {role === 'student' && (
          <button className="top-role-toggle" onClick={() => onRoleSwitch('courier')} type="button">
            <span className="pulse-badge" />
            <span className="toggle-text">Switch to Courier</span>
            {openCount > 0 && <span className="role-badge">{openCount}</span>}
          </button>
        )}
        {role === 'courier' && (
          <button className="top-role-toggle" onClick={() => onRoleSwitch('student')} type="button">
            <i className="fa-solid fa-graduation-cap" />
            <span className="toggle-text">Student View</span>
          </button>
        )}

        {/* Bell Notifications */}
        <button
          className={`iconbtn${unreadCount > 0 ? ' hasnews' : ''}`}
          id="bellBtn"
          onClick={onOpenNotifs}
          type="button"
          aria-label="Notifications"
        >
          <i className="fa-solid fa-bell" style={{ fontSize: 18 }} />
          {unreadCount > 0 && <span className="bell-dot" />}
        </button>

        {/* Create Request button (desktop) */}
        <button
          className="btn btn-primary btn-sm top-create-btn"
          onClick={() => onNavigate('create')}
          type="button"
        >
          <i className="fa-solid fa-plus" style={{ fontSize: 15 }} />
          <span>Create Request</span>
        </button>
      </div>
    </header>
  );
}
