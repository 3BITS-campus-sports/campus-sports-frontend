// Date implicite și constante pentru campus, facilități, roluri și formulare

export const fallbackFacilities = [
  {
    id: 1,
    name: 'Teren Fotbal Sintetic Nocturnă #1',
    nameEn: 'Synthetic Football Pitch',
    subtitle: 'Complex sportiv - corp E',
    category: 'Sporturi',
    visualBg: 'var(--tenis-bg)',
    visualColor: 'var(--tenis-accent)',
    icon: '⚽',
    badgeAlert: null,
    hours: 'Deschis azi: 08:00 - 23:00',
    priceRon: 90.0,
    priceEur: 18.0,
    unit: '/ 1h slot',
    usefulInfo: {
      location: 'Complex sportiv, corp E',
      program: 'Luni - duminică, 08:00 - 23:00',
      notice: 'Nocturnă LED automată inclusă',
      beforeVisit: ['Încălțăminte sintetic/tartan', 'Respectă intervalul selectat'],
      equipmentOptions: [{ name: 'Minge oficială', price: 10 }]
    }
  },
  {
    id: 2,
    name: 'Teren de tenis',
    nameEn: 'Tennis Court',
    subtitle: 'Campus - zona baza sportivă',
    category: 'Sporturi',
    visualBg: 'var(--tenis-bg)',
    visualColor: 'var(--tenis-accent)',
    icon: '🎾',
    badgeAlert: null,
    hours: 'Deschis azi: 08:00 - 21:00',
    priceRon: 40.0,
    priceEur: 8.0,
    unit: '/ 1h slot',
    usefulInfo: {
      location: 'Baza sportivă campus',
      program: 'Zilnic, 08:00 - 21:00',
      notice: 'Acces doar cu încălțăminte curată',
      beforeVisit: ['Rachete proprii sau închiriate', 'Respectă durata slotului'],
      equipmentOptions: [{ name: 'Set 2 rachete', price: 10 }]
    }
  },
  {
    id: 3,
    name: 'Bazin',
    nameEn: 'Swimming Pool',
    subtitle: 'Complex sportiv - corp E, parter',
    category: 'Înot',
    visualBg: 'var(--bazin-bg)',
    visualColor: 'var(--bazin-accent)',
    icon: '≈',
    badgeAlert: 'Rezervările se deschid la 08:00',
    hours: 'Deschis azi: 06:00 - 21:00',
    priceRon: 25.0,
    priceEur: 5.0,
    unit: '/ 1h slot',
    usefulInfo: {
      location: 'Complex sportiv, corp E, parter',
      program: 'Luni - vineri, 06:00 - 21:00',
      notice: 'Rezervările din timp beneficiază de reducere',
      beforeVisit: ['Cască și ochelari obligatorii', 'Duș obligatoriu înainte'],
      equipmentOptions: [{ name: 'Ochelari înot', price: 4 }, { name: 'Cască silicon', price: 3 }]
    }
  },
  {
    id: 4,
    name: 'Sală Polivalentă & Fitness',
    nameEn: 'Fitness Gym',
    subtitle: 'Corp D - Demisol',
    category: 'Sporturi',
    visualBg: '#FEE2E2',
    visualColor: '#DC2626',
    icon: '🏋️',
    badgeAlert: null,
    hours: 'Deschis azi: 08:00 - 22:00',
    priceRon: 30.0,
    priceEur: 6.0,
    unit: '/ 1h slot',
    usefulInfo: {
      location: 'Corp D, demisol',
      program: 'Luni - duminică, 08:00 - 22:00',
      notice: 'Reducere 50% pentru studenții USV',
      beforeVisit: ['Prosop pe aparate', 'Pantofi sport de schimb'],
      equipmentOptions: [{ name: 'Prosop sală', price: 3 }]
    }
  },
  {
    id: 5,
    name: 'Saună',
    nameEn: 'Sauna',
    subtitle: 'Complex sportiv - corp E, etaj',
    category: 'Relaxare',
    visualBg: 'var(--sauna-bg)',
    visualColor: 'var(--sauna-accent)',
    icon: '♨',
    badgeAlert: null,
    hours: 'Deschis azi: 08:00 - 21:00',
    priceRon: 40.0,
    priceEur: 8.0,
    unit: '/ 1h slot',
    usefulInfo: {
      location: 'Corp E, etaj',
      program: 'Luni - sâmbătă, 08:00 - 21:00',
      notice: 'Timp maxim recomandat: 15 min per repriză',
      beforeVisit: ['Două prosoape mari', 'Hidratare corespunzătoare'],
      equipmentOptions: [{ name: 'Prosop saună', price: 5 }]
    }
  }
];

export const campusPins = [
  { id: 1, facilityId: 1, name: 'Teren Fotbal Sintetic', type: 'Sporturi', icon: '⚽', x: 280, y: 70, color: '#16A34A', zone: 'Complex Sportiv Corp E' },
  { id: 2, facilityId: 2, name: 'Teren de tenis', type: 'Sporturi', icon: '🎾', x: 310, y: 150, color: '#D97706', zone: 'Baza Sportivă Campus' },
  { id: 3, facilityId: 3, name: 'Bazin de Înot USV', type: 'Înot', icon: '🏊', x: 190, y: 80, color: '#0284C7', zone: 'Corp E - Parter' },
  { id: 4, facilityId: 4, name: 'Sală Fitness & Cardio', type: 'Relaxare', icon: '🏋️', x: 190, y: 140, color: '#7C3AED', zone: 'Corp E - Etaj 1' }
];

export const emptyRegisterForm = {
  roleType: 'STUDENT',
  fullName: '',
  email: '',
  phone: '',
  matricolNumber: '',
  faculty: '',
  password: '',
  acceptedTerms: false
};

export const emptyFacilityForm = {
  name: '',
  sport_type: 'Fotbal',
  category: 'Sporturi',
  capacity: 10,
  base_price_per_hour: 40.0,
  slot_minutes: 60,
  opens_at: '08:00:00',
  closes_at: '22:00:00'
};

export const emptyUserForm = {
  full_name: '',
  email: '',
  phone_number: '',
  role_type: 'STUDENT',
  password: ''
};

export const roleMetaMap = {
  STUDENT: { label: 'Student USV', color: '#0284C7', bg: '#E0F2FE' },
  PROFESSOR: { label: 'Cadru Didactic / Profesor', color: '#059669', bg: '#D1FAE5' },
  STAFF: { label: 'Cadru Didactic / Personal', color: '#059669', bg: '#D1FAE5' },
  AMATEUR: { label: 'Amator / Extern', color: '#D97706', bg: '#FEF3C7' },
  EXTERNAL: { label: 'Amator / Extern', color: '#D97706', bg: '#FEF3C7' },
  RECEPTIONIST: { label: 'Recepționer Campus', color: '#7C3AED', bg: '#EDE9FE' },
  ADMIN: { label: 'Administrator Sistem', color: '#4F46E5', bg: '#EEF2FF' }
};

export const defaultUpcomingBookings = [
  {
    id: 'SC-271026-001',
    facilityName: 'Bazin - Complex sportiv',
    dateText: 'Marți, 27 octombrie 2026',
    timeText: '16:00 - 17:00 · 60 min',
    totalPaidRon: '22,50',
    totalPaidEur: '4.50',
    status: 'Confirmată'
  }
];

export const defaultHistoryBookings = [
  {
    id: 'SC-201026-084',
    facilityName: 'Saună - Complex sportiv',
    dateText: 'Vineri, 20 octombrie 2026, 18:00 - 19:00 · 60 min',
    totalPaidRon: '20,00',
    status: 'Finalizată'
  },
  {
    id: 'SC-121026-019',
    facilityName: 'Teren de tenis - Campus',
    dateText: 'Joi, 12 octombrie 2026, 16:00 - 17:00 · 60 min',
    totalPaidRon: '40,00',
    status: 'Finalizată'
  }
];
