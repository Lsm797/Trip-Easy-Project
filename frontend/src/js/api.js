// Comunicação com o backend (Spring Boot). Em desenvolvimento, o Vite encaminha
// /api para http://localhost:8080 (ver vite.config.js), então o cookie de sessão
// funciona sem CORS.

const NAMES_KEY = 'tripeasy_known_names';

async function request(method, path, body) {
  let res;
  try {
    res = await fetch(path, {
      method,
      credentials: 'same-origin',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    const err = new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
    err.status = 0;
    throw err;
  }

  const text = await res.text();
  if (!res.ok) {
    let message = (text || '').trim();
    if (res.status === 403 && !message) message = 'Sua sessão expirou. Entre novamente.';
    if (!message) message = `Erro ${res.status} ao falar com o servidor.`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ---- usuários ----
export const apiRegister = (nome, email, senha) => request('POST', '/api/usuarios/cadastro', { nome, email, senha });
export const apiLogin = (email, senha) => request('POST', '/api/usuarios/login', { email, senha });
export const apiLogout = () => request('POST', '/api/usuarios/logout');
export const apiRequestPasswordReset = (email) => request('POST', '/api/usuarios/recuperar-senha', { email });
export const apiResetPassword = (email, codigo, novaSenha) =>
  request('POST', '/api/usuarios/redefinir-senha', { email, codigo, novaSenha });

// ---- viagens ----
export const apiListTrips = () => request('GET', '/api/viagens');
export const apiGetTrip = (id) => request('GET', `/api/viagens/${id}`);
export const apiCreateTrip = (body) => request('POST', '/api/viagens', body);
export const apiUpdateTrip = (id, body) => request('PUT', `/api/viagens/${id}`, body);
export const apiDeleteTrip = (id) => request('DELETE', `/api/viagens/${id}`);

// ---- atividades (roteiro) ----
export const apiListActivities = (tripId) => request('GET', `/api/viagens/${tripId}/atividades`);
export const apiCreateActivity = (tripId, body) => request('POST', `/api/viagens/${tripId}/atividades`, body);
export const apiUpdateActivity = (id, body) => request('PUT', `/api/atividades/${id}`, body);
export const apiDeleteActivity = (id) => request('DELETE', `/api/atividades/${id}`);

// ---- checklist ----
export const apiListChecklist = (tripId) => request('GET', `/api/viagens/${tripId}/checklist`);
export const apiCreateChecklistItem = (tripId, body) => request('POST', `/api/viagens/${tripId}/checklist`, body);
export const apiSetChecklistDone = (id, concluido) => request('PATCH', `/api/checklist/${id}/concluido`, { concluido });
export const apiDeleteChecklistItem = (id) => request('DELETE', `/api/checklist/${id}`);

// ---- despesas ----
export const apiListExpenses = (tripId) => request('GET', `/api/viagens/${tripId}/despesas`);
export const apiCreateExpense = (tripId, body) => request('POST', `/api/viagens/${tripId}/despesas`, body);
export const apiUpdateExpense = (id, body) => request('PUT', `/api/despesas/${id}`, body);
export const apiDeleteExpense = (id) => request('DELETE', `/api/despesas/${id}`);

// ---- nome do usuário (o backend não devolve o nome no login) ----
function readNames() {
  try {
    return JSON.parse(localStorage.getItem(NAMES_KEY) || '{}');
  } catch {
    return {};
  }
}

export function rememberUserName(email, name) {
  const names = readNames();
  names[(email || '').toLowerCase()] = name;
  localStorage.setItem(NAMES_KEY, JSON.stringify(names));
}

export function knownUserName(email) {
  const stored = readNames()[(email || '').toLowerCase()];
  if (stored) return stored;
  const prefix = (email || '').split('@')[0] || 'Viajante';
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
}
