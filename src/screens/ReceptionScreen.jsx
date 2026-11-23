import React from 'react';

export default function ReceptionScreen({
  receptionForm,
  setReceptionForm,
  receptionState,
  setReceptionState,
  booking,
  onValidateQr,
  onBackToAccount
}) {
  return (
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

        <form onSubmit={onValidateQr}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-main)', marginBottom: '4px' }}>
              Token Bilet QR (Hexadecimal / Text)
            </label>
            <textarea
              rows={3}
              value={receptionForm.token}
              onChange={(e) => setReceptionForm((f) => ({ ...f, token: e.target.value }))}
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
              onClick={() => setReceptionForm((f) => ({ ...f, token: booking.qr_payload }))}
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
              onChange={(e) => setReceptionForm((f) => ({ ...f, receptionistId: e.target.value }))}
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
              setReceptionForm((f) => ({ ...f, token: '' }));
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
        onClick={onBackToAccount}
        style={{
          width: '100%',
          padding: '10px',
          background: 'transparent',
          border: '1px solid var(--border-light)',
          color: 'var(--text-main)',
          marginTop: '8px',
          marginBottom: '20px'
        }}
      >
        ⬅️ Înapoi la Contul meu
      </button>
    </div>
  );
}
