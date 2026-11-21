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

export default function App() {
  // Ecranul activ curent:
  // 'login' | 'register' | 'facilities' | 'facility_detail' | 'choose_datetime' |
  // 'summary_payment' | 'confirmed_ticket' | 'my_bookings' | 'map' | 'admin'
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
  
  // Utilizator curent & rol
  const [userRole, setUserRole] = useState('STUDENT'); // 'STUDENT' (-50%), 'PROFESSOR' (-30%), 'AMATEUR' (0%)
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
  const [reminderEnabled, setReminderEnabled] = useState(true);

  // Tab în Rezervările Mele ('upcoming' | 'history')
  const [bookingsTab, setBookingsTab] = useState('upcoming');

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
    setCurrentScreen('choose_datetime');
    loadAvailability(selectedFacility, isoToday);
  };

  const selectCalendarDay = (isoDate) => {
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

  // Tabul „Cont" și butonul „Contul meu". Până la ecranul 11 din Figma deschid panoul Admin.
  const openAccount = () => {
    setCurrentScreen('admin');
    fetchFacilitiesFromBackend();
    fetchUsersFromBackend();
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
    // Reducerea din rezumatul plății se calculează după rolul utilizatorului autentificat
    if (['STUDENT', 'PROFESSOR', 'AMATEUR'].includes(user.roleType)) {
      setUserRole(user.roleType);
    }
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

  const getRoleDiscountPercent = () => {
    if (userRole === 'STUDENT') return 50;
    if (userRole === 'PROFESSOR') return 30;
    return 0;
  };

  const calculateFinalPrice = () => {
    if (!selectedFacility) return '22,50';
    const base = currency === 'RON' ? selectedFacility.priceRon : selectedFacility.priceEur;
    const discount = getRoleDiscountPercent() / 100;
    const discountedBase = base * (1 - discount);
    const equip = addEquipment ? (currency === 'RON' ? 10 : 2) : 0;
    const total = discountedBase + equip;
    return currency === 'RON' ? total.toFixed(2).replace('.', ',') : total.toFixed(2);
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

        {currentScreen === 'summary_payment' && selectedFacility && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => setCurrentScreen('choose_datetime')} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '14px', cursor: 'pointer' }}>←</button>
              <div>
                <h2 className="figma-header-title">Rezumat și plată</h2>
                <p className="figma-header-desc">Verifică datele rezervării înainte de a continua</p>
              </div>
            </div>
          </div>
        )}

        {currentScreen === 'confirmed_ticket' && (
          <div>
            <h2 className="figma-header-title">Rezervare confirmată</h2>
            <p className="figma-header-desc">Plată finalizată cu succes · Bilet electronic emis</p>
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
          const canContinue = Boolean(selectedSlot) && !availability.loading;
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
                          onClick={() => setSelectedSlot(slot)}
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

              <button
                type="button"
                className={`sc-btn-primary ${canContinue ? '' : 'sc-btn-disabled'}`}
                disabled={!canContinue}
                onClick={() => setCurrentScreen('summary_payment')}
              >
                Continuă către rezumat
                <img src={canContinue ? iconArrowDark : iconArrowMuted} alt="" />
              </button>
            </div>
          );
        })()}

        {/* ---------------- 06. REZUMAT ȘI PLATĂ ---------------- */}
        {currentScreen === 'summary_payment' && selectedFacility && (
          <div>
            <div className="info-section-box">
              <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '2px' }}>{selectedFacility.name}</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                📅 {formatLongDate(selectedDate)} · ⏰ {selectedSlot ? `${selectedSlot.startLabel}–${selectedSlot.endLabel}` : ''} · {selectedFacility.slotMinutes || 60} min
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Tarif facilitate:</span>
                <span>{selectedFacility.priceRon} RON</span>
              </div>

              {addEquipment && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Echipament opțional:</span>
                  <span>+10 RON</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0', color: '#16A34A' }}>
                <span>Reducere student (-50%):</span>
                <span>-{(selectedFacility.priceRon * 0.5).toFixed(2)} RON</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 900, borderTop: '1px solid var(--border-light)', marginTop: '10px', paddingTop: '10px' }}>
                <span>Total:</span>
                <span>{calculateFinalPrice()} {currency}</span>
              </div>
            </div>

            <button className="btn-figma-green" onClick={() => setCurrentScreen('confirmed_ticket')}>
              Confirmă și plătește · {calculateFinalPrice()} {currency} →
            </button>
          </div>
        )}

        {/* ---------------- 07. REZERVARE CONFIRMATĂ (Bilet QR) ---------------- */}
        {currentScreen === 'confirmed_ticket' && (
          <div>
            <div className="info-section-box" style={{ borderTop: '4px solid #22C55E' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Bazin - Complex sportiv</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                📅 Marți, 27 octombrie 2026 · ⏰ 16:00 - 17:00 · 60 min
              </p>
              <p style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '14px' }}>
                Total achitat: <span style={{ color: '#16A34A' }}>22,50 RON / 4.50 EUR</span>
              </p>

              <div style={{ textAlign: 'center', background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ width: '130px', height: '130px', background: 'white', margin: '0 auto', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                    <rect width="100" height="100" fill="white" />
                    <rect x="5" y="5" width="26" height="26" fill="#0F2942" rx="3" />
                    <rect x="10" y="10" width="16" height="16" fill="white" />
                    <rect x="14" y="14" width="8" height="8" fill="#0F2942" />
                    <rect x="69" y="5" width="26" height="26" fill="#0F2942" rx="3" />
                    <rect x="74" y="10" width="16" height="16" fill="white" />
                    <rect x="78" y="14" width="8" height="8" fill="#0F2942" />
                    <rect x="5" y="69" width="26" height="26" fill="#0F2942" rx="3" />
                    <rect x="10" y="74" width="16" height="16" fill="white" />
                    <rect x="14" y="78" width="8" height="8" fill="#0F2942" />
                    <rect x="38" y="8" width="8" height="8" fill="#0F2942" />
                    <rect x="40" y="40" width="20" height="20" fill="#0F2942" rx="2" />
                  </svg>
                </div>
                <p style={{ fontSize: '11px', fontWeight: 800, marginTop: '8px' }}>Cod de acces: SC-271026-001</p>
                <p style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Prezintă codul la intrare în Bazinul Complexului Sportiv</p>
              </div>
            </div>

            <button className="btn-figma-dark" style={{ width: '100%', padding: '12px', borderRadius: '12px', marginBottom: '10px' }} onClick={() => setCurrentScreen('my_bookings')}>
              Vezi rezervările mele →
            </button>
          </div>
        )}

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

        {/* ---------------- HARTA CAMPUSULUI ---------------- */}
        {currentScreen === 'map' && (
          <div>
            <div style={{ background: '#E2E8F0', height: '240px', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '1px solid var(--border-light)', marginBottom: '14px' }}>
              <svg viewBox="0 0 400 240" style={{ width: '100%', height: '100%' }}>
                <rect x="20" y="110" width="360" height="20" fill="#CBD5E1" rx="4" />
                <rect x="180" y="20" width="24" height="200" fill="#CBD5E1" rx="4" />
                <rect x="30" y="30" width="80" height="50" fill="#94A3B8" rx="6" />
                <text x="70" y="60" fill="white" fontSize="10" fontWeight="700" textAnchor="middle">Corp A / Rectorat</text>
                <rect x="240" y="30" width="100" height="50" fill="#94A3B8" rx="6" />
                <text x="290" y="60" fill="white" fontSize="10" fontWeight="700" textAnchor="middle">Corp C (FIESC)</text>
              </svg>
            </div>
          </div>
        )}

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
            { label: 'Facilități', icon: navGrid, screens: ['facilities', 'facility_detail', 'choose_datetime', 'summary_payment'], onClick: () => setCurrentScreen('facilities') },
            { label: 'Hartă', icon: navMap, screens: ['map'], onClick: () => setCurrentScreen('map') },
            { label: 'Rezervările mele', icon: navCalendar, screens: ['my_bookings', 'confirmed_ticket'], onClick: () => setCurrentScreen('my_bookings') },
            { label: 'Cont', icon: navUser, screens: ['admin'], onClick: openAccount }
          ].map((tab) => (
            <button
              key={tab.label}
              className={`sc-nav-tab ${tab.screens.includes(currentScreen) ? 'active' : ''}`}
              onClick={tab.onClick}
            >
              <span className="sc-nav-pill">
                <span className="sc-nav-icon" style={{ '--icon': `url(${tab.icon})` }} />
              </span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
