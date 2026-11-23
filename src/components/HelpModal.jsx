import React, { useState } from 'react';

export default function HelpModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState(1);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1200,
      padding: '16px'
    }}>
      <div style={{
        background: 'var(--card-bg)',
        borderRadius: '16px',
        padding: '20px',
        width: '100%',
        maxWidth: '420px',
        maxHeight: '85vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
        border: '1px solid var(--border-light)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '10px'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            📘 Ghid & Asistență Campus Sports
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            ✕
          </button>
        </div>

        {/* Secțiuni Ghid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          <div
            style={{ padding: '10px', borderRadius: '10px', background: 'var(--border-light)', cursor: 'pointer' }}
            onClick={() => setActiveTab(activeTab === 1 ? 0 : 1)}
          >
            <strong style={{ fontSize: '12px', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between' }}>
              <span>1. Cum fac o rezervare online?</span>
              <span>{activeTab === 1 ? '▲' : '▼'}</span>
            </strong>
            {activeTab === 1 && (
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '6px 0 0', lineHeight: '1.4' }}>
                Selectezi facilitatea dorită din ecranul principal sau de pe <strong>Harta Campusului</strong>, alegi data și un interval orar liber din calendar, bifezi echipamente opționale și apeși „Continuă spre plată".
              </p>
            )}
          </div>

          <div
            style={{ padding: '10px', borderRadius: '10px', background: 'var(--border-light)', cursor: 'pointer' }}
            onClick={() => setActiveTab(activeTab === 2 ? 0 : 2)}
          >
            <strong style={{ fontSize: '12px', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between' }}>
              <span>2. Cum intru la teren/sală cu biletul QR?</span>
              <span>{activeTab === 2 ? '▲' : '▼'}</span>
            </strong>
            {activeTab === 2 && (
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '6px 0 0', lineHeight: '1.4' }}>
                După confirmarea plății primești un cod QR criptat (AES-256). La intrarea în Complexul Sportiv (Corp E), prezinți codul QR de pe telefon la recepție pentru scanare și validare check-in.
              </p>
            )}
          </div>

          <div
            style={{ padding: '10px', borderRadius: '10px', background: 'var(--border-light)', cursor: 'pointer' }}
            onClick={() => setActiveTab(activeTab === 3 ? 0 : 3)}
          >
            <strong style={{ fontSize: '12px', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between' }}>
              <span>3. Care este politica de anulare (24h)?</span>
              <span>{activeTab === 3 ? '▲' : '▼'}</span>
            </strong>
            {activeTab === 3 && (
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '6px 0 0', lineHeight: '1.4' }}>
                Poți anula gratuit orice rezervare confirmată din tab-ul <strong>„Rezervările mele"</strong> dacă au rămas cel puțin 24 de ore până la începerea intervalului. Rezervările nefinalizate se pot anula oricând.
              </p>
            )}
          </div>

          <div
            style={{ padding: '10px', borderRadius: '10px', background: 'var(--border-light)', cursor: 'pointer' }}
            onClick={() => setActiveTab(activeTab === 4 ? 0 : 4)}
          >
            <strong style={{ fontSize: '12px', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between' }}>
              <span>4. Ce reduceri se aplică la tarife?</span>
              <span>{activeTab === 4 ? '▲' : '▼'}</span>
            </strong>
            {activeTab === 4 && (
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '6px 0 0', lineHeight: '1.4' }}>
                Studenții USV înmatriculați beneficiază de <strong>50% reducere</strong> pe baza email-ului instituțional @student.usv.ro, iar cadrele didactice beneficiază de <strong>30% reducere</strong>.
              </p>
            )}
          </div>
        </div>

        {/* Date Contact Suport */}
        <div style={{ padding: '12px', borderRadius: '12px', background: '#0B1F3A', color: '#FFFFFF', fontSize: '11px', lineHeight: '1.5' }}>
          <strong style={{ color: '#C6F246', display: 'block', marginBottom: '4px' }}>📍 Recepție Baza Sportivă USV</strong>
          <span>Complexul Sportiv Corp E, parter</span><br/>
          <span>🕒 Program: Luni - Duminică: 08:00 - 22:00</span><br/>
          <span>☎️ Tel: 0230 216 147 int. 120 · ✉️ sport@usv.ro</span>
        </div>

        <button
          type="button"
          className="btn-figma-dark"
          style={{ width: '100%', marginTop: '14px', padding: '10px', fontSize: '12px' }}
          onClick={onClose}
        >
          Am înțeles, închide ghidul
        </button>
      </div>
    </div>
  );
}
