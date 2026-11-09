import React, { useState } from 'react';

export default function App() {
  // Ecranul activ curent:
  // 'auth' | 'register' | 'facilities' | 'facility_detail' | 'choose_datetime' | 
  // 'summary_payment' | 'confirmed_ticket' | 'my_bookings' | 'map'
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
  const [selectedDate, setSelectedDate] = useState(27); // ziua 27
  const [selectedSlot, setSelectedSlot] = useState('16:00 - 17:00');
  const [addEquipment, setAddEquipment] = useState(true);
  const [reminderEnabled, setReminderEnabled] = useState(true);

  // Tab în Rezervările Mele ('upcoming' | 'history')
  const [bookingsTab, setBookingsTab] = useState('upcoming');

  // Modal anulare rezervare
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  // Date facilități din Figma
  const facilitiesList = [
    {
      id: 1,
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
        beforeVisit: [
          'Adu echipament de înot și papuci de schimb',
          'Respectă cu strictețe intervalul orar selectat',
          'Prezintă codul QR de acces la turnichet'
        ],
        equipmentOptions: [
          { name: 'Ochelari de înot', price: 4 },
          { name: 'Cască de înot din silicon', price: 3 },
          { name: 'Prosop bumbac', price: 3 }
        ]
      }
    },
    {
      id: 2,
      name: 'Saună',
      nameEn: 'Sauna',
      subtitle: 'Complex sportiv - corp E, etaj',
      category: 'Relaxare',
      visualBg: 'var(--sauna-bg)',
      visualColor: 'var(--sauna-accent)',
      icon: '♨',
      badgeAlert: null,
      hours: 'Deschis azi: 08:00 - 20:00',
      priceRon: 20.0,
      priceEur: 4.0,
      unit: '/ 1h slot',
      usefulInfo: {
        location: 'Complex sportiv, corp E, etaj 1',
        program: 'Luni - sâmbătă, 08:00 - 20:00',
        notice: 'Accesul la saună necesită rezervare prealabilă',
        beforeVisit: [
          'Adu două prosoape mari pentru igienă',
          'Consumă apă și hidratează-te înainte de sesiune',
          'Timpul maxim recomandat este de 15 min / repriză'
        ],
        equipmentOptions: [
          { name: 'Prosop mare de saună', price: 5 },
          { name: 'Uleiuri esențiale mentol/eucalipt', price: 4 }
        ]
      }
    },
    {
      id: 3,
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
        location: 'Campus 2, lângă Căminul 5',
        program: 'Zilnic, 08:00 - 21:00 (cu nocturnă)',
        notice: 'Nocturna se aprinde automat după ora 17:30',
        beforeVisit: [
          'Încălțăminte sport cu talpă non-marking',
          'Eliberează terenul la finalul orei',
          'Păstrează curățenia în zona băncii de rezerve'
        ],
        equipmentOptions: [
          { name: 'Set 2 rachete Wilson', price: 10 },
          { name: 'Tub 3 mingi presurizate', price: 6 }
        ]
      }
    },
    {
      id: 4,
      name: 'Sală de fitness',
      nameEn: 'Fitness Gym',
      subtitle: 'Corp D - Demisol',
      category: 'Sporturi',
      visualBg: '#FEE2E2',
      visualColor: '#DC2626',
      icon: '🏋️',
      badgeAlert: null,
      hours: 'Deschis azi: 07:00 - 22:00',
      priceRon: 15.0,
      priceEur: 3.0,
      unit: '/ 1h slot',
      usefulInfo: {
        location: 'Corp D, demisol (intrare prin curte)',
        program: 'Luni - duminică, 07:00 - 22:00',
        notice: 'Reducere 50% aplicabilă direct pentru studenții USV',
        beforeVisit: [
          'Prosop obligatoriu pe aparate',
          'Pantofi de schimb curați',
          'Așază greutățile la loc pe stativ după utilizare'
        ],
        equipmentOptions: [
          { name: 'Centură din piele pentru forță', price: 5 },
          { name: 'Chingi haltere', price: 3 }
        ]
      }
    }
  ];

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

  // Navigare rapidă către detalii facilitate
  const openFacilityDetails = (facility) => {
    setSelectedFacility(facility);
    setCurrentScreen('facility_detail');
  };

  // Reducere rol (Student -50%, Profesor -30%, Amator 0%)
  const getRoleDiscountPercent = () => {
    if (userRole === 'STUDENT') return 50;
    if (userRole === 'PROFESSOR') return 30;
    return 0;
  };

  // Calcul preț final cu reducere
  const calculateFinalPrice = () => {
    if (!selectedFacility) return '22,50';
    const base = currency === 'RON' ? selectedFacility.priceRon : selectedFacility.priceEur;
    const discount = getRoleDiscountPercent() / 100;
    const discountedBase = base * (1 - discount);
    const equip = addEquipment ? (currency === 'RON' ? 10 : 2) : 0;
    const total = discountedBase + equip;
    return currency === 'RON' ? total.toFixed(2).replace('.', ',') : total.toFixed(2);
  };

  // Confirmare anulare
  const confirmCancel = () => {
    setMyUpcomingBookings([]);
    setShowCancelModal(false);
    setCurrentScreen('my_bookings');
  };

  return (
    <div className="phone-mockup">
      {/* ================= HEADER BLEUMARIN FIGMA ================= */}
      <header className="figma-header">
        <div className="figma-header-top">
          {/* Logo Brand */}
          <div className="brand-title" onClick={() => setCurrentScreen('facilities')} style={{ cursor: 'pointer' }}>
            <div className="brand-icon-box">S</div>
            <span>Sport Campus</span>
          </div>

          {/* Butoane acțiune dreapta */}
          <div className="top-pills-row">
            {/* Pill Limba RO / EN */}
            <div className="pill-group">
              <button 
                className={`pill-btn ${lang === 'ro' ? 'active' : ''}`}
                onClick={() => setLang('ro')}
              >
                RO
              </button>
              <button 
                className={`pill-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => setLang('en')}
              >
                EN
              </button>
            </div>

            {/* Pill Moneda RON / EUR */}
            <div className="pill-group">
              <button 
                className={`pill-btn ${currency === 'RON' ? 'active' : ''}`}
                onClick={() => setCurrency('RON')}
              >
                RON
              </button>
              <button 
                className={`pill-btn ${currency === 'EUR' ? 'active' : ''}`}
                onClick={() => setCurrency('EUR')}
              >
                EUR
              </button>
            </div>

            {/* Dark Mode toggle */}
            <button 
              className="pill-action" 
              onClick={toggleDarkMode}
              title="Mod întunecat / luminos"
              style={{ padding: '4px 8px', fontSize: '11px' }}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* Buton Ajutor / Contul Meu */}
            {currentScreen === 'auth' || currentScreen === 'register' ? (
              <button className="pill-action" onClick={() => alert('Pentru asistență contactați recepția bazei sportive USV: 0230-216-147')}>
                Ajutor
              </button>
            ) : (
              <button className="pill-action" onClick={() => setCurrentScreen('auth')}>
                Contul meu
              </button>
            )}
          </div>
        </div>

        {/* Header Titlu Dinamic per Ecran */}
        {currentScreen === 'auth' && (
          <div>
            <h2 className="figma-header-title">Autentificare</h2>
            <p className="figma-header-desc">Intră în cont pentru a rezerva o facilitate sportivă</p>
          </div>
        )}

        {currentScreen === 'register' && (
          <div>
            <h2 className="figma-header-title">Creare cont</h2>
            <p className="figma-header-desc">Un singur cont Campus Sport pentru datele de student</p>
          </div>
        )}

        {currentScreen === 'facilities' && (
          <div>
            <h2 className="figma-header-title">Facilități</h2>
            <p className="figma-header-desc">Alege unde vrei să faci mișcare</p>
          </div>
        )}

        {currentScreen === 'facility_detail' && selectedFacility && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={() => setCurrentScreen('facilities')}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '14px', cursor: 'pointer' }}
              >
                ←
              </button>
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
              <button 
                onClick={() => setCurrentScreen('facility_detail')}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '14px', cursor: 'pointer' }}
              >
                ←
              </button>
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
              <button 
                onClick={() => setCurrentScreen('choose_datetime')}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '14px', cursor: 'pointer' }}
              >
                ←
              </button>
              <div>
                <h2 className="figma-header-title">Rezumat și plată</h2>
                <p className="figma-header-desc">Verifică datele rezervării înainte de a continua la plată externă</p>
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

        {/* ---------------- 01. AUTENTIFICARE ---------------- */}
        {currentScreen === 'auth' && (
          <div style={{ paddingTop: '8px' }}>
            <div className="info-section-box">
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Email</label>
              <input 
                type="email" 
                defaultValue="ana.popescu@stud.usv.ro"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-page)', color: 'var(--text-main)', marginBottom: '14px' }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Parolă</label>
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', color: '#0284C7', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {showPassword ? 'Ascunde' : 'Arată'}
                </button>
              </div>
              <input 
                type={showPassword ? 'text' : 'password'} 
                defaultValue="parola123!"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-page)', color: 'var(--text-main)', marginBottom: '8px' }}
              />

              <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                <a href="#forgot" style={{ fontSize: '11px', color: '#0284C7', textDecoration: 'none', fontWeight: 600 }}>Ai uitat parola?</a>
              </div>

              <button className="btn-figma-green" onClick={() => setCurrentScreen('facilities')}>
                Autentifică-te →
              </button>
            </div>

            <div style={{ textAlign: 'center', margin: '14px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              sau
            </div>

            <div className="info-section-box" style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>Nu ai încă un cont?</p>
              <button className="btn-figma-outline" onClick={() => setCurrentScreen('register')}>
                Creează un cont
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '12px', borderRadius: '12px', marginTop: '16px' }}>
              <span style={{ fontSize: '16px' }}>🔒</span>
              <p style={{ fontSize: '11px', color: '#0369A1', lineHeight: 1.3 }}>
                Un singur cont pentru rezervări, plăți online și acces la facilități.
              </p>
            </div>
          </div>
        )}

        {/* ---------------- 02. CREARE CONT ---------------- */}
        {currentScreen === 'register' && (
          <div style={{ paddingTop: '8px' }}>
            <div className="info-section-box">
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Nume și prenume</label>
              <input 
                type="text" 
                defaultValue="Ana Popescu"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-page)', color: 'var(--text-main)', marginBottom: '12px' }}
              />

              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Email de student</label>
              <input 
                type="email" 
                defaultValue="ana.popescu@stud.usv.ro"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-page)', color: 'var(--text-main)', marginBottom: '12px' }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>Parolă</label>
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', color: '#0284C7', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {showPassword ? 'Ascunde' : 'Arată'}
                </button>
              </div>
              <input 
                type={showPassword ? 'text' : 'password'} 
                defaultValue="parola123!"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '13px', background: 'var(--bg-page)', color: 'var(--text-main)', marginBottom: '14px' }}
              />

              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '18px' }}>
                <input type="checkbox" defaultChecked style={{ marginTop: '2px', accentColor: 'var(--primary-green)' }} />
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                  Accept termenii de utilizare și prelucrarea datelor cu caracter personal
                </label>
              </div>

              <button className="btn-figma-green" onClick={() => setCurrentScreen('facilities')}>
                Creează cont →
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '14px' }}>
              <button 
                onClick={() => setCurrentScreen('auth')}
                style={{ background: 'none', border: 'none', color: '#0284C7', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Ai deja cont? Autentifică-te
              </button>
            </div>
          </div>
        )}

        {/* ---------------- 03. FACILITĂȚI (Catalog Principal) ---------------- */}
        {currentScreen === 'facilities' && (
          <div>
            {/* Search Bar */}
            <div className="figma-search-bar">
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>🔍</span>
              <input 
                type="text" 
                placeholder="Caută facilitate sportivă..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>⚙️</span>
            </div>

            {/* Filter Pills */}
            <div className="category-filter-row">
              {['Toate', 'Înot', 'Relaxare', 'Sporturi'].map((cat) => (
                <button
                  key={cat}
                  className={`cat-pill ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              4 facilități disponibile pentru rezervare
            </p>

            {/* Lista Cardurilor de Facilități */}
            {facilitiesList
              .filter(f => activeCategory === 'Toate' || f.category === activeCategory)
              .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((facility) => (
                <div key={facility.id} className="figma-facility-card">
                  {/* Top Colored Visual */}
                  <div className="facility-top-visual" style={{ backgroundColor: facility.visualBg, color: facility.visualColor }}>
                    <span className="visual-icon-symbol">{facility.icon}</span>
                  </div>

                  {/* Body */}
                  <div className="facility-card-inner">
                    <h3 className="facility-card-name">{facility.name}</h3>
                    <p className="facility-card-subtitle">{facility.subtitle}</p>

                    {facility.badgeAlert && (
                      <span className="facility-badge-alert">{facility.badgeAlert}</span>
                    )}

                    <div className="facility-hours-text">
                      <span>🕒</span>
                      <span>{facility.hours}</span>
                    </div>

                    <div className="facility-price-row">
                      <div>
                        <span className="facility-price-val">
                          {currency === 'RON' ? `${facility.priceRon} RON` : `${facility.priceEur} EUR`}
                        </span>
                        <span className="facility-price-unit"> {facility.unit}</span>
                      </div>

                      <button className="btn-figma-dark" onClick={() => openFacilityDetails(facility)}>
                        Detalii →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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

            {/* Informații Utile */}
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
                  <span style={{ fontWeight: 800, fontSize: '12px' }}>{selectedFacility.priceRon} RON / 5 EUR</span>
                  <p style={{ fontSize: '11px', color: '#16A34A', marginTop: '2px' }}>Studenții USV au 50% reducere automată</p>
                </div>
              </div>

              <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', padding: '10px 12px', borderRadius: '10px', marginTop: '12px' }}>
                <p style={{ fontSize: '11px', color: '#BE123C', fontWeight: 700 }}>
                  💡 {selectedFacility.usefulInfo.notice}
                </p>
              </div>
            </div>

            {/* Înainte de vizită */}
            <div className="info-section-box">
              <h4 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '10px' }}>Înainte de vizită</h4>
              {selectedFacility.usefulInfo.beforeVisit.map((rule, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: '#16A34A', fontWeight: 800 }}>✓</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>

            {/* Echipament Opțional */}
            <div className="info-section-box">
              <h4 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '10px' }}>Echipament (opțional)</h4>
              {selectedFacility.usefulInfo.equipmentOptions.map((eq, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)', fontSize: '12px' }}>
                  <span>{eq.name}</span>
                  <span style={{ fontWeight: 700 }}>{eq.price} RON</span>
                </div>
              ))}
            </div>

            {/* Contact / Ajutor box */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', padding: '12px', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Pentru mai multe detalii:</p>
                <p style={{ fontSize: '12px', fontWeight: 700 }}>📞 Sunați la 0230-216-147</p>
              </div>
              <button className="btn-figma-outline" style={{ width: 'auto', padding: '6px 12px', fontSize: '11px' }} onClick={() => alert('Asistență Recepție: L-V 08:00 - 18:00')}>
                Ajutor ℹ️
              </button>
            </div>

            {/* Buton Înainte */}
            <button className="btn-figma-green" onClick={() => setCurrentScreen('choose_datetime')}>
              Rezervă - alege data și ora →
            </button>
          </div>
        )}

        {/* ---------------- 05. ALEGE DATA ȘI ORA ---------------- */}
        {currentScreen === 'choose_datetime' && selectedFacility && (
          <div>
            {/* Calendar Octombrie 2026 */}
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
                
                {/* Zile mockup luna */}
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

              {/* Legendă */}
              <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                <span>🟢 Liber</span>
                <span>🟡 Ocupat</span>
                <span>⚫ Selectat</span>
              </div>

              {/* Sloturi Orare */}
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

            {/* Alert hold_expires_at din schemă */}
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '10px 12px', borderRadius: '10px', marginBottom: '14px' }}>
              <p style={{ fontSize: '11px', color: '#1E40AF', lineHeight: 1.3 }}>
                ℹ️ Selectează un interval liber. Intervalele selectate temporar sunt rezervate 10 minute pentru plată (hold_expires_at).
              </p>
            </div>

            {/* Opțiune Echipament */}
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

            {/* Buton Înainte */}
            <button className="btn-figma-green" onClick={() => setCurrentScreen('summary_payment')}>
              Continuă către rezumat →
            </button>
          </div>
        )}

        {/* ---------------- 06. REZUMAT ȘI PLATĂ ---------------- */}
        {currentScreen === 'summary_payment' && selectedFacility && (
          <div>
            {/* Box Rezumat */}
            <div className="info-section-box">
              <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '2px' }}>{selectedFacility.name} - Complex sportiv</h3>
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

              <button 
                onClick={() => setCurrentScreen('choose_datetime')}
                style={{ background: 'none', border: 'none', color: '#0284C7', fontSize: '11px', fontWeight: 700, cursor: 'pointer', marginTop: '10px' }}
              >
                + Modifică datele rezervării
              </button>
            </div>

            {/* Procesator Plată */}
            <div className="info-section-box">
              <h4 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '10px' }}>Plată prin procesator extern</h4>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', border: '1px solid #22C55E', borderRadius: '10px', background: '#F0FDF4', marginBottom: '12px' }}>
                <input type="radio" checked readOnly style={{ accentColor: 'var(--primary-green)' }} />
                <span style={{ fontSize: '12px', fontWeight: 700 }}>💳 Card bancar (plată externă)</span>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px', borderRadius: '10px' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                  Vei fi redirecționat către pagina securizată a procesatorului pentru a introduce datele cardului.
                </p>
              </div>
            </div>

            <button className="btn-figma-green" onClick={() => setCurrentScreen('confirmed_ticket')}>
              Confirmă și plătește · {calculateFinalPrice()} {currency} →
            </button>

            <p style={{ fontSize: '10px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '10px' }}>
              Politica de anulare: anulare gratuită cu 24h înainte
            </p>
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

              {/* Cod QR Visual */}
              <div style={{ textAlign: 'center', background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ width: '130px', height: '130px', background: 'white', margin: '0 auto', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                    <rect width="100" height="100" fill="white" />
                    {/* Corners */}
                    <rect x="5" y="5" width="26" height="26" fill="#0F2942" rx="3" />
                    <rect x="10" y="10" width="16" height="16" fill="white" />
                    <rect x="14" y="14" width="8" height="8" fill="#0F2942" />
                    <rect x="69" y="5" width="26" height="26" fill="#0F2942" rx="3" />
                    <rect x="74" y="10" width="16" height="16" fill="white" />
                    <rect x="78" y="14" width="8" height="8" fill="#0F2942" />
                    <rect x="5" y="69" width="26" height="26" fill="#0F2942" rx="3" />
                    <rect x="10" y="74" width="16" height="16" fill="white" />
                    <rect x="14" y="78" width="8" height="8" fill="#0F2942" />
                    {/* Matrix Pixels */}
                    <rect x="38" y="8" width="8" height="8" fill="#0F2942" />
                    <rect x="52" y="12" width="10" height="6" fill="#0F2942" />
                    <rect x="40" y="40" width="20" height="20" fill="#0F2942" rx="2" />
                    <rect x="45" y="45" width="10" height="10" fill="white" />
                    <rect x="48" y="48" width="4" height="4" fill="#0F2942" />
                    <rect x="10" y="40" width="8" height="14" fill="#0F2942" />
                    <rect x="72" y="40" width="12" height="10" fill="#0F2942" />
                    <rect x="40" y="72" width="14" height="8" fill="#0F2942" />
                    <rect x="70" y="70" width="16" height="16" fill="#0F2942" />
                  </svg>
                </div>
                <p style={{ fontSize: '11px', fontWeight: 800, marginTop: '8px' }}>Cod de acces: SC-271026-001</p>
                <p style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Prezintă codul la intrare în Bazinul Complexului Sportiv</p>
              </div>

              {/* Reminder Switch */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '12px', fontWeight: 700 }}>🔔 Reminder cu 1 oră înainte</span>
                <label className="switch">
                  <input type="checkbox" checked={reminderEnabled} onChange={(e) => setReminderEnabled(e.target.checked)} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            {/* Cum intri la bazin */}
            <div className="info-section-box">
              <h4 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '6px' }}>Cum intri la bazin</h4>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Prezintă codul la recepție/turnichet la intrarea în complex. Accesul se permite în intervalul 15:50 - 17:05 (ora 17:00 expiră).
              </p>
            </div>

            <button className="btn-figma-dark" style={{ width: '100%', padding: '12px', borderRadius: '12px', marginBottom: '10px' }} onClick={() => setCurrentScreen('my_bookings')}>
              Vezi rezervările mele →
            </button>

            <button className="btn-figma-outline" style={{ marginBottom: '12px' }} onClick={() => setCurrentScreen('facilities')}>
              Înapoi la facilități
            </button>

            <div style={{ textAlign: 'center' }}>
              <button 
                onClick={() => setShowCancelModal(true)}
                style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Anulează rezervarea
              </button>
            </div>
          </div>
        )}

        {/* ---------------- 08. REZERVĂRILE MELE ---------------- */}
        {currentScreen === 'my_bookings' && (
          <div>
            {/* Tabs Viitoare / Istoric */}
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

            {bookingsTab === 'upcoming' ? (
              myUpcomingBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-secondary)' }}>
                  <p style={{ fontSize: '13px', marginBottom: '12px' }}>Nu ai nicio rezervare viitoare.</p>
                  <button className="btn-figma-green" onClick={() => setCurrentScreen('facilities')}>
                    Rezervă o facilitate
                  </button>
                </div>
              ) : (
                myUpcomingBookings.map(b => (
                  <div key={b.id} className="info-section-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 800 }}>● {b.status}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{b.id}</span>
                    </div>

                    <h3 style={{ fontSize: '15px', fontWeight: 800 }}>{b.facilityName}</h3>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 10px' }}>
                      {b.dateText}, {b.timeText}
                    </p>
                    <p style={{ fontSize: '12px', fontWeight: 700, marginBottom: '14px' }}>
                      Total: <span style={{ color: '#16A34A' }}>{b.totalPaidRon} RON / {b.totalPaidEur} EUR</span>
                    </p>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-figma-dark" style={{ flex: 1 }} onClick={() => setCurrentScreen('confirmed_ticket')}>
                        Vezi codul QR
                      </button>
                      <button 
                        style={{ background: 'none', border: '1px solid #EF4444', color: '#EF4444', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                        onClick={() => setShowCancelModal(true)}
                      >
                        Anulează
                      </button>
                    </div>
                  </div>
                ))
              )
            ) : (
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>Istoric finalizate</h4>
                {historyBookings.map(h => (
                  <div key={h.id} className="info-section-box" style={{ opacity: 0.85 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700 }}>● {h.status}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{h.id}</span>
                    </div>
                    <h4 style={{ fontSize: '14px', fontWeight: 800 }}>{h.facilityName}</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{h.dateText}</p>
                    <p style={{ fontSize: '11px', fontWeight: 700, marginTop: '6px' }}>Total achitat: {h.totalPaidRon} RON</p>
                  </div>
                ))}
              </div>
            )}

            <button className="btn-figma-outline" style={{ marginTop: '10px' }} onClick={() => setCurrentScreen('facilities')}>
              Rezervă altă facilitate
            </button>
          </div>
        )}

        {/* ---------------- HARTA CAMPUSULUI ---------------- */}
        {currentScreen === 'map' && (
          <div>
            <div style={{ background: '#E2E8F0', height: '240px', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '1px solid var(--border-light)', marginBottom: '14px' }}>
              <svg viewBox="0 0 400 240" style={{ width: '100%', height: '100%' }}>
                {/* Strazi Campus */}
                <rect x="20" y="110" width="360" height="20" fill="#CBD5E1" rx="4" />
                <rect x="180" y="20" width="24" height="200" fill="#CBD5E1" rx="4" />

                {/* Clădiri */}
                <rect x="30" y="30" width="80" height="50" fill="#94A3B8" rx="6" />
                <text x="70" y="60" fill="white" fontSize="10" fontWeight="700" textAnchor="middle">Corp A / Rectorat</text>

                <rect x="240" y="30" width="100" height="50" fill="#94A3B8" rx="6" />
                <text x="290" y="60" fill="white" fontSize="10" fontWeight="700" textAnchor="middle">Corp C (FIESC)</text>

                {/* Pin Bazin */}
                <g style={{ cursor: 'pointer' }} onClick={() => openFacilityDetails(facilitiesList[0])}>
                  <circle cx="80" cy="170" r="20" fill="#0284C7" stroke="white" strokeWidth="2" />
                  <text x="80" y="175" fill="white" fontSize="14" textAnchor="middle">🏊‍♂️</text>
                  <text x="80" y="205" fill="var(--text-main)" fontSize="10" fontWeight="800" textAnchor="middle">Bazin Corp E</text>
                </g>

                {/* Pin Teren Tenis */}
                <g style={{ cursor: 'pointer' }} onClick={() => openFacilityDetails(facilitiesList[2])}>
                  <circle cx="280" cy="170" r="20" fill="#16A34A" stroke="white" strokeWidth="2" />
                  <text x="280" y="175" fill="white" fontSize="14" textAnchor="middle">🎾</text>
                  <text x="280" y="205" fill="var(--text-main)" fontSize="10" fontWeight="800" textAnchor="middle">Teren Tenis</text>
                </g>
              </svg>
            </div>

            <div className="info-section-box">
              <h4 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '6px' }}>Ghid localizare</h4>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Toate facilitățile sunt amplasate în Campusul 1 și 2 al USV. La fiecare intrare este montat turnichet automat conectat la baza de date Campus Sports.
              </p>
            </div>
          </div>
        )}

      </main>

      {/* ================= 09. MODAL ANULARE REZERVARE ================= */}
      {showCancelModal && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', background: 'var(--card-bg)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px 20px', textAlign: 'center', boxShadow: '0 -10px 30px rgba(0,0,0,0.3)' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 12px' }}>
              ⚠️
            </div>
            
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>Sigur dorești să anulezi rezervarea?</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '20px' }}>
              Suma de <b>22,50 RON</b> va fi returnată pe card conform politicii noastre (anulare gratuită cu cel puțin 24h înainte).
            </p>

            <button 
              onClick={confirmCancel}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#EF4444', color: 'white', border: 'none', fontWeight: 800, fontSize: '13px', cursor: 'pointer', marginBottom: '8px' }}
            >
              Da, anulează rezervarea
            </button>

            <button 
              className="btn-figma-outline" 
              onClick={() => setShowCancelModal(false)}
            >
              Nu, păstrează rezervarea
            </button>
          </div>
        </div>
      )}

      {/* ================= BOTTOM NAVIGATION TABS (FIGMA EXACT) ================= */}
      <nav className="figma-bottom-nav">
        <button 
          className={`nav-link-btn ${currentScreen === 'facilities' || currentScreen === 'facility_detail' || currentScreen === 'choose_datetime' || currentScreen === 'summary_payment' ? 'active' : ''}`}
          onClick={() => setCurrentScreen('facilities')}
        >
          <span className="nav-icon">🏟️</span>
          <span>Facilități</span>
        </button>

        <button 
          className={`nav-link-btn ${currentScreen === 'map' ? 'active' : ''}`}
          onClick={() => setCurrentScreen('map')}
        >
          <span className="nav-icon">📍</span>
          <span>Hartă</span>
        </button>

        <button 
          className={`nav-link-btn ${currentScreen === 'my_bookings' || currentScreen === 'confirmed_ticket' ? 'active' : ''}`}
          onClick={() => setCurrentScreen('my_bookings')}
        >
          <span className="nav-icon">🎟️</span>
          <span>Rezervările mele</span>
        </button>

        <button 
          className={`nav-link-btn ${currentScreen === 'auth' || currentScreen === 'register' ? 'active' : ''}`}
          onClick={() => setCurrentScreen('auth')}
        >
          <span className="nav-icon">👤</span>
          <span>Cont</span>
        </button>
      </nav>
    </div>
  );
}
