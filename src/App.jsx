import React, { useState, useEffect } from 'react';

// Date facilități sportive cu imagini vectoriale/stilistice
const facilitiesData = [
  {
    id: 1,
    name: 'Bazin Olimpic Universitar',
    nameEn: 'University Olympic Pool',
    sportType: 'Natație / Înot',
    sportTypeEn: 'Swimming',
    category: 'indoor',
    capacityTotal: 30,
    spotsLeft: 14,
    priceRon: 25.0,
    priceEur: 5.0,
    opensAt: '06:00',
    closesAt: '21:00',
    slotMinutes: 60,
    earlyDiscountPercent: 10,
    location: 'Baza Sportivă Corp E',
    contactPhone: '0230-216-147 int. 12',
    bgGradient: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
    icon: '🏊‍♂️',
    badge: 'Piscină & Saună',
    badgeEn: 'Pool & Sauna',
    badgeColor: 'badge-blue',
    equipmentText: 'Închiriază ochelari & cască natație (+10 RON)',
    equipmentTextEn: 'Rent swimming goggles & cap (+2 EUR)'
  },
  {
    id: 2,
    name: 'Teren Sintetic Fotbal Nocturnă',
    nameEn: 'Synthetic Football Pitch',
    sportType: 'Fotbal',
    sportTypeEn: 'Football',
    category: 'outdoor',
    capacityTotal: 22,
    spotsLeft: 8,
    priceRon: 40.0,
    priceEur: 8.0,
    opensAt: '08:00',
    closesAt: '22:00',
    slotMinutes: 90,
    earlyDiscountPercent: 0,
    location: 'Campus 2 - Baza Sportivă Nord',
    contactPhone: '0230-216-147 int. 15',
    bgGradient: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
    icon: '⚽',
    badge: 'Nocturnă LED inclusă',
    badgeEn: 'LED Floodlights included',
    badgeColor: 'badge-green',
    equipmentText: 'Închiriază minge oficială & veste (+15 RON)',
    equipmentTextEn: 'Rent official ball & vests (+3 EUR)'
  },
  {
    id: 3,
    name: 'Sală Fitness & Cardio Matrix',
    nameEn: 'Matrix Fitness & Cardio Gym',
    sportType: 'Fitness / Culturism',
    sportTypeEn: 'Fitness & Gym',
    category: 'indoor',
    capacityTotal: 25,
    spotsLeft: 19,
    priceRon: 15.0,
    priceEur: 3.0,
    opensAt: '07:00',
    closesAt: '22:00',
    slotMinutes: 60,
    earlyDiscountPercent: 0,
    location: 'Corp D - Demisol',
    contactPhone: '0230-216-147 int. 18',
    bgGradient: 'linear-gradient(135deg, #C2410C 0%, #9A3412 100%)',
    icon: '🏋️‍♂️',
    badge: 'Aparate Profesionale',
    badgeEn: 'Pro Matrix Equipment',
    badgeColor: 'badge-orange',
    equipmentText: 'Prosop sală & centură forță (+8 RON)',
    equipmentTextEn: 'Gym towel & lifting belt (+1.5 EUR)'
  },
  {
    id: 4,
    name: 'Teren Polivalent Baschet & Volei',
    nameEn: 'Multisport Basketball & Volleyball',
    sportType: 'Baschet / Volei',
    sportTypeEn: 'Basketball / Volleyball',
    category: 'outdoor',
    capacityTotal: 16,
    spotsLeft: 11,
    priceRon: 20.0,
    priceEur: 4.0,
    opensAt: '09:00',
    closesAt: '20:00',
    slotMinutes: 60,
    earlyDiscountPercent: 5,
    location: 'Campus 1 - Zona Cămine',
    contactPhone: '0230-216-147 int. 20',
    bgGradient: 'linear-gradient(135deg, #7E22CE 0%, #6B21A8 100%)',
    icon: '🏀',
    badge: 'Suprafață Tartan',
    badgeEn: 'Tartan Flooring',
    badgeColor: 'badge-blue',
    equipmentText: 'Minge baschet Wilson (+10 RON)',
    equipmentTextEn: 'Wilson basketball rental (+2 EUR)'
  }
];

export default function App() {
  // Stări generale
  const [activeTab, setActiveTab] = useState('facilities'); // 'facilities' | 'map' | 'bookings' | 'account'
  const [currency, setCurrency] = useState('RON'); // 'RON' | 'EUR'
  const [lang, setLang] = useState('ro'); // 'ro' | 'en'
  const [darkMode, setDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  
  // Utilizator & Roluri (Student: -50%, Profesor: -30%, Amator: 0%)
  const [userRole, setUserRole] = useState('STUDENT');
  const [userProfile, setUserProfile] = useState({
    name: 'Cosmin Gabriel Flocea',
    email: 'cosmin.flocea@student.usv.ro',
    phone: '0740 123 456'
  });

  // Modale
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showMapDetails, setShowMapDetails] = useState(null);
  
  // Flux de Rezervare
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [bookingStep, setBookingStep] = useState(1); // 1: Detalii slot, 2: Plată card, 3: Bilet emis
  const [bookingForm, setBookingForm] = useState({
    date: '2026-11-12',
    timeSlot: '16:00 - 17:00',
    seats: 1,
    rentEquipment: false,
    sendReminder: true
  });
  
  // Formular simulare card
  const [cardForm, setCardForm] = useState({
    number: '4111 2222 3333 4242',
    name: 'COSMIN G FLOCEA',
    expiry: '08/28',
    cvv: '942'
  });

  // Lista rezervări
  const [myBookings, setMyBookings] = useState([
    {
      id: 201,
      facilityId: 1,
      facilityName: 'Bazin Olimpic Universitar',
      date: '2026-11-15',
      timeSlot: '10:00 - 11:00',
      status: 'CONFIRMED',
      totalAmount: 12.50,
      currency: 'RON',
      qrToken: 'QR-CSB-USV-2026-BZN-084',
      withEquipment: true,
      canCancelUntil: '2026-11-14 10:00'
    }
  ]);

  // Ceas LIVE
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      };
      setCurrentTime(now.toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-US', options));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [lang]);

  // Comutare temă Dark/Light
  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  // Calcul procente reducere
  const getDiscountPercent = () => {
    if (userRole === 'STUDENT') return 50;
    if (userRole === 'PROFESSOR') return 30;
    return 0;
  };

  // Calcul total bilet
  const calculateTotal = (facility) => {
    if (!facility) return 0;
    const base = currency === 'RON' ? facility.priceRon : facility.priceEur;
    const disc = getDiscountPercent() / 100;
    let unitPrice = base * (1 - disc);
    
    // Reducere rezervare din timp (Early discount)
    if (facility.earlyDiscountPercent > 0) {
      unitPrice -= (unitPrice * (facility.earlyDiscountPercent / 100));
    }
    
    const equipCost = bookingForm.rentEquipment ? (currency === 'RON' ? 10 : 2) : 0;
    const total = (unitPrice * bookingForm.seats) + equipCost;
    return total.toFixed(2);
  };

  // Finalizare plată și emitere bilet
  const handleProcessPayment = () => {
    const newId = Math.floor(100 + Math.random() * 900);
    const newBooking = {
      id: newId,
      facilityId: selectedFacility.id,
      facilityName: selectedFacility.name,
      date: bookingForm.date,
      timeSlot: bookingForm.timeSlot,
      status: 'CONFIRMED',
      totalAmount: calculateTotal(selectedFacility),
      currency: currency,
      qrToken: `QR-CSB-USV-2026-${selectedFacility.id}-${newId}`,
      withEquipment: bookingForm.rentEquipment,
      canCancelUntil: `${bookingForm.date} 08:00`
    };

    setMyBookings([newBooking, ...myBookings]);
    setBookingStep(3); // ecran bilet confirmat
  };

  // Anulare rezervare (cu minim 24h înainte)
  const handleCancelBooking = (bookingId) => {
    if (window.confirm(lang === 'ro' ? 'Ești sigur că vrei să anulezi rezervarea? Suma va fi returnată integral.' : 'Are you sure you want to cancel? Full refund will be issued.')) {
      setMyBookings(myBookings.filter(b => b.id !== bookingId));
      alert(lang === 'ro' ? '✅ Rezervarea a fost anulată cu succes!' : '✅ Booking was cancelled successfully!');
    }
  };

  return (
    <div className="phone-frame">
      {/* Dynamic Notch / Camera */}
      <div className="phone-notch">
        <div className="phone-speaker"></div>
        <div className="phone-camera"></div>
      </div>

      {/* Top Status Bar: Live Clock & Battery */}
      <div className="phone-status-bar">
        <span>🕒 {currentTime}</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span>📶 5G</span>
          <span>🔋 98%</span>
        </div>
      </div>

      {/* Header cu Logo, Limba, Moneda și Dark Mode */}
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="brand-badge">CS</div>
          <div>
            <h1 style={{ fontSize: '15px', fontWeight: 800, lineHeight: 1.1 }}>Campus Sports</h1>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>USV · 3BITS Team</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {/* Ghid de Utilizare */}
          <button 
            className="btn-icon" 
            title="Ghid de utilizare"
            onClick={() => setShowGuideModal(true)}
          >
            ❓
          </button>

          {/* Selector Limbă RO / EN */}
          <button 
            className="btn-icon" 
            onClick={() => setLang(lang === 'ro' ? 'en' : 'ro')}
            title="Schimbă limba / Change language"
          >
            {lang === 'ro' ? '🇷🇴 RO' : '🇬🇧 EN'}
          </button>

          {/* Monedă RON / EUR */}
          <button 
            className="btn-icon" 
            onClick={() => setCurrency(currency === 'RON' ? 'EUR' : 'RON')}
            title="Conversie automată RON / EUR"
          >
            <b>{currency}</b>
          </button>

          {/* Dark Mode */}
          <button 
            className="btn-icon" 
            onClick={toggleTheme}
            title="Comută Mod Întunecat / Mod Luminos"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Selector Rol Utilizator (Student, Profesor, Amator) */}
      <div style={{ padding: '8px 18px', background: 'var(--bg-app)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
          {lang === 'ro' ? 'Tarif activ:' : 'Applied role:'}
        </span>
        <select 
          value={userRole} 
          onChange={(e) => setUserRole(e.target.value)}
          style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: 700 }}
        >
          <option value="STUDENT">🎓 Student USV (-50%)</option>
          <option value="PROFESSOR">👨‍🏫 Profesor USV (-30%)</option>
          <option value="AMATEUR">👤 Public / Amator (0%)</option>
        </select>
      </div>

      {/* Viewport Conținut */}
      <div className="app-content">
        
        {/* ================= TAB 1: FACILITĂȚI SPORTIVE ================= */}
        {activeTab === 'facilities' && !selectedFacility && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 800 }}>
                  {lang === 'ro' ? 'Facilități Sportive' : 'Sports Facilities'}
                </h2>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {lang === 'ro' ? 'Rezervă sloturi rapide fără suprapuneri' : 'Book instant slots with zero conflicts'}
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('map')} 
                style={{ fontSize: '11px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
              >
                🗺️ {lang === 'ro' ? 'Vezi pe hartă' : 'View on map'}
              </button>
            </div>

            {facilitiesData.map((f) => {
              const basePrice = currency === 'RON' ? f.priceRon : f.priceEur;
              const discPrice = (basePrice * (1 - getDiscountPercent()/100)).toFixed(1);

              return (
                <div key={f.id} className="facility-card">
                  {/* Banner Grafic */}
                  <div className="facility-banner" style={{ background: f.bgGradient }}>
                    <div className="facility-banner-overlay"></div>
                    <div className="facility-banner-content">
                      <div>
                        <span style={{ fontSize: '26px' }}>{f.icon}</span>
                        <h3 style={{ fontSize: '15px', fontWeight: 800 }}>
                          {lang === 'ro' ? f.name : f.nameEn}
                        </h3>
                        <p style={{ fontSize: '11px', opacity: 0.9 }}>📍 {f.location}</p>
                      </div>
                      <span className={`badge ${f.badgeColor}`}>
                        {lang === 'ro' ? f.badge : f.badgeEn}
                      </span>
                    </div>
                  </div>

                  {/* Detalii card */}
                  <div className="facility-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        ⏰ {f.opensAt} - {f.closesAt} ({f.slotMinutes} min)
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>
                        🟢 {f.spotsLeft} {lang === 'ro' ? 'locuri libere' : 'spots left'}
                      </span>
                    </div>

                    {/* Preț & Buton de rezervare */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                          <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--primary)' }}>
                            {discPrice} {currency}
                          </span>
                          {getDiscountPercent() > 0 && (
                            <span style={{ fontSize: '11px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                              {basePrice} {currency}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          {currency === 'RON' ? `≈ ${(parseFloat(discPrice)/5).toFixed(1)} EUR` : `≈ ${(parseFloat(discPrice)*5).toFixed(0)} RON`}
                        </p>
                      </div>

                      <button 
                        className="btn-primary" 
                        style={{ width: 'auto', padding: '8px 18px' }}
                        onClick={() => { setSelectedFacility(f); setBookingStep(1); }}
                      >
                        {lang === 'ro' ? 'Rezervă' : 'Book'} →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= FLUX REZERVARE: PASUL 1 (Interval & Opțiuni) ================= */}
        {selectedFacility && bookingStep === 1 && (
          <div>
            <button 
              onClick={() => setSelectedFacility(null)} 
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}
            >
              ← {lang === 'ro' ? 'Înapoi la Facilități' : 'Back to Facilities'}
            </button>

            <h2 style={{ fontSize: '17px', fontWeight: 800 }}>{lang === 'ro' ? selectedFacility.name : selectedFacility.nameEn}</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              📍 {selectedFacility.location} · 📞 {selectedFacility.contactPhone}
            </p>

            {/* Pas 1 din 2 Indicator */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
              <div style={{ flex: 1, height: '4px', background: 'var(--primary)', borderRadius: '2px' }}></div>
              <div style={{ flex: 1, height: '4px', background: 'var(--border)', borderRadius: '2px' }}></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  📅 {lang === 'ro' ? 'Selectează data dorită:' : 'Select appointment date:'}
                </label>
                <input 
                  type="date" 
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  ⏰ {lang === 'ro' ? 'Interval orar disponibil (fără suprapunere):' : 'Available time slot:'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {['08:00 - 09:00', '10:00 - 11:00', '14:00 - 15:00', '16:00 - 17:00', '18:00 - 19:00', '20:00 - 21:00'].map((slot) => {
                    const isSelected = bookingForm.timeSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setBookingForm({ ...bookingForm, timeSlot: slot })}
                        style={{
                          padding: '10px 6px',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                          background: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                          color: isSelected ? '#065F46' : 'var(--text-main)',
                          fontWeight: isSelected ? 800 : 500,
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Închiriere echipament */}
              <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={bookingForm.rentEquipment}
                    onChange={(e) => setBookingForm({ ...bookingForm, rentEquipment: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                  />
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>
                      🎒 {lang === 'ro' ? selectedFacility.equipmentText : selectedFacility.equipmentTextEn}
                    </span>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {lang === 'ro' ? 'Echipamentul se ridică de la recepție' : 'Pick up equipment at the desk'}
                    </p>
                  </div>
                </label>
              </div>

              {/* Notificare Reminder */}
              <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={bookingForm.sendReminder}
                    onChange={(e) => setBookingForm({ ...bookingForm, sendReminder: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                  />
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>
                      🔔 {lang === 'ro' ? 'Trimite reminder SMS & Email cu 2h înainte' : 'Send SMS/Email reminder 2h prior'}
                    </span>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {lang === 'ro' ? 'Notificare gratuită pe cosmin.flocea@student.usv.ro' : 'Free reminder alert'}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Sumar cost */}
            <div style={{ background: 'var(--bg-app)', padding: '14px', borderRadius: '12px', marginBottom: '16px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span>{lang === 'ro' ? 'Reducere rol:' : 'Discount applied:'}</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>-{getDiscountPercent()}% ({userRole})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 900, paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                <span>{lang === 'ro' ? 'Total de achitat:' : 'Total due:'}</span>
                <span style={{ color: 'var(--primary)' }}>{calculateTotal(selectedFacility)} {currency}</span>
              </div>
            </div>

            <button className="btn-primary" onClick={() => setBookingStep(2)}>
              💳 {lang === 'ro' ? 'Mergi la Plata cu Cardul' : 'Proceed to Card Payment'}
            </button>
          </div>
        )}

        {/* ================= FLUX REZERVARE: PASUL 2 (Simulare Plată Card) ================= */}
        {selectedFacility && bookingStep === 2 && (
          <div>
            <button 
              onClick={() => setBookingStep(1)} 
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}
            >
              ← {lang === 'ro' ? 'Înapoi la alegerea orarului' : 'Back to slot selection'}
            </button>

            <h2 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '4px' }}>
              🔒 {lang === 'ro' ? 'Plată Securizată Online' : 'Secure Online Payment'}
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Procesare 256-bit SSL · Stripe Test Gateway
            </p>

            {/* Pas 2 din 2 Indicator */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
              <div style={{ flex: 1, height: '4px', background: 'var(--primary)', borderRadius: '2px' }}></div>
              <div style={{ flex: 1, height: '4px', background: 'var(--primary)', borderRadius: '2px' }}></div>
            </div>

            {/* Card Mockup Visual */}
            <div style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: 'white', padding: '18px', borderRadius: '16px', marginBottom: '18px', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>USV SPORTS PAY</span>
                <span style={{ fontSize: '20px' }}>💳</span>
              </div>
              <p style={{ fontSize: '16px', letterSpacing: '2px', fontFamily: 'monospace', marginBottom: '18px' }}>
                {cardForm.number}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <div>
                  <span style={{ opacity: 0.6, display: 'block', fontSize: '9px' }}>TITULAR CARD</span>
                  <span>{cardForm.name}</span>
                </div>
                <div>
                  <span style={{ opacity: 0.6, display: 'block', fontSize: '9px' }}>EXPIRĂ</span>
                  <span>{cardForm.expiry}</span>
                </div>
              </div>
            </div>

            {/* Formular Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Număr Card:</label>
                <input 
                  type="text" 
                  value={cardForm.number}
                  onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Expirare (LL/AA):</label>
                  <input 
                    type="text" 
                    value={cardForm.expiry}
                    onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>CVV / CVC:</label>
                  <input 
                    type="password" 
                    maxLength={3}
                    value={cardForm.cvv}
                    onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>

            <button className="btn-primary" onClick={handleProcessPayment}>
              ✅ {lang === 'ro' ? `Autorizează Plata (${calculateTotal(selectedFacility)} ${currency})` : `Authorize Payment (${calculateTotal(selectedFacility)} ${currency})`}
            </button>
          </div>
        )}

        {/* ================= FLUX REZERVARE: PASUL 3 (Bilet Generat cu QR) ================= */}
        {selectedFacility && bookingStep === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '42px', marginBottom: '8px' }}>🎉</div>
            <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--primary)', marginBottom: '4px' }}>
              {lang === 'ro' ? 'Rezervare Confirmată!' : 'Booking Confirmed!'}
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {lang === 'ro' ? 'Biletul electronic a fost emis și trimis pe email' : 'Electronic ticket issued and emailed'}
            </p>

            {/* Bilet Electronic Verde Stilizat */}
            <div className="ticket-wrapper">
              <div className="ticket-cutout-left"></div>
              <div className="ticket-cutout-right"></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>CAMPUS SPORTS USV</span>
                <span className="badge badge-green" style={{ background: 'white', color: '#047857' }}>ACTIV</span>
              </div>

              <h3 style={{ fontSize: '17px', fontWeight: 900, marginTop: '8px' }}>{selectedFacility.name}</h3>
              <p style={{ fontSize: '12px', opacity: 0.9 }}>📅 {bookingForm.date} · ⏰ {bookingForm.timeSlot}</p>

              <div className="ticket-divider"></div>

              {/* QR Code Matrix Graphic */}
              <div style={{ background: 'white', padding: '12px', borderRadius: '12px', width: '160px', margin: '0 auto', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', display: 'block' }}>
                  {/* Pattern QR realist */}
                  <rect width="100" height="100" fill="white" />
                  {/* Corner 1 */}
                  <rect x="5" y="5" width="25" height="25" fill="#047857" rx="3" />
                  <rect x="10" y="10" width="15" height="15" fill="white" />
                  <rect x="13" y="13" width="9" height="9" fill="#047857" />
                  {/* Corner 2 */}
                  <rect x="70" y="5" width="25" height="25" fill="#047857" rx="3" />
                  <rect x="75" y="10" width="15" height="15" fill="white" />
                  <rect x="78" y="13" width="9" height="9" fill="#047857" />
                  {/* Corner 3 */}
                  <rect x="5" y="70" width="25" height="25" fill="#047857" rx="3" />
                  <rect x="10" y="75" width="15" height="15" fill="white" />
                  <rect x="13" y="78" width="9" height="9" fill="#047857" />
                  {/* Random QR bits */}
                  <rect x="36" y="8" width="6" height="6" fill="#047857" />
                  <rect x="46" y="15" width="6" height="6" fill="#047857" />
                  <rect x="56" y="8" width="6" height="6" fill="#047857" />
                  <rect x="38" y="38" width="24" height="24" fill="#047857" rx="2" />
                  <rect x="44" y="44" width="12" height="12" fill="white" />
                  <rect x="48" y="48" width="4" height="4" fill="#047857" />
                  <rect x="10" y="42" width="6" height="14" fill="#047857" />
                  <rect x="72" y="42" width="8" height="10" fill="#047857" />
                  <rect x="40" y="75" width="10" height="8" fill="#047857" />
                  <rect x="75" y="75" width="15" height="15" fill="#047857" />
                </svg>
                <p style={{ color: '#0F172A', fontSize: '9px', fontWeight: 800, marginTop: '4px', fontFamily: 'monospace' }}>
                  QR-CSB-{bookingForm.date.slice(5)}-{selectedFacility.id}
                </p>
              </div>

              <p style={{ fontSize: '11px', marginTop: '12px', opacity: 0.9 }}>
                Titular: <b>{userProfile.name}</b> ({userRole})
              </p>
              <p style={{ fontSize: '10px', opacity: 0.75 }}>
                Scanează la turnichetul de acces sau la recepție
              </p>
            </div>

            <button 
              className="btn-primary" 
              onClick={() => { setSelectedFacility(null); setActiveTab('bookings'); }}
            >
              🎟️ {lang === 'ro' ? 'Vezi în Rezervările Mele' : 'View in My Bookings'}
            </button>
          </div>
        )}

        {/* ================= TAB 2: HARTA INTERACTIVĂ A CAMPUSULUI ================= */}
        {activeTab === 'map' && (
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>
              🗺️ {lang === 'ro' ? 'Harta Campusului Sportiv USV' : 'USV Sports Campus Map'}
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              {lang === 'ro' ? 'Apasă pe o locație pentru contact și programare' : 'Tap on pins to see contact info and book'}
            </p>

            {/* Canvas Hartă Interactivă SVG */}
            <div className="map-canvas">
              <svg viewBox="0 0 400 260" style={{ width: '100%', height: '100%' }}>
                {/* Drumuri & Alei */}
                <rect x="20" y="120" width="360" height="24" fill="#CBD5E1" rx="4" />
                <rect x="180" y="20" width="26" height="220" fill="#CBD5E1" rx="4" />
                
                {/* Clădiri Campus USV */}
                {/* Corp A / Rectorat */}
                <rect x="30" y="30" width="80" height="60" fill="#94A3B8" rx="6" />
                <text x="70" y="65" fill="white" fontSize="11" fontWeight="700" textAnchor="middle">Corp A / Rectorat</text>

                {/* Corp C / Calculatoare */}
                <rect x="240" y="30" width="100" height="60" fill="#94A3B8" rx="6" />
                <text x="290" y="65" fill="white" fontSize="11" fontWeight="700" textAnchor="middle">Corp C (FIESC)</text>

                {/* Pin 1: Bazin Olimpic */}
                <g style={{ cursor: 'pointer' }} onClick={() => setShowMapDetails(facilitiesData[0])}>
                  <circle cx="80" cy="180" r="22" fill="#0284C7" stroke="white" strokeWidth="3" />
                  <text x="80" y="185" fill="white" fontSize="16" textAnchor="middle">🏊‍♂️</text>
                  <text x="80" y="215" fill="var(--text-main)" fontSize="10" fontWeight="700" textAnchor="middle">Bazin Corp E</text>
                </g>

                {/* Pin 2: Teren Fotbal */}
                <g style={{ cursor: 'pointer' }} onClick={() => setShowMapDetails(facilitiesData[1])}>
                  <circle cx="280" cy="180" r="22" fill="#15803D" stroke="white" strokeWidth="3" />
                  <text x="280" y="185" fill="white" fontSize="16" textAnchor="middle">⚽</text>
                  <text x="280" y="215" fill="var(--text-main)" fontSize="10" fontWeight="700" textAnchor="middle">Teren Gazon</text>
                </g>

                {/* Pin 3: Sală Fitness */}
                <g style={{ cursor: 'pointer' }} onClick={() => setShowMapDetails(facilitiesData[2])}>
                  <circle cx="140" cy="80" r="18" fill="#C2410C" stroke="white" strokeWidth="2" />
                  <text x="140" y="85" fill="white" fontSize="13" textAnchor="middle">🏋️</text>
                </g>

                {/* Pin 4: Teren Baschet */}
                <g style={{ cursor: 'pointer' }} onClick={() => setShowMapDetails(facilitiesData[3])}>
                  <circle cx="340" cy="120" r="18" fill="#7E22CE" stroke="white" strokeWidth="2" />
                  <text x="340" y="125" fill="white" fontSize="13" textAnchor="middle">🏀</text>
                </g>
              </svg>
            </div>

            {/* Pop-up Detalii & Ajutor / Telefon la click pe pin */}
            {showMapDetails ? (
              <div style={{ marginTop: '14px', padding: '14px', borderRadius: '12px', background: 'var(--bg-card)', border: '2px solid var(--primary)', boxShadow: 'var(--card-shadow)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 800 }}>{showMapDetails.name}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📍 {showMapDetails.location}</p>
                    <p style={{ fontSize: '12px', marginTop: '6px', fontWeight: 600 }}>
                      📞 {lang === 'ro' ? 'Asistență Recepție:' : 'Desk Support:'} <a href={`tel:${showMapDetails.contactPhone}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{showMapDetails.contactPhone}</a>
                    </p>
                  </div>
                  <button onClick={() => setShowMapDetails(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✖</button>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button 
                    className="btn-primary" 
                    onClick={() => { setSelectedFacility(showMapDetails); setBookingStep(1); setActiveTab('facilities'); }}
                  >
                    📅 {lang === 'ro' ? 'Rezervă la această locație' : 'Book at this location'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '14px', padding: '12px', borderRadius: '10px', background: 'var(--bg-app)', border: '1px dashed var(--border)', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                💡 {lang === 'ro' ? 'Apasă pe cercurile colorate de pe hartă pentru a vedea detaliile fiecărei săli.' : 'Tap on the colored map circles to inspect facility details.'}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: BILETELE MELE & ISTORIC ================= */}
        {activeTab === 'bookings' && (
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>
              {lang === 'ro' ? 'Rezervările & Biletele Mele' : 'My Bookings & Tickets'}
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              {lang === 'ro' ? 'Bilete cu cod QR valabil pentru scanare' : 'QR code tickets valid for turnstile scan'}
            </p>

            {myBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '36px' }}>🎟️</span>
                <p style={{ marginTop: '10px', fontSize: '13px' }}>
                  {lang === 'ro' ? 'Nu ai nicio rezervare activă momentan.' : 'No active bookings right now.'}
                </p>
                <button className="btn-primary" style={{ width: 'auto', margin: '14px auto 0' }} onClick={() => setActiveTab('facilities')}>
                  {lang === 'ro' ? 'Explorează Facilități' : 'Explore Facilities'}
                </button>
              </div>
            ) : (
              myBookings.map((b) => (
                <div key={b.id} className="facility-card" style={{ borderLeft: '4px solid var(--primary)', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 800 }}>{b.facilityName}</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📅 {b.date} · ⏰ {b.timeSlot}</p>
                    </div>
                    <span className="badge badge-green">CONFIRMAT</span>
                  </div>

                  {b.withEquipment && (
                    <span style={{ fontSize: '11px', background: 'var(--primary-light)', color: '#065F46', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '8px' }}>
                      🎒 Echipament inclus
                    </span>
                  )}

                  {/* Bilet QR Box */}
                  <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '10px', textAlign: 'center', margin: '10px 0', border: '1px solid var(--border)' }}>
                    <div style={{ width: '80px', height: '80px', background: 'white', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '36px' }}>📱</span>
                    </div>
                    <p style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '11px', marginTop: '6px' }}>{b.qrToken}</p>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {lang === 'ro' ? 'Prezintă codul la turnichetul de acces' : 'Present code at turnstile'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>
                      {lang === 'ro' ? 'Achitat:' : 'Paid:'} {b.totalAmount} {b.currency}
                    </span>
                    <button 
                      onClick={() => handleCancelBooking(b.id)}
                      style={{ background: 'none', border: '1px solid #EF4444', color: '#EF4444', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {lang === 'ro' ? 'Anulează (cu 24h înainte)' : 'Cancel (24h rule)'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ================= TAB 4: CONTUL MEU ================= */}
        {activeTab === 'account' && (
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px' }}>
              {lang === 'ro' ? 'Profil Utilizator USV' : 'USV User Profile'}
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              {lang === 'ro' ? 'Gestionare credențiale și rol instituțional' : 'Manage account credentials and role'}
            </p>

            <div className="facility-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '18px' }}>
                  CF
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800 }}>{userProfile.name}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{userProfile.email}</p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <p style={{ fontSize: '12px', marginBottom: '6px' }}>
                  Rol activ: <b>{userRole}</b> ({getDiscountPercent()}% reducere)
                </p>
                <p style={{ fontSize: '12px', marginBottom: '6px' }}>
                  Telefon: <b>{userProfile.phone}</b>
                </p>
                <p style={{ fontSize: '12px', marginBottom: '10px' }}>
                  Bază de date: <b>PostgreSQL 16 · Docker Active</b>
                </p>
                <button 
                  className="btn-secondary" 
                  style={{ width: '100%', fontSize: '12px' }}
                  onClick={() => setShowAuthModal(true)}
                >
                  🔐 {lang === 'ro' ? 'Schimbă Parola / Autentificare' : 'Change Password / Login'}
                </button>
              </div>
            </div>

            {/* Informații Proiect */}
            <div className="facility-card" style={{ padding: '14px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Proiect IP · Semestrul 1</h4>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Echipa 3BITS: Cosmin Flocea, Alexandra Andrieș, Sebastian Strugar</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Ghid Google JS Style Guide · REST Swagger v3</p>
            </div>
          </div>
        )}

      </div>

      {/* ================= MODAL GHID DE UTILIZARE ================= */}
      {showGuideModal && (
        <div className="modal-overlay" onClick={() => setShowGuideModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>
                📖 {lang === 'ro' ? 'Ghid Rapid de Utilizare' : 'Quick User Guide'}
              </h3>
              <button onClick={() => setShowGuideModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✖</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', lineHeight: 1.4 }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>1️⃣</span>
                <div>
                  <b>{lang === 'ro' ? 'Alege facilitatea sportivă' : 'Choose facility'}:</b>
                  <p style={{ color: 'var(--text-muted)' }}>Selectează Bazinul, Terenul de fotbal, Sala fitness sau Terenul de baschet.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>2️⃣</span>
                <div>
                  <b>{lang === 'ro' ? 'Selectează data și ora' : 'Pick date & slot'}:</b>
                  <p style={{ color: 'var(--text-muted)' }}>Sistemul blochează automat suprapunerile de orar în baza de date PostgreSQL.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>3️⃣</span>
                <div>
                  <b>{lang === 'ro' ? 'Plătește online cu cardul' : 'Pay online'}:</b>
                  <p style={{ color: 'var(--text-muted)' }}>Tarifele includ automat reducerea instituțională (-50% studenți, -30% profesori).</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>4️⃣</span>
                <div>
                  <b>{lang === 'ro' ? 'Scanează biletul QR la turnichet' : 'Scan QR at gate'}:</b>
                  <p style={{ color: 'var(--text-muted)' }}>După plată primești biletul digital cu cod QR unic pentru acces.</p>
                </div>
              </div>
            </div>

            <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => setShowGuideModal(false)}>
              {lang === 'ro' ? 'Am înțeles!' : 'Got it!'}
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL LOGIN & AFISARE PAROLA ================= */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>🔐 Autentificare Cont USV</h3>
              <button onClick={() => setShowAuthModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✖</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Email Instituțional USV:</label>
                <input 
                  type="email" 
                  defaultValue={userProfile.email}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Parolă:</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    defaultValue="CampusSports2026!"
                    style={{ width: '100%', padding: '10px 40px 10px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '12px' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                    title={showPassword ? 'Ascunde parola' : 'Afișează parola'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>

            <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => { setShowAuthModal(false); alert('Autentificat cu succes!'); }}>
              Salvează Credențiale
            </button>
          </div>
        </div>
      )}

      {/* ================= BOTTOM NAVIGATION TABS ================= */}
      <nav className="app-nav">
        <button 
          className={`nav-tab ${activeTab === 'facilities' ? 'active' : ''}`}
          onClick={() => { setActiveTab('facilities'); setSelectedFacility(null); }}
        >
          <span className="icon" style={{ fontSize: '18px' }}>🏟️</span>
          <span>{lang === 'ro' ? 'Facilități' : 'Sports'}</span>
        </button>

        <button 
          className={`nav-tab ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => { setActiveTab('map'); setSelectedFacility(null); }}
        >
          <span className="icon" style={{ fontSize: '18px' }}>🗺️</span>
          <span>{lang === 'ro' ? 'Hartă' : 'Map'}</span>
        </button>

        <button 
          className={`nav-tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => { setActiveTab('bookings'); setSelectedFacility(null); }}
        >
          <span className="icon" style={{ fontSize: '18px' }}>🎟️</span>
          <span>{lang === 'ro' ? 'Bilete' : 'Tickets'}</span>
        </button>

        <button 
          className={`nav-tab ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => { setActiveTab('account'); setSelectedFacility(null); }}
        >
          <span className="icon" style={{ fontSize: '18px' }}>👤</span>
          <span>{lang === 'ro' ? 'Profil' : 'Profile'}</span>
        </button>
      </nav>
    </div>
  );
}
