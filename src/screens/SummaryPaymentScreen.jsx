import React from 'react';
import {
  iconCalendarDark,
  iconClockDark,
  iconBackBlue,
  iconLockNavy,
  iconExternal,
  iconCheck,
  iconInfoRed,
  iconArrowDark,
  iconXRed,
  iconWavesTeal,
  iconWaves,
  iconFlame,
  iconBallCard
} from '../constants/figmaAssets';
import {
  bookingTimes,
  bookingTotals,
  lowerFirst,
  formatAmount
} from '../constants/dateTimeHelpers';

const CATEGORY_STYLE = {
  'Înot': { className: 'swim', icon: iconWaves },
  'Relaxare': { className: 'relax', icon: iconFlame },
  'Sporturi': { className: 'sport', icon: iconBallCard }
};

const DISCOUNT_LABELS = {
  STUDENT: 'Reducere student',
  PROFESSOR: 'Reducere cadru didactic'
};

export default function SummaryPaymentScreen({
  booking,
  selectedFacility,
  currency,
  simulateFailure,
  setSimulateFailure,
  payment,
  onPayBooking,
  onBackToChooseDatetime,
  isFailed = false,
  onBackToSummary
}) {
  if (!booking) return null;

  const times = bookingTimes(booking);
  const totals = bookingTotals(booking, currency);
  const discount = Number(booking.discount_amount);
  const equipment = Number(booking.equipment_amount);

  const renderFacilityHeading = (bookingRow) => {
    const style = CATEGORY_STYLE[selectedFacility?.category] || CATEGORY_STYLE.Sporturi;
    return (
      <div className="sc-facility-heading">
        <span className={`sc-category-badge ${style.className}`}>
          {style.className === 'swim' ? (
            <img src={iconWavesTeal} alt="" />
          ) : (
            <span style={{ '--icon': `url("${style.icon}")` }} />
          )}
        </span>
        <strong>
          {bookingRow.facility} · {bookingRow.building_name?.split(',')[0]}
        </strong>
      </div>
    );
  };

  if (isFailed) {
    return (
      <div className="sc-stack">
        <section className="sc-panel sc-status-card">
          <span className="sc-status-badge"><img src={iconXRed} alt="" /></span>
          <h3>Nu am putut finaliza plata</h3>
          <p>Rezervarea nu a fost confirmată. Poți reîncerca plata sau te poți întoarce la rezumat.</p>
        </section>

        <section className="sc-panel sc-panel-outline sc-panel-tight">
          {renderFacilityHeading(booking)}
          <div className="sc-meta-row"><img src={iconCalendarDark} alt="" />{times.dateText}</div>
          <div className="sc-meta-row"><img src={iconClockDark} alt="" />{times.timeText} · {times.minutes} min</div>
          <hr className="sc-separator" />
          <div className="sc-amount-row">
            <span>Total de plată</span>
            <strong>{formatAmount(booking.total_amount)} RON / {formatAmount(booking.total_amount_eur)} EUR</strong>
          </div>
        </section>

        {payment.error && (
          <div className="sc-alert-error" role="alert">
            <img src={iconInfoRed} alt="" />
            <span>{payment.error}</span>
          </div>
        )}

        <button type="button" className="sc-btn-primary" disabled={payment.loading} onClick={onPayBooking}>
          {payment.loading ? 'Se procesează plata…' : 'Reîncearcă plata'}
          <img src={iconArrowDark} alt="" />
        </button>
        <button type="button" className="sc-btn-secondary" onClick={onBackToSummary}>
          Anulează / Înapoi
        </button>
      </div>
    );
  }

  return (
    <div className="sc-stack">
      <section className="sc-panel">
        {renderFacilityHeading(booking)}
        <div className="sc-meta-row"><img src={iconCalendarDark} alt="" />{times.dateText}</div>
        <div className="sc-meta-row"><img src={iconClockDark} alt="" />{times.timeText} · {times.minutes} min</div>
        <hr className="sc-separator" />
        <div className="sc-amount-row">
          <span>Tarif {lowerFirst(booking.facility)}</span>
          <strong>{formatAmount(booking.base_amount)} RON</strong>
        </div>
        {equipment > 0 && (
          <div className="sc-amount-row">
            <span>{selectedFacility?.usefulInfo?.equipmentTitle || 'Echipament'}</span>
            <strong>{formatAmount(equipment)} RON</strong>
          </div>
        )}
        {discount > 0 && (
          <div className="sc-amount-row">
            <span>{DISCOUNT_LABELS[booking.role_type] || 'Reducere'}</span>
            <strong className="sc-amount-discount">−{formatAmount(discount)} RON</strong>
          </div>
        )}
        <hr className="sc-separator" />
        <div className="sc-total-row">
          <span>Total</span>
          <span className="sc-total-sum">
            <strong>{totals.main}</strong>
            <span>≈ {totals.other}</span>
          </span>
        </div>
      </section>

      <button type="button" className="sc-back-link" onClick={onBackToChooseDatetime}>
        <img src={iconBackBlue} alt="" />
        Modifică data sau ora
      </button>

      <section className="sc-panel">
        <h3 className="sc-panel-title">Plată prin procesator extern</h3>
        <div className="sc-processor">
          <span><img src={iconLockNavy} alt="" />Continuă la plata externă</span>
          <img src={iconExternal} alt="" />
        </div>
        <p className="sc-panel-text">
          Vei fi redirecționat către pagina securizată a procesatorului pentru a introduce datele cardului.
        </p>
        <p className="sc-muted-note">Demonstrativ: nu există tranzacție reală.</p>
        <label className="sc-consent">
          <input
            type="checkbox"
            checked={simulateFailure}
            onChange={(e) => setSimulateFailure(e.target.checked)}
          />
          <span className="sc-checkbox" aria-hidden="true">
            <img src={iconCheck} alt="" />
          </span>
          <span>Simulează o plată refuzată de bancă</span>
        </label>
      </section>

      <p className="sc-muted-note">Suma de plată în moneda selectată: {totals.main}.</p>

      {payment.error && (
        <div className="sc-alert-error" role="alert">
          <img src={iconInfoRed} alt="" />
          <span>{payment.error}</span>
        </div>
      )}

      <button
        type="button"
        className="sc-btn-primary"
        disabled={payment.loading}
        onClick={onPayBooking}
      >
        {payment.loading ? 'Se procesează plata…' : `Confirmă și plătește · ${totals.main}`}
        <img src={iconArrowDark} alt="" />
      </button>
      <p className="sc-muted-note sc-center">Poți anula cu cel puțin 24 de ore înainte.</p>
    </div>
  );
}
