import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_STATE } from './data.js';
import {
  login as apiLogin,
  signup as apiSignup,
  logout as apiLogout,
} from './api/auth.js';
import { setStoredToken, getStoredToken } from './api/client.js';
import { getProfile, updateProfile } from './api/profile.js';
import {
  fetchRequests,
  createRequest,
  fetchRequestEvents,
} from './api/requests.js';
import {
  fetchOpenQueue,
  fetchAssignedQueue,
  acceptRequest,
  updateLifecycle,
} from './api/runner.js';

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
    document.body.classList.toggle('dark', !!state.dark);
  }, [state.dark]);

  // ── Toast ──────────────────────────────────────────────────────────────────
  function showToast(message, icon = 'fa-circle-check') {
    setToast({ show: true, message, icon });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3200);
  }

  // ── Navigation ─────────────────────────────────────────────────────────────
  function handleNavigate(targetPage, subTab) {
    setPage(targetPage);
    if (targetPage === 'courier' && subTab) {
      setState(s => ({ ...s, courierSubTab: subTab }));
    }
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Role Switch ────────────────────────────────────────────────────────────
  function handleRoleSwitch(newRole) {
    setState(s => ({ ...s, role: newRole }));
    if (newRole === 'courier') {
      setPage('courier');
      showToast('Switched to Courier View 🛵', 'fa-motorcycle');
      loadCourierQueue();
    } else {
      setPage('home');
      showToast('Switched to Student View 🎓', 'fa-graduation-cap');
    }
    setSidebarOpen(false);
  }

  // ── Dark Mode ──────────────────────────────────────────────────────────────
  function handleThemeToggle() {
    setState(s => ({ ...s, dark: !s.dark }));
    showToast(!state.dark ? 'Dark mode enabled 🌙' : 'Light mode enabled ☀️', 'fa-circle-half-stroke');
  }

  // ── Auth: Login ────────────────────────────────────────────────────────────
  async function handleLogin(credentials) {
    setState(s => ({ ...s, loadingProfile: true }));
    try {
      const result = await apiLogin({ email: credentials.email, password: credentials.password });
      const token = result.access_token;
      if (token) setStoredToken(token);

      // Fetch real profile from backend
      let profile = null;
      try {
        profile = await getProfile();
      } catch {
        // profile endpoint optional during initial setup
      }

      const displayName = profile?.display_name || credentials.name || credentials.email.split('@')[0];
      setState(s => ({
        ...s,
        loggedIn: true,
        loadingProfile: false,
        user: {
          fullName: displayName,
          first: displayName.split(' ')[0],
          email: credentials.email,
          phone: profile?.phone || '',
          sid: '',
        },
      }));
      setPage('home');
      showToast(`Welcome back, ${displayName.split(' ')[0]}! 👋`, 'fa-circle-check');
    } catch (err) {
      setState(s => ({ ...s, loadingProfile: false }));
      showToast(err.message || 'Login failed. Check your credentials.', 'fa-triangle-exclamation');
    }
  }

  // ── Auth: Signup ───────────────────────────────────────────────────────────
  async function handleSignup(credentials) {
    setState(s => ({ ...s, loadingProfile: true }));
    try {
      const result = await apiSignup({
        email: credentials.email,
        password: credentials.password,
        fullName: credentials.name,
      });
      const token = result.access_token;
      if (token) setStoredToken(token);

      const displayName = credentials.name || credentials.email.split('@')[0];
      setState(s => ({
        ...s,
        loggedIn: true,
        loadingProfile: false,
        user: {
          fullName: displayName,
          first: displayName.split(' ')[0],
          email: credentials.email,
          phone: '',
          sid: '',
        },
      }));
      setPage('home');
      showToast(`Welcome to Knights Delivery, ${displayName.split(' ')[0]}! 🎓`, 'fa-circle-check');
    } catch (err) {
      setState(s => ({ ...s, loadingProfile: false }));
      showToast(err.message || 'Sign up failed. Please try again.', 'fa-triangle-exclamation');
    }
  }

  // ── Auth: Sign Out ─────────────────────────────────────────────────────────
  function handleSignOut() {
    apiLogout();
    setState(DEFAULT_STATE());
    setPage('home');
    showToast('Signed out of Knights Delivery', 'fa-arrow-right-from-bracket');
  }

  // ── Fetch Student Requests ─────────────────────────────────────────────────
  const loadRequests = useCallback(async () => {
    setState(s => ({ ...s, loadingRequests: true, requestsError: null }));
    try {
      const orders = await fetchRequests();
      setState(s => ({ ...s, orders: Array.isArray(orders) ? orders : [], loadingRequests: false }));
    } catch (err) {
      setState(s => ({
        ...s,
        loadingRequests: false,
        requestsError: err.message || 'Could not load requests.',
      }));
    }
  }, []);

  // ── Fetch Courier Open Queue ───────────────────────────────────────────────
  const loadCourierQueue = useCallback(async () => {
    setState(s => ({ ...s, loadingCourierQueue: true, courierQueueError: null }));
    try {
      const queue = await fetchOpenQueue();
      setState(s => ({ ...s, availableOrders: Array.isArray(queue) ? queue : [], loadingCourierQueue: false }));
    } catch (err) {
      setState(s => ({
        ...s,
        loadingCourierQueue: false,
        courierQueueError: err.message || 'Could not load delivery queue.',
      }));
    }
  }, []);

  // ── Fetch on page visit ────────────────────────────────────────────────────
  useEffect(() => {
    if (!state.loggedIn) return;
    if (page === 'requests' || page === 'activity') loadRequests();
    if (page === 'courier') loadCourierQueue();
  }, [state.loggedIn, page, loadRequests, loadCourierQueue]);

  // ── Create Order ───────────────────────────────────────────────────────────
  async function handleCreateOrder(orderData) {
    setState(s => ({ ...s, loadingRequests: true }));
    try {
      const created = await createRequest({
        category: orderData.cat,
        itemDetails: orderData.items,
        pickupAddress: orderData.pickup,
        pickupInstructions: orderData.pickupInstructions || null,
        dropoffAddress: orderData.drop,
        dropoffInstructions: orderData.dropInstructions || null,
        handoffNote: orderData.notes || null,
        customerEstimate: {
          amountMinor: (orderData.fee || 25) * 100,
          currency: 'PHP',
        },
      });

      setState(s => ({
        ...s,
        orders: [created, ...(s.orders || [])],
        loadingRequests: false,
        notifs: [
          {
            id: Date.now(),
            type: 'order',
            title: `Request ${created.id} posted`,
            body: `Looking for a courier to deliver ${orderData.items.slice(0, 30)}...`,
            time: 'Just now',
            read: false,
          },
          ...(s.notifs || []),
        ],
      }));

      showToast(`Request ${created.id} posted! Finding a courier...`, 'fa-box');
      setPage('requests');
    } catch (err) {
      setState(s => ({ ...s, loadingRequests: false }));
      showToast(err.message || 'Failed to post request. Try again.', 'fa-triangle-exclamation');
    }
  }

  // ── Courier: Accept Order ──────────────────────────────────────────────────
  async function handleAcceptOrder(orderId) {
    try {
      const updated = await acceptRequest(orderId);
      setState(s => ({
        ...s,
        activeCourierOrderId: orderId,
        availableOrders: s.availableOrders.map(o => o.id === orderId ? updated : o),
      }));
      showToast(`Order ${orderId} accepted! 🛵 Head to the pickup now.`, 'fa-motorcycle');
      handleNavigate('courier', 'active');
    } catch (err) {
      showToast(err.message || 'Could not accept order. Someone may have taken it.', 'fa-triangle-exclamation');
    }
  }

  // ── Courier: Advance Delivery Stage ───────────────────────────────────────
  async function handleAdvanceDelivery(orderId, action) {
    try {
      const updated = await updateLifecycle(orderId, action);
      setState(s => ({
        ...s,
        orders: (s.orders || []).map(o => o.id === orderId ? updated : o),
        availableOrders: (s.availableOrders || []).map(o => o.id === orderId ? updated : o),
        courierTrips: action === 'mark_delivered' ? (s.courierTrips || 0) + 1 : s.courierTrips,
        activeCourierOrderId: action === 'mark_delivered' ? null : s.activeCourierOrderId,
      }));
      if (action === 'mark_delivered') {
        showToast('Delivery completed! Great work 🎉', 'fa-circle-check');
        handleNavigate('courier', 'earnings');
      } else {
        showToast('Status updated!', 'fa-person-running');
      }
    } catch (err) {
      showToast(err.message || 'Could not update delivery stage.', 'fa-triangle-exclamation');
    }
  }

  // ── Courier: Generic patch (toggle online, etc.) ───────────────────────────
  function handleUpdateCourier(patch) {
    setState(s => ({ ...s, ...patch }));
  }

  // ── Profile Update ─────────────────────────────────────────────────────────
  async function handleUpdateUser(patch) {
    try {
      const updated = await updateProfile({
        displayName: patch.user?.fullName,
        phone: patch.user?.phone,
      });
      setState(s => ({
        ...s,
        user: {
          ...s.user,
          fullName: updated?.display_name || patch.user?.fullName || s.user.fullName,
          phone: updated?.phone || patch.user?.phone || s.user.phone,
        },
      }));
      showToast('Profile updated successfully!', 'fa-circle-check');
    } catch (err) {
      showToast(err.message || 'Profile update failed.', 'fa-triangle-exclamation');
    }
  }

  // ── Chat ───────────────────────────────────────────────────────────────────
  function handleOpenChat(recipientInfo) {
    setChatRecipient(recipientInfo || null);
    setChatOpen(true);
  }

  function handleSendMessage(text) {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    setState(s => ({ ...s, chat: [...(s.chat || []), { from: 'me', text, time: timeStr }] }));
  }

  // ── Notifications ──────────────────────────────────────────────────────────
  function handleMarkAllNotifsRead() {
    setState(s => ({ ...s, notifs: (s.notifs || []).map(n => ({ ...n, read: true })) }));
    showToast('All notifications marked as read', 'fa-check-double');
  }

  return (
    <div className="app-root">
      {/* Dynamic Toast Feedback */}
      <div className={`toast${toast.show ? ' show' : ''}`}>
        <i className={`fa-solid ${toast.icon}`} />
        <span>{toast.message}</span>
      </div>

      {!state.loggedIn ? (
        <GatePage onLogin={handleLogin} onSignup={handleSignup} loading={state.loadingProfile} />
      ) : (
        <div className="shell">
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

          <div className="main">
            <Topbar
              page={page}
              role={state.role}
              state={state}
              onNavigate={handleNavigate}
              onRoleSwitch={handleRoleSwitch}
              onToggleSidebar={() => setSidebarOpen(s => !s)}
              onOpenNotifs={() => setNotifsOpen(true)}
            />

            <main className="viewport">
              {page === 'home' && <HomePage state={state} onNavigate={handleNavigate} />}

              {page === 'create' && (
                <CreatePage state={state} onSubmit={handleCreateOrder} />
              )}

              {page === 'requests' && (
                <RequestsPage
                  state={state}
                  onNavigate={handleNavigate}
                  onRefresh={loadRequests}
                />
              )}

              {page === 'activity' && (
                <ActivityPage state={state} onNavigate={handleNavigate} />
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
                  onAccept={handleAcceptOrder}
                  onAdvance={handleAdvanceDelivery}
                  onNavigate={handleNavigate}
                  onOpenChat={handleOpenChat}
                  onRefreshQueue={loadCourierQueue}
                />
              )}
            </main>

            <BottomNav
              page={page}
              role={state.role}
              state={state}
              onNavigate={handleNavigate}
              onRoleSwitch={handleRoleSwitch}
            />
          </div>

          <NotifsDrawer
            isOpen={notifsOpen}
            onClose={() => setNotifsOpen(false)}
            notifs={state.notifs}
            onMarkAllRead={handleMarkAllNotifsRead}
          />

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
