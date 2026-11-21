import React, { useState, useEffect, useRef } from 'react';

// Iconițe exportate din prototipul Figma (vezi descarca-iconite-figma.ps1)
import decorHero1 from './assets/figma/decor-hero-1.svg';
import decorHero2 from './assets/figma/decor-hero-2.svg';
import logoBall from './assets/figma/logo-ball.svg';
import iconSearch from './assets/figma/icon-search.svg';
import iconMapWhite from './assets/figma/icon-map-white.svg';
import decorCard from './assets/figma/decor-card.svg';
import iconWaves from './assets/figma/icon-waves.svg';
import iconFlame from './assets/figma/icon-flame.svg';
import iconBallCard from './assets/figma/icon-ball-card.svg';
import iconTag from './assets/figma/icon-tag.svg';
import dotOpen from './assets/figma/dot-open.svg';
import iconArrowWhite from './assets/figma/icon-arrow-white.svg';
import navGrid from './assets/figma/nav-grid.svg';
import navMap from './assets/figma/nav-map.svg';
import navCalendar from './assets/figma/nav-calendar.svg';
import navUser from './assets/figma/nav-user.svg';
import iconArrowDark from './assets/figma/icon-arrow-dark.svg';
import iconLock from './assets/figma/icon-lock.svg';
import iconCheck from './assets/figma/icon-check.svg';
import iconInfoRed from './assets/figma/icon-info-red.svg';
import iconBackBlue from './assets/figma/icon-back-blue.svg';
import iconMapTeal from './assets/figma/icon-map-teal.svg';
import iconClockTeal from './assets/figma/icon-clock-teal.svg';
import iconTagOrange from './assets/figma/icon-tag-orange.svg';
import iconCheckGreen from './assets/figma/icon-check-green.svg';
import iconPhoneWhite from './assets/figma/icon-phone-white.svg';
import iconInfoDark from './assets/figma/icon-info-dark.svg';
import iconChevronLeft from './assets/figma/icon-chevron-left.svg';
import iconChevronRight from './assets/figma/icon-chevron-right.svg';
import dotLegendFree from './assets/figma/dot-legend-free.svg';
import dotLegendBusy from './assets/figma/dot-legend-busy.svg';
import dotLegendSelected from './assets/figma/dot-legend-selected.svg';
import dotSlotFree from './assets/figma/dot-slot-free.svg';
import dotSlotBusy from './assets/figma/dot-slot-busy.svg';
import dotSlotSelected from './assets/figma/dot-slot-selected.svg';
import iconInfoBlue from './assets/figma/icon-info-blue.svg';
import iconInfoAmber from './assets/figma/icon-info-amber.svg';
import iconArrowMuted from './assets/figma/icon-arrow-muted.svg';
import QRCode from 'qrcode';
import iconCalendarDark from './assets/figma/icon-calendar-dark.svg';
import iconClockDark from './assets/figma/icon-clock-dark.svg';
import iconLockNavy from './assets/figma/icon-lock-navy.svg';
import iconExternal from './assets/figma/icon-external.svg';
import iconXRed from './assets/figma/icon-x-red.svg';
import iconBellBlue from './assets/figma/icon-bell-blue.svg';
import switchOn from './assets/figma/switch-on.svg';
import iconArrowLime from './assets/figma/icon-arrow-lime.svg';
import iconWavesTeal from './assets/figma/icon-waves-teal.svg';

// ---------- Calendar (Figma 05) ----------
const MONTHS_RO = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie',
  'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
const WEEKDAYS_RO = ['duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă'];
const WEEKDAY_HEADERS = ['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D'];
// Cât de departe în viitor se poate rezerva (luni după luna curentă)
const MAX_MONTHS_AHEAD = 2;

// Data locală în formatul cerut de API: 2026-11-24
const toIsoDate = (date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0')
].join('-');

// „marți, 24 noiembrie 2026"
const formatLongDate = (isoDate) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return `${WEEKDAYS_RO[date.getDay()]}, ${day} ${MONTHS_RO[month - 1]} ${year}`;
};

// Celulele calendarului pentru o lună: null pentru golurile de la început și sfârșit, apoi zilele
const buildMonthCells = (year, month) => {
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // luni = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstWeekday).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toIsoDate(new Date(year, month, day)));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
};

// Textul de stare al unui interval: „Disponibil · 6/10 locuri", „Ocupat", „Selectat · 4/10 locuri"
const slotStatusText = (slot, isSelected) => {
  const seats = slot.capacity > 1 ? ` · ${slot.seatsLeft}/${slot.capacity} locuri` : '';
  if (isSelected) return `Selectat${seats}`;
  if (slot.overlapsOwnBooking) return 'Se suprapune cu o rezervare a ta';
  if (slot.isAvailable) return `Disponibil${seats}`;
  return `Ocupat${seats}`;
};

// Ecranele de autentificare: fără bara de jos, cu „Ajutor" în antet (ca în Figma 01 și 02)
const AUTH_SCREENS = ['login', 'register'];
const AUTH_STORAGE_KEY = 'sc_auth';
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MIN_PASSWORD_LENGTH = 8;
// Aceeași regulă ca în backend (POST /auth/register): cel puțin o literă și o cifră
const PASSWORD_LETTER = /[A-Za-zĂÂÎȘȚăâîșț]/;
const PASSWORD_DIGIT = /\d/;

// Tokenul și utilizatorul salvate după login, ca să rămâi autentificat după reîncărcarea paginii
const readStoredAuth = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
    return saved && saved.token ? saved : { token: null, user: null };
  } catch {
    return { token: null, user: null };
  }
};

// Trimite emailul și parola la POST /api/v1/auth/login. Întoarce { ok, data } sau { ok: false, message }.
const requestLogin = async (email, password) => {
  try {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password })
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      return { ok: true, data: body };
    }
    // 401 = email sau parolă greșită; textul e cel din Figma (ecranul 01b)
    const message = res.status === 401
      ? 'Email sau parolă incorectă'
      : body.error?.message || `Eroare ${res.status}`;
    return { ok: false, message };
  } catch {
    return { ok: false, message: 'Serverul nu răspunde. Verifică dacă backend-ul este pornit.' };
  }
};

// Culoarea bannerului și iconița fiecărei categorii, ca în Figma
const CATEGORY_STYLE = {
  'Înot': { className: 'swim', icon: iconWaves },
  'Relaxare': { className: 'relax', icon: iconFlame },
  'Sporturi': { className: 'sport', icon: iconBallCard }
};

// 25 -> "25", 22.5 -> "22,50" (format românesc, fără zecimale inutile)
const formatAmount = (value) => {
  const number = Number(value);
  return Number.isInteger(number)
    ? String(number)
    : number.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// ---------- Rezervare și plată (Figma 06, 06b, 07) ----------
const BOOKING_TIME_ZONE = 'Europe/Bucharest';
// Stările în care rezervarea așteaptă plata (slotul e blocat 5 minute)
const PENDING_STATUSES = ['INITIATED', 'PENDING_PAYMENT'];
const DISCOUNT_LABELS = { STUDENT: 'Reducere student', PROFESSOR: 'Reducere cadru didactic' };
const SERVER_DOWN_MESSAGE = 'Serverul nu răspunde. Verifică dacă backend-ul este pornit.';

// "Bazin" -> "bazin" (pentru „Tarif bazin", „Cum intri la bazin") și invers ("marți" -> "Marți")
const lowerFirst = (text) => text.charAt(0).toLowerCase() + text.slice(1);
const upperFirst = (text) => text.charAt(0).toUpperCase() + text.slice(1);

// Data și ora rezervării, în ora României: { dateText: 'Marți, 27 octombrie 2026', timeText: '18:00–19:00', minutes: 60 }
const bookingTimes = (booking) => {
  const start = new Date(booking.start_time);
  const end = new Date(booking.end_time);
  const hour = (date) => date.toLocaleTimeString('ro-RO', {
    timeZone: BOOKING_TIME_ZONE, hour: '2-digit', minute: '2-digit', hour12: false
  });
  // 'sv-SE' scrie data ca '2026-10-27', formatul primit de formatLongDate
  const isoDate = start.toLocaleDateString('sv-SE', { timeZone: BOOKING_TIME_ZONE });
  return {
    isoDate,
    dateText: upperFirst(formatLongDate(isoDate)),
    timeText: `${hour(start)}–${hour(end)}`,
    minutes: Math.round((end - start) / 60000)
  };
};

// Totalul în moneda aleasă în antet și, mai mic, în cealaltă monedă (Figma 06)
const bookingTotals = (booking, currency) => {
  const ron = `${formatAmount(booking.total_amount)} RON`;
  const eur = `${formatAmount(booking.total_amount_eur)} EUR`;
  return currency === 'EUR' ? { main: eur, other: ron } : { main: ron, other: eur };
};

// Mesajul de eroare din răspunsul API ({ error: { code, message } } sau { error: '...' })
const apiErrorMessage = (status, body) => {
  if (status === 0) return SERVER_DOWN_MESSAGE;
  if (status === 401) return 'Sesiunea a expirat. Autentifică-te din nou.';
  const message = typeof body.error === 'string' ? body.error : body.error?.message;
  return message || `Eroare ${status}`;
};

export default function App() {
  // Ecranul activ curent:
  // 'login' | 'register' | 'facilities' | 'facility_detail' | 'choose_datetime' |
  // 'summary_payment' | 'payment_failed' | 'confirmed_ticket' | 'my_bookings' | 'map' | 'admin'
  // Fără token salvat, aplicația pornește pe ecranul de autentificare (Figma 01)
  const [currentScreen, setCurrentScreen] = useState(() => (readStoredAuth().token ? 'facilities' : 'login'));

  // Autentificare (KAN-21): tokenul JWT și utilizatorul primite de la /auth/login
  const [authToken, setAuthToken] = useState(() => readStoredAuth().token);
  const [authUser, setAuthUser] = useState(() => readStoredAuth().user);

  // Formularul de autentificare (Figma 01 / 01b)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Formularul de creare cont (Figma 02 / 02b)
  const emptyRegisterForm = { fullName: '', email: '', password: '', acceptedTerms: false };
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm);
  const [registerErrors, setRegisterErrors] = useState({});
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Fiecare ecran nou se deschide de sus, nu de la poziția de derulare a ecranului anterior
  const screenContentRef = useRef(null);
  useEffect(() => {
    if (screenContentRef.current) {
      screenContentRef.current.scrollTop = 0;
    }
  }, [currentScreen]);
  
  // Setări globale
  const [lang, setLang] = useState('ro'); // 'ro' | 'en'
  const [currency, setCurrency] = useState('RON'); // 'RON' | 'EUR'
  const [darkMode, setDarkMode] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);

  // Filtru categorie în Facilități ('Toate', 'Înot', 'Relaxare', 'Sporturi')
  const [activeCategory, setActiveCategory] = useState('Toate');
  const [searchQuery, setSearchQuery] = useState('');

  // Facilitate selectată pentru fluxul de rezervare
  const [selectedFacility, setSelectedFacility] = useState(null);

  // Data și intervalul selectate în calendar (Figma 05). Data e în formatul API-ului: '2026-11-24'
  const [selectedDate, setSelectedDate] = useState(() => toIsoDate(new Date()));
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });
  // Intervalul ales: { startLabel, endLabel, seatsLeft, capacity, ... } din GET /availability (KAN-25)
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availability, setAvailability] = useState({ slots: [], loading: false, error: '' });
  const [addEquipment, setAddEquipment] = useState(true);
  // Rezervarea creată la intrarea în rezumat (POST /bookings), actualizată după plată (Figma 06, 06b, 07)
  const [booking, setBooking] = useState(null);
  const [bookingRequest, setBookingRequest] = useState({ loading: false, error: '' });
  const [payment, setPayment] = useState({ loading: false, error: '' });
  // Plata e simulată (KAN-53): bifa din rezumat cere backend-ului o plată refuzată, pentru ecranul 06b
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [qrImage, setQrImage] = useState('');
  const [qrEnlarged, setQrEnlarged] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(true);

  // Tab în Rezervările Mele ('upcoming' | 'history')
  const [bookingsTab, setBookingsTab] = useState('upcoming');

  // KAN-57: Scanare și validare bilet QR la recepție (Figma 12)
  const [receptionForm, setReceptionForm] = useState({ token: '', receptionistId: '5' });
  const [receptionState, setReceptionState] = useState({ loading: false, result: null, error: '' });

  // Modal anulare rezervare
  const [showCancelModal, setShowCancelModal] = useState(false);

  // ================= ADMIN STATE (KAN-42, KAN-45, KAN-47) =================
  const [adminTab, setAdminTab] = useState('facilities'); // 'facilities' | 'users'
  const [dbFacilities, setDbFacilities] = useState([]);
  const [dbUsers, setDbUsers] = useState([]);
  const [dbLocations, setDbLocations] = useState([]);
  const [backendOnline, setBackendOnline] = useState(false);

  // Modale Admin
  const [showAddFacilityModal, setShowAddFacilityModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Formulare Admin
  const [facilityForm, setFacilityForm] = useState({
    name: '',
    sport_type: 'Fotbal',
    category: 'Sporturi',
    capacity: 10,
    base_price_per_hour: 40.0,
    slot_minutes: 60,
    opens_at: '08:00:00',
    closes_at: '22:00:00'
  });

  // Formular gol pentru adăugarea unui utilizator nou (KAN-47)
  const emptyUserForm = {
    full_name: '',
    email: '',
    phone_number: '',
    role_type: 'STUDENT',
    password: ''
  };
  const [userForm, setUserForm] = useState(emptyUserForm);
  // Eroarea primită de la API la salvare; se afișează în formular
  const [userFormError, setUserFormError] = useState('');
  // Eroarea la încărcarea listei de utilizatori; se afișează în locul tabelului
  const [usersLoadError, setUsersLoadError] = useState('');

  // Date fallback inițiale (Figma)
  const fallbackFacilities = [
    {
      id: 1,
      name: 'Teren Fotbal Sintetic Nocturnă #1',
      nameEn: 'Synthetic Football Pitch',
      subtitle: 'Complex sportiv - corp E',
      category: 'Sporturi',
      visualBg: 'var(--tenis-bg)',
      visualColor: 'var(--tenis-accent)',
      icon: '⚽',
      badgeAlert: null,
      hours: 'Deschis azi: 08:00 - 23:00',
      priceRon: 90.0,
      priceEur: 18.0,
      unit: '/ 1h slot',
      usefulInfo: {
        location: 'Complex sportiv, corp E',
        program: 'Luni - duminică, 08:00 - 23:00',
        notice: 'Nocturnă LED automată inclusă',
        beforeVisit: ['Încălțăminte sintetic/tartan', 'Respectă intervalul selectat'],
        equipmentOptions: [{ name: 'Minge oficială', price: 10 }]
      }
    },
    {
      id: 2,
      name: 'Teren de tenis',
      nameEn: 'Tennis Court',
      subtitle: 'Campus - zona baza sportivă',
      category: 'Sporturi',
      visualBg: 'var(--tenis-bg)',
      visualColor: 'var(--tenis-accent)',
      icon: '🎾',
      badgeAlert: null,
      hours: 'Deschis azi: 08:00 - 21:00',
      priceRon: 40.0,
      priceEur: 8.0,
      unit: '/ 1h slot',
      usefulInfo: {
        location: 'Baza sportivă campus',
        program: 'Zilnic, 08:00 - 21:00',
        notice: 'Acces doar cu încălțăminte curată',
        beforeVisit: ['Rachete proprii sau închiriate', 'Respectă durata slotului'],
        equipmentOptions: [{ name: 'Set 2 rachete', price: 10 }]
      }
    },
    {
      id: 3,
      name: 'Bazin',
      nameEn: 'Swimming Pool',
      subtitle: 'Complex sportiv - corp E, parter',
      category: 'Înot',
      visualBg: 'var(--bazin-bg)',
      visualColor: 'var(--bazin-accent)',
      icon: '≈',
      badgeAlert: 'Rezervările se deschid la 08:00',
      hours: 'Deschis azi: 06:00 - 21:00',
      priceRon: 25.0,
      priceEur: 5.0,
      unit: '/ 1h slot',
      usefulInfo: {
        location: 'Complex sportiv, corp E, parter',
        program: 'Luni - vineri, 06:00 - 21:00',
        notice: 'Rezervările din timp beneficiază de reducere',
        beforeVisit: ['Cască și ochelari obligatorii', 'Duș obligatoriu înainte'],
        equipmentOptions: [{ name: 'Ochelari înot', price: 4 }, { name: 'Cască silicon', price: 3 }]
      }
    },
    {
      id: 4,
      name: 'Sală Polivalentă & Fitness',
      nameEn: 'Fitness Gym',
      subtitle: 'Corp D - Demisol',
      category: 'Sporturi',
      visualBg: '#FEE2E2',
      visualColor: '#DC2626',
      icon: '🏋️',
      badgeAlert: null,
      hours: 'Deschis azi: 08:00 - 22:00',
      priceRon: 30.0,
      priceEur: 6.0,
      unit: '/ 1h slot',
      usefulInfo: {
        location: 'Corp D, demisol',
        program: 'Luni - duminică, 08:00 - 22:00',
        notice: 'Reducere 50% pentru studenții USV',
        beforeVisit: ['Prosop pe aparate', 'Pantofi sport de schimb'],
        equipmentOptions: [{ name: 'Prosop sală', price: 3 }]
      }
    },
    {
      id: 5,
      name: 'Saună',
      nameEn: 'Sauna',
      subtitle: 'Complex sportiv - corp E, etaj',
      category: 'Relaxare',
      visualBg: 'var(--sauna-bg)',
      visualColor: 'var(--sauna-accent)',
      icon: '♨',
      badgeAlert: null,
      hours: 'Deschis azi: 08:00 - 21:00',
      priceRon: 40.0,
      priceEur: 8.0,
      unit: '/ 1h slot',
      usefulInfo: {
        location: 'Corp E, etaj',
        program: 'Luni - sâmbătă, 08:00 - 21:00',
        notice: 'Timp maxim recomandat: 15 min per repriză',
        beforeVisit: ['Două prosoape mari', 'Hidratare corespunzătoare'],
        equipmentOptions: [{ name: 'Prosop saună', price: 5 }]
      }
    }
  ];

  // ================= CONECTARE LA BACKEND (KAN-40, KAN-41, KAN-43) =================
  const fetchFacilitiesFromBackend = async () => {
    try {
      const res = await fetch('/api/v1/facilities');
      if (res.ok) {
        const data = await res.json();
        setDbFacilities(data);
        setBackendOnline(true);
      }
    } catch (err) {
      console.log('Backend offline sau rulare locala stand-alone:', err.message);
    }
  };

  const fetchUsersFromBackend = async () => {
    try {
      const res = await fetch('/api/v1/users');
      if (!res.ok) {
        throw new Error(`serverul a răspuns cu ${res.status}`);
      }
      setDbUsers(await res.json());
      setUsersLoadError('');
    } catch (err) {
      setDbUsers([]);
      setUsersLoadError('Nu s-au putut încărca utilizatorii din baza de date (' + err.message + '). Verifică dacă backend-ul este pornit.');
    }
  };

  // Extrage mesajul de eroare din răspunsul API: { error: { code, message } }
  const readApiError = async (res) => {
    // 409 vine de la indexul unic pe email; mesajul PostgreSQL e tehnic, așa că îl înlocuim
    if (res.status === 409) {
      return 'Emailul este deja folosit de alt utilizator.';
    }
    try {
      const body = await res.json();
      const message = typeof body.error === 'string' ? body.error : body.error?.message;
      return message || `Eroare ${res.status}`;
    } catch {
      return `Eroare ${res.status}`;
    }
  };

  // Deschide formularul gol, pentru adăugare
  const openAddUserForm = () => {
    setEditingUser(null);
    setUserForm(emptyUserForm);
    setUserFormError('');
    setShowAddUserModal(true);
  };

  // Deschide formularul completat cu datele utilizatorului, pentru editare
  const openEditUserForm = (u) => {
    setShowAddUserModal(false);
    setEditingUser(u);
    setUserForm({
      full_name: u.full_name,
      email: u.email,
      phone_number: u.phone_number || '',
      role_type: u.role_type,
      is_active: u.is_active
    });
    setUserFormError('');
  };

  const closeUserForm = () => {
    setShowAddUserModal(false);
    setEditingUser(null);
    setUserFormError('');
  };

  useEffect(() => {
    fetchFacilitiesFromBackend();
    fetchUsersFromBackend();
  }, []);

  // Lista de facilități pentru catalog (ia din DB dacă backend-ul e pornit, altfel fallback)
  const activeFacilitiesList = dbFacilities.length > 0 ? dbFacilities.map(f => ({
    id: f.facility_id,
    name: f.name,
    nameEn: f.name,
    subtitle: [f.location_name || 'Baza Sportivă USV', f.location_zone, f.slot_minutes && `${f.slot_minutes} min`]
      .filter(Boolean)
      .join(' · '),
    opensAt: f.opens_at ? f.opens_at.slice(0, 5) : null,
    closesAt: f.closes_at ? f.closes_at.slice(0, 5) : null,
    category: f.category || 'Sporturi',
    visualBg: f.category === 'Înot' ? 'var(--bazin-bg)' : (f.category === 'Relaxare' ? 'var(--sauna-bg)' : 'var(--tenis-bg)'),
    visualColor: f.category === 'Înot' ? 'var(--bazin-accent)' : (f.category === 'Relaxare' ? 'var(--sauna-accent)' : 'var(--tenis-accent)'),
    icon: f.category === 'Înot' ? '≈' : (f.category === 'Relaxare' ? '♨' : (f.sport_type === 'Tenis' ? '🎾' : '⚽')),
    badgeAlert: f.facility_id === 3 ? 'Rezervările se deschid la 08:00' : null,
    hours: `Deschis: ${f.opens_at ? f.opens_at.slice(0, 5) : '08:00'} - ${f.closes_at ? f.closes_at.slice(0, 5) : '22:00'}`,
    priceRon: parseFloat(f.base_price_per_hour) || 30.0,
    priceEur: Number(((parseFloat(f.base_price_per_hour) || 30.0) / 5).toFixed(2)),
    unit: '/ 1h slot',
    // Pentru ecranele 04 și 05 (KAN-52)
    slotMinutes: f.slot_minutes || 60,
    contactPhone: f.contact_phone || null,
    usefulInfo: {
      location: [f.location_name || 'Complex USV', f.location_zone, f.location_address].filter(Boolean).join(', '),
      program: `${f.opens_at ? f.opens_at.slice(0, 5) : '08:00'}–${f.closes_at ? f.closes_at.slice(0, 5) : '22:00'}`,
      notice: 'Tarife diferențiate: studenții au 50% reducere, profesorii 30%',
      beforeVisit: f.category === 'Înot'
        ? ['Adu echipamentul de înot și papucii.', 'Respectă intervalul rezervat și indicațiile personalului.', 'Pregătește codul rezervării pentru acces.']
        : ['Vino cu echipament sportiv adecvat.', 'Respectă intervalul rezervat și indicațiile personalului.', 'Pregătește codul rezervării pentru acces.'],
      equipmentTitle: f.category === 'Înot' ? 'Echipament de înot' : 'Echipament',
      equipmentOptions: f.category === 'Înot'
        ? [{ name: 'Ochelari de înot', price: 4 }, { name: 'Bonetă de înot', price: 3 }, { name: 'Plută de înot', price: 3 }]
        : [{ name: 'Echipament sportiv complet', price: 10 }]
    }
  })) : fallbackFacilities;

  // ================= ADMIN HANDLERS (KAN-44, KAN-46) =================
  const handleSaveFacility = async (e) => {
    e.preventDefault();
    try {
      if (editingFacility) {
        // PUT /api/v1/facilities/:id
        const res = await fetch(`/api/v1/facilities/${editingFacility.facility_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(facilityForm)
        });
        if (res.ok) {
          alert('✅ Facilitate actualizată cu succes în PostgreSQL!');
          fetchFacilitiesFromBackend();
          setEditingFacility(null);
        }
      } else {
        // POST /api/v1/facilities
        const res = await fetch('/api/v1/facilities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(facilityForm)
        });
        if (res.ok) {
          alert('✅ Facilitate adăugată cu succes în PostgreSQL!');
          fetchFacilitiesFromBackend();
          setShowAddFacilityModal(false);
        }
      }
    } catch (err) {
      alert('Eroare conectare API: ' + err.message);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setUserFormError('');
    try {
      let res;
      if (editingUser) {
        // PUT /api/v1/users/:id - parola nu se trimite, nu se schimbă de aici
        const { full_name, email, phone_number, role_type, is_active } = userForm;
        res = await fetch(`/api/v1/users/${editingUser.user_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ full_name, email, phone_number, role_type, is_active })
        });
      } else {
        // POST /api/v1/users
        res = await fetch('/api/v1/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userForm)
        });
      }

      // La eroare (400 date invalide, 404, 409 email folosit) formularul rămâne deschis cu mesajul primit
      if (!res.ok) {
        setUserFormError(await readApiError(res));
        return;
      }
      alert(editingUser ? '✅ Utilizator actualizat cu succes în PostgreSQL!' : '✅ Utilizator adăugat cu succes în PostgreSQL!');
      closeUserForm();
      fetchUsersFromBackend();
    } catch (err) {
      setUserFormError('Eroare conectare API: ' + err.message);
    }
  };

  // Rezervări active
  const [myUpcomingBookings, setMyUpcomingBookings] = useState([
    {
      id: 'SC-271026-001',
      facilityName: 'Bazin - Complex sportiv',
      dateText: 'Marți, 27 octombrie 2026',
      timeText: '16:00 - 17:00 · 60 min',
      totalPaidRon: '22,50',
      totalPaidEur: '4.50',
      status: 'Confirmată'
    }
  ]);

  const historyBookings = [
    {
      id: 'SC-201026-084',
      facilityName: 'Saună - Complex sportiv',
      dateText: 'Vineri, 20 octombrie 2026, 18:00 - 19:00 · 60 min',
      totalPaidRon: '20,00',
      status: 'Finalizată'
    },
    {
      id: 'SC-121026-019',
      facilityName: 'Teren de tenis - Campus',
      dateText: 'Joi, 12 octombrie 2026, 16:00 - 17:00 · 60 min',
      totalPaidRon: '40,00',
      status: 'Finalizată'
    }
  ];

  // Comutare Dark Mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark', !darkMode);
  };

  const openFacilityDetails = (facility) => {
    setSelectedFacility(facility);
    setCurrentScreen('facility_detail');
  };

  // GET /facilities/{id}/availability?date=... (KAN-25). Cu token, se marchează și suprapunerile cu rezervările proprii.
  const loadAvailability = async (facility, isoDate) => {
    setSelectedSlot(null);
    setAvailability({ slots: [], loading: true, error: '' });
    try {
      const res = await fetch(`/api/v1/facilities/${facility.id}/availability?date=${isoDate}`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = res.status === 401
          ? 'Sesiunea a expirat. Autentifică-te din nou pentru a rezerva.'
          : body.error?.message || `Eroare ${res.status}`;
        setAvailability({ slots: [], loading: false, error: message });
        return;
      }
      setAvailability({ slots: body.slots || [], loading: false, error: '' });
    } catch {
      setAvailability({ slots: [], loading: false, error: 'Serverul nu răspunde. Verifică dacă backend-ul este pornit.' });
    }
  };

  // Figma 04 -> 05: deschide calendarul pe ziua de azi
  const openChooseDateTime = () => {
    const today = new Date();
    const isoToday = toIsoDate(today);
    setSelectedDate(isoToday);
    setCalendarMonth({ year: today.getFullYear(), month: today.getMonth() });
    setBookingRequest({ loading: false, error: '' });
    setCurrentScreen('choose_datetime');
    loadAvailability(selectedFacility, isoToday);
  };

  const selectCalendarDay = (isoDate) => {
    setBookingRequest({ loading: false, error: '' });
    setSelectedDate(isoDate);
    loadAvailability(selectedFacility, isoDate);
  };

  // Navigare între luni: nu înainte de luna curentă și cel mult MAX_MONTHS_AHEAD luni înainte
  const changeCalendarMonth = (delta) => {
    const today = new Date();
    const target = new Date(calendarMonth.year, calendarMonth.month + delta, 1);
    const monthsFromNow = (target.getFullYear() - today.getFullYear()) * 12 + target.getMonth() - today.getMonth();
    if (monthsFromNow < 0 || monthsFromNow > MAX_MONTHS_AHEAD) {
      return;
    }
    setCalendarMonth({ year: target.getFullYear(), month: target.getMonth() });
  };

  // Codul QR se desenează din tokenul primit de la backend după plată (booking.qr_payload)
  useEffect(() => {
    const payload = booking?.qr_payload;
    if (!payload) {
      setQrImage('');
      return undefined;
    }
    let cancelled = false;
    QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 0,
      width: 240,
      color: { dark: '#0b1f3a', light: '#ffffff' }
    })
      .then((url) => { if (!cancelled) setQrImage(url); })
      .catch(() => { if (!cancelled) setQrImage(''); });
    return () => { cancelled = true; };
  }, [booking?.qr_payload]);

  // Cerere POST cu tokenul utilizatorului; status 0 înseamnă că serverul nu răspunde
  const postWithAuth = async (url, data) => {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(data)
      });
      const body = await res.json().catch(() => ({}));
      return { status: res.status, body };
    } catch {
      return { status: 0, body: {} };
    }
  };

  // Figma 05 -> 06: rezervarea se creează la intrarea în rezumat (POST /bookings), cu slotul blocat 5 minute.
  // Dacă utilizatorul revine din rezumat și păstrează același interval, refolosim rezervarea existentă.
  const openSummary = async () => {
    if (!selectedSlot || bookingRequest.loading) return;
    const sameBooking = booking &&
      booking.facility_id === selectedFacility.id &&
      new Date(booking.start_time).getTime() === new Date(selectedSlot.startTime).getTime() &&
      PENDING_STATUSES.includes(booking.status) &&
      new Date(booking.hold_expires_at) > new Date();
    if (sameBooking) {
      setPayment({ loading: false, error: '' });
      setCurrentScreen('summary_payment');
      return;
    }

    setBookingRequest({ loading: true, error: '' });
    const { status, body } = await postWithAuth('/api/v1/bookings', {
      facilityId: selectedFacility.id,
      bookingDate: selectedDate,
      startTime: `${selectedSlot.startLabel}:00`,
      endTime: `${selectedSlot.endLabel}:00`,
      reminderEnabled
    });
    if (status === 201) {
      setBooking(body);
      setBookingRequest({ loading: false, error: '' });
      setPayment({ loading: false, error: '' });
      setSimulateFailure(false);
      setCurrentScreen('summary_payment');
      return;
    }
    if (status === 409) {
      // Altcineva a rezervat între timp intervalul: reîncărcăm intervalele zilei
      setBookingRequest({ loading: false, error: 'Intervalul ales nu mai este liber. Alege altă oră.' });
      loadAvailability(selectedFacility, selectedDate);
      return;
    }
    setBookingRequest({ loading: false, error: apiErrorMessage(status, body) });
  };

  // Figma 06 și 06b: „Confirmă și plătește" / „Reîncearcă plata" -> POST /bookings/{id}/pay (plată simulată, KAN-53)
  const payBooking = async () => {
    if (payment.loading) return;
    setPayment({ loading: true, error: '' });
    const { status, body } = await postWithAuth(`/api/v1/bookings/${booking.booking_id}/pay`, {
      method: 'CARD_ONLINE',
      simulateResult: simulateFailure ? 'FAILED' : 'SUCCESS'
    });
    if (status === 200) {
      setBooking(body.booking);
      setPayment({ loading: false, error: '' });
      setQrEnlarged(false);
      setCurrentScreen('confirmed_ticket');
      return;
    }
    if (status === 402) {
      // Rezervarea rămâne în așteptare; la „Reîncearcă plata" simularea pornește din nou cu succes
      setBooking(body.booking);
      setSimulateFailure(false);
      setPayment({ loading: false, error: '' });
      setCurrentScreen('payment_failed');
      return;
    }
    // 400 SB400: au trecut cele 5 minute de blocare; 409: rezervarea nu mai așteaptă plata
    const message = status === 400 && body.error?.code === 'SB400'
      ? 'Au trecut cele 5 minute în care intervalul a fost păstrat. Alege din nou data și ora.'
      : apiErrorMessage(status, body);
    setPayment({ loading: false, error: message });
    setCurrentScreen('summary_payment');
  };

  // KAN-56: Tabul „Cont" și butonul „Contul meu" deschid ecranul Contul meu (Figma 11)
  const openAccount = () => {
    setCurrentScreen('account');
  };

  const openAdminPanel = () => {
    setCurrentScreen('admin');
    fetchFacilitiesFromBackend();
    fetchUsersFromBackend();
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // mod privat
    }
    setAuthToken(null);
    setAuthUser(null);
    setLoginForm({ email: '', password: '' });
    setCurrentScreen('login');
  };

  // KAN-57: Validare token QR la recepție prin apel POST /api/v1/qr/validate
  const handleValidateQr = async (e) => {
    e?.preventDefault();
    if (!receptionForm.token.trim()) {
      setReceptionState({ loading: false, result: null, error: 'Te rugăm să introduci sau să scanezi codul tokenului QR.' });
      return;
    }
    setReceptionState({ loading: true, result: null, error: '' });
    try {
      const res = await fetch('/api/v1/qr/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          token: receptionForm.token.trim(),
          receptionistId: Number(receptionForm.receptionistId) || authUser?.id || 5
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.valid) {
        setReceptionState({ loading: false, result: data, error: '' });
      } else {
        const errorMsg = data.error?.message || data.message || `Validare eșuată (${res.status})`;
        setReceptionState({ loading: false, result: null, error: errorMsg });
      }
    } catch {
      setReceptionState({ loading: false, result: null, error: 'Nu s-a putut contacta serverul backend pentru validarea biletului.' });
    }
  };

  // Salvează sesiunea după login și deschide lista de facilități
  const completeLogin = ({ token, user }) => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user }));
    } catch {
      // Fără localStorage (mod privat), sesiunea ține doar până la reîncărcarea paginii
    }
    setAuthToken(token);
    setAuthUser(user);
    setLoginForm({ email: '', password: '' });
    setRegisterForm(emptyRegisterForm);
    setCurrentScreen('facilities');
  };

  const goToLogin = () => {
    setLoginError('');
    setCurrentScreen('login');
  };

  const goToRegister = () => {
    setRegisterErrors({});
    setCurrentScreen('register');
  };

  // Figma 01: „Autentifică-te"
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setAuthSubmitting(true);
    const result = await requestLogin(loginForm.email, loginForm.password);
    setAuthSubmitting(false);
    if (result.ok) {
      completeLogin(result.data);
    } else {
      setLoginError(result.message);
    }
  };

  // Verificările din formularul de creare cont, înainte de trimitere (Figma 02b)
  const validateRegisterForm = () => {
    const errors = {};
    if (registerForm.fullName.trim() === '') {
      errors.fullName = 'Completează numele și prenumele';
    }
    if (!EMAIL_PATTERN.test(registerForm.email.trim())) {
      errors.email = 'Introdu o adresă de email validă';
    }
    if (registerForm.password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Parola trebuie să aibă minimum ${MIN_PASSWORD_LENGTH} caractere`;
    } else if (!PASSWORD_LETTER.test(registerForm.password) || !PASSWORD_DIGIT.test(registerForm.password)) {
      errors.password = 'Parola trebuie să conțină cel puțin o literă și o cifră';
    }
    if (!registerForm.acceptedTerms) {
      errors.terms = 'Trebuie să accepți termenii pentru a crea contul';
    }
    return errors;
  };

  // Figma 02: „Creează contul" -> POST /auth/register, apoi autentificare automată
  const handleRegister = async (e) => {
    e.preventDefault();
    const errors = validateRegisterForm();
    setRegisterErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setAuthSubmitting(true);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: registerForm.fullName.trim(),
          email: registerForm.email.trim(),
          password: registerForm.password,
          roleType: 'STUDENT'
        })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setRegisterErrors({
          general: res.status === 409
            ? 'Există deja un cont cu acest email.'
            : body.error?.message || `Eroare ${res.status}`
        });
        return;
      }
      const login = await requestLogin(registerForm.email, registerForm.password);
      if (login.ok) {
        completeLogin(login.data);
      } else {
        setRegisterErrors({ general: login.message });
      }
    } catch {
      setRegisterErrors({ general: 'Serverul nu răspunde. Verifică dacă backend-ul este pornit.' });
    } finally {
      setAuthSubmitting(false);
    }
  };

  // „Deschis azi · 08:00–21:00" din orele venite de la API, altfel textul existent
  const openTodayText = (facility) =>
    facility.opensAt && facility.closesAt
      ? `Deschis azi · ${facility.opensAt}–${facility.closesAt}`
      : facility.hours;

  // Prețul principal în moneda aleasă, iar cealaltă monedă afișată mai mic, ca în Figma
  const priceParts = (facility) => {
    const ron = `${formatAmount(facility.priceRon)} RON`;
    const eur = `${formatAmount(facility.priceEur)} EUR`;
    return currency === 'RON' ? [ron, eur] : [eur, ron];
  };

  // Rândul cu iconița categoriei și numele facilității (Figma 06, 06b, 07)
  const renderFacilityHeading = (bookingRow) => {
    const style = CATEGORY_STYLE[selectedFacility?.category] || CATEGORY_STYLE.Sporturi;
    return (
      <div className="sc-facility-heading">
        <span className={`sc-category-badge ${style.className}`}>
          {/* Figma are doar iconița pentru Înot; la celelalte categorii folosim iconița cardului, colorată prin mască.
              Ghilimelele sunt necesare: iconițele mici sunt incluse ca text (data URL) */}
          {style.className === 'swim'
            ? <img src={iconWavesTeal} alt="" />
            : <span style={{ '--icon': `url("${style.icon}")` }} />}
        </span>
        {/* „Complex sportiv, corp A" -> „Complex sportiv", ca în Figma; corpul apare în „Cum intri" */}
        <strong>{bookingRow.facility} · {bookingRow.building_name.split(',')[0]}</strong>
      </div>
    );
  };

  return (
    <div className="phone-mockup">
      {/* ================= HEADER BLEUMARIN FIGMA ================= */}
      <header className="figma-header sc-hero">
        <img className="sc-hero-decor sc-hero-decor-1" src={decorHero1} alt="" />
        <img className="sc-hero-decor sc-hero-decor-2" src={decorHero2} alt="" />

        <div className="sc-hero-bar">
          <button className="sc-brand" onClick={() => setCurrentScreen(authToken ? 'facilities' : 'login')}>
            <span className="sc-logo"><img src={logoBall} alt="" /></span>
            Sport Campus
          </button>
          {AUTH_SCREENS.includes(currentScreen) ? (
            // „Ajutor" va deschide ghidul de utilizare (pasul 6 din plan)
            <button className="sc-header-action" type="button">Ajutor</button>
          ) : (
            // Temporar: „Contul meu" deschide panoul Admin până se face ecranul 11 din Figma
            <button className="sc-header-action" onClick={openAccount}>Contul meu</button>
          )}
        </div>

        <div className="sc-hero-switches">
          <div className="sc-switch" role="group" aria-label="Limbă">
            <button className={lang === 'ro' ? 'active' : ''} onClick={() => setLang('ro')}>RO</button>
            <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
          </div>
          <div className="sc-switch" role="group" aria-label="Monedă">
            <button className={currency === 'RON' ? 'active' : ''} onClick={() => setCurrency('RON')}>RON</button>
            <button className={currency === 'EUR' ? 'active' : ''} onClick={() => setCurrency('EUR')}>EUR</button>
          </div>
        </div>

        {/* Header Titlu Dinamic per Ecran */}
        {currentScreen === 'login' && (
          <div>
            <h2 className="figma-header-title">Autentificare</h2>
            <p className="figma-header-desc">Intră în cont pentru a rezerva o facilitate sportivă.</p>
          </div>
        )}

        {currentScreen === 'register' && (
          <div>
            <h2 className="figma-header-title">Creare cont</h2>
            <p className="figma-header-desc">Un singur pas. Completează datele de student.</p>
          </div>
        )}

        {currentScreen === 'facilities' && (
          <div>
            <h2 className="figma-header-title">Facilități</h2>
            <p className="figma-header-desc">Alege unde vrei să faci mișcare.</p>
          </div>
        )}

        {currentScreen === 'account' && (
          <div>
            <h2 className="figma-header-title">Contul meu</h2>
            <p className="figma-header-desc">Date profil, preferințe și administrare sesiune</p>
          </div>
        )}

        {currentScreen === 'reception' && (
          <div>
            <h2 className="figma-header-title">Scanare QR Recepție</h2>
            <p className="figma-header-desc">Validare bilet electronic de acces la intrarea în facilitate</p>
          </div>
        )}

        {currentScreen === 'admin' && (
          <div>
            <h2 className="figma-header-title">Panou Administrare (Admin)</h2>
            <p className="figma-header-desc">Gestionare facilități & utilizatori direct în baza de date</p>
          </div>
        )}

        {currentScreen === 'facility_detail' && selectedFacility && (
          <div>
            <h2 className="figma-header-title">{selectedFacility.name}</h2>
            <p className="figma-header-desc">{selectedFacility.category} · {selectedFacility.subtitle.split(' · ')[0]}</p>
          </div>
        )}

        {currentScreen === 'choose_datetime' && selectedFacility && (
          <div>
            <h2 className="figma-header-title">Alege data și ora</h2>
            <p className="figma-header-desc">
              {selectedFacility.name} · {selectedFacility.slotMinutes || 60} min · {formatAmount(selectedFacility.priceRon)} RON / {formatAmount(selectedFacility.priceEur)} EUR
            </p>
          </div>
        )}

        {currentScreen === 'summary_payment' && (
          <div>
            <h2 className="figma-header-title">Rezumat și plată</h2>
            <p className="figma-header-desc">Verifică datele rezervării înainte de a continua la plata externă.</p>
          </div>
        )}

        {currentScreen === 'payment_failed' && (
          <div>
            <h2 className="figma-header-title">Plată eșuată</h2>
            <p className="figma-header-desc">Tranzacția nu a putut fi procesată de bancă</p>
          </div>
        )}

        {currentScreen === 'confirmed_ticket' && (
          <div>
            <h2 className="figma-header-title">Rezervare confirmată</h2>
            {booking?.booking_code && (
              <p className="figma-header-desc">
                {Number(booking.total_amount) > 0 ? 'Plătită' : 'Gratuită'} · Cod rezervare {booking.booking_code}
              </p>
            )}
          </div>
        )}

        {currentScreen === 'my_bookings' && (
          <div>
            <h2 className="figma-header-title">Rezervările mele</h2>
            <p className="figma-header-desc">Rezervările și codurile tale de acces</p>
          </div>
        )}

        {currentScreen === 'map' && (
          <div>
            <h2 className="figma-header-title">Harta Campus</h2>
            <p className="figma-header-desc">Localizarea sălilor și a terenurilor sportive</p>
          </div>
        )}
      </header>

      {/* ================= CONȚINUT ECRANE ================= */}
      <main ref={screenContentRef} className={`figma-screen-content ${AUTH_SCREENS.includes(currentScreen) ? 'sc-no-nav' : ''}`}>

        {/* ---------------- AUTENTIFICARE (Figma 01 / 01b) ---------------- */}
        {currentScreen === 'login' && (
          <div className="sc-stack">
            <form className="sc-form-card" onSubmit={handleLogin} noValidate>
              {loginError && (
                <div className="sc-alert-error" role="alert">
                  <img src={iconInfoRed} alt="" />
                  <span>{loginError}</span>
                </div>
              )}

              <label className="sc-field">
                <span className="sc-label">Email</span>
                <span className={`sc-input ${loginError ? 'error' : ''}`}>
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="ana.popescu@stud.univ.ro"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  />
                </span>
              </label>

              <label className="sc-field">
                <span className="sc-label">Parolă</span>
                <span className={`sc-input ${loginError ? 'error' : ''}`}>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="sc-input-toggle"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                  >
                    {showLoginPassword ? 'Ascunde' : 'Arată'}
                  </button>
                </span>
              </label>

              <div className="sc-link-row">
                {/* Recuperarea parolei nu există încă în backend */}
                <button type="button" className="sc-link">Ai uitat parola?</button>
              </div>

              <button type="submit" className="sc-btn-primary" disabled={authSubmitting}>
                {authSubmitting ? 'Se verifică…' : 'Autentifică-te'}
                <img src={iconArrowDark} alt="" />
              </button>
            </form>

            <div className="sc-divider"><span>sau</span></div>

            <div className="sc-new-account">
              <p>Nu ai încă un cont?</p>
              <button type="button" className="sc-btn-secondary" onClick={goToRegister}>
                Creează un cont
              </button>
            </div>

            <div className="sc-info">
              <img src={iconLock} alt="" />
              <span>Un singur cont pentru rezervări, plata online și accesul în facilități.</span>
            </div>
          </div>
        )}

        {/* ---------------- CREARE CONT (Figma 02 / 02b) ---------------- */}
        {currentScreen === 'register' && (
          <form className="sc-stack" onSubmit={handleRegister} noValidate>
            <div className="sc-form-card">
              {registerErrors.general && (
                <div className="sc-alert-error" role="alert">
                  <img src={iconInfoRed} alt="" />
                  <span>{registerErrors.general}</span>
                </div>
              )}

              <label className="sc-field">
                <span className="sc-label">Nume și prenume</span>
                <span className={`sc-input ${registerErrors.fullName ? 'error' : ''}`}>
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder="Ana Popescu"
                    value={registerForm.fullName}
                    onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                  />
                </span>
                {registerErrors.fullName && <span className="sc-field-error">{registerErrors.fullName}</span>}
              </label>

              <label className="sc-field">
                <span className="sc-label">Email de student</span>
                <span className={`sc-input ${registerErrors.email ? 'error' : ''}`}>
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="ana.popescu@stud.univ.ro"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  />
                </span>
                {registerErrors.email && <span className="sc-field-error">{registerErrors.email}</span>}
              </label>

              <label className="sc-field">
                <span className="sc-label">Parolă</span>
                <span className={`sc-input ${registerErrors.password ? 'error' : ''}`}>
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="sc-input-toggle"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  >
                    {showRegisterPassword ? 'Ascunde' : 'Arată'}
                  </button>
                </span>
                {registerErrors.password && <span className="sc-field-error">{registerErrors.password}</span>}
                <span className="sc-field-hint">Folosește o parolă unică pentru acest cont.</span>
              </label>
            </div>

            <label className="sc-consent">
              <input
                type="checkbox"
                checked={registerForm.acceptedTerms}
                onChange={(e) => setRegisterForm({ ...registerForm, acceptedTerms: e.target.checked })}
              />
              <span className="sc-checkbox" aria-hidden="true">
                <img src={iconCheck} alt="" />
              </span>
              <span>
                Accept termenii de utilizare și am citit informarea privind datele personale.
                {registerErrors.terms && <span className="sc-field-error sc-block">{registerErrors.terms}</span>}
              </span>
            </label>

            <button type="submit" className="sc-btn-primary" disabled={authSubmitting}>
              {authSubmitting ? 'Se creează contul…' : 'Creează contul'}
              <img src={iconArrowDark} alt="" />
            </button>

            <button type="button" className="sc-btn-secondary" onClick={goToLogin}>
              Ai deja cont? Autentifică-te
            </button>
          </form>
        )}

        {/* ---------------- 11. CONTUL MEU (KAN-56 - FIGMA 11) ---------------- */}
        {currentScreen === 'account' && (() => {
          const name = authUser?.fullName || authUser?.name || 'Cosmin Flocea';
          const email = authUser?.email || 'cosmin.flocea@student.usv.ro';
          const role = authUser?.role || 'STUDENT';
          const initials = name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CF';
          
          const roleMeta = {
            STUDENT: { label: 'Student USV', color: '#0284C7', bg: '#E0F2FE' },
            STAFF: { label: 'Cadru Didactic / Personal', color: '#059669', bg: '#D1FAE5' },
            EXTERNAL: { label: 'Amator / Extern', color: '#D97706', bg: '#FEF3C7' },
            RECEPTIONIST: { label: 'Recepționer Campus', color: '#7C3AED', bg: '#EDE9FE' },
            ADMIN: { label: 'Administrator Sistem', color: '#4F46E5', bg: '#EEF2FF' }
          }[role] || { label: role, color: '#475569', bg: '#F1F5F9' };

          return (
            <div>
              {/* Card Profil Utilizator */}
              <div className="info-section-box" style={{ textAlign: 'center', padding: '20px 16px', position: 'relative' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0B1F3A 0%, #1E3A8A 100%)',
                  color: '#C6F246',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: 900,
                  margin: '0 auto 12px',
                  boxShadow: '0 4px 12px rgba(11, 31, 58, 0.15)'
                }}>
                  {initials}
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px' }}>
                  {name}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 10px' }}>
                  {email}
                </p>
                <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: roleMeta.bg, color: roleMeta.color, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ● {roleMeta.label}
                </div>

                {/* Detalii student / profil */}
                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-light)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', textAlign: 'left' }}>
                  <div style={{ background: 'var(--bg-page)', padding: '8px 10px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Telefon</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>{authUser?.phone || '0740 123 456'}</span>
                  </div>
                  <div style={{ background: 'var(--bg-page)', padding: '8px 10px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Nr. Matricol / ID</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'monospace' }}>{authUser?.matricolNumber || 'USV-2024-8841'}</span>
                  </div>
                  <div style={{ background: 'var(--bg-page)', padding: '8px 10px', borderRadius: '8px', gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Facultate / Depart.</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>{authUser?.faculty || 'Inginerie Electrică și Știința Calculatoarelor (FIESC)'}</span>
                  </div>
                </div>
              </div>

              {/* Setări & Preferințe */}
              <div className="info-section-box">
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 12px' }}>
                  Preferințe aplicație
                </h4>

                {/* Comutator Dark Mode */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <div>
                    <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-main)' }}>Mod întunecat (Dark Mode)</strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Comută tema de culori a interfeței</span>
                  </div>
                  <button
                    type="button"
                    onClick={toggleDarkMode}
                    style={{
                      width: '46px',
                      height: '26px',
                      borderRadius: '13px',
                      background: darkMode ? '#C6F246' : '#CBD5E1',
                      border: 'none',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease',
                      padding: '2px'
                    }}
                  >
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: darkMode ? '#0B1F3A' : '#FFFFFF',
                      transform: darkMode ? 'translateX(20px)' : 'translateX(0)',
                      transition: 'transform 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px'
                    }}>
                      {darkMode ? '🌙' : '☀️'}
                    </div>
                  </button>
                </div>

                {/* Monedă & Limbă */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <div>
                    <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-main)' }}>Monedă afișată</strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Prețurile din catalog</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      className={`btn-figma-dark ${currency === 'RON' ? 'active' : ''}`}
                      style={{ padding: '4px 10px', fontSize: '11px', background: currency === 'RON' ? '#0B1F3A' : 'var(--bg-page)', color: currency === 'RON' ? '#C6F246' : 'var(--text-main)' }}
                      onClick={() => setCurrency('RON')}
                    >RON</button>
                    <button
                      className={`btn-figma-dark ${currency === 'EUR' ? 'active' : ''}`}
                      style={{ padding: '4px 10px', fontSize: '11px', background: currency === 'EUR' ? '#0B1F3A' : 'var(--bg-page)', color: currency === 'EUR' ? '#C6F246' : 'var(--text-main)' }}
                      onClick={() => setCurrency('EUR')}
                    >EUR</button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                  <div>
                    <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-main)' }}>Limbă</strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Română / Engleză</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      className={`btn-figma-dark ${lang === 'ro' ? 'active' : ''}`}
                      style={{ padding: '4px 10px', fontSize: '11px', background: lang === 'ro' ? '#0B1F3A' : 'var(--bg-page)', color: lang === 'ro' ? '#C6F246' : 'var(--text-main)' }}
                      onClick={() => setLang('ro')}
                    >RO</button>
                    <button
                      className={`btn-figma-dark ${lang === 'en' ? 'active' : ''}`}
                      style={{ padding: '4px 10px', fontSize: '11px', background: lang === 'en' ? '#0B1F3A' : 'var(--bg-page)', color: lang === 'en' ? '#C6F246' : 'var(--text-main)' }}
                      onClick={() => setLang('en')}
                    >EN</button>
                  </div>
                </div>
              </div>

              {/* Secțiune Acțiuni Rapide */}
              <div className="info-section-box">
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 10px' }}>
                  Servicii & Administrare
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    className="btn-figma-dark"
                    style={{ width: '100%', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--card-bg)', border: '1px solid var(--border-light)', color: 'var(--text-main)' }}
                    onClick={() => setCurrentScreen('reception')}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>📱</span>
                      <span style={{ fontWeight: 700, fontSize: '12px' }}>Scanare cod QR la recepție (Figma 12)</span>
                    </span>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>➔</span>
                  </button>

                  <button
                    className="btn-figma-dark"
                    style={{ width: '100%', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--card-bg)', border: '1px solid var(--border-light)', color: 'var(--text-main)' }}
                    onClick={openAdminPanel}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>🛠️</span>
                      <span style={{ fontWeight: 700, fontSize: '12px' }}>Panou Administrare Baze de Date</span>
                    </span>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>➔</span>
                  </button>

                  <button
                    className="btn-figma-dark"
                    style={{ width: '100%', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--card-bg)', border: '1px solid var(--border-light)', color: 'var(--text-main)' }}
                    onClick={() => setCurrentScreen('my_bookings')}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>📅</span>
                      <span style={{ fontWeight: 700, fontSize: '12px' }}>Rezervările mele</span>
                    </span>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>➔</span>
                  </button>
                </div>
              </div>

              {/* Buton Deconectare */}
              <button
                type="button"
                className="btn-figma-dark"
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#EF4444',
                  fontWeight: 800,
                  fontSize: '13px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  marginBottom: '20px'
                }}
              >
                🚪 Ieșire din cont (Deconectare)
              </button>
            </div>
          );
        })()}

        {/* ---------------- 12. SCANARE COD QR LA RECEPȚIE (KAN-57 - FIGMA 12) ---------------- */}
        {currentScreen === 'reception' && (
          <div>
            <div className="info-section-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>🏢</span>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Recepție Baze Sportive USV
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Modul recepționer pentru verificare bilet electronic
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '10px 0 14px' }}>
                Scanează codul QR prezentat pe telefon de student sau introdu manual tokenul de securitate criptat cu <strong>AES-256-GCM</strong>.
              </p>

              <form onSubmit={handleValidateQr}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-main)', marginBottom: '4px' }}>
                    Token Bilet QR (Hexadecimal / Text)
                  </label>
                  <textarea
                    rows={3}
                    value={receptionForm.token}
                    onChange={(e) => setReceptionForm(f => ({ ...f, token: e.target.value }))}
                    placeholder="Lipește tokenul biletului QR criptat..."
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-page)',
                      color: 'var(--text-main)',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {booking?.qr_payload && (
                  <button
                    type="button"
                    onClick={() => setReceptionForm(f => ({ ...f, token: booking.qr_payload }))}
                    style={{
                      background: 'rgba(198, 242, 70, 0.15)',
                      border: '1px dashed #65A30D',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      marginBottom: '12px',
                      width: '100%',
                      textAlign: 'left'
                    }}
                  >
                    📋 Folosește biletul rezervării curente ({booking.booking_code})
                  </button>
                )}

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-main)', marginBottom: '4px' }}>
                    ID Personal Recepție (PostgreSQL)
                  </label>
                  <input
                    type="number"
                    value={receptionForm.receptionistId}
                    onChange={(e) => setReceptionForm(f => ({ ...f, receptionistId: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-page)',
                      color: 'var(--text-main)',
                      fontSize: '12px'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-figma-dark"
                  disabled={receptionState.loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#0B1F3A',
                    color: '#C6F246',
                    fontSize: '13px',
                    fontWeight: 800,
                    borderRadius: '12px',
                    cursor: receptionState.loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {receptionState.loading ? 'Se validează în PostgreSQL…' : '🔍 Validează biletul la intrare'}
                </button>
              </form>
            </div>

            {/* Rezultat Validare: SUCCES */}
            {receptionState.result && (
              <div className="info-section-box" style={{ background: 'rgba(22, 163, 74, 0.08)', border: '2px solid #16A34A', borderRadius: '16px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '24px' }}>✅</span>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 900, color: '#16A34A', margin: 0 }}>
                      ACCES PERMIS
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {receptionState.result.message || 'Bilet validat cu succes la recepție.'}
                    </span>
                  </div>
                </div>

                <div style={{ background: 'var(--card-bg)', borderRadius: '10px', padding: '12px', marginTop: '10px', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Status nou:</span>
                    <strong style={{ fontSize: '11px', color: '#16A34A' }}>CHECKED_IN</strong>
                  </div>
                  {receptionState.result.booking?.facility_name && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Facilitate:</span>
                      <strong style={{ fontSize: '11px', color: 'var(--text-main)' }}>{receptionState.result.booking.facility_name}</strong>
                    </div>
                  )}
                  {receptionState.result.booking?.client_name && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Beneficiar:</span>
                      <strong style={{ fontSize: '11px', color: 'var(--text-main)' }}>{receptionState.result.booking.client_name}</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Validat la:</span>
                    <strong style={{ fontSize: '11px', color: 'var(--text-main)' }}>{new Date().toLocaleTimeString('ro-RO')}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-figma-dark"
                  onClick={() => {
                    setReceptionState({ loading: false, result: null, error: '' });
                    setReceptionForm(f => ({ ...f, token: '' }));
                  }}
                  style={{ width: '100%', marginTop: '12px', padding: '10px', fontSize: '12px' }}
                >
                  Scanează alt bilet
                </button>
              </div>
            )}

            {/* Rezultat Validare: EROARE */}
            {receptionState.error && (
              <div className="info-section-box" style={{ background: 'rgba(220, 38, 38, 0.08)', border: '2px solid #DC2626', borderRadius: '16px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>⛔</span>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 900, color: '#DC2626', margin: 0 }}>
                      ACCES RESPINS
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Biletul nu a putut fi validat
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '12px', color: '#DC2626', fontWeight: 700, margin: '8px 0' }}>
                  {receptionState.error}
                </p>

                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '6px 0 12px' }}>
                  Motive frecvente: tokenul a expirat, a fost utilizat deja anterior (stare CHECKED_IN) sau semnătura AES-256 este invalidă.
                </p>

                <button
                  type="button"
                  className="btn-figma-dark"
                  onClick={() => setReceptionState({ loading: false, result: null, error: '' })}
                  style={{ width: '100%', padding: '10px', fontSize: '12px' }}
                >
                  Reîncearcă validarea
                </button>
              </div>
            )}

            <button
              type="button"
              className="btn-figma-dark"
              onClick={() => setCurrentScreen('account')}
              style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-main)', marginTop: '8px', marginBottom: '20px' }}
            >
              ⬅️ Înapoi la Contul meu
            </button>
          </div>
        )}

        {/* ---------------- PANOU ADMIN (KAN-42, KAN-45, KAN-47) ---------------- */}

        {currentScreen === 'admin' && (
          <div>
            {/* Sub-taburi Admin: Facilitati vs Utilizatori */}
            <div className="admin-tab-bar">
              <button 
                className={`admin-tab-btn ${adminTab === 'facilities' ? 'active' : ''}`}
                onClick={() => setAdminTab('facilities')}
              >
                🏟️ Facilități ({dbFacilities.length || fallbackFacilities.length})
              </button>
              <button 
                className={`admin-tab-btn ${adminTab === 'users' ? 'active' : ''}`}
                onClick={() => setAdminTab('users')}
              >
                👥 Utilizatori ({dbUsers.length})
              </button>
            </div>

            {/* TAB ADMIN 1: FACILITĂȚI (KAN-45 de Sebastian) */}
            {adminTab === 'facilities' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800 }}>Tabel Facilități (PostgreSQL)</span>
                  <button 
                    className="btn-sm-action" 
                    style={{ background: 'var(--primary-green)', padding: '6px 12px' }}
                    onClick={() => {
                      setFacilityForm({
                        name: '',
                        sport_type: 'Fotbal',
                        category: 'Sporturi',
                        capacity: 14,
                        base_price_per_hour: 40.0,
                        slot_minutes: 60,
                        opens_at: '08:00:00',
                        closes_at: '22:00:00'
                      });
                      setShowAddFacilityModal(true);
                    }}
                  >
                    + Adaugă facilitate
                  </button>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nume</th>
                        <th>Sport</th>
                        <th>Capacitate</th>
                        <th>Preț/h</th>
                        <th>Status</th>
                        <th>Acțiuni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dbFacilities.length > 0 ? dbFacilities : fallbackFacilities.map(f => ({
                        facility_id: f.id,
                        name: f.name,
                        sport_type: f.category === 'Înot' ? 'Natație' : f.category,
                        capacity: 14,
                        base_price_per_hour: f.priceRon,
                        is_active: true
                      }))).map((f) => (
                        <tr key={f.facility_id}>
                          <td style={{ fontWeight: 800 }}>#{f.facility_id}</td>
                          <td><b>{f.name}</b></td>
                          <td>{f.sport_type}</td>
                          <td>{f.capacity} locuri</td>
                          <td style={{ color: 'var(--primary-green)', fontWeight: 800 }}>{f.base_price_per_hour} RON</td>
                          <td>
                            <span className={f.is_active ? 'badge-status-active' : 'badge-status-inactive'}>
                              {f.is_active ? 'ACTIV' : 'INACTIV'}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn-sm-action"
                              onClick={() => {
                                setEditingFacility(f);
                                setFacilityForm({
                                  name: f.name,
                                  sport_type: f.sport_type || 'Fotbal',
                                  category: f.category || 'Sporturi',
                                  capacity: f.capacity,
                                  base_price_per_hour: f.base_price_per_hour,
                                  slot_minutes: f.slot_minutes || 60,
                                  opens_at: f.opens_at || '08:00:00',
                                  closes_at: f.closes_at || '22:00:00',
                                  is_active: f.is_active
                                });
                              }}
                            >
                              Editează
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                  💡 Datele din acest tabel sunt încărcate în timp real din tabela <code>sport_facilities</code> prin API-ul REST <code>GET /api/v1/facilities</code>.
                </p>
              </div>
            )}

            {/* TAB ADMIN 2: UTILIZATORI (KAN-47 de Alexandra) */}
            {adminTab === 'users' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800 }}>Tabel Utilizatori (PostgreSQL)</span>
                  <button 
                    className="btn-sm-action" 
                    style={{ background: 'var(--primary-green)', padding: '6px 12px' }}
                    onClick={openAddUserForm}
                  >
                    + Adaugă utilizator
                  </button>
                </div>

                {usersLoadError && (
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626', marginBottom: '10px' }}>
                    ⚠️ {usersLoadError}
                  </p>
                )}

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nume</th>
                        <th>Email USV</th>
                        <th>Telefon</th>
                        <th>Rol</th>
                        <th>Status</th>
                        <th>Creat la</th>
                        <th>Acțiuni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbUsers.length === 0 && !usersLoadError && (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center' }}>Nu există utilizatori în baza de date.</td>
                        </tr>
                      )}
                      {dbUsers.map((u) => (
                        <tr key={u.user_id}>
                          <td style={{ fontWeight: 800 }}>#{u.user_id}</td>
                          <td><b>{u.full_name}</b></td>
                          <td style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{u.email}</td>
                          <td style={{ fontSize: '10px' }}>{u.phone_number || '—'}</td>
                          <td>
                            <span style={{ fontWeight: 800, color: u.role_type === 'STUDENT' ? '#0284C7' : (u.role_type === 'PROFESSOR' ? '#7C3AED' : '#059669') }}>
                              {u.role_type}
                            </span>
                          </td>
                          <td>
                            <span className={u.is_active ? 'badge-status-active' : 'badge-status-inactive'}>
                              {u.is_active ? 'ACTIV' : 'INACTIV'}
                            </span>
                          </td>
                          <td style={{ fontSize: '10px' }}>
                            {u.created_at ? new Date(u.created_at).toLocaleDateString('ro-RO') : '—'}
                          </td>
                          <td>
                            <button
                              className="btn-sm-action"
                              onClick={() => openEditUserForm(u)}
                            >
                              Editează
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                  💡 Datele din acest tabel sunt încărcate prin API-ul REST <code>GET /api/v1/users</code>, unind datele din tabelele <code>users</code> și <code>student_profiles</code>.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ---------------- 03. FACILITĂȚI (Catalog Principal) ---------------- */}
        {currentScreen === 'facilities' && (
          <div className="sc-stack">
            <div className="sc-search-row">
              <label className="sc-search-field">
                <img src={iconSearch} alt="" />
                <input
                  type="search"
                  placeholder="Caută după nume…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </label>
              <button className="sc-map-button" onClick={() => setCurrentScreen('map')} aria-label="Hartă campus">
                <img src={iconMapWhite} alt="" />
              </button>
            </div>

            <div className="sc-chips">
              {['Toate', 'Înot', 'Relaxare', 'Sporturi'].map((cat) => (
                <button
                  key={cat}
                  className={`sc-chip ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {(() => {
              const visibleFacilities = activeFacilitiesList
                .filter(f => activeCategory === 'Toate' || f.category === activeCategory)
                .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

              return (
                <>
                  <p className="sc-list-summary">{visibleFacilities.length} facilități · prețuri / interval</p>

                  {visibleFacilities.map((facility) => {
                    const style = CATEGORY_STYLE[facility.category] || CATEGORY_STYLE['Sporturi'];
                    const [mainPrice, otherPrice] = priceParts(facility);
                    return (
                      <article
                        key={facility.id}
                        className="sc-facility-card"
                        onClick={() => openFacilityDetails(facility)}
                      >
                        <div className={`sc-card-banner ${style.className}`}>
                          <img className="sc-card-decor" src={decorCard} alt="" />
                          <span className="sc-card-category">{facility.category}</span>
                          <img className="sc-card-icon" src={style.icon} alt="" />
                        </div>

                        <div className="sc-card-body">
                          <h3 className="sc-card-title">{facility.name}</h3>
                          <p className="sc-card-subtitle">{facility.subtitle}</p>

                          {facility.badgeAlert && (
                            <span className="sc-promo">
                              <img src={iconTag} alt="" />
                              {facility.badgeAlert}
                            </span>
                          )}

                          <span className="sc-open-today">
                            <img src={dotOpen} alt="" />
                            {openTodayText(facility)}
                          </span>

                          <div className="sc-price-row">
                            <span className="sc-price">
                              <strong>{mainPrice}</strong>
                              <span>/ {otherPrice}</span>
                            </span>
                            <button
                              className="sc-btn-details"
                              onClick={(e) => { e.stopPropagation(); openFacilityDetails(facility); }}
                            >
                              Detalii
                              <img src={iconArrowWhite} alt="" />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </>
              );
            })()}
          </div>
        )}

        {/* ---------------- 04. DETALII FACILITATE (Figma 04) ---------------- */}
        {currentScreen === 'facility_detail' && selectedFacility && (
          <div className="sc-stack">
            <button type="button" className="sc-back-link" onClick={() => setCurrentScreen('facilities')}>
              <img src={iconBackBlue} alt="" />
              Toate facilitățile
            </button>

            <section className="sc-panel">
              <h3 className="sc-panel-title">Informații utile</h3>
              <div className="sc-info-row">
                <span className="sc-info-badge"><img src={iconMapTeal} alt="" /></span>
                <span className="sc-info-text">
                  <span>Locație</span>
                  <strong>{selectedFacility.usefulInfo.location}</strong>
                </span>
              </div>
              <div className="sc-info-row">
                <span className="sc-info-badge"><img src={iconClockTeal} alt="" /></span>
                <span className="sc-info-text">
                  <span>Program</span>
                  <strong>{selectedFacility.usefulInfo.program}</strong>
                </span>
              </div>
              <hr className="sc-separator" />
              <div className="sc-price-line">
                <span>{selectedFacility.slotMinutes || 60} min / rezervare</span>
                <span className="sc-price">
                  <strong className="sc-price-large">{priceParts(selectedFacility)[0]}</strong>
                  <span>/ {priceParts(selectedFacility)[1]}</span>
                </span>
              </div>
              <p className="sc-muted-note">Preț de bază pentru un interval; reducerea se aplică la plată.</p>
            </section>

            <div className="sc-promo-box">
              <img src={iconTagOrange} alt="" />
              <span>{selectedFacility.usefulInfo.notice}</span>
            </div>

            <section className="sc-panel sc-panel-tight">
              <h3 className="sc-panel-title">Înainte de vizită</h3>
              {selectedFacility.usefulInfo.beforeVisit.map((rule) => (
                <div key={rule} className="sc-rule">
                  <span className="sc-rule-badge"><img src={iconCheckGreen} alt="" /></span>
                  <span>{rule}</span>
                </div>
              ))}
            </section>

            <section className="sc-panel sc-panel-tight">
              <h3 className="sc-panel-title">{selectedFacility.usefulInfo.equipmentTitle || 'Echipament'} (opțional)</h3>
              {selectedFacility.usefulInfo.equipmentOptions.map((item, index) => (
                <React.Fragment key={item.name}>
                  {index > 0 && <hr className="sc-separator" />}
                  <div className="sc-equipment-row">
                    <span>{item.name}</span>
                    <strong>{formatAmount(item.price)} RON</strong>
                  </div>
                </React.Fragment>
              ))}
            </section>

            <section className="sc-contact-box">
              <div className="sc-contact-row">
                <span className="sc-phone-badge"><img src={iconPhoneWhite} alt="" /></span>
                <span>
                  Pentru mai multe detalii, sunați la {selectedFacility.contactPhone || 'recepția bazei sportive'}
                </span>
              </div>
              {/* „Ajutor" va deschide ghidul de utilizare (KAN-63) */}
              <button type="button" className="sc-btn-secondary">
                Ajutor
                <img src={iconInfoDark} alt="" className="sc-btn-icon" />
              </button>
            </section>

            <button type="button" className="sc-btn-primary" onClick={openChooseDateTime}>
              Rezervă · alege data și ora
              <img src={iconArrowDark} alt="" />
            </button>
            <p className="sc-muted-note sc-center">Vei vedea disponibilitatea înainte de plată.</p>
          </div>
        )}

        {/* ---------------- 05 / 05b. ALEGE DATA ȘI ORA (Figma 05, 05b) ---------------- */}
        {currentScreen === 'choose_datetime' && selectedFacility && (() => {
          const todayIso = toIsoDate(new Date());
          const cells = buildMonthCells(calendarMonth.year, calendarMonth.month);
          const weeks = [];
          for (let i = 0; i < cells.length; i += 7) {
            weeks.push(cells.slice(i, i + 7));
          }
          const noSlots = !availability.loading && !availability.error && availability.slots.length === 0;
          const isFreeDayEmpty = !availability.loading && !availability.error &&
            availability.slots.length > 0 && availability.slots.every((slot) => !slot.isAvailable);
          const canContinue = Boolean(selectedSlot) && !availability.loading && !bookingRequest.loading;
          const monthTitle = `${MONTHS_RO[calendarMonth.month][0].toUpperCase()}${MONTHS_RO[calendarMonth.month].slice(1)} ${calendarMonth.year}`;

          return (
            <div className="sc-stack">
              <button type="button" className="sc-back-link" onClick={() => setCurrentScreen('facility_detail')}>
                <img src={iconBackBlue} alt="" />
                Detalii facilitate
              </button>

              <section className="sc-calendar">
                <div className="sc-calendar-head">
                  <button type="button" className="sc-month-btn" onClick={() => changeCalendarMonth(-1)} aria-label="Luna precedentă">
                    <img src={iconChevronLeft} alt="" />
                  </button>
                  <span>{monthTitle}</span>
                  <button type="button" className="sc-month-btn" onClick={() => changeCalendarMonth(1)} aria-label="Luna următoare">
                    <img src={iconChevronRight} alt="" />
                  </button>
                </div>
                <div className="sc-calendar-row sc-weekdays">
                  {WEEKDAY_HEADERS.map((day) => <span key={day}>{day}</span>)}
                </div>
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="sc-calendar-row">
                    {week.map((isoDate, dayIndex) => {
                      if (!isoDate) {
                        return <span key={`gol-${dayIndex}`} className="sc-day empty" />;
                      }
                      const isPast = isoDate < todayIso;
                      const classes = ['sc-day'];
                      if (isPast) classes.push('past');
                      if (isoDate === todayIso) classes.push('today');
                      if (isoDate === selectedDate) classes.push('selected');
                      return (
                        <button
                          key={isoDate}
                          type="button"
                          className={classes.join(' ')}
                          disabled={isPast}
                          onClick={() => selectCalendarDay(isoDate)}
                        >
                          {Number(isoDate.slice(8))}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </section>

              <div className="sc-selected-day">
                <strong>Selectat: {formatLongDate(selectedDate)}</strong>
                <div className="sc-legend">
                  <span><img src={dotLegendFree} alt="" />Liber</span>
                  <span><img src={dotLegendBusy} alt="" />Ocupat</span>
                  <span><img src={dotLegendSelected} alt="" />Selectat</span>
                </div>
              </div>

              {availability.loading && <p className="sc-muted-note">Se încarcă intervalele…</p>}

              {availability.error && (
                <div className="sc-alert-error" role="alert">
                  <img src={iconInfoRed} alt="" />
                  <span>{availability.error}</span>
                </div>
              )}

              {(noSlots || isFreeDayEmpty) && (
                <div className="sc-warning-box">
                  <div className="sc-warning-title">
                    <img src={iconInfoAmber} alt="" />
                    <strong>Nu există intervale libere în această zi</strong>
                  </div>
                  <p>Alege altă dată din calendar pentru a vedea intervalele disponibile.</p>
                </div>
              )}

              {availability.slots.length > 0 && !isFreeDayEmpty && (
                <>
                  <div className="sc-slots">
                    {availability.slots.map((slot) => {
                      const isSelected = selectedSlot && selectedSlot.startTime === slot.startTime;
                      const state = isSelected ? 'selected' : slot.isAvailable ? 'free' : 'busy';
                      const dot = state === 'selected' ? dotSlotSelected : state === 'free' ? dotSlotFree : dotSlotBusy;
                      return (
                        <button
                          key={slot.startTime}
                          type="button"
                          className={`sc-slot ${state}`}
                          disabled={!slot.isAvailable}
                          onClick={() => {
                            setSelectedSlot(slot);
                            setBookingRequest({ loading: false, error: '' });
                          }}
                        >
                          <span className="sc-slot-time">{slot.startLabel}–{slot.endLabel}</span>
                          <span className="sc-slot-status">
                            <img src={dot} alt="" />
                            {slotStatusText(slot, isSelected)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="sc-note-box">
                    <img src={iconInfoBlue} alt="" />
                    <span>Fără suprapuneri: intervalele ocupate sau care se suprapun cu rezervările tale sunt dezactivate.</span>
                  </div>

                  <label className="sc-equipment-toggle">
                    <input
                      type="checkbox"
                      checked={addEquipment}
                      onChange={(e) => setAddEquipment(e.target.checked)}
                    />
                    <span className="sc-checkbox" aria-hidden="true">
                      <img src={iconCheck} alt="" />
                    </span>
                    <span className="sc-equipment-text">
                      <strong>Adaugă {(selectedFacility.usefulInfo.equipmentTitle || 'echipament').toLowerCase()}</strong>
                      <span>+10 RON</span>
                    </span>
                  </label>
                </>
              )}

              {bookingRequest.error && (
                <div className="sc-alert-error" role="alert">
                  <img src={iconInfoRed} alt="" />
                  <span>{bookingRequest.error}</span>
                </div>
              )}

              <button
                type="button"
                className={`sc-btn-primary ${canContinue ? '' : 'sc-btn-disabled'}`}
                disabled={!canContinue}
                onClick={openSummary}
              >
                {bookingRequest.loading ? 'Se creează rezervarea…' : 'Continuă către rezumat'}
                <img src={canContinue ? iconArrowDark : iconArrowMuted} alt="" />
              </button>
            </div>
          );
        })()}

        {/* ---------------- 06. REZUMAT ȘI PLATĂ (Figma 06) ---------------- */}
        {currentScreen === 'summary_payment' && booking && (() => {
          const times = bookingTimes(booking);
          const totals = bookingTotals(booking, currency);
          const discount = Number(booking.discount_amount);
          const equipment = Number(booking.equipment_amount);
          return (
            <div className="sc-stack">
              <section className="sc-panel">
                {renderFacilityHeading(booking)}
                <div className="sc-meta-row"><img src={iconCalendarDark} alt="" />{times.dateText}</div>
                <div className="sc-meta-row"><img src={iconClockDark} alt="" />{times.timeText} · {times.minutes} min</div>
                <hr className="sc-separator" />
                <div className="sc-amount-row">
                  <span>Tarif {lowerFirst(booking.facility)}</span>
                  <strong>{formatAmount(booking.base_amount)} RON</strong>
                </div>
                {equipment > 0 && (
                  <div className="sc-amount-row">
                    <span>{selectedFacility?.usefulInfo?.equipmentTitle || 'Echipament'}</span>
                    <strong>{formatAmount(equipment)} RON</strong>
                  </div>
                )}
                {discount > 0 && (
                  <div className="sc-amount-row">
                    <span>{DISCOUNT_LABELS[booking.role_type] || 'Reducere'}</span>
                    <strong className="sc-amount-discount">−{formatAmount(discount)} RON</strong>
                  </div>
                )}
                <hr className="sc-separator" />
                <div className="sc-total-row">
                  <span>Total</span>
                  <span className="sc-total-sum">
                    <strong>{totals.main}</strong>
                    <span>≈ {totals.other}</span>
                  </span>
                </div>
              </section>

              <button type="button" className="sc-back-link" onClick={() => setCurrentScreen('choose_datetime')}>
                <img src={iconBackBlue} alt="" />
                Modifică data sau ora
              </button>

              <section className="sc-panel">
                <h3 className="sc-panel-title">Plată prin procesator extern</h3>
                {/* În MVP nu există procesator real: plata simulată pornește din butonul de mai jos */}
                <div className="sc-processor">
                  <span><img src={iconLockNavy} alt="" />Continuă la plata externă</span>
                  <img src={iconExternal} alt="" />
                </div>
                <p className="sc-panel-text">
                  Vei fi redirecționat către pagina securizată a procesatorului pentru a introduce datele cardului.
                </p>
                <p className="sc-muted-note">Demonstrativ: nu există tranzacție reală.</p>
                <label className="sc-consent">
                  <input
                    type="checkbox"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                  />
                  <span className="sc-checkbox" aria-hidden="true">
                    <img src={iconCheck} alt="" />
                  </span>
                  <span>Simulează o plată refuzată de bancă</span>
                </label>
              </section>

              <p className="sc-muted-note">Suma de plată în moneda selectată: {totals.main}.</p>

              {payment.error && (
                <div className="sc-alert-error" role="alert">
                  <img src={iconInfoRed} alt="" />
                  <span>{payment.error}</span>
                </div>
              )}

              <button type="button" className="sc-btn-primary" disabled={payment.loading} onClick={payBooking}>
                {payment.loading ? 'Se procesează plata…' : `Confirmă și plătește · ${totals.main}`}
                <img src={iconArrowDark} alt="" />
              </button>
              <p className="sc-muted-note sc-center">Poți anula cu cel puțin 24 de ore înainte.</p>
            </div>
          );
        })()}

        {/* ---------------- 06b. PLATĂ EȘUATĂ (Figma 06b) ---------------- */}
        {currentScreen === 'payment_failed' && booking && (() => {
          const times = bookingTimes(booking);
          return (
            <div className="sc-stack">
              <section className="sc-panel sc-status-card">
                <span className="sc-status-badge"><img src={iconXRed} alt="" /></span>
                <h3>Nu am putut finaliza plata</h3>
                <p>Rezervarea nu a fost confirmată. Poți reîncerca plata sau te poți întoarce la rezumat.</p>
              </section>

              <section className="sc-panel sc-panel-outline sc-panel-tight">
                {renderFacilityHeading(booking)}
                <div className="sc-meta-row"><img src={iconCalendarDark} alt="" />{times.dateText}</div>
                <div className="sc-meta-row"><img src={iconClockDark} alt="" />{times.timeText} · {times.minutes} min</div>
                <hr className="sc-separator" />
                <div className="sc-amount-row">
                  <span>Total de plată</span>
                  <strong>{formatAmount(booking.total_amount)} RON / {formatAmount(booking.total_amount_eur)} EUR</strong>
                </div>
              </section>

              {payment.error && (
                <div className="sc-alert-error" role="alert">
                  <img src={iconInfoRed} alt="" />
                  <span>{payment.error}</span>
                </div>
              )}

              <button type="button" className="sc-btn-primary" disabled={payment.loading} onClick={payBooking}>
                {payment.loading ? 'Se procesează plata…' : 'Reîncearcă plata'}
                <img src={iconArrowDark} alt="" />
              </button>
              <button type="button" className="sc-btn-secondary" onClick={() => setCurrentScreen('summary_payment')}>
                Anulează / Înapoi
              </button>
            </div>
          );
        })()}

        {/* ---------------- 07. REZERVARE CONFIRMATĂ (Figma 07) ---------------- */}
        {currentScreen === 'confirmed_ticket' && (booking?.qr_payload ? (() => {
          const times = bookingTimes(booking);
          const dayMonth = times.dateText.split(', ')[1].replace(/ \d{4}$/, '');
          return (
            <div className="sc-stack">
              <section className="sc-ticket">
                <div className="sc-ticket-details">
                  {renderFacilityHeading(booking)}
                  <div className="sc-meta-row"><img src={iconCalendarDark} alt="" />{times.dateText}</div>
                  <div className="sc-meta-row"><img src={iconClockDark} alt="" />{times.timeText} · {times.minutes} min</div>
                  <div className="sc-amount-row">
                    <span>Total plătit</span>
                    <strong className="sc-amount-strong">
                      {formatAmount(booking.total_amount)} RON / {formatAmount(booking.total_amount_eur)} EUR
                    </strong>
                  </div>
                </div>
                <div className="sc-ticket-perforation" aria-hidden="true" />
                {/* Atingerea codului îl mărește, ca să fie citit ușor de scanerul de la recepție */}
                <button
                  type="button"
                  className={`sc-ticket-code ${qrEnlarged ? 'enlarged' : ''}`}
                  aria-expanded={qrEnlarged}
                  onClick={() => setQrEnlarged((value) => !value)}
                >
                  <span className="sc-qr-box">
                    {qrImage
                      ? <img src={qrImage} alt={`Cod QR pentru rezervarea ${booking.booking_code}`} />
                      : <span className="sc-qr-fallback">{booking.qr_payload}</span>}
                  </span>
                  <span className="sc-ticket-code-text">
                    <strong>Cod de acces</strong>
                    <span>
                      Prezintă codul la recepția din {booking.building_name}.
                      {qrEnlarged ? ' Atinge din nou pentru a-l micșora.' : ' Atinge codul pentru a-l mări.'}
                    </span>
                  </span>
                </button>
              </section>

              {/* Reminderul se alege la crearea rezervării; modificarea lui ulterioară are nevoie de un endpoint separat */}
              <div className="sc-reminder-row">
                <span className="sc-reminder-label">
                  <span className="sc-bell-badge"><img src={iconBellBlue} alt="" /></span>
                  Reminder cu 1 oră înainte
                </span>
                {booking.reminder_enabled
                  ? <img className="sc-switch-img" src={switchOn} alt="Pornit" />
                  : <span className="sc-switch-off" role="img" aria-label="Oprit" />}
              </div>

              <section className="sc-howto">
                <h3>Cum intri la {lowerFirst(booking.facility)}</h3>
                <p>
                  Prezintă codul rezervării la recepția din {booking.building_name}. Accesul corespunde
                  intervalului {times.timeText} din {dayMonth}.
                </p>
              </section>

              <button type="button" className="sc-btn-dark" onClick={() => setCurrentScreen('my_bookings')}>
                Vezi rezervările mele
                <img src={iconArrowLime} alt="" />
              </button>
              <button type="button" className="sc-btn-secondary" onClick={() => setCurrentScreen('facilities')}>
                Înapoi la facilități
              </button>
              {/* Dialogul de anulare (Figma 09) și POST /bookings/{id}/cancel vin cu KAN-62 și KAN-60 */}
              <button type="button" className="sc-btn-danger" onClick={() => setCurrentScreen('my_bookings')}>
                Anulează rezervarea
              </button>
            </div>
          );
        })() : (
          <div className="sc-stack">
            <div className="sc-note-box">
              <img src={iconInfoBlue} alt="" />
              <span>Codul de acces apare aici după plata unei rezervări.</span>
            </div>
            <button type="button" className="sc-btn-secondary" onClick={() => setCurrentScreen('my_bookings')}>
              Vezi rezervările mele
            </button>
          </div>
        ))}

        {/* ---------------- 08. REZERVĂRILE MELE ---------------- */}
        {currentScreen === 'my_bookings' && (
          <div>
            <div style={{ display: 'flex', background: 'var(--border-light)', borderRadius: '12px', padding: '3px', marginBottom: '14px' }}>
              <button 
                style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 700, background: bookingsTab === 'upcoming' ? 'var(--card-bg)' : 'transparent', color: bookingsTab === 'upcoming' ? 'var(--text-main)' : 'var(--text-secondary)', cursor: 'pointer' }}
                onClick={() => setBookingsTab('upcoming')}
              >
                Viitoare ({myUpcomingBookings.length})
              </button>
              <button 
                style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 700, background: bookingsTab === 'history' ? 'var(--card-bg)' : 'transparent', color: bookingsTab === 'history' ? 'var(--text-main)' : 'var(--text-secondary)', cursor: 'pointer' }}
                onClick={() => setBookingsTab('history')}
              >
                Istoric (2)
              </button>
            </div>

            {myUpcomingBookings.map(b => (
              <div key={b.id} className="info-section-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 800 }}>● {b.status}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{b.id}</span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800 }}>{b.facilityName}</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 10px' }}>{b.dateText}, {b.timeText}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-figma-dark" style={{ flex: 1 }} onClick={() => setCurrentScreen('confirmed_ticket')}>
                    Vezi codul QR
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ---------------- 10. HARTA CAMPUSULUI (KAN-58 - FIGMA 10) ---------------- */}
        {currentScreen === 'map' && (() => {
          const [selectedPinId, setSelectedPinId] = useState(1);
          const [mapFilter, setMapFilter] = useState('Toate');

          const campusPins = [
            { id: 1, facilityId: 1, name: 'Teren Fotbal Sintetic', type: 'Sporturi', icon: '⚽', x: 280, y: 70, color: '#16A34A', zone: 'Complex Sportiv Corp E' },
            { id: 2, facilityId: 2, name: 'Teren de tenis', type: 'Sporturi', icon: '🎾', x: 310, y: 150, color: '#D97706', zone: 'Baza Sportivă Campus' },
            { id: 3, facilityId: 3, name: 'Bazin de Înot USV', type: 'Înot', icon: '🏊', x: 190, y: 80, color: '#0284C7', zone: 'Corp E - Parter' },
            { id: 4, facilityId: 4, name: 'Sală Fitness & Cardio', type: 'Relaxare', icon: '🏋️', x: 190, y: 140, color: '#7C3AED', zone: 'Corp E - Etaj 1' }
          ];

          const filteredFacilities = activeFacilitiesList.filter(f => 
            mapFilter === 'Toate' ? true : f.category === mapFilter
          );

          const activePin = campusPins.find(p => p.facilityId === selectedPinId) || campusPins[0];
          const matchedFacility = activeFacilitiesList.find(f => f.id === selectedPinId) || activeFacilitiesList[0];

          return (
            <div>
              {/* Filtre Categorie Hartă */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '8px' }}>
                {['Toate', 'Sporturi', 'Înot', 'Relaxare'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setMapFilter(cat)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      border: '1px solid var(--border-light)',
                      background: mapFilter === cat ? '#0B1F3A' : 'var(--card-bg)',
                      color: mapFilter === cat ? '#C6F246' : 'var(--text-main)',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Harta Interactivă SVG USV Campus */}
              <div style={{
                background: 'var(--card-bg)',
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid var(--border-light)',
                marginBottom: '14px',
                boxShadow: '0 4px 14px rgba(11, 31, 58, 0.08)'
              }}>
                <div style={{ padding: '8px 12px', background: 'var(--bg-page)', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-main)' }}>
                    📍 Campus USV Suceava (Str. Universității nr. 13)
                  </span>
                  <span style={{ fontSize: '10px', color: '#16A34A', fontWeight: 800 }}>
                    ● 4 baze sportive active
                  </span>
                </div>

                <div style={{ position: 'relative', width: '100%', height: '240px', background: '#F1F5F9' }}>
                  <svg viewBox="0 0 400 240" style={{ width: '100%', height: '100%', display: 'block' }}>
                    {/* Fundal alei și iarbă */}
                    <rect x="0" y="0" width="400" height="240" fill="#E2E8F0" />
                    <rect x="230" y="20" width="150" height="90" fill="#DCFCE7" rx="8" />
                    <rect x="240" y="120" width="140" height="90" fill="#FEF3C7" rx="8" />

                    {/* Drumuri / Alei pietonale campus */}
                    <path d="M 0 110 L 400 110" stroke="#CBD5E1" strokeWidth="18" fill="none" />
                    <path d="M 130 0 L 130 240" stroke="#CBD5E1" strokeWidth="16" fill="none" />
                    <path d="M 230 40 L 230 220" stroke="#CBD5E1" strokeWidth="12" fill="none" />

                    {/* Corp A / Rectorat */}
                    <rect x="20" y="20" width="90" height="60" fill="#94A3B8" rx="6" />
                    <text x="65" y="48" fill="white" fontSize="9" fontWeight="800" textAnchor="middle">Corp A (Rectorat)</text>
                    <text x="65" y="62" fill="#E2E8F0" fontSize="8" textAnchor="middle">Str. Universității</text>

                    {/* Corp C / FIESC */}
                    <rect x="20" y="130" width="90" height="70" fill="#64748B" rx="6" />
                    <text x="65" y="162" fill="white" fontSize="9" fontWeight="800" textAnchor="middle">Corp C (FIESC)</text>
                    <text x="65" y="176" fill="#E2E8F0" fontSize="8" textAnchor="middle">Laboratoare IT</text>

                    {/* Corp E - Complex Sportiv */}
                    <rect x="150" y="40" width="65" height="140" fill="#3B82F6" rx="8" opacity="0.85" />
                    <text x="182" y="105" fill="white" fontSize="9" fontWeight="900" textAnchor="middle" transform="rotate(-90 182 105)">Corp E Sportiv</text>

                    {/* Teren Fotbal Sintetic */}
                    <rect x="245" y="30" width="120" height="65" fill="#15803D" rx="6" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 3" />
                    <text x="305" y="65" fill="white" fontSize="9" fontWeight="800" textAnchor="middle">⚽ Teren Sintetic</text>

                    {/* Teren Tenis */}
                    <rect x="260" y="135" width="105" height="65" fill="#C2410C" rx="6" stroke="#FFFFFF" strokeWidth="1.5" />
                    <text x="312" y="170" fill="white" fontSize="9" fontWeight="800" textAnchor="middle">🎾 Teren Tenis</text>

                    {/* Pin-uri interactive pentru facilitati */}
                    {campusPins.map(pin => {
                      const isSelected = selectedPinId === pin.facilityId;
                      return (
                        <g
                          key={pin.id}
                          onClick={() => setSelectedPinId(pin.facilityId)}
                          style={{ cursor: 'pointer' }}
                        >
                          {isSelected && (
                            <circle cx={pin.x} cy={pin.y} r="18" fill={pin.color} opacity="0.3">
                              <animate attributeName="r" values="14;22;14" dur="1.8s" repeatCount="indefinite" />
                            </circle>
                          )}
                          <circle cx={pin.x} cy={pin.y} r="12" fill={isSelected ? '#0B1F3A' : pin.color} stroke="#FFFFFF" strokeWidth="2" />
                          <text x={pin.x} y={pin.y + 4} fill={isSelected ? '#C6F246' : 'white'} fontSize="11" fontWeight="800" textAnchor="middle">
                            {pin.icon}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Indicator Facilitate Selectata pe Harta */}
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    right: '8px',
                    background: 'rgba(11, 31, 58, 0.92)',
                    backdropFilter: 'blur(4px)',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <strong style={{ fontSize: '12px', color: '#C6F246', display: 'block' }}>
                        {activePin.name}
                      </strong>
                      <span style={{ fontSize: '10px', color: '#CBD5E1' }}>
                        {activePin.zone}
                      </span>
                    </div>
                    {matchedFacility && (
                      <button
                        className="btn-figma-green"
                        style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 800, borderRadius: '6px' }}
                        onClick={() => openFacilityDetails(matchedFacility)}
                      >
                        Rezervă aici
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Lista Facilităților din Campus */}
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 10px' }}>
                Baze sportive în campus ({filteredFacilities.length})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {filteredFacilities.map(facility => (
                  <div
                    key={facility.id}
                    className="info-section-box"
                    style={{
                      margin: 0,
                      cursor: 'pointer',
                      border: selectedPinId === facility.id ? '2px solid #0B1F3A' : '1px solid var(--border-light)',
                      transition: 'all 0.15s ease'
                    }}
                    onClick={() => setSelectedPinId(facility.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800 }}>
                        {facility.category} · {facility.subtitle}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-main)' }}>
                        {formatAmount(facility.priceRon)} RON <span style={{ fontSize: '10px', fontWeight: 400, color: 'var(--text-secondary)' }}>/ slot</span>
                      </span>
                    </div>

                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 6px' }}>
                      {facility.name}
                    </h4>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700 }}>
                        ● {facility.hours || 'Deschis azi'}
                      </span>
                      <button
                        className="btn-figma-dark"
                        style={{ padding: '6px 12px', fontSize: '11px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openFacilityDetails(facility);
                        }}
                      >
                        Vezi program și rezervă
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

      </main>

      {/* ================= MODAL ADAUGARE / EDITARE FACILITATE (KAN-45) ================= */}
      {(showAddFacilityModal || editingFacility) && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', background: 'var(--card-bg)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '20px', maxHeight: '85%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800 }}>
                {editingFacility ? '✏️ Actualizare Facilitate (PostgreSQL)' : '➕ Adăugare Facilitate Nouă (PostgreSQL)'}
              </h3>
              <button 
                onClick={() => { setShowAddFacilityModal(false); setEditingFacility(null); }}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
              >
                ✖
              </button>
            </div>

            <form onSubmit={handleSaveFacility} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Nume Facilitate:</label>
                <input 
                  type="text" 
                  required
                  value={facilityForm.name} 
                  onChange={(e) => setFacilityForm({ ...facilityForm, name: e.target.value })}
                  placeholder="ex: Teren Squash Corp C"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Tip Sport:</label>
                  <select 
                    value={facilityForm.sport_type} 
                    onChange={(e) => setFacilityForm({ ...facilityForm, sport_type: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '12px' }}
                  >
                    <option value="Fotbal">Fotbal</option>
                    <option value="Tenis">Tenis</option>
                    <option value="Natație">Natație</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Saună">Saună</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Categorie:</label>
                  <select 
                    value={facilityForm.category} 
                    onChange={(e) => setFacilityForm({ ...facilityForm, category: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '12px' }}
                  >
                    <option value="Sporturi">Sporturi</option>
                    <option value="Înot">Înot</option>
                    <option value="Relaxare">Relaxare</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Capacitate Max (persoane):</label>
                  <input 
                    type="number" 
                    min="1"
                    value={facilityForm.capacity} 
                    onChange={(e) => setFacilityForm({ ...facilityForm, capacity: parseInt(e.target.value) || 1 })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '12px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Preț de Bază (RON/h):</label>
                  <input 
                    type="number" 
                    step="0.5"
                    min="0"
                    value={facilityForm.base_price_per_hour} 
                    onChange={(e) => setFacilityForm({ ...facilityForm, base_price_per_hour: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Oră Deschidere:</label>
                  <input 
                    type="text" 
                    value={facilityForm.opens_at} 
                    onChange={(e) => setFacilityForm({ ...facilityForm, opens_at: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '12px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Oră Închidere:</label>
                  <input 
                    type="text" 
                    value={facilityForm.closes_at} 
                    onChange={(e) => setFacilityForm({ ...facilityForm, closes_at: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '12px' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn-figma-green" style={{ marginTop: '10px' }}>
                💾 Salvează în PostgreSQL
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL ADAUGARE / EDITARE UTILIZATOR (KAN-47) ================= */}
      {(showAddUserModal || editingUser) && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', background: 'var(--card-bg)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '20px', maxHeight: '85%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800 }}>
                {editingUser ? '✏️ Actualizare Utilizator (PostgreSQL)' : '➕ Adăugare Utilizator Nou (PostgreSQL)'}
              </h3>
              <button
                onClick={closeUserForm}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
              >
                ✖
              </button>
            </div>

            {userFormError && (
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626', marginBottom: '10px' }}>
                ⚠️ {userFormError}
              </p>
            )}

            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Nume Complet:</label>
                <input 
                  type="text" 
                  required
                  value={userForm.full_name} 
                  onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                  placeholder="ex: Andrei Ionescu"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Email Instituțional USV:</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="ex: andrei.ionescu@student.ro"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Telefon (opțional):</label>
                <input
                  type="tel"
                  maxLength={20}
                  value={userForm.phone_number}
                  onChange={(e) => setUserForm({ ...userForm, phone_number: e.target.value })}
                  placeholder="ex: 0712345678"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '12px' }}
                />
              </div>

              {!editingUser && (
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Parolă inițială (minim 8 caractere):</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '12px' }}
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Rol Instituțional:</label>
                <select 
                  value={userForm.role_type} 
                  onChange={(e) => setUserForm({ ...userForm, role_type: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '12px' }}
                >
                  <option value="STUDENT">STUDENT (-50% reducere)</option>
                  <option value="PROFESSOR">PROFESSOR (-30% reducere)</option>
                  <option value="AMATEUR">AMATEUR (public larg)</option>
                  <option value="RECEPTIONIST">RECEPTIONIST (recepție)</option>
                  <option value="ADMIN">ADMIN (administrator)</option>
                </select>
              </div>

              {editingUser && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '6px 0' }}>
                  <input 
                    type="checkbox" 
                    id="userActive"
                    checked={userForm.is_active} 
                    onChange={(e) => setUserForm({ ...userForm, is_active: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary-green)' }}
                  />
                  <label htmlFor="userActive" style={{ fontSize: '12px', fontWeight: 700 }}>Cont Activ</label>
                </div>
              )}

              <button type="submit" className="btn-figma-green" style={{ marginTop: '10px' }}>
                💾 Salvează în PostgreSQL
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= BOTTOM NAVIGATION TABS (FIGMA EXACT) ================= */}
      {/* Bara de jos nu apare pe ecranele de autentificare (Figma 01 și 02) */}
      {!AUTH_SCREENS.includes(currentScreen) && (
        <nav className="figma-bottom-nav sc-nav">
          {[
            { label: 'Facilități', icon: navGrid, screens: ['facilities', 'facility_detail', 'choose_datetime', 'summary_payment', 'payment_failed'], onClick: () => setCurrentScreen('facilities') },
            { label: 'Hartă', icon: navMap, screens: ['map'], onClick: () => setCurrentScreen('map') },
            { label: 'Rezervările mele', icon: navCalendar, screens: ['my_bookings', 'confirmed_ticket'], onClick: () => setCurrentScreen('my_bookings') },
            { label: 'Cont', icon: navUser, screens: ['account', 'admin', 'reception'], onClick: openAccount }
          ].map((tab) => (
            <button
              key={tab.label}
              className={`sc-nav-tab ${tab.screens.includes(currentScreen) ? 'active' : ''}`}
              onClick={tab.onClick}
            >
              <span className="sc-nav-pill">
                {/* Ghilimelele sunt necesare: iconițele mici sunt incluse ca text (data URL) cu spații și caractere speciale */}
                <span className="sc-nav-icon" style={{ '--icon': `url("${tab.icon}")` }} />
              </span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
