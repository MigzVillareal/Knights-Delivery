// Notifications Drawer / Dropdown Panel

export default function NotifsDrawer({ isOpen, onClose, notifs = [], onMarkAllRead, onSelectNotif }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-backdrop open" onClick={onClose} />
      <div className="drawer open" style={{ zIndex: 90 }}>
        <div className="drawer-head">
          <i className="fa-solid fa-bell" style={{ color: 'var(--navy-soft)', fontSize: 18 }} />
          <h2>Notifications</h2>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="link"
              onClick={onMarkAllRead}
              type="button"
              style={{ fontSize: 13, textDecoration: 'none' }}
            >
              Mark all read
            </button>
            <button className="iconbtn ghost" onClick={onClose} type="button" aria-label="Close">
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        </div>

        <div className="drawer-body">
          {notifs.length === 0 ? (
            <div className="emptydesk" style={{ padding: '60px 20px' }}>
              <div className="esi"><i className="fa-solid fa-bell-slash" /></div>
              <h3>No notifications</h3>
              <p>You're all caught up! Order status updates will appear here.</p>
            </div>
          ) : (
            notifs.map(n => (
              <div
                key={n.id}
                className="mrowz"
                onClick={() => {
                  if (onSelectNotif) onSelectNotif(n);
                  onClose();
                }}
                style={{
                  background: n.read ? 'transparent' : 'var(--navy-tint)',
                  borderRadius: 14,
                  padding: '12px 14px',
                  marginBottom: 8,
                  cursor: 'pointer',
                }}
              >
                <div
                  className="mic"
                  style={{
                    background: n.type === 'promo' ? 'var(--yellow-pale)' : n.type === 'ok' ? 'var(--ok-bg)' : 'var(--surface)',
                    color: n.type === 'promo' ? 'var(--yellow-ink)' : n.type === 'ok' ? 'var(--ok)' : 'var(--navy-soft)',
                  }}
                >
                  <i
                    className={`fa-solid ${
                      n.type === 'promo'
                        ? 'fa-gift'
                        : n.type === 'ok'
                        ? 'fa-check'
                        : n.type === 'chat'
                        ? 'fa-comment'
                        : 'fa-box'
                    }`}
                  />
                </div>
                <div className="grow">
                  <b style={{ fontSize: 14 }}>{n.title}</b>
                  <small style={{ display: 'block', marginTop: 2, color: 'var(--text-2)' }}>{n.body}</small>
                  <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, marginTop: 4, display: 'inline-block' }}>
                    {n.time}
                  </span>
                </div>
                {!n.read && (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', flexShrink: 0 }} />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
