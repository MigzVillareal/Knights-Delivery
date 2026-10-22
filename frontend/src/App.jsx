import { useState, useEffect } from 'react';
import { DEFAULT_STATE } from './data.js';

// Modular Page Components
import GatePage from './components/GatePage.jsx';
import HomePage from './components/HomePage.jsx';
import CreatePage from './components/CreatePage.jsx';
import RequestsPage from './components/RequestsPage.jsx';
import ActivityPage from './components/ActivityPage.jsx';
import TrackingPage from './components/TrackingPage.jsx';
import ProfilePage from './components/ProfilePage.jsx';
import CourierPage from './components/CourierPage.jsx';

// Dynamic Navigation & Responsive Chrome
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import BottomNav from './components/BottomNav.jsx';

import NotifsDrawer from './components/NotifsDrawer.jsx';
import ChatDrawer from './components/ChatDrawer.jsx';

export default function App() {
  const [state, setState] = useState(() => DEFAULT_STATE());
  const [page, setPage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatRecipient, setChatRecipient] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', icon: 'fa-circle-check' });

  // Sync dark mode class on document body
  useEffect(() => {
    if (state.dark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [state.dark]);

  // Global Toast helper
  function showToast(message, icon = 'fa-circle-check') {
    setToast({ show: true, message, icon });
    setTimeout(() => {
      setToast(t => ({ ...t, show: false }));
    }, 3200);
  }

  // Navigation handler
  function handleNavigate(targetPage, subTab) {
    setPage(targetPage);
    if (subTab) {
      setState(s => ({ ...s, courierSubTab: subTab }));
    }
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Role Switcher
  function handleRoleSwitch(newRole) {
    setState(s => ({ ...s, role: newRole }));
    if (newRole === 'courier') {
      setPage('courier');
      showToast('Switched to Courier View 🛵', 'fa-motorcycle');
    } else {
      setPage('home');
      showToast('Switched to Student View 🎓', 'fa-graduation-cap');
    }
    setSidebarOpen(false);
  }

  // Dark Mode Toggle
  function handleThemeToggle() {
    setState(s => ({ ...s, dark: !s.dark }));
    showToast(!state.dark ? 'Dark mode enabled 🌙' : 'Light mode enabled ☀️', 'fa-circle-half-stroke');
  }

  // Auth: Login / Signup
  function handleLogin(credentials) {
    setState(s => ({
      ...s,
      loggedIn: true,
      user: {
        ...s.user,
        email: credentials.email,
        fullName: credentials.name || s.user.fullName,
        first: (credentials.name || s.user.fullName).split(' ')[0],
      },
    }));
    setPage('home');
    showToast(`Welcome back, ${(credentials.name || 'Knight').split(' ')[0]}! 👋`, 'fa-circle-check');
  }

  // Auth: Sign Out
  function handleSignOut() {
    setState(s => ({ ...s, loggedIn: false }));
    showToast('Signed out of Knights Delivery', 'fa-arrow-right-from-bracket');
  }

  // Create Order Submission
  function handleCreateOrder(orderData) {
    const newId = `KD-${Math.floor(2440 + Math.random() * 50)}`;
    const newOrder = {
      id: newId,
      cat: orderData.cat,
      items: orderData.items,
      pickup: "Bam-Bam's Canteen",
      dropoff: orderData.drop,
      status: 'finding',
      stage: 0,
      fee: orderData.fee || 25,
      tip: 0,
      time: 'Just now',
      notes: orderData.notes,
    };

    const newCourierAvailable = {
      id: newId,
      title: orderData.cat === 'food' ? "Bam-Bam's Canteen" : `${orderData.cat.toUpperCase()} Request`,
      cat: orderData.cat,
      items: orderData.items,
      pickup: "Bam-Bam's Canteen (Science Bldg)",
      dropoff: orderData.drop,
      fee: newOrder.fee,
      tip: 10,
      student: state.user.fullName,
      sid: state.user.sid,
      phone: state.user.phone,
      time: 'Just now',
      notes: orderData.notes || 'Please handle with care.',
      status: 'finding',
      stage: 0,
    };

    setState(s => ({
      ...s,
      orders: [newOrder, ...(s.orders || [])],
      availableOrders: [newCourierAvailable, ...(s.availableOrders || [])],
      notifs: [
        {
          id: Date.now(),
          type: 'order',
          title: `Request ${newId} posted`,
          body: `Looking for a courier to deliver ${orderData.items.slice(0, 30)}...`,
          time: 'Just now',
          read: false,
        },
        ...(s.notifs || []),
      ],
    }));

    showToast(`Request ${newId} posted! Finding a courier...`, 'fa-box');
    setPage('tracking');
  }

  // Courier Actions (accept, advance stage, complete)
  function handleUpdateCourier(patch) {
    setState(s => ({ ...s, ...patch }));
  }

  // User Profile Update
  function handleUpdateUser(patch) {
    setState(s => ({ ...s, ...patch }));
    showToast('Profile updated successfully!', 'fa-circle-check');
  }

  function handleOpenChat(recipientInfo) {
    setChatRecipient(recipientInfo || null);
    setChatOpen(true);
  }

  // Chat message send
  function handleSendMessage(text) {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const newMsg = { from: 'me', text, time: timeStr };

    setState(s => ({
      ...s,
      chat: [...(s.chat || []), newMsg],
    }));

    // Simulate response
    setTimeout(() => {
      const studentReplies = [
        "Thank you! I'm waiting near the room.",
        "Got it, thanks for updating!",
        "See you soon!",
      ];
      const courierReplies = [
        "Got it! I'm on it right now.",
        "Almost there, heading up the stairs!",
        "Thanks for the update, see you in a minute!",
      ];
      const replies = chatRecipient?.isCourierMode ? studentReplies : courierReplies;
      const reply = replies[Math.floor(Math.random() * replies.length)];
      const courierTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      setState(s => ({
        ...s,
        chat: [...(s.chat || []), { from: 'them', text: reply, time: courierTime }],
      }));
    }, 1200);
  }

  // Mark all notifications read
  function handleMarkAllNotifsRead() {
    setState(s => ({
      ...s,
      notifs: (s.notifs || []).map(n => ({ ...n, read: true })),
    }));
    showToast('All notifications marked as read', 'fa-check-double');
  }

  return (
    <div className="app-root">
      {/* Dynamic Toast Feedback */}
      <div className={`toast${toast.show ? ' show' : ''}`}>
        <i className={`fa-solid ${toast.icon}`} />
        <span>{toast.message}</span>
      </div>

      {/* When user is not logged in: show responsive Gate / Auth page */}
      {!state.loggedIn ? (
        <GatePage onLogin={handleLogin} />
      ) : (
        /* When user is logged in: unified responsive shell (Desktop sidebar + Mobile drawer + Bottom nav) */
        <div className="shell">
          {/* Responsive Sidebar (desktop sticky / mobile drawer) */}
          <Sidebar
            page={page}
            role={state.role}
            state={state}
            onNavigate={handleNavigate}
            onRoleSwitch={handleRoleSwitch}
            onThemeToggle={handleThemeToggle}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Main Content Area */}
          <div className="main">
            {/* Topbar (Desktop header + Mobile header with hamburger menu) */}
            <Topbar
              page={page}
              role={state.role}
              state={state}
              onNavigate={handleNavigate}
              onRoleSwitch={handleRoleSwitch}
              onToggleSidebar={() => setSidebarOpen(s => !s)}
              onOpenNotifs={() => setNotifsOpen(true)}
            />

            {/* Dynamic Viewport rendering the active page */}
            <main className="viewport">
              {page === 'home' && (
                <HomePage
                  state={state}
                  onNavigate={handleNavigate}
                />
              )}

              {page === 'create' && (
                <CreatePage
                  state={state}
                  onSubmit={handleCreateOrder}
                />
              )}

              {page === 'requests' && (
                <RequestsPage
                  state={state}
                  onNavigate={handleNavigate}
                />
              )}

              {page === 'activity' && (
                <ActivityPage
                  state={state}
                  onNavigate={handleNavigate}
                />
              )}

              {page === 'tracking' && (
                <TrackingPage
                  state={state}
                  onOpenChat={() => handleOpenChat(null)}
                />
              )}

              {page === 'profile' && (
                <ProfilePage
                  state={state}
                  onUpdate={handleUpdateUser}
                  onSignOut={handleSignOut}
                />
              )}

              {page === 'courier' && (
                <CourierPage
                  state={state}
                  onUpdate={handleUpdateCourier}
                  onNavigate={handleNavigate}
                  onOpenChat={handleOpenChat}
                />
              )}
            </main>

            {/* Dynamic Mobile Bottom Navigation Pill (hidden on desktop screens via CSS) */}
            <BottomNav
              page={page}
              role={state.role}
              state={state}
              onNavigate={handleNavigate}
              onRoleSwitch={handleRoleSwitch}
            />
          </div>

          {/* Notifications Drawer */}
          <NotifsDrawer
            isOpen={notifsOpen}
            onClose={() => setNotifsOpen(false)}
            notifs={state.notifs}
            onMarkAllRead={handleMarkAllNotifsRead}
          />

          {/* Real-time Courier / Student Chat Drawer */}
          <ChatDrawer
            isOpen={chatOpen}
            onClose={() => setChatOpen(false)}
            chatMessages={state.chat}
            onSendMessage={handleSendMessage}
            recipient={chatRecipient}
          />
        </div>
      )}
    </div>
  );
}
