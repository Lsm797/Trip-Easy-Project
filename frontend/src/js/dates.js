const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const pad = (n) => String(n).padStart(2, '0');

function utcMs(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export function todayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function isValidIso(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return false;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function isoToBr(iso) {
  if (!isValidIso(iso)) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// 'dd/mm/aaaa' -> 'aaaa-mm-dd' (ou null se inválida)
export function brToIso(br) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec((br || '').trim());
  if (!match) return null;
  const iso = `${match[3]}-${pad(match[2])}-${pad(match[1])}`;
  return isValidIso(iso) ? iso : null;
}

export function addDaysIso(iso, days) {
  const dt = new Date(utcMs(iso) + days * 86400000);
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

// quantos dias de a até b (b - a)
export function diffDaysIso(a, b) {
  return Math.round((utcMs(b) - utcMs(a)) / 86400000);
}

export function countdownFromIso(iso) {
  if (!isValidIso(iso)) return 0;
  return Math.max(0, diffDaysIso(todayIso(), iso));
}

// '2026-12-14' -> '14 de Dezembro, 2026'
export function formatLongDate(iso) {
  if (!isValidIso(iso)) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} de ${MONTHS[m - 1]}, ${y}`;
}

// '2026-12-14' -> '14 de Dezembro, Segunda'
export function formatDayLabel(iso) {
  if (!isValidIso(iso)) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${d} de ${MONTHS[m - 1]}, ${weekday}`;
}

// '09:00 AM' / '02:30 PM' / '14:30' -> 'HH:mm' (ou null)
export function to24h(text) {
  const raw = (text || '').trim().toUpperCase();
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/.exec(raw);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const suffix = match[3];
  if (minutes > 59) return null;
  if (suffix) {
    if (hours < 1 || hours > 12) return null;
    if (suffix === 'AM' && hours === 12) hours = 0;
    if (suffix === 'PM' && hours !== 12) hours += 12;
  } else if (hours > 23) {
    return null;
  }
  return `${pad(hours)}:${pad(minutes)}`;
}

// 'HH:mm' ou 'HH:mm:ss' -> '02:30 PM'
export function from24h(text) {
  const match = /^(\d{1,2}):(\d{2})/.exec(text || '');
  if (!match) return '';
  const hours = Number(match[1]);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${pad(h12)}:${match[2]} ${suffix}`;
}

export function defaultWizardDates() {
  const start = addDaysIso(todayIso(), 30);
  const end = addDaysIso(start, 8);
  return { startDate: isoToBr(start), endDate: isoToBr(end) };
}

// Valida o período do assistente de criação. Retorna mensagem de erro ou ''.
export function validateTripPeriod(startBr, endBr) {
  const start = brToIso(startBr);
  const end = brToIso(endBr);
  if (!start || !end) return 'Use datas válidas no formato dd/mm/aaaa.';
  if (start < todayIso()) return 'A data de ida não pode estar no passado.';
  if (end < start) return 'A data de volta não pode ser anterior à data de ida.';
  return '';
}
