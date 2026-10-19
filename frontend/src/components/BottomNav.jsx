// Mobile / Tablet Bottom Navigation Bar (Dynamic for mobile view)

export default function BottomNav({ page, role, state, onNavigate, onRoleSwitch }) {
  const { orders = [], availableOrders = [] } = state;
  const ongoingCount = orders.filter(o => ['finding', 'accepted', 'picked', 'on_way', 'arriving'].includes(o.status)).length;
  const openCourierCount = availableOrders.filter(o => o.status === 'finding').length;

  if (role === 'student') {
    const items = [
      { id: 'home', icon: 'fa-house', label: 'Home' },
      { id: 'requests', icon: 'fa-box', label: 'Requests', badge: ongoingCount > 0 ? ongoingCount : null },
      { id: 'create', icon: 'fa-plus', label: 'Create', isAction: true },
      { id: 'activity', icon: 'fa-clock-rotate-left', label: 'Activity' },
      { id: 'profile', icon: 'fa-user', label: 'Profile' },
    ];

    return (
      <nav className="navpill" aria-label="Mobile Navigation">
        {items.map(item => {
          const isActive = page === item.id;
          return (
            <button
              key={item.id}
              className={`navitem${isActive ? ' active' : ''}${item.isAction ? ' navaction' : ''}`}
              onClick={() => onNavigate(item.id)}
              type="button"
              aria-label={item.label}
            >
              <span className="navico">
                <i className={`fa-solid ${item.icon}`} />
                {item.badge && <span className="navbadge">{item.badge}</span>}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  // Courier Role Bottom Navigation
  const courierItems = [
    { id: 'courier', sub: 'available', icon: 'fa-star', label: 'Available', badge: openCourierCount > 0 ? openCourierCount : null },
    { id: 'courier', sub: 'active', icon: 'fa-person-running', label: 'Active' },
    { id: 'courier', sub: 'earnings', icon: 'fa-wallet', label: 'Earnings' },
    { id: 'switch', icon: 'fa-graduation-cap', label: 'Student' },
  ];

  return (
    <nav className="navpill" aria-label="Mobile Courier Navigation">
      {courierItems.map((item, idx) => {
        const isActive = page === item.id && (item.sub ? state.courierSubTab === item.sub : true);
        return (
          <button
            key={idx}
            className={`navitem${isActive ? ' active' : ''}`}
            onClick={() => {
              if (item.id === 'switch') {
                onRoleSwitch('student');
              } else {
                onNavigate(item.id, item.sub);
              }
            }}
            type="button"
            aria-label={item.label}
          >
            <span className="navico">
              <i className={`fa-solid ${item.icon}`} />
              {item.badge && <span className="navbadge">{item.badge}</span>}
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
