import React from 'react';
import { roleMetaMap } from '../constants/mockData';

export default function AccountScreen({
  authUser,
  darkMode,
  toggleDarkMode,
  currency,
  setCurrency,
  lang,
  setLang,
  canUseReception,
  canUseAdmin,
  onNavigateReception,
  onNavigateAdmin,
  onNavigateMyBookings,
  onLogout
}) {
  const name = authUser?.fullName || authUser?.name || 'Utilizator';
  const email = authUser?.email || '—';
  const role = authUser?.roleType || authUser?.role || 'STUDENT';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  const roleMeta = roleMetaMap[role] || { label: role, color: '#475569', bg: '#F1F5F9' };

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
        <div style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: '20px',
          background: roleMeta.bg,
          color: roleMeta.color,
          fontSize: '11px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          ● {roleMeta.label}
        </div>

        {/* Detalii student / profil */}
        <div style={{
          marginTop: '16px',
          paddingTop: '14px',
          borderTop: '1px solid var(--border-light)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          textAlign: 'left'
        }}>
          <div style={{ background: 'var(--bg-page)', padding: '8px 10px', borderRadius: '8px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Telefon</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>{authUser?.phone || authUser?.phoneNumber || '—'}</span>
          </div>
          <div style={{ background: 'var(--bg-page)', padding: '8px 10px', borderRadius: '8px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Nr. Matricol / ID</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'monospace' }}>{authUser?.matricolNumber || authUser?.matricol_number || '—'}</span>
          </div>
          <div style={{ background: 'var(--bg-page)', padding: '8px 10px', borderRadius: '8px', gridColumn: 'span 2' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Facultate / Depart.</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>{authUser?.faculty || authUser?.department || '—'}</span>
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
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                background: currency === 'RON' ? '#0B1F3A' : 'var(--bg-page)',
                color: currency === 'RON' ? '#C6F246' : 'var(--text-main)'
              }}
              onClick={() => setCurrency('RON')}
            >
              RON
            </button>
            <button
              className={`btn-figma-dark ${currency === 'EUR' ? 'active' : ''}`}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                background: currency === 'EUR' ? '#0B1F3A' : 'var(--bg-page)',
                color: currency === 'EUR' ? '#C6F246' : 'var(--text-main)'
              }}
              onClick={() => setCurrency('EUR')}
            >
              EUR
            </button>
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
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                background: lang === 'ro' ? '#0B1F3A' : 'var(--bg-page)',
                color: lang === 'ro' ? '#C6F246' : 'var(--text-main)'
              }}
              onClick={() => setLang('ro')}
            >
              RO
            </button>
            <button
              className={`btn-figma-dark ${lang === 'en' ? 'active' : ''}`}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                background: lang === 'en' ? '#0B1F3A' : 'var(--bg-page)',
                color: lang === 'en' ? '#C6F246' : 'var(--text-main)'
              }}
              onClick={() => setLang('en')}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {/* Secțiune Acțiuni Rapide */}
      <div className="info-section-box">
        <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 10px' }}>
          Servicii & Administrare
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Recepția doar pentru RECEPTIONIST și ADMIN (KAN-68) */}
          {canUseReception && (
            <button
              className="btn-figma-dark"
              style={{
                width: '100%',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'var(--card-bg)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-main)'
              }}
              onClick={onNavigateReception}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>🎟️</span>
                <span style={{ fontWeight: 700, fontSize: '12px' }}>Recepție (Scanare & Validare QR)</span>
              </span>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>➔</span>
            </button>
          )}

          {/* Panoul Admin doar pentru ADMIN (KAN-68) */}
          {canUseAdmin && (
            <button
              className="btn-figma-dark"
              style={{
                width: '100%',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'var(--card-bg)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-main)'
              }}
              onClick={onNavigateAdmin}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>🛠️</span>
                <span style={{ fontWeight: 700, fontSize: '12px' }}>Panou Administrare Baze de Date</span>
              </span>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>➔</span>
            </button>
          )}

          <button
            className="btn-figma-dark"
            style={{
              width: '100%',
              justifyContent: 'space-between',
              padding: '10px 14px',
              background: 'var(--card-bg)',
              border: '1px solid var(--border-light)',
              color: 'var(--text-main)'
            }}
            onClick={onNavigateMyBookings}
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
        onClick={onLogout}
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
}
