import { useState } from 'react';
import { FAQ_ITEMS } from '../data.js';
import { Toggle } from './Helpers.jsx';

export default function ProfilePage({ state, onUpdate, onSignOut }) {
  const { user, dark, push, orderUpdates, orders = [], addresses = [] } = state;
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user.fullName);
  const [editSid, setEditSid] = useState(user.sid);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editPhone, setEditPhone] = useState(user.phone);
  const [openFaq, setOpenFaq] = useState(null);
  const [newAddr, setNewAddr] = useState('');

  function saveProfile() {
    onUpdate({ user: { ...user, fullName: editName, sid: editSid, email: editEmail, phone: editPhone } });
    setEditing(false);
  }

  function addAddress() {
    if (!newAddr.trim()) return;
    onUpdate({ addresses: [...addresses, { t: newAddr.trim(), s: '', def: false }] });
    setNewAddr('');
  }

  const initials = user.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <section className="page active" id="page-profile">
      <div className="profilegrid">
        {/* Profile hero */}
        <div className="profilehero">
          <div className="avatar" style={{ width: 88, height: 88, fontSize: 30 }}>{initials}</div>
          <div className="grow">
            <h2>{user.fullName}</h2>
            <p>Student · Ateneo de Naga University</p>
            <div className="chips">
              <span className="pchip"><i className="fa-solid fa-id-card" /><span>{user.sid}</span></span>
              <span className="pchip"><i className="fa-solid fa-envelope" /><span>{user.email}</span></span>
              <span className="pchip"><i className="fa-solid fa-phone" /><span>{user.phone}</span></span>
            </div>
          </div>
          <button className="editbtn" onClick={() => setEditing(e => !e)} type="button">
            <i className="fa-solid fa-pen" />Edit profile
          </button>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="panel" id="pfEditPanel">
            <div className="panel-head"><h2>My information</h2></div>
            <div className="field"><label>Full name</label><input className="input" value={editName} onChange={e => setEditName(e.target.value)} /></div>
            <div className="field"><label>Student ID</label><input className="input" value={editSid} onChange={e => setEditSid(e.target.value)} /></div>
            <div className="field"><label>Email</label><input className="input" type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} /></div>
            <div className="field"><label>Phone</label><input className="input" value={editPhone} onChange={e => setEditPhone(e.target.value)} /></div>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button className="btn btn-primary btn-sm" onClick={saveProfile} style={{ flex: 1, width: 'auto' }} type="button">Save changes</button>
              <button className="btn btn-soft" onClick={() => setEditing(false)} style={{ flex: 1 }} type="button">Cancel</button>
            </div>
          </div>
        )}

        {/* Payment methods */}
        <div className="panel">
          <div className="panel-head">
            <h2>Payment methods</h2>
            <button className="link" type="button">+ Add new</button>
          </div>
          {[
            { icon: 'fa-wallet', label: 'GCash', sub: '•••• 4821', color: 'var(--info-bg)', ink: 'var(--info)' },
            { icon: 'fa-credit-card', label: 'Maya', sub: '•••• 9034', color: 'var(--ok-bg)', ink: 'var(--ok)' },
          ].map(pm => (
            <div key={pm.label} className="mrowz">
              <span className="mic" style={{ background: pm.color, color: pm.ink }}>
                <i className={`fa-solid ${pm.icon}`} />
              </span>
              <div className="grow">
                <b>{pm.label}</b>
                <small>{pm.sub}</small>
              </div>
              <button className="minibtn" type="button">Edit</button>
            </div>
          ))}
        </div>

        {/* Addresses */}
        <div className="panel">
          <div className="panel-head"><h2>Addresses</h2></div>
          {addresses.map((addr, i) => (
            <div key={i} className="mrowz">
              <span className="mic"><i className="fa-solid fa-location-dot" /></span>
              <div className="grow">
                <b>{addr.t}</b>
                {addr.s && <small>{addr.s}</small>}
              </div>
              {addr.def && <span className="badge bg-ok">Default</span>}
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <input
              className="input" id="addrNew"
              placeholder="e.g. SHS Building Room 204"
              style={{ flex: 1 }}
              value={newAddr} onChange={e => setNewAddr(e.target.value)}
            />
            <button className="btn btn-primary btn-sm" onClick={addAddress} style={{ width: 'auto', padding: '0 22px' }} type="button">
              <i className="fa-solid fa-plus" />
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="panel">
          <div className="panel-head"><h2>Preferences</h2></div>
          {[
            { icon: 'fa-bell', key: 'push', title: 'Push notifications', sub: 'Alerts for promos and news', val: push },
            { icon: 'fa-box', key: 'orderUpdates', title: 'Order updates', sub: 'Live status of your deliveries', val: orderUpdates },
            { icon: 'fa-moon', key: 'dark', title: 'Dark mode', sub: 'Easier on the eyes at night', val: dark },
          ].map(pref => (
            <div key={pref.key} className="switchline">
              <div className="sic"><i className={`fa-solid ${pref.icon}`} /></div>
              <div><b>{pref.title}</b><p>{pref.sub}</p></div>
              <Toggle on={pref.val} onChange={v => onUpdate({ [pref.key]: v })} />
            </div>
          ))}
          <button className="dangerline" type="button" onClick={() => onUpdate({ orders: [] })}>
            <i className="fa-solid fa-rotate-left" />
            <b>Clear demo data &amp; restart</b>
          </button>
        </div>

        {/* Help & Support */}
        <div className="panel">
          <div className="panel-head"><h2>Help &amp; Support</h2></div>
          <div className="helpbtns">
            {[
              { icon: 'fa-comment', label: 'Chat with support', sub: 'Live agent, 2 min reply', bg: 'var(--info-bg)', color: 'var(--info)' },
              { icon: 'fa-phone', label: 'Call hotline', sub: '+63 54 123 4567', bg: 'var(--ok-bg)', color: 'var(--ok)' },
              { icon: 'fa-triangle-exclamation', label: 'Report an issue', sub: 'Missing or late items', bg: 'var(--danger-bg)', color: 'var(--danger)' },
              { icon: 'fa-circle-question', label: 'FAQs', sub: 'Fees, PIN & refunds', bg: 'var(--yellow-pale)', color: 'var(--yellow-ink)' },
            ].map(h => (
              <button key={h.label} className="helpbtn" type="button">
                <span className="hic" style={{ background: h.bg, color: h.color }}>
                  <i className={`fa-solid ${h.icon}`} />
                </span>
                <span><b>{h.label}</b><small>{h.sub}</small></span>
              </button>
            ))}
          </div>

          {/* FAQ accordion */}
          <div className="faq" id="faqList">
            {FAQ_ITEMS.map((faq, i) => (
              <div key={i} className={`faq-item${openFaq === i ? ' open' : ''}`}>
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)} type="button">
                  {faq.q}
                  <i className="fa-solid fa-chevron-down" />
                </button>
                <div className="faq-a"><p>{faq.a}</p></div>
              </div>
            ))}
          </div>
        </div>

        {/* Account */}
        <div className="panel">
          <div className="panel-head"><h2>Account</h2></div>
          <div className="mrowz">
            <span className="mic"><i className="fa-solid fa-shield-halved" /></span>
            <div className="grow">
              <b>Knights verified student</b>
              <small>Your ADNU student ID is verified</small>
            </div>
            <span className="badge bg-ok">Verified</span>
          </div>
          <div className="mrowz">
            <span className="mic"><i className="fa-solid fa-receipt" /></span>
            <div className="grow">
              <b>Order history</b>
              <small>{orders.length} orders · ₱{orders.reduce((a, o) => a + (o.fee || 0), 0)} spent total</small>
            </div>
            <button className="minibtn" type="button">View</button>
          </div>
          <button className="dangerline" onClick={onSignOut} type="button">
            <i className="fa-solid fa-right-from-bracket" />
            <b>Sign out</b>
          </button>
          <p className="smallnote">Knights Delivery v1.0 · Ateneo de Naga University</p>
        </div>
      </div>
    </section>
  );
}
