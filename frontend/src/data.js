// Shared data constants for Knights Delivery

export const CATS = {
  food:     { name: 'Food',     icon: 'fa-solid fa-burger',         cls: 'food',     desktop_icon: 'burger' },
  supplies: { name: 'Supplies', icon: 'fa-solid fa-pen-ruler',      cls: 'supplies', desktop_icon: 'pen-ruler' },
  errands:  { name: 'Errands',  icon: 'fa-solid fa-person-running', cls: 'errands',  desktop_icon: 'person-running' },
  printing: { name: 'Printing', icon: 'fa-solid fa-print',          cls: 'printing', desktop_icon: 'print' },
};

export function catCls(cat) {
  return `t-${CATS[cat]?.cls || 'neutral'}`;
}

export const STAGES = [
  { label: 'Request posted',   sub: 'We received your request' },
  { label: 'Courier accepted', sub: '{courier} will pick up your order' },
  { label: 'Arriving soon',    sub: 'Courier is heading to {dropoff}' },
  { label: 'Delivered',        sub: 'Enjoy! Please rate your courier' },
];

export const STATUS_UI = {
  finding:   { label: 'Finding a courier…', cls: 'st-finding',   icon: 'fa-circle-dot' },
  accepted:  { label: 'Courier accepted',   cls: 'st-accepted',  icon: 'fa-person-running' },
  picked:    { label: 'Picking up order',   cls: 'st-onway',     icon: 'fa-box' },
  on_way:    { label: 'On the way',         cls: 'st-onway',     icon: 'fa-person-running' },
  arriving:  { label: 'Arriving soon',      cls: 'st-onway',     icon: 'fa-person-running' },
  delivered: { label: 'Delivered',          cls: 'st-delivered', icon: 'fa-circle-check' },
  cancelled: { label: 'Cancelled',          cls: 'st-cancelled', icon: 'fa-circle-xmark' },
};

export const COURIER = {
  name: 'Juan Dela Cruz',
  initials: 'JD',
  rating: '4.9',
  deliveries: '1,248',
};

export const TIME_OPTIONS = [
  'ASAP (30–45 min)',
  'Today, 6:00pm – 6:30pm',
  'Tomorrow, 9:00am – 9:30am',
];

export const FEE_BASE = { food: 25, supplies: 20, errands: 30, printing: 15 };

export const FAQ_ITEMS = [
  { q: 'How is the delivery fee calculated?', a: 'Fees start at ₱15–₱30 based on category and distance within campus.' },
  { q: 'Can I cancel my order?', a: 'Yes — free cancellation until a courier accepts your request. After acceptance, a ₱10 cancellation fee may apply.' },
  { q: 'What if my item is wrong or missing?', a: 'Tap "Report issue" on your order screen. Our support team responds within 2 minutes, 8am–8pm.' },
];

export const DEFAULT_STATE = () => ({
  user: { id: null, fullName: '', first: '', email: '', sid: '', phone: '' },
  role: 'student',
  dark: false,
  push: true,
  orderUpdates: true,
  loggedIn: false,
  promoDismissed: false,
  reqTab: 'ongoing',
  actTab: 'all',
  courierSubTab: 'available',
  courierOnline: true,
  courierEarnings: 0,
  courierTrips: 0,
  activeCourierOrderId: null,
  availableOrders: [],
  courierTripsLog: [],
  orders: [],
  addresses: [],
  defaultPayment: 'Cash',
  chat: [],
  notifs: [],
  // Loading / error states
  loadingRequests: false,
  requestsError: null,
  loadingCourierQueue: false,
  courierQueueError: null,
  loadingProfile: false,
});
