import React from 'react';
import {
  iconBackBlue,
  iconChevronLeft,
  iconChevronRight,
  dotLegendFree,
  dotLegendBusy,
  dotLegendSelected,
  dotSlotFree,
  dotSlotBusy,
  dotSlotSelected,
  iconInfoRed,
  iconInfoAmber,
  iconInfoBlue,
  iconCheck,
  iconArrowDark,
  iconArrowMuted
} from '../constants/figmaAssets';
import {
  MONTHS_RO,
  WEEKDAY_HEADERS,
  toIsoDate,
  formatLongDate,
  buildMonthCells,
  slotStatusText
} from '../constants/dateTimeHelpers';

export default function ChooseDatetimeScreen({
  selectedFacility,
  calendarMonth,
  selectedDate,
  selectedSlot,
  availability,
  addEquipment,
  setAddEquipment,
  bookingRequest,
  onBack,
  onChangeCalendarMonth,
  onSelectCalendarDay,
  onSelectSlot,
  onOpenSummary
}) {
  if (!selectedFacility) return null;

  const todayIso = toIsoDate(new Date());
  const cells = buildMonthCells(calendarMonth.year, calendarMonth.month);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  const noSlots = !availability.loading && !availability.error && availability.slots.length === 0;
  const isFreeDayEmpty = !availability.loading && !availability.error &&
    availability.slots.length > 0 && availability.slots.every((slot) => !slot.isAvailable);
  const canContinue = Boolean(selectedSlot) && !availability.loading && !bookingRequest.loading;
  const monthTitle = `${MONTHS_RO[calendarMonth.month][0].toUpperCase()}${MONTHS_RO[calendarMonth.month].slice(1)} ${calendarMonth.year}`;

  return (
    <div className="sc-stack">
      <button type="button" className="sc-back-link" onClick={onBack}>
        <img src={iconBackBlue} alt="" />
        Detalii facilitate
      </button>

      <section className="sc-calendar">
        <div className="sc-calendar-head">
          <button
            type="button"
            className="sc-month-btn"
            onClick={() => onChangeCalendarMonth(-1)}
            aria-label="Luna precedentă"
          >
            <img src={iconChevronLeft} alt="" />
          </button>
          <span>{monthTitle}</span>
          <button
            type="button"
            className="sc-month-btn"
            onClick={() => onChangeCalendarMonth(1)}
            aria-label="Luna următoare"
          >
            <img src={iconChevronRight} alt="" />
          </button>
        </div>
        <div className="sc-calendar-row sc-weekdays">
          {WEEKDAY_HEADERS.map((day) => <span key={day}>{day}</span>)}
        </div>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="sc-calendar-row">
            {week.map((isoDate, dayIndex) => {
              if (!isoDate) {
                return <span key={`gol-${dayIndex}`} className="sc-day empty" />;
              }
              const isPast = isoDate < todayIso;
              const classes = ['sc-day'];
              if (isPast) classes.push('past');
              if (isoDate === todayIso) classes.push('today');
              if (isoDate === selectedDate) classes.push('selected');
              return (
                <button
                  key={isoDate}
                  type="button"
                  className={classes.join(' ')}
                  disabled={isPast}
                  onClick={() => onSelectCalendarDay(isoDate)}
                >
                  {Number(isoDate.slice(8))}
                </button>
              );
            })}
          </div>
        ))}
      </section>

      <div className="sc-selected-day">
        <strong>Selectat: {formatLongDate(selectedDate)}</strong>
        <div className="sc-legend">
          <span><img src={dotLegendFree} alt="" />Liber</span>
          <span><img src={dotLegendBusy} alt="" />Ocupat</span>
          <span><img src={dotLegendSelected} alt="" />Selectat</span>
        </div>
      </div>

      {availability.loading && <p className="sc-muted-note">Se încarcă intervalele…</p>}

      {availability.error && (
        <div className="sc-alert-error" role="alert">
          <img src={iconInfoRed} alt="" />
          <span>{availability.error}</span>
        </div>
      )}

      {(noSlots || isFreeDayEmpty) && (
        <div className="sc-warning-box">
          <div className="sc-warning-title">
            <img src={iconInfoAmber} alt="" />
            <strong>Nu există intervale libere în această zi</strong>
          </div>
          <p>Alege altă dată din calendar pentru a vedea intervalele disponibile.</p>
        </div>
      )}

      {availability.slots.length > 0 && !isFreeDayEmpty && (
        <>
          <div className="sc-slots">
            {availability.slots.map((slot) => {
              const isSelected = selectedSlot && selectedSlot.startTime === slot.startTime;
              const state = isSelected ? 'selected' : slot.isAvailable ? 'free' : 'busy';
              const dot = state === 'selected' ? dotSlotSelected : state === 'free' ? dotSlotFree : dotSlotBusy;
              return (
                <button
                  key={slot.startTime}
                  type="button"
                  className={`sc-slot ${state}`}
                  disabled={!slot.isAvailable}
                  onClick={() => onSelectSlot(slot)}
                >
                  <span className="sc-slot-time">{slot.startLabel}–{slot.endLabel}</span>
                  <span className="sc-slot-status">
                    <img src={dot} alt="" />
                    {slotStatusText(slot, isSelected)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="sc-note-box">
            <img src={iconInfoBlue} alt="" />
            <span>Fără suprapuneri: intervalele ocupate sau care se suprapun cu rezervările tale sunt dezactivate.</span>
          </div>

          <label className="sc-equipment-toggle">
            <input
              type="checkbox"
              checked={addEquipment}
              onChange={(e) => setAddEquipment(e.target.checked)}
            />
            <span className="sc-checkbox" aria-hidden="true">
              <img src={iconCheck} alt="" />
            </span>
            <span className="sc-equipment-text">
              <strong>Adaugă {(selectedFacility.usefulInfo.equipmentTitle || 'echipament').toLowerCase()}</strong>
              <span>+10 RON</span>
            </span>
          </label>
        </>
      )}

      {bookingRequest.error && (
        <div className="sc-alert-error" role="alert">
          <img src={iconInfoRed} alt="" />
          <span>{bookingRequest.error}</span>
        </div>
      )}

      <button
        type="button"
        className={`sc-btn-primary ${canContinue ? '' : 'sc-btn-disabled'}`}
        disabled={!canContinue}
        onClick={onOpenSummary}
      >
        {bookingRequest.loading ? 'Se creează rezervarea…' : 'Continuă către rezumat'}
        <img src={canContinue ? iconArrowDark : iconArrowMuted} alt="" />
      </button>
    </div>
  );
}
