import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

// Utilitare & API
import {
  readStoredAuth,
  saveStoredAuth,
  clearStoredAuth,
  requestLogin,
  requestRegister,
  fetchFacilities,
  fetchUsers,
  fetchAvailability,
  fetchFacilityEquipment,
  createBooking,
  payBooking as apiPayBooking,
  fetchMyBookings,
  cancelBooking,
  validateQr,
  authHeaders,
  readApiError,
  apiErrorMessage
} from './api/client';

import {
  fallbackFacilities,
  emptyRegisterForm,
  emptyFacilityForm,
  emptyUserForm
} from './constants/mockData';

import {
  toIsoDate,
  MAX_MONTHS_AHEAD
} from './constants/dateTimeHelpers';

// Componente Globale & Modale
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import CancelModal from './components/CancelModal';
import HelpModal from './components/HelpModal';
import AdminFacilityModal from './components/AdminFacilityModal';
import AdminUserModal from './components/AdminUserModal';

// Ecrane (Screens)
import AuthScreen from './screens/AuthScreen';
import FacilitiesScreen from './screens/FacilitiesScreen';
import FacilityDetailScreen from './screens/FacilityDetailScreen';
import ChooseDatetimeScreen from './screens/ChooseDatetimeScreen';
import SummaryPaymentScreen from './screens/SummaryPaymentScreen';
import ConfirmedTicketScreen from './screens/ConfirmedTicketScreen';
import MyBookingsScreen from './screens/MyBookingsScreen';
import MapScreen from './screens/MapScreen';
import AccountScreen from './screens/AccountScreen';
import ReceptionScreen from './screens/ReceptionScreen';
import AdminScreen from './screens/AdminScreen';

const AUTH_SCREENS = ['login', 'register'];
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_LETTER = /[A-Za-zĂÂÎȘȚăâîșț]/;
const PASSWORD_DIGIT = /\d/;
// Aceleași reguli ca în backend (POST /auth/register, KAN-69)
const PHONE_CHARS = /^\+?[\d\s().-]+$/;
const MIN_PHONE_DIGITS = 10;
const MAX_PHONE_DIGITS = 15;
const MATRICOL_PATTERN = /^[A-Za-z0-9/.-]{2,40}$/;
const PENDING_STATUSES = ['INITIATED', 'PENDING_PAYMENT'];
// Cine vede panoul Admin și ecranul de Recepție (aceleași reguli ca în backend, KAN-68)
const ADMIN_ROLES = ['ADMIN'];
const RECEPTION_ROLES = ['RECEPTIONIST', 'ADMIN'];

export default function App() {
  // ---------------- 1. Rutare & Autentificare ----------------
  const [currentScreen, setCurrentScreen] = useState(() => (readStoredAuth().token ? 'facilities' : 'login'));
  const [authToken, setAuthToken] = useState(() => readStoredAuth().token);
  const [authUser, setAuthUser] = useState(() => readStoredAuth().user);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [registerForm, setRegisterForm] = useState(emptyRegisterForm);
  const [registerErrors, setRegisterErrors] = useState({});
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Derulare la început la schimbarea ecranului
  const screenContentRef = useRef(null);
  useEffect(() => {
    if (screenContentRef.current) {
      screenContentRef.current.scrollTop = 0;
    }
  }, [currentScreen]);

  // ---------------- 2. Preferințe Globale ----------------
  const [lang, setLang] = useState('ro');
  const [currency, setCurrency] = useState('RON');
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark', !darkMode);
  };

  // ---------------- 3. Catalog Facilități ----------------
  const [activeCategory, setActiveCategory] = useState('Toate');
  const [searchQuery, setSearchQuery] = useState('');
  const [dbFacilities, setDbFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);

  // ---------------- 4. Calendar & Rezervare (Alexandra / Sebastian) ----------------
  const [selectedDate, setSelectedDate] = useState(() => toIsoDate(new Date()));
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availability, setAvailability] = useState({ slots: [], loading: false, error: '' });
  // Echipamentul de închiriat al facilității alese (din baza de date) și id-urile bifate (KAN-71)
  const [facilityEquipment, setFacilityEquipment] = useState([]);
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState([]);
  const [booking, setBooking] = useState(null);
  const [bookingRequest, setBookingRequest] = useState({ loading: false, error: '' });
  const [payment, setPayment] = useState({ loading: false, error: '' });
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [qrImage, setQrImage] = useState('');
  const [qrEnlarged, setQrEnlarged] = useState(false);
  const [reminderEnabled] = useState(true);

  // ---------------- 5. Rezervările Mele (Sebastian) ----------------
  const [bookingsTab, setBookingsTab] = useState('upcoming');
  const [userBookings, setUserBookings] = useState([]);
  const [userBookingsLoading, setUserBookingsLoading] = useState(false);
  const [userBookingsError, setUserBookingsError] = useState('');

  // ---------------- 6. Harta Campus (Cosmin) ----------------
  const [selectedPinId, setSelectedPinId] = useState(1);
  const [mapFilter, setMapFilter] = useState('Toate');

  // ---------------- 7. Recepție QR (Cosmin) ----------------
  const [receptionForm, setReceptionForm] = useState({ token: '' });
  const [receptionState, setReceptionState] = useState({ loading: false, result: null, error: '' });

  // ---------------- 8. Modale (Ghid, Anulare, Admin) ----------------
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('Schimbare de program');
  const [cancelNotes] = useState('');
  const [cancelStatus, setCancelStatus] = useState({ loading: false, error: '', success: '' });

  // ---------------- 9. Panou Admin ----------------
  const [adminTab, setAdminTab] = useState('facilities');
  const [dbUsers, setDbUsers] = useState([]);
  const [usersLoadError, setUsersLoadError] = useState('');
  const [showAddFacilityModal, setShowAddFacilityModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [facilityForm, setFacilityForm] = useState(emptyFacilityForm);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [userFormError, setUserFormError] = useState('');

  // ================= ÎNCĂRCARE DATE INIȚIALE =================
  const loadFacilitiesFromBackend = async () => {
    const data = await fetchFacilities();
    if (data && data.length > 0) {
      setDbFacilities(data);
    }
  };

  const loadUsersFromBackend = async () => {
    try {
      const data = await fetchUsers(authToken);
      setDbUsers(data);
      setUsersLoadError('');
    } catch (err) {
      setDbUsers([]);
      setUsersLoadError(`Nu s-au putut încărca utilizatorii (${err.message}). Verifică backend-ul.`);
    }
  };

  useEffect(() => {
    loadFacilitiesFromBackend();
  }, []);

  // Rolul utilizatorului logat decide ce butoane și ecrane de personal vede
  const userRole = authUser?.roleType || authUser?.role || null;
  const canUseAdmin = ADMIN_ROLES.includes(userRole);
  const canUseReception = RECEPTION_ROLES.includes(userRole);

  // Un utilizator fără rolul potrivit nu rămâne pe ecranul Admin sau Recepție (ex. după ieșirea din cont)
  useEffect(() => {
    if ((currentScreen === 'admin' && !canUseAdmin) || (currentScreen === 'reception' && !canUseReception)) {
      setCurrentScreen(authToken ? 'account' : 'login');
    }
  }, [currentScreen, canUseAdmin, canUseReception, authToken]);

  // Lista activă de facilități (Postgres dacă e conectat, altfel fallback)
  const activeFacilitiesList = dbFacilities.length > 0 ? dbFacilities.map((f) => ({
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
    slotMinutes: f.slot_minutes || 60,
    contactPhone: f.contact_phone || null,
    usefulInfo: {
      location: [f.location_name || 'Complex USV', f.location_zone, f.location_address].filter(Boolean).join(', '),
      program: `${f.opens_at ? f.opens_at.slice(0, 5) : '08:00'}–${f.closes_at ? f.closes_at.slice(0, 5) : '22:00'}`,
      notice: 'Tarife diferențiate: studenții au 50% reducere, profesorii 30%',
      beforeVisit: f.category === 'Înot'
        ? ['Adu echipamentul de înot și papucii.', 'Respectă intervalul rezervat și indicațiile personalului.', 'Pregătește codul rezervării pentru acces.']
        : ['Vino cu echipament sportiv adecvat.', 'Respectă intervalul rezervat și indicațiile personalului.', 'Pregătește codul rezervării pentru acces.'],
      equipmentTitle: f.category === 'Înot' ? 'Echipament de înot' : 'Echipament'
    }
  })) : fallbackFacilities;

  // ================= AUTENTIFICARE & SESIUNE =================
  const completeLogin = ({ token, user }) => {
    saveStoredAuth({ token, user });
    setAuthToken(token);
    setAuthUser(user);
    setLoginForm({ email: '', password: '' });
    setRegisterForm(emptyRegisterForm);
    setCurrentScreen('facilities');
  };

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

  const validateRegisterForm = () => {
    const errors = {};
    if (registerForm.fullName.trim() === '') errors.fullName = 'Completează numele și prenumele';
    if (!EMAIL_PATTERN.test(registerForm.email.trim())) errors.email = 'Introdu o adresă de email validă';
    const phone = registerForm.phone.trim();
    const phoneDigits = phone.replace(/\D/g, '').length;
    if (phone === '') {
      errors.phone = 'Completează numărul de telefon';
    } else if (!PHONE_CHARS.test(phone) || phoneDigits < MIN_PHONE_DIGITS || phoneDigits > MAX_PHONE_DIGITS) {
      errors.phone = `Telefonul trebuie să aibă între ${MIN_PHONE_DIGITS} și ${MAX_PHONE_DIGITS} cifre`;
    }
    if (registerForm.roleType === 'STUDENT') {
      if (registerForm.matricolNumber.trim() === '') {
        errors.matricolNumber = 'Completează numărul matricol';
      } else if (!MATRICOL_PATTERN.test(registerForm.matricolNumber.trim())) {
        errors.matricolNumber = 'Folosește doar litere, cifre, „/”, „-” sau „.” (2–40 de caractere)';
      }
      if (registerForm.faculty.trim().length < 3) errors.faculty = 'Completează facultatea';
    }
    if (registerForm.password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Parola trebuie să aibă minimum ${MIN_PASSWORD_LENGTH} caractere`;
    } else if (!PASSWORD_LETTER.test(registerForm.password) || !PASSWORD_DIGIT.test(registerForm.password)) {
      errors.password = 'Parola trebuie să conțină cel puțin o literă și o cifră';
    }
    if (!registerForm.acceptedTerms) errors.terms = 'Trebuie să accepți termenii pentru a crea contul';
    return errors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errors = validateRegisterForm();
    setRegisterErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setAuthSubmitting(true);
    const res = await requestRegister(registerForm);

    if (!res.ok) {
      setRegisterErrors({ general: res.message });
      setAuthSubmitting(false);
      return;
    }

    const loginRes = await requestLogin(registerForm.email, registerForm.password);
    setAuthSubmitting(false);
    if (loginRes.ok) {
      completeLogin(loginRes.data);
    } else {
      setRegisterErrors({ general: loginRes.message });
    }
  };

  const handleLogout = () => {
    clearStoredAuth();
    setAuthToken(null);
    setAuthUser(null);
    setLoginForm({ email: '', password: '' });
    setCurrentScreen('login');
  };

  // ================= REZERVARE & DISPONIBILITATE =================
  const openFacilityDetails = async (facility) => {
    setSelectedFacility(facility);
    setFacilityEquipment([]);
    setSelectedEquipmentIds([]);
    setCurrentScreen('facility_detail');
    setFacilityEquipment(await fetchFacilityEquipment(facility.id));
  };

  const toggleEquipment = (equipmentId) => {
    setBookingRequest({ loading: false, error: '' });
    setSelectedEquipmentIds((ids) => (ids.includes(equipmentId)
      ? ids.filter((id) => id !== equipmentId)
      : [...ids, equipmentId]));
  };

  const loadSlotAvailability = async (facility, isoDate) => {
    setSelectedSlot(null);
    setAvailability({ slots: [], loading: true, error: '' });
    const res = await fetchAvailability(facility.id, isoDate, authToken);
    if (res.ok) {
      setAvailability({ slots: res.slots, loading: false, error: '' });
    } else {
      setAvailability({ slots: [], loading: false, error: res.error });
    }
  };

  const openChooseDateTime = () => {
    const today = new Date();
    const isoToday = toIsoDate(today);
    setSelectedDate(isoToday);
    setCalendarMonth({ year: today.getFullYear(), month: today.getMonth() });
    setBookingRequest({ loading: false, error: '' });
    setCurrentScreen('choose_datetime');
    loadSlotAvailability(selectedFacility, isoToday);
  };

  const selectCalendarDay = (isoDate) => {
    setBookingRequest({ loading: false, error: '' });
    setSelectedDate(isoDate);
    loadSlotAvailability(selectedFacility, isoDate);
  };

  const changeCalendarMonth = (delta) => {
    const today = new Date();
    const target = new Date(calendarMonth.year, calendarMonth.month + delta, 1);
    const monthsFromNow = (target.getFullYear() - today.getFullYear()) * 12 + target.getMonth() - today.getMonth();
    if (monthsFromNow < 0 || monthsFromNow > MAX_MONTHS_AHEAD) return;
    setCalendarMonth({ year: target.getFullYear(), month: target.getMonth() });
  };

  const openSummary = async () => {
    if (!selectedSlot || bookingRequest.loading) return;
    // Aceeași rezervare se refolosește doar dacă nici echipamentul ales nu s-a schimbat
    const equipmentKey = [...selectedEquipmentIds].sort((a, b) => a - b).join(',');
    const sameBooking = booking &&
      booking.equipmentKey === equipmentKey &&
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
    const { status, body } = await createBooking({
      facilityId: selectedFacility.id,
      bookingDate: selectedDate,
      startTime: `${selectedSlot.startLabel}:00`,
      endTime: `${selectedSlot.endLabel}:00`,
      reminderEnabled,
      equipment: selectedEquipmentIds.map((equipmentId) => ({ equipmentId, quantity: 1 }))
    }, authToken);

    if (status === 201) {
      setBooking({ ...body, equipmentKey });
      setBookingRequest({ loading: false, error: '' });
      setPayment({ loading: false, error: '' });
      setSimulateFailure(false);
      setCurrentScreen('summary_payment');
      return;
    }

    if (status === 409) {
      setBookingRequest({ loading: false, error: 'Intervalul ales nu mai este liber. Alege altă oră.' });
      loadSlotAvailability(selectedFacility, selectedDate);
      return;
    }

    setBookingRequest({ loading: false, error: apiErrorMessage(status, body) });
  };

  const payBooking = async () => {
    if (payment.loading) return;
    setPayment({ loading: true, error: '' });
    const { status, body } = await apiPayBooking(booking.booking_id, simulateFailure, authToken);

    if (status === 200) {
      setBooking(body.booking);
      setPayment({ loading: false, error: '' });
      setQrEnlarged(false);
      setCurrentScreen('confirmed_ticket');
      return;
    }

    if (status === 402) {
      setBooking(body.booking);
      setSimulateFailure(false);
      setPayment({ loading: false, error: '' });
      setCurrentScreen('payment_failed');
      return;
    }

    const message = status === 400 && body.error?.code === 'SB400'
      ? 'Au trecut cele 5 minute în care intervalul a fost păstrat. Alege din nou data și ora.'
      : apiErrorMessage(status, body);

    setPayment({ loading: false, error: message });
    setCurrentScreen('summary_payment');
  };

  // Generare imagine QR bilet
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

  // ================= REZERVĂRILE MELE =================
  // Doar rezervările reale ale utilizatorului: listă goală -> mesajul „Nu ai nicio rezervare”, eroare -> mesaj (KAN-70)
  const loadUserBookings = async (scope = bookingsTab) => {
    setUserBookings([]);
    setUserBookingsError('');
    if (!authToken) {
      return;
    }
    setUserBookingsLoading(true);
    try {
      setUserBookings(await fetchMyBookings(scope, authToken));
    } catch (err) {
      setUserBookingsError(`Nu am putut încărca rezervările: ${err.message}`);
    } finally {
      setUserBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (currentScreen === 'my_bookings') {
      loadUserBookings(bookingsTab);
    }
  }, [currentScreen, bookingsTab, authToken]);

  const handleConfirmCancelBooking = async () => {
    if (!selectedBookingToCancel) return;
    const bId = selectedBookingToCancel.booking_id || selectedBookingToCancel.id;
    setCancelStatus({ loading: true, error: '', success: '' });

    const { ok, data } = await cancelBooking(bId, cancelReason, cancelNotes, authToken);
    if (!ok) {
      const errMsg = data.error?.message || 'Eroare la anularea rezervării. Anularea este posibilă doar cu minim 24h înainte.';
      setCancelStatus({ loading: false, error: errMsg, success: '' });
      return;
    }

    setCancelStatus({ loading: false, error: '', success: 'Rezervarea a fost anulată cu succes! Intervalul a fost eliberat.' });
    setTimeout(() => {
      setShowCancelModal(false);
      setSelectedBookingToCancel(null);
      setCancelStatus({ loading: false, error: '', success: '' });
      loadUserBookings(bookingsTab);
    }, 1000);
  };

  // ================= SCANARE QR RECEPȚIE =================
  const handleValidateQr = async (e) => {
    e?.preventDefault();
    if (!receptionForm.token.trim()) {
      setReceptionState({ loading: false, result: null, error: 'Te rugăm să introduci sau să scanezi codul tokenului QR.' });
      return;
    }
    setReceptionState({ loading: true, result: null, error: '' });
    const { ok, data, status } = await validateQr(receptionForm.token.trim(), authToken);

    if (ok && data.valid) {
      setReceptionState({ loading: false, result: data, error: '' });
    } else {
      const errorMsg = data.error?.message || data.message || `Validare eșuată (${status})`;
      setReceptionState({ loading: false, result: null, error: errorMsg });
    }
  };

  // ================= ADMIN HANDLERS =================
  const handleSaveFacility = async (e) => {
    e.preventDefault();
    try {
      const url = editingFacility ? `/api/v1/facilities/${editingFacility.facility_id}` : '/api/v1/facilities';
      const method = editingFacility ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders(authToken) },
        body: JSON.stringify(facilityForm)
      });
      if (res.ok) {
        alert(editingFacility ? '✅ Facilitate actualizată cu succes!' : '✅ Facilitate adăugată cu succes!');
        loadFacilitiesFromBackend();
        setShowAddFacilityModal(false);
        setEditingFacility(null);
      } else {
        alert(`Facilitatea nu a fost salvată: ${await readApiError(res)}`);
      }
    } catch (err) {
      alert(`Eroare conectare API: ${err.message}`);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setUserFormError('');
    try {
      const url = editingUser ? `/api/v1/users/${editingUser.user_id}` : '/api/v1/users';
      const method = editingUser ? 'PUT' : 'POST';
      const body = editingUser
        ? { full_name: userForm.full_name, email: userForm.email, phone_number: userForm.phone_number, role_type: userForm.role_type, is_active: userForm.is_active }
        : userForm;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders(authToken) },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        setUserFormError(await readApiError(res));
        return;
      }

      alert(editingUser ? '✅ Utilizator actualizat cu succes!' : '✅ Utilizator adăugat cu succes!');
      setShowAddUserModal(false);
      setEditingUser(null);
      loadUsersFromBackend();
    } catch (err) {
      setUserFormError(`Eroare conectare API: ${err.message}`);
    }
  };

  return (
    <div className="phone-mockup">
      {/* 1. Header Global */}
      <Header
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        authToken={authToken}
        lang={lang}
        setLang={setLang}
        currency={currency}
        setCurrency={setCurrency}
        onOpenHelp={() => setShowHelpModal(true)}
        onOpenAccount={() => setCurrentScreen('account')}
        selectedFacility={selectedFacility}
        booking={booking}
      />

      {/* 2. Conținut Ecran Activ */}
      <main className="figma-content" ref={screenContentRef}>
        {/* Autentificare & Creare Cont */}
        {currentScreen === 'login' && (
          <AuthScreen
            mode="login"
            loginForm={loginForm}
            setLoginForm={setLoginForm}
            loginError={loginError}
            showLoginPassword={showLoginPassword}
            setShowLoginPassword={setShowLoginPassword}
            onLogin={handleLogin}
            authSubmitting={authSubmitting}
            goToRegister={() => { setRegisterErrors({}); setCurrentScreen('register'); }}
          />
        )}

        {currentScreen === 'register' && (
          <AuthScreen
            mode="register"
            registerForm={registerForm}
            setRegisterForm={setRegisterForm}
            registerErrors={registerErrors}
            showRegisterPassword={showRegisterPassword}
            setShowRegisterPassword={setShowRegisterPassword}
            onRegister={handleRegister}
            authSubmitting={authSubmitting}
            goToLogin={() => { setLoginError(''); setCurrentScreen('login'); }}
          />
        )}

        {/* Catalog Facilități */}
        {currentScreen === 'facilities' && (
          <FacilitiesScreen
            facilitiesList={activeFacilitiesList}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenDetails={openFacilityDetails}
            onOpenMap={() => setCurrentScreen('map')}
            currency={currency}
          />
        )}

        {/* Detalii Facilitate */}
        {currentScreen === 'facility_detail' && selectedFacility && (
          <FacilityDetailScreen
            selectedFacility={selectedFacility}
            facilityEquipment={facilityEquipment}
            onBack={() => setCurrentScreen('facilities')}
            onChooseDateTime={openChooseDateTime}
            onOpenHelp={() => setShowHelpModal(true)}
            currency={currency}
          />
        )}

        {/* Calendar & Intervale */}
        {currentScreen === 'choose_datetime' && selectedFacility && (
          <ChooseDatetimeScreen
            selectedFacility={selectedFacility}
            calendarMonth={calendarMonth}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            availability={availability}
            facilityEquipment={facilityEquipment}
            selectedEquipmentIds={selectedEquipmentIds}
            onToggleEquipment={toggleEquipment}
            bookingRequest={bookingRequest}
            onBack={() => setCurrentScreen('facility_detail')}
            onChangeCalendarMonth={changeCalendarMonth}
            onSelectCalendarDay={selectCalendarDay}
            onSelectSlot={(slot) => {
              setSelectedSlot(slot);
              setBookingRequest({ loading: false, error: '' });
            }}
            onOpenSummary={openSummary}
          />
        )}

        {/* Rezumat & Plată */}
        {currentScreen === 'summary_payment' && booking && (
          <SummaryPaymentScreen
            booking={booking}
            selectedFacility={selectedFacility}
            currency={currency}
            simulateFailure={simulateFailure}
            setSimulateFailure={setSimulateFailure}
            payment={payment}
            onPayBooking={payBooking}
            onBackToChooseDatetime={() => setCurrentScreen('choose_datetime')}
          />
        )}

        {/* Plată Eșuată */}
        {currentScreen === 'payment_failed' && booking && (
          <SummaryPaymentScreen
            isFailed
            booking={booking}
            selectedFacility={selectedFacility}
            currency={currency}
            payment={payment}
            onPayBooking={payBooking}
            onBackToSummary={() => setCurrentScreen('summary_payment')}
          />
        )}

        {/* Bilet Confirmat cu QR */}
        {currentScreen === 'confirmed_ticket' && (
          <ConfirmedTicketScreen
            booking={booking}
            selectedFacility={selectedFacility}
            qrImage={qrImage}
            qrEnlarged={qrEnlarged}
            setQrEnlarged={setQrEnlarged}
            onGoToMyBookings={() => setCurrentScreen('my_bookings')}
            onGoToFacilities={() => setCurrentScreen('facilities')}
          />
        )}

        {/* Rezervările Mele */}
        {currentScreen === 'my_bookings' && (
          <MyBookingsScreen
            bookingsTab={bookingsTab}
            setBookingsTab={setBookingsTab}
            userBookings={userBookings}
            userBookingsLoading={userBookingsLoading}
            userBookingsError={userBookingsError}
            currency={currency}
            onViewTicket={(b) => {
              setBooking(b);
              setCurrentScreen('confirmed_ticket');
            }}
            onPayBooking={(b) => {
              setBooking(b);
              setCurrentScreen('summary_payment');
            }}
            onCancelBooking={(b) => {
              setSelectedBookingToCancel(b);
              setShowCancelModal(true);
            }}
            onExploreFacilities={() => setCurrentScreen('facilities')}
          />
        )}

        {/* Harta Campusului */}
        {currentScreen === 'map' && (
          <MapScreen
            facilitiesList={activeFacilitiesList}
            selectedPinId={selectedPinId}
            setSelectedPinId={setSelectedPinId}
            mapFilter={mapFilter}
            setMapFilter={setMapFilter}
            onOpenFacilityDetails={openFacilityDetails}
          />
        )}

        {/* Contul Meu */}
        {currentScreen === 'account' && (
          <AccountScreen
            authUser={authUser}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            currency={currency}
            setCurrency={setCurrency}
            lang={lang}
            setLang={setLang}
            canUseReception={canUseReception}
            canUseAdmin={canUseAdmin}
            onNavigateReception={() => setCurrentScreen('reception')}
            onNavigateAdmin={() => {
              setCurrentScreen('admin');
              loadFacilitiesFromBackend();
              loadUsersFromBackend();
            }}
            onNavigateMyBookings={() => setCurrentScreen('my_bookings')}
            onLogout={handleLogout}
          />
        )}

        {/* Recepție Scanner QR */}
        {currentScreen === 'reception' && canUseReception && (
          <ReceptionScreen
            receptionForm={receptionForm}
            setReceptionForm={setReceptionForm}
            receptionState={receptionState}
            setReceptionState={setReceptionState}
            booking={booking}
            onValidateQr={handleValidateQr}
            onBackToAccount={() => setCurrentScreen('account')}
          />
        )}

        {/* Panou Admin */}
        {currentScreen === 'admin' && canUseAdmin && (
          <AdminScreen
            adminTab={adminTab}
            setAdminTab={setAdminTab}
            dbFacilities={dbFacilities}
            fallbackFacilities={fallbackFacilities}
            dbUsers={dbUsers}
            usersLoadError={usersLoadError}
            onOpenAddFacility={() => {
              setFacilityForm(emptyFacilityForm);
              setEditingFacility(null);
              setShowAddFacilityModal(true);
            }}
            onOpenEditFacility={(f) => {
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
              setShowAddFacilityModal(true);
            }}
            onOpenAddUser={() => {
              setEditingUser(null);
              setUserForm(emptyUserForm);
              setUserFormError('');
              setShowAddUserModal(true);
            }}
            onOpenEditUser={(u) => {
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
              setShowAddUserModal(true);
            }}
          />
        )}
      </main>

      {/* 3. Modale */}
      <AdminFacilityModal
        isOpen={showAddFacilityModal || Boolean(editingFacility)}
        editingFacility={editingFacility}
        facilityForm={facilityForm}
        setFacilityForm={setFacilityForm}
        onClose={() => {
          setShowAddFacilityModal(false);
          setEditingFacility(null);
        }}
        onSave={handleSaveFacility}
      />

      <AdminUserModal
        isOpen={showAddUserModal || Boolean(editingUser)}
        editingUser={editingUser}
        userForm={userForm}
        setUserForm={setUserForm}
        userFormError={userFormError}
        onClose={() => {
          setShowAddUserModal(false);
          setEditingUser(null);
          setUserFormError('');
        }}
        onSave={handleSaveUser}
      />

      <CancelModal
        isOpen={showCancelModal}
        selectedBooking={selectedBookingToCancel}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancelBooking}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
        cancelStatus={cancelStatus}
      />

      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* 4. Bottom Navigation Bar */}
      {!AUTH_SCREENS.includes(currentScreen) && (
        <BottomNav
          currentScreen={currentScreen}
          setCurrentScreen={setCurrentScreen}
          onOpenAccount={() => setCurrentScreen('account')}
        />
      )}
    </div>
  );
}
