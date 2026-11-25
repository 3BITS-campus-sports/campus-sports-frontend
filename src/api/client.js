// Client API pentru Campus Sports Booking
// Centralizează toate cererile fetch, header-ele JWT și tratarea erorilor

export const AUTH_STORAGE_KEY = 'sc_auth';
export const SERVER_DOWN_MESSAGE = 'Serverul nu răspunde. Verifică dacă backend-ul este pornit.';

export const readStoredAuth = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
    return saved && saved.token ? saved : { token: null, user: null };
  } catch {
    return { token: null, user: null };
  }
};

export const saveStoredAuth = ({ token, user }) => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user }));
  } catch {
    // Sesiunea rămâne doar în memorie în mod privat
  }
};

export const clearStoredAuth = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Sesiune privată
  }
};

export const apiErrorMessage = (status, body) => {
  if (status === 0) return SERVER_DOWN_MESSAGE;
  if (status === 401) return 'Sesiunea a expirat. Autentifică-te din nou.';
  const message = typeof body.error === 'string' ? body.error : body.error?.message;
  return message || `Eroare ${status}`;
};

export const readApiError = async (res) => {
  if (res.status === 409) {
    return 'Emailul este deja folosit de alt utilizator.';
  }
  try {
    const body = await res.json();
    const message = typeof body.error === 'string' ? body.error : body.error?.message;
    return message || `Eroare ${res.status}`;
  } catch {
    return `Eroare ${res.status}`;
  }
};

// Autentificare (Figma 01 / POST /auth/login)
export const requestLogin = async (email, password) => {
  try {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password })
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      return { ok: true, data: body };
    }
    const message = res.status === 401
      ? 'Email sau parolă incorectă'
      : body.error?.message || `Eroare ${res.status}`;
    return { ok: false, message };
  } catch {
    return { ok: false, message: SERVER_DOWN_MESSAGE };
  }
};

// Înregistrare cont (Figma 02 / POST /auth/register): rol, telefon și, pentru studenți, matricol și facultate (KAN-69)
export const requestRegister = async ({ fullName, email, phone, password, roleType, matricolNumber, faculty }) => {
  const isStudent = roleType === 'STUDENT';
  try {
    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        roleType,
        ...(isStudent ? { matricolNumber: matricolNumber.trim(), faculty: faculty.trim() } : {})
      })
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      // 409: backend-ul spune dacă emailul sau numărul matricol este deja folosit
      return {
        ok: false,
        message: body.error?.message || (res.status === 409 ? 'Există deja un cont cu aceste date.' : `Eroare ${res.status}`)
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, message: SERVER_DOWN_MESSAGE };
  }
};

// Încărcare catalog facilități (GET /facilities)
export const fetchFacilities = async () => {
  try {
    const res = await fetch('/api/v1/facilities');
    if (res.ok) {
      return await res.json();
    }
    return [];
  } catch (err) {
    console.log('Backend offline sau rulare locală stand-alone:', err.message);
    return [];
  }
};

// Antetul Authorization pentru cererile care cer autentificare
export const authHeaders = (authToken) => (authToken ? { Authorization: `Bearer ${authToken}` } : {});

// Încărcare utilizatori Admin (GET /users) – doar pentru rolul ADMIN (KAN-68)
export const fetchUsers = async (authToken) => {
  const res = await fetch('/api/v1/users', { headers: authHeaders(authToken) });
  if (!res.ok) {
    throw new Error(`serverul a răspuns cu ${res.status}`);
  }
  return await res.json();
};

// Încărcare disponibilitate intervale (GET /facilities/:id/availability)
export const fetchAvailability = async (facilityId, isoDate, authToken) => {
  try {
    const res = await fetch(`/api/v1/facilities/${facilityId}/availability?date=${isoDate}`, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = res.status === 401
        ? 'Sesiunea a expirat. Autentifică-te din nou pentru a rezerva.'
        : body.error?.message || `Eroare ${res.status}`;
      return { ok: false, slots: [], error: message };
    }
    return { ok: true, slots: body.slots || [] };
  } catch {
    return { ok: false, slots: [], error: SERVER_DOWN_MESSAGE };
  }
};

// Inițiere rezervare cu blocare de 5 minute (POST /bookings)
export const createBooking = async ({ facilityId, bookingDate, startTime, endTime, reminderEnabled }, authToken) => {
  try {
    const res = await fetch('/api/v1/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify({ facilityId, bookingDate, startTime, endTime, reminderEnabled })
    });
    const body = await res.json().catch(() => ({}));
    return { status: res.status, body };
  } catch {
    return { status: 0, body: {} };
  }
};

// Confirmare / plată simulată (POST /bookings/:id/pay)
export const payBooking = async (bookingId, simulateFailure, authToken) => {
  try {
    const res = await fetch(`/api/v1/bookings/${bookingId}/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify({
        method: 'CARD_ONLINE',
        simulateResult: simulateFailure ? 'FAILED' : 'SUCCESS'
      })
    });
    const body = await res.json().catch(() => ({}));
    return { status: res.status, body };
  } catch {
    return { status: 0, body: {} };
  }
};

// Rezervările proprii (GET /bookings/my-bookings). La eroare aruncă un mesaj pentru ecran (KAN-70)
export const fetchMyBookings = async (scope, authToken) => {
  let res;
  try {
    res = await fetch(`/api/v1/bookings/my-bookings?scope=${scope}`, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
    });
  } catch {
    throw new Error(SERVER_DOWN_MESSAGE);
  }
  if (!res.ok) {
    throw new Error(await readApiError(res));
  }
  const data = await res.json().catch(() => []);
  return Array.isArray(data) ? data : [];
};

// Anulare rezervare (POST /bookings/:id/cancel)
export const cancelBooking = async (bookingId, reason, notes, authToken) => {
  try {
    const res = await fetch(`/api/v1/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify({ reason, notes })
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: {} };
  }
};

// Scanare și validare bilet QR (POST /qr/validate) – recepționerul este utilizatorul logat (KAN-68)
export const validateQr = async (token, authToken) => {
  try {
    const res = await fetch('/api/v1/qr/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify({ token })
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data, status: res.status };
  } catch {
    return { ok: false, data: {}, status: 0 };
  }
};
