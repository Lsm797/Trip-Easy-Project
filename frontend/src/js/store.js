import { INITIAL_TRIPS, POPULAR_DESTINATIONS, sanitizeImageUrl } from './data.js';

const TRIPS_KEY = 'tripeasy_trips';
const ACTIVE_ID_KEY = 'tripeasy_active_id';
const USERNAME_KEY = 'tripeasy_username';
const USER_EMAIL_KEY = 'tripeasy_user_email';
const LOGGED_IN_KEY = 'tripeasy_logged_in';
const USERS_KEY = 'tripeasy_registered_users';
const SETTINGS_KEY = 'tripeasy_platform_settings';
const LOGS_KEY = 'tripeasy_admin_logs';

export const DEFAULT_PLATFORM_SETTINGS = {
  allowRegistrations: true,
  maintenanceMode: false,
  announcementText: '',
  defaultBudgetEconomic: 3500,
  defaultBudgetModerate: 8500,
  defaultBudgetLuxury: 18000,
  featuredDestinations: POPULAR_DESTINATIONS,
};

const DEFAULT_USERS = [
  {
    id: 'usr-admin-1',
    name: 'Administrador',
    email: 'admin@tripeasy.com',
    password: 'admin123',
    role: 'admin',
    status: 'active',
    createdAt: '2026-01-10',
  },
  {
    id: 'usr-alex-2',
    name: 'Alex',
    email: 'alex@tripeasy.com',
    password: 'password123',
    role: 'user',
    status: 'active',
    createdAt: '2026-02-14',
  },
  {
    id: 'usr-maria-3',
    name: 'Maria',
    email: 'maria@tripeasy.com',
    password: 'password123',
    role: 'user',
    status: 'active',
    createdAt: '2026-03-05',
  },
];

const DEFAULT_LOGS = [
  {
    id: 'log-1',
    timestamp: '2026-11-18 09:15',
    actor: 'Administrador',
    action: 'Inicializou parâmetros padrão da plataforma',
    target: 'Configurações Globais',
    category: 'system',
  },
  {
    id: 'log-2',
    timestamp: '2026-11-19 14:32',
    actor: 'Alex',
    action: 'Atualizou roteiro e checklist',
    target: 'Aventura no Rio',
    category: 'trip',
  },
  {
    id: 'log-3',
    timestamp: '2026-11-20 11:04',
    actor: 'Maria',
    action: 'Consultou orçamento de viagem',
    target: 'Aventura Londres',
    category: 'trip',
  },
];

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function normalizeUser(raw, index) {
  const email = raw.email || `usuario${index + 1}@tripeasy.com`;
  const isAdminEmail = email.toLowerCase() === 'admin@tripeasy.com';
  return {
    id: raw.id || `usr-${index}-${email.replace(/[^a-z0-9]/gi, '')}`,
    name: raw.name || 'Viajante',
    email,
    password: raw.password || 'password123',
    role: raw.role || (isAdminEmail ? 'admin' : 'user'),
    status: raw.status || 'active',
    createdAt: raw.createdAt || '2026-03-01',
  };
}

export function getPlatformUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    const seeded = clone(DEFAULT_USERS);
    localStorage.setItem(USERS_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seeded = clone(DEFAULT_USERS);
      localStorage.setItem(USERS_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const normalized = parsed.map((u, idx) => normalizeUser(u, idx));
    if (!normalized.some((u) => u.role === 'admin')) {
      normalized.unshift(clone(DEFAULT_USERS[0]));
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    const seeded = clone(DEFAULT_USERS);
    localStorage.setItem(USERS_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

export function savePlatformUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getPlatformSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    const seeded = clone(DEFAULT_PLATFORM_SETTINGS);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw);
    const dests =
      Array.isArray(parsed.featuredDestinations) && parsed.featuredDestinations.length > 0
        ? parsed.featuredDestinations.map((d) => ({
            ...d,
            image: sanitizeImageUrl(d.image, d.name),
          }))
        : clone(POPULAR_DESTINATIONS);

    return {
      ...clone(DEFAULT_PLATFORM_SETTINGS),
      ...parsed,
      featuredDestinations: dests,
    };
  } catch {
    return clone(DEFAULT_PLATFORM_SETTINGS);
  }
}

export function savePlatformSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getAdminLogs() {
  const raw = localStorage.getItem(LOGS_KEY);
  if (!raw) {
    const seeded = clone(DEFAULT_LOGS);
    localStorage.setItem(LOGS_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : clone(DEFAULT_LOGS);
  } catch {
    return clone(DEFAULT_LOGS);
  }
}

export function appendAdminLog(actor, action, target, category) {
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
    2,
    '0'
  )}`;
  const entry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp,
    actor,
    action,
    target,
    category,
  };
  const next = [entry, ...getAdminLogs()].slice(0, 80);
  localStorage.setItem(LOGS_KEY, JSON.stringify(next));
  return next;
}

export function clearAdminLogs() {
  localStorage.setItem(LOGS_KEY, JSON.stringify([]));
  return [];
}

export function loadTrips() {
  const raw = localStorage.getItem(TRIPS_KEY);
  if (!raw) {
    const seeded = clone(INITIAL_TRIPS);
    localStorage.setItem(TRIPS_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return clone(INITIAL_TRIPS);
    return parsed.map((t) => ({
      ...t,
      bannerImage: sanitizeImageUrl(t.bannerImage, t.destination || t.name),
    }));
  } catch {
    return clone(INITIAL_TRIPS);
  }
}

export function saveTrips(trips) {
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
}

export function loadSession() {
  return {
    isLoggedIn: localStorage.getItem(LOGGED_IN_KEY) === 'true',
    userName: localStorage.getItem(USERNAME_KEY) || 'Alex',
    userEmail: localStorage.getItem(USER_EMAIL_KEY) || 'alex@tripeasy.com',
    activeTripId: localStorage.getItem(ACTIVE_ID_KEY) || 'rio-adventure',
  };
}

export function saveSessionAuth({ isLoggedIn, userName, userEmail }) {
  if (isLoggedIn) {
    localStorage.setItem(LOGGED_IN_KEY, 'true');
    localStorage.setItem(USERNAME_KEY, userName);
    if (userEmail) localStorage.setItem(USER_EMAIL_KEY, userEmail);
  } else {
    localStorage.removeItem(LOGGED_IN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
  }
}

export function saveActiveTripId(id) {
  localStorage.setItem(ACTIVE_ID_KEY, id);
}

export function saveUserName(name) {
  localStorage.setItem(USERNAME_KEY, name);
}

export function resetAllPlatformData() {
  localStorage.removeItem(TRIPS_KEY);
  localStorage.removeItem(ACTIVE_ID_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.setItem(USERS_KEY, JSON.stringify(clone(DEFAULT_USERS)));
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(clone(DEFAULT_PLATFORM_SETTINGS)));
  localStorage.setItem(LOGS_KEY, JSON.stringify(clone(DEFAULT_LOGS)));
  const trips = clone(INITIAL_TRIPS);
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
  localStorage.setItem(ACTIVE_ID_KEY, 'rio-adventure');
  return {
    trips,
    activeTripId: 'rio-adventure',
    userName: 'Alex',
    platformSettings: clone(DEFAULT_PLATFORM_SETTINGS),
  };
}
