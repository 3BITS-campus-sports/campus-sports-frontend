import React from 'react';

export default function MyBookingsScreen({
  bookingsTab,
  setBookingsTab,
  userBookings,
  userBookingsLoading,
  userBookingsError,
  currency,
  onViewTicket,
  onPayBooking,
  onCancelBooking,
  onExploreFacilities
}) {
  const upcomingCount = userBookings.filter(
    (b) => b.is_upcoming !== false && b.status !== 'CANCELLED'
  ).length;

  const historyCount = userBookings.filter(
    (b) => b.is_upcoming === false || b.status === 'CANCELLED'
  ).length;

  return (
    <div>
      {/* Comutator Tab-uri: Viitoare vs Istoric */}
      <div style={{
        display: 'flex',
        background: 'var(--border-light)',
        borderRadius: '12px',
        padding: '3px',
        marginBottom: '14px'
      }}>
        <button
          style={{
            flex: 1,
            padding: '8px',
            border: 'none',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 700,
            background: bookingsTab === 'upcoming' ? 'var(--card-bg)' : 'transparent',
            color: bookingsTab === 'upcoming' ? 'var(--text-main)' : 'var(--text-secondary)',
            cursor: 'pointer'
          }}
          onClick={() => setBookingsTab('upcoming')}
        >
          Viitoare ({upcomingCount})
        </button>
        <button
          style={{
            flex: 1,
            padding: '8px',
            border: 'none',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 700,
            background: bookingsTab === 'history' ? 'var(--card-bg)' : 'transparent',
            color: bookingsTab === 'history' ? 'var(--text-main)' : 'var(--text-secondary)',
            cursor: 'pointer'
          }}
          onClick={() => setBookingsTab('history')}
        >
          Istoric & Anulate ({historyCount})
        </button>
      </div>

      {userBookingsLoading && (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: '13px' }}>
          Se încarcă rezervările din sistem...
        </div>
      )}

      {userBookingsError && (
        <div style={{
          padding: '12px',
          borderRadius: '10px',
          background: '#FEF2F2',
          border: '1px solid #FCA5A5',
          color: '#991B1B',
          fontSize: '12px',
          marginBottom: '12px'
        }}>
          ⚠️ {userBookingsError}
        </div>
      )}

      {!userBookingsLoading && userBookings.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '36px 16px',
          background: 'var(--card-bg)',
          borderRadius: '16px',
          border: '1px solid var(--border-light)'
        }}>
          <p style={{ fontSize: '30px', marginBottom: '8px' }}>📅</p>
          <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '6px' }}>Nu ai nicio rezervare aici</h4>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Explorează facilitățile sportive USV și rezervă un teren sau bazinul de înot.
          </p>
          <button type="button" className="btn-figma-green" onClick={onExploreFacilities}>
            Explorează Facilități
          </button>
        </div>
      )}

      {!userBookingsLoading && userBookings.map((b) => {
        const bCode = b.booking_code || b.id || `SC-2026-${b.booking_id}`;
        const bFacility = b.facility || b.facilityName || 'Facilitate Sportivă USV';
        const bLoc = b.building_name || 'Complex Sportiv USV (Corp E)';
        const isCancelled = b.status === 'CANCELLED';
        const isConfirmed = b.status === 'CONFIRMED';
        const isPending = b.status === 'PENDING_PAYMENT' || b.status === 'INITIATED';
        const isCheckedIn = b.status === 'CHECKED_IN';

        const priceText = currency === 'EUR'
          ? `${b.total_amount_eur || b.totalPaidEur || '4.50'} EUR`
          : `${b.total_amount || b.totalPaidRon || '22.50'} RON`;

        return (
          <div
            key={bCode}
            className="info-section-box"
            style={{
              marginBottom: '14px',
              border: isCancelled ? '1px dashed #CBD5E1' : '1px solid var(--border-light)',
              opacity: isCancelled ? 0.75 : 1,
              background: isCancelled ? 'rgba(241, 245, 249, 0.5)' : 'var(--card-bg)'
            }}
          >
            {/* Header Card: Status badge + Cod */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '6px',
                background: isConfirmed ? '#DCFCE7' : isPending ? '#FEF3C7' : isCheckedIn ? '#DBEAFE' : '#F1F5F9',
                color: isConfirmed ? '#15803D' : isPending ? '#B45309' : isCheckedIn ? '#1D4ED8' : '#64748B'
              }}>
                ● {isConfirmed ? 'Confirmată' : isPending ? 'În așteptare plată' : isCheckedIn ? 'Prezent la sală' : isCancelled ? 'Anulată' : b.status}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'monospace', fontWeight: 600 }}>
                {bCode}
              </span>
            </div>

            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0' }}>{bFacility}</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 6px 0' }}>📍 {bLoc}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                🕒 {b.dateText || (b.start_time ? new Date(b.start_time).toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Data selectată')} · {b.timeText || (b.start_time ? `${new Date(b.start_time).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })} - ${new Date(b.end_time).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}` : 'Interval orar')}
              </span>
              <span style={{ fontWeight: 800, color: isCancelled ? '#94A3B8' : '#0B1F3A', fontSize: '13px' }}>
                {priceText}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
              {isConfirmed && (
                <>
                  <button
                    className="btn-figma-dark"
                    style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                    onClick={() => onViewTicket(b)}
                  >
                    🎟️ Vezi Bilet QR
                  </button>
                  <button
                    className="btn-figma-danger"
                    style={{ padding: '8px 12px', fontSize: '12px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                    onClick={() => onCancelBooking(b)}
                  >
                    Anulează
                  </button>
                </>
              )}

              {isPending && (
                <>
                  <button
                    className="btn-figma-green"
                    style={{ flex: 1, padding: '8px', fontSize: '12px' }}
                    onClick={() => onPayBooking(b)}
                  >
                    💳 Plătește acum
                  </button>
                  <button
                    style={{ padding: '8px 12px', fontSize: '12px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                    onClick={() => onCancelBooking(b)}
                  >
                    Renunță
                  </button>
                </>
              )}

              {isCancelled && (
                <div style={{ flex: 1, textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#94A3B8', padding: '6px' }}>
                  ⛔ Rezervare anulată · Interval eliberat
                </div>
              )}

              {isCheckedIn && (
                <div style={{ flex: 1, textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#16A34A', padding: '6px' }}>
                  ✅ Check-in efectuat cu succes
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
