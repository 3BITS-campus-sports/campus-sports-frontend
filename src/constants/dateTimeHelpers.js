// Helper-e pentru date și orare (Figma 04, 05, 06)

export const MONTHS_RO = [
  'ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie',
  'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'
];

export const WEEKDAYS_RO = [
  'duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă'
];

export const WEEKDAY_HEADERS = ['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D'];
export const MAX_MONTHS_AHEAD = 2;
export const BOOKING_TIME_ZONE = 'Europe/Bucharest';

export const toIsoDate = (date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0')
].join('-');

export const formatLongDate = (isoDate) => {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return `${WEEKDAYS_RO[date.getDay()]}, ${day} ${MONTHS_RO[month - 1]} ${year}`;
};

export const buildMonthCells = (year, month) => {
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // luni = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstWeekday).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toIsoDate(new Date(year, month, day)));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
};

export const slotStatusText = (slot, isSelected) => {
  const seats = slot.capacity > 1 ? ` · ${slot.seatsLeft}/${slot.capacity} locuri` : '';
  if (isSelected) return `Selectat${seats}`;
  if (slot.overlapsOwnBooking) return 'Se suprapune cu o rezervare a ta';
  if (slot.isAvailable) return `Disponibil${seats}`;
  return `Ocupat${seats}`;
};

export const lowerFirst = (text) => text.charAt(0).toLowerCase() + text.slice(1);
export const upperFirst = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export const formatAmount = (value) => {
  const number = Number(value);
  return Number.isInteger(number)
    ? String(number)
    : number.toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const bookingTimes = (booking) => {
  const start = new Date(booking.start_time);
  const end = new Date(booking.end_time);
  const hour = (date) => date.toLocaleTimeString('ro-RO', {
    timeZone: BOOKING_TIME_ZONE, hour: '2-digit', minute: '2-digit', hour12: false
  });
  const isoDate = start.toLocaleDateString('sv-SE', { timeZone: BOOKING_TIME_ZONE });
  return {
    isoDate,
    dateText: upperFirst(formatLongDate(isoDate)),
    timeText: `${hour(start)}–${hour(end)}`,
    minutes: Math.round((end - start) / 60000)
  };
};

export const bookingTotals = (booking, currency) => {
  const ron = `${formatAmount(booking.total_amount)} RON`;
  const eur = `${formatAmount(booking.total_amount_eur)} EUR`;
  return currency === 'EUR' ? { main: eur, other: ron } : { main: ron, other: eur };
};
