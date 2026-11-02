import React, { useState } from 'react';

const mockFacilities = [
  {
    id: 1,
    name: 'Bazin Olimpic',
    sportType: 'Înot',
    category: 'indoor',
    capacity: 30,
    priceHourRon: 25.0,
    priceHourEur: 5.0,
    opensAt: '06:00',
    closesAt: '21:00',
    slotMinutes: 60,
    earlyDiscount: 10,
    badge: 'Piscină & Saună',
    badgeColor: 'badge-blue'
  },
  {
    id: 2,
    name: 'Teren Fotbal Gazon',
    sportType: 'Fotbal',
    category: 'outdoor',
    capacity: 22,
    priceHourRon: 40.0,
    priceHourEur: 8.0,
    opensAt: '08:00',
    closesAt: '22:00',
    slotMinutes: 90,
    earlyDiscount: 0,
    badge: 'Nocturnă inclusă',
    badgeColor: 'badge-green'
  },
  {
    id: 3,
    name: 'Sală Fitness & Cardio',
    sportType: 'Fitness',
    category: 'indoor',
    capacity: 20,
    priceHourRon: 15.0,
    priceHourEur: 3.0,
    opensAt: '07:00',
    closesAt: '22:00',
    slotMinutes: 60,
    earlyDiscount: 0,
    badge: 'Echipamente Matrix',
    badgeColor: 'badge-blue'
  },
  {
    id: 4,
    name: 'Teren Baschet Nord',
    sportType: 'Baschet',
    category: 'outdoor',
    capacity: 10,
    priceHourRon: 20.0,
    priceHourEur: 4.0,
    opensAt: '09:00',
    closesAt: '20:00',
    slotMinutes: 60,
    earlyDiscount: 0,
    badge: 'Campus Nord',
    badgeColor: 'badge-green'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('facilities'); // 'facilities' | 'bookings' | 'account'
  const [currency, setCurrency] = useState('RON'); // 'RON' | 'EUR'
  const [lang, setLang] = useState('ro'); // 'ro' | 'en'
  const [darkMode, setDarkMode] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [userRole, setUserRole] = useState('STUDENT'); // 'STUDENT' (-50%), 'PROFESSOR' (-30%), 'AMATEUR' (0%)
  const [myBookings, setMyBookings] = useState([
    {
      id: 101,
      facilityName: 'Bazin Olimpic',
      date: '2026-11-05',
      time: '14:00 - 15:00',
      status: 'CONFIRMED',
      totalAmount: 12.5,
      qrToken: 'QR-CSB-2026-BZN-101'
    }
  ]);

  const [bookingForm, setBookingForm] = useState({
    date: '2026-11-06',
    timeSlot: '10:00 - 11:00',
    seats: 1,
    rentEquipment: false
  });

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark', !darkMode);
  };

  const getDiscountPercent = () => {
    if (userRole === 'STUDENT') return 50;
    if (userRole === 'PROFESSOR') return 30;
    return 0;
  };

  const calculateTotal = (facility) => {
    if (!facility) return 0;
    const base = currency === 'RON' ? facility.priceHourRon : facility.priceHourEur;
    const disc = getDiscountPercent() / 100;
    const equip = bookingForm.rentEquipment ? (currency === 'RON' ? 10 : 2) : 0;
    const total = (base * (1 - disc) * bookingForm.seats) + equip;
    return total.toFixed(2);
  };

  const handleConfirmBooking = () => {
    const newBooking = {
      id: Date.now() % 10000,
      facilityName: selectedFacility.name,
      date: bookingForm.date,
      time: bookingForm.timeSlot,
      status: 'CONFIRMED',
      totalAmount: calculateTotal(selectedFacility),
      qrToken: `QR-CSB-${Date.now().toString(36).toUpperCase()}`
    };
    setMyBookings([newBooking, ...myBookings]);
    setSelectedFacility(null);
    setActiveTab('bookings');
  };

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <header>
        <div className="logo-container">
          <div className="logo-badge">CS</div>
          <div>
            <h1 style={{ fontSize: '15px', fontWeight: 700 }}>Campus Sports</h1>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Echipa 3BITS · USV</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            onClick={() => setCurrency(currency === 'RON' ? 'EUR' : 'RON')}
            style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '6px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
          >
            {currency}
          </button>
          <button 
            onClick={toggleTheme}
            style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '6px', border: '1px solid var(--border)', background: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '16px 20px', flex: 1, overflowY: 'auto' }}>
        {/* TAB 1: FACILITĂȚI SPORTIVE */}
        {activeTab === 'facilities' && !selectedFacility && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Facilități Disponibile</h2>
              <select 
                value={userRole} 
                onChange={(e) => setUserRole(e.target.value)}
                style={{ fontSize: '11px', padding: '4px 6px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)' }}
              >
                <option value="STUDENT">Student (-50%)</option>
                <option value="PROFESSOR">Profesor (-30%)</option>
                <option value="AMATEUR">Public / Amator</option>
              </select>
            </div>

            {mockFacilities.map((f) => (
              <div key={f.id} className="facility-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600 }}>{f.name}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{f.sportType} · Orar: {f.opensAt} - {f.closesAt}</p>
                  </div>
                  <span className={`badge ${f.badgeColor}`}>{f.badge}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <div>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>
                      {currency === 'RON' ? `${(f.priceHourRon * (1 - getDiscountPercent()/100)).toFixed(0)} RON` : `${(f.priceHourEur * (1 - getDiscountPercent()/100)).toFixed(1)} EUR`}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '4px' }}>/ slot {f.slotMinutes} min</span>
                  </div>
                  <button 
                    className="btn-primary" 
                    style={{ width: 'auto', padding: '6px 14px' }}
                    onClick={() => setSelectedFacility(f)}
                  >
                    Rezervă
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DIALOG REZERVARE PENTRU FACILITATEA SELECTATĂ */}
        {selectedFacility && (
          <div>
            <button 
              onClick={() => setSelectedFacility(null)} 
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', marginBottom: '12px' }}
            >
              ← Înapoi la listă
            </button>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>{selectedFacility.name}</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Tarif aplicat: <b>{userRole}</b> (reducere {getDiscountPercent()}%)
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Alege data:</label>
                <input 
                  type="date" 
                  value={bookingForm.date} 
                  onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Interval orar:</label>
                <select 
                  value={bookingForm.timeSlot} 
                  onChange={(e) => setBookingForm({ ...bookingForm, timeSlot: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)' }}
                >
                  <option>08:00 - 09:00</option>
                  <option>10:00 - 11:00</option>
                  <option>14:00 - 15:00</option>
                  <option>16:00 - 17:00</option>
                  <option>18:00 - 19:00</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <input 
                  type="checkbox" 
                  id="equip" 
                  checked={bookingForm.rentEquipment} 
                  onChange={(e) => setBookingForm({ ...bookingForm, rentEquipment: e.target.checked })} 
                />
                <label htmlFor="equip" style={{ fontSize: '13px' }}>Închiriază echipament sportiv (+{currency === 'RON' ? '10 RON' : '2 EUR'})</label>
              </div>
            </div>

            <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--bg-main)', marginBottom: '16px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700 }}>
                <span>Total de plată:</span>
                <span style={{ color: 'var(--primary)' }}>{calculateTotal(selectedFacility)} {currency}</span>
              </div>
            </div>

            <button className="btn-primary" onClick={handleConfirmBooking}>
              Confirmă Rezervarea & Emite Bilet
            </button>
          </div>
        )}

        {/* TAB 2: REZERVĂRILE MELE & COD QR */}
        {activeTab === 'bookings' && (
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>Biletele & Rezervările Mele</h2>
            {myBookings.map((b) => (
              <div key={b.id} className="facility-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{b.facilityName}</h3>
                  <span className="badge badge-green">CONFIRMATĂ</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>📅 {b.date} · ⏰ {b.time}</p>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>Cost achitat: <b>{b.totalAmount} RON</b></p>

                {/* QR Code Demo */}
                <div style={{ marginTop: '14px', padding: '12px', background: 'var(--bg-main)', borderRadius: '8px', textAlign: 'center', border: '1px dashed var(--border)' }}>
                  <div style={{ width: '90px', height: '90px', background: 'white', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #CBD5E1', borderRadius: '6px' }}>
                    <span style={{ fontSize: '32px' }}>📱</span>
                  </div>
                  <p style={{ fontSize: '11px', fontFamily: 'monospace', marginTop: '6px', fontWeight: 600 }}>{b.qrToken}</p>
                  <p style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Prezintă codul la turnichet / recepție</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: CONTUL MEU */}
        {activeTab === 'account' && (
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>Profil Utilizator</h2>
            <div className="facility-card">
              <p style={{ fontSize: '14px', fontWeight: 600 }}>Cosmin Gabriel Flocea</p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>cosmin.flocea@student.usv.ro</p>
              <span className="badge badge-blue">Rol: STUDENT USV</span>
            </div>

            <div className="facility-card" style={{ marginTop: '12px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Preferințe Sistem (Figma v2.1)</h4>
              <p style={{ fontSize: '12px', marginBottom: '4px' }}>• Limbă interfață: <b>Română</b></p>
              <p style={{ fontSize: '12px', marginBottom: '4px' }}>• Monedă preferată: <b>{currency}</b></p>
              <p style={{ fontSize: '12px', marginBottom: '4px' }}>• Notificare reminder: <b>Activ (cu 60 min înainte)</b></p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation matching Figma */}
      <nav className="nav-bottom">
        <button 
          className={`nav-item ${activeTab === 'facilities' ? 'active' : ''}`}
          onClick={() => { setActiveTab('facilities'); setSelectedFacility(null); }}
        >
          <span>🏟️</span>
          <span>Facilități</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          <span>🎟️</span>
          <span>Rezervări</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          <span>👤</span>
          <span>Contul meu</span>
        </button>
      </nav>
    </div>
  );
}
