import React from 'react';
import {
  iconCalendarDark,
  iconClockDark,
  iconBellBlue,
  switchOn,
  iconArrowLime,
  iconInfoBlue,
  iconWavesTeal,
  iconWaves,
  iconFlame,
  iconBallCard
} from '../constants/figmaAssets';
import {
  bookingTimes,
  formatAmount,
  lowerFirst
} from '../constants/dateTimeHelpers';

const CATEGORY_STYLE = {
  'Înot': { className: 'swim', icon: iconWaves },
  'Relaxare': { className: 'relax', icon: iconFlame },
  'Sporturi': { className: 'sport', icon: iconBallCard }
};

export default function ConfirmedTicketScreen({
  booking,
  selectedFacility,
  qrImage,
  qrEnlarged,
  setQrEnlarged,
  onGoToMyBookings,
  onGoToFacilities
}) {
  if (!booking?.qr_payload) {
    return (
      <div className="sc-stack">
        <div className="sc-note-box">
          <img src={iconInfoBlue} alt="" />
          <span>Codul de acces apare aici după plata unei rezervări.</span>
        </div>
        <button type="button" className="sc-btn-secondary" onClick={onGoToMyBookings}>
          Vezi rezervările mele
        </button>
      </div>
    );
  }

  const times = bookingTimes(booking);
  const dayMonth = times.dateText.split(', ')[1]?.replace(/ \d{4}$/, '') || '';
  const style = CATEGORY_STYLE[selectedFacility?.category] || CATEGORY_STYLE.Sporturi;

  return (
    <div className="sc-stack">
      <section className="sc-ticket">
        <div className="sc-ticket-details">
          <div className="sc-facility-heading">
            <span className={`sc-category-badge ${style.className}`}>
              {style.className === 'swim' ? (
                <img src={iconWavesTeal} alt="" />
              ) : (
                <span style={{ '--icon': `url("${style.icon}")` }} />
              )}
            </span>
            <strong>
              {booking.facility} · {booking.building_name?.split(',')[0]}
            </strong>
          </div>
          <div className="sc-meta-row"><img src={iconCalendarDark} alt="" />{times.dateText}</div>
          <div className="sc-meta-row"><img src={iconClockDark} alt="" />{times.timeText} · {times.minutes} min</div>
          <div className="sc-amount-row">
            <span>Total plătit</span>
            <strong className="sc-amount-strong">
              {formatAmount(booking.total_amount)} RON / {formatAmount(booking.total_amount_eur)} EUR
            </strong>
          </div>
        </div>
        <div className="sc-ticket-perforation" aria-hidden="true" />
        <button
          type="button"
          className={`sc-ticket-code ${qrEnlarged ? 'enlarged' : ''}`}
          aria-expanded={qrEnlarged}
          onClick={() => setQrEnlarged(!qrEnlarged)}
        >
          <span className="sc-qr-box">
            {qrImage ? (
              <img src={qrImage} alt={`Cod QR pentru rezervarea ${booking.booking_code}`} />
            ) : (
              <span className="sc-qr-fallback">{booking.qr_payload}</span>
            )}
          </span>
          <span className="sc-ticket-code-text">
            <strong>Cod de acces</strong>
            <span>
              Prezintă codul la recepția din {booking.building_name}.
              {qrEnlarged ? ' Atinge din nou pentru a-l micșora.' : ' Atinge codul pentru a-l mări.'}
            </span>
          </span>
        </button>
      </section>

      <div className="sc-reminder-row">
        <span className="sc-reminder-label">
          <span className="sc-bell-badge"><img src={iconBellBlue} alt="" /></span>
          Reminder cu 1 oră înainte
        </span>
        {booking.reminder_enabled ? (
          <img className="sc-switch-img" src={switchOn} alt="Pornit" />
        ) : (
          <span className="sc-switch-off" role="img" aria-label="Oprit" />
        )}
      </div>

      <section className="sc-howto">
        <h3>Cum intri la {lowerFirst(booking.facility)}</h3>
        <p>
          Prezintă codul rezervării la recepția din {booking.building_name}. Accesul corespunde
          intervalului {times.timeText} din {dayMonth}.
        </p>
      </section>

      <button type="button" className="sc-btn-dark" onClick={onGoToMyBookings}>
        Vezi rezervările mele
        <img src={iconArrowLime} alt="" />
      </button>
      <button type="button" className="sc-btn-secondary" onClick={onGoToFacilities}>
        Înapoi la facilități
      </button>
      <button type="button" className="sc-btn-danger" onClick={onGoToMyBookings}>
        Anulează rezervarea
      </button>
    </div>
  );
}
