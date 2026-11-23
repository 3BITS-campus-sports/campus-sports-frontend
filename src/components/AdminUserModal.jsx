import React from 'react';

export default function AdminUserModal({
  isOpen,
  editingUser,
  userForm,
  setUserForm,
  userFormError,
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
            {editingUser ? '✏️ Actualizare Utilizator (PostgreSQL)' : '➕ Adăugare Utilizator Nou (PostgreSQL)'}
          </h3>
          <button
            onClick={onClose}
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

        <form onSubmit={onSave} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
  );
}
