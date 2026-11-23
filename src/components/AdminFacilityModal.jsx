import React from 'react';

export default function AdminFacilityModal({
  isOpen,
  editingFacility,
  facilityForm,
  setFacilityForm,
  onClose,
  onSave
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(3px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'flex-end'
    }}>
      <div style={{
        width: '100%',
        background: 'var(--card-bg)',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        padding: '20px',
        maxHeight: '85%',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800 }}>
            {editingFacility ? '✏️ Actualizare Facilitate (PostgreSQL)' : '➕ Adăugare Facilitate Nouă (PostgreSQL)'}
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
          >
            ✖
          </button>
        </div>

        <form onSubmit={onSave} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                onChange={(e) => setFacilityForm({ ...facilityForm, capacity: parseInt(e.target.value, 10) || 1 })}
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
  );
}
