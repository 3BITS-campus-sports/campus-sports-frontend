import React from 'react';

export default function CancelModal({
  isOpen,
  selectedBooking,
  onClose,
  onConfirm,
  cancelReason,
  setCancelReason,
  cancelStatus
}) {
  if (!isOpen || !selectedBooking) return null;

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
        maxWidth: '380px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
        border: '1px solid var(--border-light)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '32px' }}>⚠️</span>
          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '8px 0 4px', color: 'var(--text-main)' }}>
            Anulează rezervarea?
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
            {selectedBooking.facility || selectedBooking.facilityName} · {selectedBooking.booking_code || selectedBooking.id}
          </p>
        </div>

        <div style={{
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '10px',
          padding: '10px',
          marginBottom: '14px',
          fontSize: '11px',
          color: '#1E40AF',
          lineHeight: '1.4'
        }}>
          ℹ️ <strong>Politică USV:</strong> Anularea este gratuită dacă se efectuează cu minimum 24 de ore înainte de oră. Suma achitată se rambursează automat.
        </div>

        {cancelStatus.error && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '8px',
            padding: '8px 10px',
            marginBottom: '12px',
            fontSize: '11px',
            color: '#991B1B',
            fontWeight: 600
          }}>
            ❌ {cancelStatus.error}
          </div>
        )}

        {cancelStatus.success && (
          <div style={{
            background: '#F0FDF4',
            border: '1px solid #86EFAC',
            borderRadius: '8px',
            padding: '8px 10px',
            marginBottom: '12px',
            fontSize: '11px',
            color: '#166534',
            fontWeight: 600
          }}>
            ✅ {cancelStatus.success}
          </div>
        )}

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px', color: 'var(--text-main)' }}>
            Motivul anulării:
          </label>
          <select
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
              fontSize: '12px',
              background: 'var(--card-bg)',
              color: 'var(--text-main)'
            }}
          >
            <option value="Schimbare de program">Schimbare de program / suprapunere orar</option>
            <option value="Motive medicale">Motive medicale / indispoziție</option>
            <option value="Condiții meteo">Condiții meteo nefavorabile</option>
            <option value="Alt motiv">Alt motiv personal</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            disabled={cancelStatus.loading}
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid var(--border-light)',
              background: 'var(--card-bg)',
              color: 'var(--text-main)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Păstrează
          </button>
          <button
            type="button"
            disabled={cancelStatus.loading}
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '10px',
              border: 'none',
              background: '#DC2626',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {cancelStatus.loading ? 'Se anulează...' : 'Confirmă anularea'}
          </button>
        </div>
      </div>
    </div>
  );
}
