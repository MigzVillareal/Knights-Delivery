// Responsive Sidebar Navigation (Desktop sidebar & Mobile off-canvas drawer)

export default function Sidebar({
  page,
  role,
  state,
  onNavigate,
  onRoleSwitch,
  onThemeToggle,
  isOpen,
  onClose,
}) {
  const { user, dark, availableOrders = [], orders = [] } = state;
  const initials = (user.fullName || 'User').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const ongoingCount = orders.filter(o => ['finding', 'accepted', 'picked', 'on_way', 'arriving'].includes(o.status)).length;
  const openCourierCount = availableOrders.filter(o => o.status === 'finding').length;

  function handleNav(targetPage, subTab) {
    onNavigate(targetPage, subTab);
    if (onClose) onClose();
  }

  function handleRole(newRole) {
    onRoleSwitch(newRole);
    if (onClose) onClose();
  }

  const studentNav = [
    { id: 'home', icon: 'fa-house', label: 'Home' },
    { id: 'create', icon: 'fa-plus', label: 'Create Request' },
    { id: 'requests', icon: 'fa-box', label: 'My Requests', badge: ongoingCount > 0 ? ongoingCount : null },
    { id: 'activity', icon: 'fa-clock-rotate-left', label: 'Activity' },
    { id: 'tracking', icon: 'fa-person-running', label: 'Live Tracking' },
    { id: 'profile', icon: 'fa-user', label: 'Profile' },
  ];

  const courierNav = [
    { id: 'courier', sub: 'available', icon: 'fa-star', label: 'Available Orders', badge: openCourierCount > 0 ? openCourierCount : null },
    { id: 'courier', sub: 'active', icon: 'fa-person-running', label: 'Active Delivery' },
    { id: 'courier', sub: 'earnings', icon: 'fa-wallet', label: 'Earnings & History' },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <div
        className={`drawer-backdrop sidebar-backdrop${isOpen ? ' open' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <aside className={`sidebar${isOpen ? ' open' : ''}`}>
        {/* Brand & Mobile Close */}
        <div className="brand">
          <div className="brandmark">
            <i className="fa-solid fa-shield-halved" />
          </div>
          <div>
            <b>Knights</b>
            <span>Delivery</span>
          </div>
          {onClose && (
            <button className="mob-close-btn" onClick={onClose} type="button" aria-label="Close menu">
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>

        {/* Role switcher */}
        <div className="role-switcher" id="roleSwitcher">
          <button
            className={`role-btn${role === 'student' ? ' active' : ''}`}
            onClick={() => handleRole('student')}
            type="button"
          >
            <i className="fa-solid fa-graduation-cap" /> Student
          </button>
          <button
            className={`role-btn${role === 'courier' ? ' active' : ''}`}
            onClick={() => handleRole('courier')}
            type="button"
          >
            <i className="fa-solid fa-motorcycle" /> Courier
            {openCourierCount > 0 && <span className="role-badge">{openCourierCount}</span>}
          </button>
        </div>

        {/* Student nav */}
        {role === 'student' && (
          <nav className="sidenav" id="studentNav">
            {studentNav.map(item => (
              <button
                key={item.id}
                className={`side-item${page === item.id ? ' active' : ''}`}
                onClick={() => handleNav(item.id)}
                type="button"
              >
                <i className={`fa-solid ${item.icon}`} />
                <span>{item.label}</span>
                {item.badge && <span className="sidecount">{item.badge}</span>}
              </button>
            ))}
          </nav>
        )}

        {/* Courier nav */}
        {role === 'courier' && (
          <nav className="sidenav" id="courierNav">
            {courierNav.map((item, i) => (
              <button
                key={i}
                className={`side-item${page === 'courier' && state.courierSubTab === item.sub ? ' active' : ''}`}
                onClick={() => handleNav('courier', item.sub)}
                type="button"
              >
                <i className={`fa-solid ${item.icon}`} />
                <span>{item.label}</span>
                {item.badge && <span className="sidecount">{item.badge}</span>}
              </button>
            ))}
            <button
              className="side-item"
              onClick={() => handleRole('student')}
              style={{ color: 'var(--navy-soft)' }}
              type="button"
            >
              <i className="fa-solid fa-rotate" />
              <span>Switch to Student</span>
            </button>
          </nav>
        )}

        {/* Campus notice card */}
        <div className="sidenote">
          <b>Ateneo de Naga University</b>
          <span>Fast, friendly on-campus delivery connecting students and student couriers.</span>
        </div>

        {/* Footer */}
        <div className="side-foot">
          <div className="side-user" onClick={() => handleNav('profile')}>
            <div className="avatar">{initials}</div>
            <div className="side-user-meta">
              <b>{user.fullName}</b>
              <small>{role === 'student' ? 'Student · ADNU' : 'Knight Courier'}</small>
            </div>
          </div>
          <button className="themebtn" onClick={onThemeToggle} type="button">
            <i className={`fa-solid fa-${dark ? 'sun' : 'moon'}`} />
            <span>{dark ? 'Light mode' : 'Dark mode'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
