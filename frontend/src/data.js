// Shared data constants for Knights Delivery

export const CATS = {
  food:     { name: 'Food',     icon: 'fa-solid fa-burger',         cls: 'food',     desktop_icon: 'burger' },
  supplies: { name: 'Supplies', icon: 'fa-solid fa-pen-ruler',      cls: 'supplies', desktop_icon: 'pen-ruler' },
  errands:  { name: 'Errands',  icon: 'fa-solid fa-person-running', cls: 'errands',  desktop_icon: 'person-running' },
  printing: { name: 'Printing', icon: 'fa-solid fa-print',          cls: 'printing', desktop_icon: 'print' },
};

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
  user: { fullName: 'Juan Dela Cruz', first: 'Juan', email: 'juandelacruz@adnu.edu.ph', sid: '2023-10482', phone: '+63 917 555 4821' },
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
  courierEarnings: 345,
  courierTrips: 4,
  activeCourierOrderId: null,
  availableOrders: [
    {
      id: 'KD-2432',
      title: "Bam-Bam's Canteen",
      cat: 'food',
      items: '2x Lechon Manok Combo, 1 Iced Tea',
      pickup: "Bam-Bam's Canteen (Science Bldg)",
      dropoff: 'Santos Hall Room S104',
      fee: 30, tip: 15,
      student: 'Maria Santos', sid: '2022-11093', phone: '+63 918 333 4819',
      time: '5 mins ago',
      notes: 'Please ask for extra gravy. Thank you!',
      status: 'finding', stage: 0,
    },
    {
      id: 'KD-2435',
      title: 'ADNU Bookstore Run',
      cat: 'supplies',
      items: '1x Bond Paper A4 (100s), 2 Black Sign Pens',
      pickup: 'ADNU Bookstore (Student Center)',
      dropoff: 'Phelan P217 Lab (2nd Floor)',
      fee: 25, tip: 10,
      student: 'Juan Dela Cruz', sid: '2023-04812', phone: '+63 920 444 8812',
      time: '12 mins ago',
      notes: "I'm in the lab until 5pm.",
      status: 'finding', stage: 0,
    },
  ],
  courierTripsLog: [
    { id: 'KD-2402', title: "Bam-Bam's Order",  cat: 'food',     pickup: "Bam-Bam's Canteen", dropoff: 'Library 3rd Floor',    time: '12:14 PM', fee: 30, tip: 20 },
    { id: 'KD-2381', title: 'Notebook & Pens',  cat: 'supplies', pickup: 'ADNU Bookstore',     dropoff: 'Phelan P217 Lab',     time: '5:31 PM',  fee: 20, tip: 0  },
    { id: 'KD-2350', title: 'Printing (PT)',     cat: 'printing', pickup: 'Print Hub, Phelan',  dropoff: 'Phelan P217 Lab',     time: '1:58 PM',  fee: 15, tip: 10 },
    { id: 'KD-2327', title: "Bam-Bam's Order",  cat: 'food',     pickup: "Bam-Bam's Canteen", dropoff: 'Xavier Hall Lobby',   time: '2:35 PM',  fee: 30, tip: 0  },
  ],
  orders: [
    { id: 'KD-2419', cat: 'printing', items: 'Photocopy (10 pages)', pickup: 'Print Hub, Phelan', dropoff: 'Phelan P217 Lab', status: 'arriving',  stage: 2, fee: 20, tip: 0,  time: '4:01 PM' },
    { id: 'KD-2402', cat: 'food',     items: "2x Lechon Manok Combo, 1 Iced Tea", pickup: "Bam-Bam's Canteen", dropoff: 'Library 3rd Floor', status: 'delivered', stage: 3, fee: 30, tip: 20, time: '12:14 PM' },
    { id: 'KD-2381', cat: 'supplies', items: 'Notebook & Pens Set', pickup: 'ADNU Bookstore', dropoff: 'Phelan P217 Lab', status: 'delivered', stage: 3, fee: 20, tip: 0, time: '5:31 PM' },
    { id: 'KD-2312', cat: 'errands',  items: 'Claim documents from Registrar', pickup: "Registrar's Office", dropoff: 'Xavier Hall Lobby', status: 'cancelled', stage: 0, fee: 30, tip: 0, time: 'Sep 20' },
  ],
  addresses: [
    { t: 'Phelan P217 Lab (2nd Floor)', s: 'College of Computer Studies', def: true },
    { t: 'Library 3rd Floor', s: 'Learning Commons' },
    { t: 'Xavier Hall Lobby', s: 'Ground Floor' },
  ],
  defaultPayment: 'Cash',
  chat: [
    { from: 'them', text: "Hi! This is Juan, your Knights courier. I'll pick up your order shortly.", time: '3:54 PM' },
    { from: 'them', text: "I'm near Phelan, going up to the 2nd floor!", time: '4:01 PM' },
  ],
  notifs: [
    { id: 1, type: 'order', title: 'Your Photocopy (PT) is on the way', body: 'Juan Dela Cruz is heading to Phelan P217 Lab.', time: '2m ago', read: false },
    { id: 2, type: 'chat',  title: 'New message from Juan Dela Cruz',  body: "I'm near Phelan, going up to the 2nd floor!",   time: '5m ago', read: false },
    { id: 3, type: 'promo', title: '20% off printing this week',       body: 'Use code KNIGHT20 at Print Hub, Phelan.',        time: '1h ago', read: true  },
    { id: 4, type: 'ok',    title: "Bam-Bam's Order was delivered",    body: 'Rate Juan Dela Cruz — how did it go?',           time: 'Sep 24', read: true  },
  ],
});
