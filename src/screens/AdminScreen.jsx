import React from 'react';

export default function AdminScreen({
  adminTab,
  setAdminTab,
  dbFacilities,
  fallbackFacilities,
  dbUsers,
  usersLoadError,
  onOpenAddFacility,
  onOpenEditFacility,
  onOpenAddUser,
  onOpenEditUser
}) {
  const facilitiesList = dbFacilities.length > 0 ? dbFacilities : fallbackFacilities.map((f) => ({
    facility_id: f.id,
    name: f.name,
    sport_type: f.category === 'Înot' ? 'Natație' : f.category,
    capacity: 14,
    base_price_per_hour: f.priceRon,
    is_active: true
  }));

  return (
    <div>
      {/* Sub-taburi Admin: Facilitati vs Utilizatori */}
      <div className="admin-tab-bar">
        <button
          className={`admin-tab-btn ${adminTab === 'facilities' ? 'active' : ''}`}
          onClick={() => setAdminTab('facilities')}
        >
          🏟️ Facilități ({facilitiesList.length})
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
              onClick={onOpenAddFacility}
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
                {facilitiesList.map((f) => (
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
                        onClick={() => onOpenEditFacility(f)}
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
              onClick={onOpenAddUser}
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
                        onClick={() => onOpenEditUser(u)}
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
  );
}
