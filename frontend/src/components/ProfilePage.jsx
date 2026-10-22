import { useState } from 'react';
import { FAQ_ITEMS } from '../data.js';
import { Toggle } from './Helpers.jsx';

export default function ProfilePage({ state, onUpdate, onSignOut }) {
  const { user, dark, push, orderUpdates, orders = [] } = state;
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user.fullName);
  const [editSid, setEditSid] = useState(user.sid);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editPhone, setEditPhone] = useState(user.phone);
  const [openFaq, setOpenFaq] = useState(null);
  function saveProfile() {
    onUpdate({ user: { ...user, fullName: editName, sid: editSid, email: editEmail, phone: editPhone } });
    setEditing(false);
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
        </div>

        {/* Help & Support — FAQs */}
        <div className="panel">
          <div className="panel-head"><h2>Help &amp; Support</h2></div>
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
