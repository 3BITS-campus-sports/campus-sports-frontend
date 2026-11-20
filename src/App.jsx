import React, { useState, useEffect } from 'react';

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
  // 'auth' | 'register' | 'facilities' | 'facility_detail' | 'choose_datetime' | 
  // 'summary_payment' | 'confirmed_ticket' | 'my_bookings' | 'map' | 'admin'
  const [currentScreen, setCurrentScreen] = useState('facilities');
  
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

  // Data și ora selectate în calendar
  const [selectedDate, setSelectedDate] = useState(27);
  const [selectedSlot, setSelectedSlot] = useState('16:00 - 17:00');
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
    usefulInfo: {
      location: `${f.location_name || 'Complex USV'} (${f.location_address || 'Suceava'})`,
      program: `Zilnic, ${f.opens_at ? f.opens_at.slice(0, 5) : '08:00'} - ${f.closes_at ? f.closes_at.slice(0, 5) : '22:00'}`,
      notice: 'Tarife diferențiate (Student -50%, Profesor -30%)',
      beforeVisit: ['Echipament sportiv adecvat', 'Respectă intervalul orar rezervat'],
      equipmentOptions: [{ name: 'Echipament sportiv complet', price: 10 }]
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

  // Tabul „Cont" și butonul „Contul meu". Până la ecranul 11 din Figma deschid panoul Admin.
  const openAccount = () => {
    setCurrentScreen('admin');
    fetchFacilitiesFromBackend();
    fetchUsersFromBackend();
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
          <button className="sc-brand" onClick={() => setCurrentScreen('facilities')}>
            <span className="sc-logo"><img src={logoBall} alt="" /></span>
            Sport Campus
          </button>
          {/* Temporar: „Contul meu" deschide panoul Admin până se face ecranul 11 din Figma */}
          <button className="sc-header-action" onClick={openAccount}>Contul meu</button>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => setCurrentScreen('facilities')} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '14px', cursor: 'pointer' }}>←</button>
              <div>
                <h2 className="figma-header-title">{selectedFacility.name}</h2>
                <p className="figma-header-desc">{selectedFacility.subtitle}</p>
              </div>
            </div>
          </div>
        )}

        {currentScreen === 'choose_datetime' && selectedFacility && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => setCurrentScreen('facility_detail')} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '14px', cursor: 'pointer' }}>←</button>
              <div>
                <h2 className="figma-header-title">Alege data și ora</h2>
                <p className="figma-header-desc">{selectedFacility.name} · 60 min · {selectedFacility.priceRon} RON / 5 EUR</p>
              </div>
            </div>
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
      <main className="figma-screen-content">

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

        {/* ---------------- 04. DETALII FACILITATE ---------------- */}
        {currentScreen === 'facility_detail' && selectedFacility && (
          <div>
            <button 
              onClick={() => setCurrentScreen('facilities')} 
              style={{ background: 'none', border: 'none', color: '#0284C7', fontSize: '12px', fontWeight: 700, cursor: 'pointer', marginBottom: '12px' }}
            >
              ← Toate facilitățile
            </button>

            <div className="info-section-box">
              <h4 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '12px' }}>Informații utile</h4>
              
              <div className="info-item-row">
                <span>📍</span>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '12px' }}>Locație: </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{selectedFacility.usefulInfo.location}</span>
                </div>
              </div>

              <div className="info-item-row">
                <span>⏰</span>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '12px' }}>Program: </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{selectedFacility.usefulInfo.program}</span>
                </div>
              </div>

              <div className="info-item-row">
                <span>🏷️</span>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '12px' }}>Tarif/oră: </span>
                  <span style={{ fontWeight: 800, fontSize: '12px' }}>{selectedFacility.priceRon} RON</span>
                  <p style={{ fontSize: '11px', color: '#16A34A', marginTop: '2px' }}>Studenții USV au 50% reducere automată</p>
                </div>
              </div>

              <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', padding: '10px 12px', borderRadius: '10px', marginTop: '12px' }}>
                <p style={{ fontSize: '11px', color: '#BE123C', fontWeight: 700 }}>
                  💡 {selectedFacility.usefulInfo.notice}
                </p>
              </div>
            </div>

            <div className="info-section-box">
              <h4 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '10px' }}>Înainte de vizită</h4>
              {selectedFacility.usefulInfo.beforeVisit.map((rule, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: '#16A34A', fontWeight: 800 }}>✓</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>

            <button className="btn-figma-green" onClick={() => setCurrentScreen('choose_datetime')}>
              Rezervă - alege data și ora →
            </button>
          </div>
        )}

        {/* ---------------- 05. ALEGE DATA ȘI ORA ---------------- */}
        {currentScreen === 'choose_datetime' && selectedFacility && (
          <div>
            <div className="calendar-card">
              <div className="calendar-header">
                <span>‹</span>
                <span>Octombrie 2026</span>
                <span>›</span>
              </div>

              <div className="calendar-grid">
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(day => (
                  <div key={day} className="calendar-day-header">{day}</div>
                ))}
                {[...Array(4)].map((_, i) => <div key={`empty-${i}`} className="calendar-day-btn inactive"></div>)}
                {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31].map(d => (
                  <button 
                    key={d} 
                    className={`calendar-day-btn ${selectedDate === d ? 'selected' : ''}`}
                    onClick={() => setSelectedDate(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800 }}>Selectat: marți, {selectedDate} octombrie 2026</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div 
                  className={`time-slot-card ${selectedSlot === '14:00 - 15:00' ? 'selected' : ''}`}
                  onClick={() => setSelectedSlot('14:00 - 15:00')}
                >
                  <span style={{ fontSize: '12px', fontWeight: 800 }}>14:00 - 15:00</span>
                  <span style={{ fontSize: '10px', opacity: 0.8 }}>🟢 Liber · 12 locuri</span>
                </div>

                <div className="time-slot-card busy">
                  <span style={{ fontSize: '12px', fontWeight: 800 }}>15:00 - 16:00</span>
                  <span style={{ fontSize: '10px' }}>🟡 Ocupat · 0 locuri</span>
                </div>

                <div 
                  className={`time-slot-card ${selectedSlot === '16:00 - 17:00' ? 'selected' : ''}`}
                  onClick={() => setSelectedSlot('16:00 - 17:00')}
                >
                  <span style={{ fontSize: '12px', fontWeight: 800 }}>16:00 - 17:00</span>
                  <span style={{ fontSize: '10px', opacity: 0.8 }}>⚫ Selectat · 4/12 locuri</span>
                </div>

                <div 
                  className={`time-slot-card ${selectedSlot === '17:00 - 18:00' ? 'selected' : ''}`}
                  onClick={() => setSelectedSlot('17:00 - 18:00')}
                >
                  <span style={{ fontSize: '12px', fontWeight: 800 }}>17:00 - 18:00</span>
                  <span style={{ fontSize: '10px', opacity: 0.8 }}>🟢 Liber · 8 locuri</span>
                </div>
              </div>
            </div>

            <div className="info-section-box" style={{ padding: '10px 14px', marginBottom: '18px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={addEquipment}
                  onChange={(e) => setAddEquipment(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary-green)' }}
                />
                <span style={{ fontSize: '12px', fontWeight: 700 }}>Adaugă echipament (+10 RON)</span>
              </label>
            </div>

            <button className="btn-figma-green" onClick={() => setCurrentScreen('summary_payment')}>
              Continuă către rezumat →
            </button>
          </div>
        )}

        {/* ---------------- 06. REZUMAT ȘI PLATĂ ---------------- */}
        {currentScreen === 'summary_payment' && selectedFacility && (
          <div>
            <div className="info-section-box">
              <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '2px' }}>{selectedFacility.name}</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                📅 Marți, {selectedDate} octombrie 2026 · ⏰ {selectedSlot} · 60 min
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
    </div>
  );
}
