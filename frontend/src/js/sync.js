// Converte entre o modelo do frontend e o da API, e envia as mudanças ao backend.
import {
  apiCreateActivity, apiCreateChecklistItem, apiCreateExpense, apiCreateTrip,
  apiDeleteActivity, apiDeleteChecklistItem, apiDeleteExpense,
  apiGetTrip, apiListActivities, apiListChecklist, apiListExpenses, apiListTrips,
  apiSetChecklistDone, apiUpdateActivity, apiUpdateExpense, apiUpdateTrip,
} from './api.js';
import { resolveDestinationImage } from './data.js';
import {
  addDaysIso, brToIso, countdownFromIso, diffDaysIso, formatDayLabel, formatLongDate,
  from24h, isoToBr, isValidIso, to24h, todayIso,
} from './dates.js';

const EXTRAS_KEY = 'tripeasy_trip_extras';

const CATEGORY_TO_API = {
  Alimentação: 'ALIMENTACAO',
  Transporte: 'TRANSPORTE',
  Hospedagem: 'HOSPEDAGEM',
  Atividades: 'PASSEIOS',
  Outros: 'OUTROS',
};
const CATEGORY_FROM_API = Object.fromEntries(Object.entries(CATEGORY_TO_API).map(([k, v]) => [v, k]));

const DEFAULT_EXTRAS = { travelersAdults: 1, travelersChildren: 0, tripStyle: 'Solo', budgetLevel: 'Econômico' };

// ---- campos que o backend não guarda (viajantes, estilo...) ficam só neste navegador ----
function readExtras() {
  try {
    return JSON.parse(localStorage.getItem(EXTRAS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveExtras(tripId, trip) {
  const all = readExtras();
  all[tripId] = {
    travelersAdults: trip.travelersAdults ?? DEFAULT_EXTRAS.travelersAdults,
    travelersChildren: trip.travelersChildren ?? DEFAULT_EXTRAS.travelersChildren,
    tripStyle: trip.tripStyle || DEFAULT_EXTRAS.tripStyle,
    budgetLevel: trip.budgetLevel || DEFAULT_EXTRAS.budgetLevel,
  };
  localStorage.setItem(EXTRAS_KEY, JSON.stringify(all));
}

// ---- API -> frontend ----
function buildItinerary(activities, startIso) {
  const base = isValidIso(startIso) ? startIso : todayIso();
  const withDay = activities
    .map((a) => ({ a, dayNumber: diffDaysIso(base, a.data) + 1 }))
    .filter((x) => x.dayNumber >= 1);
  const maxDay = withDay.reduce((max, x) => Math.max(max, x.dayNumber), 0);

  const days = [];
  for (let n = 1; n <= maxDay; n += 1) {
    const dayIso = addDaysIso(base, n - 1);
    const items = withDay
      .filter((x) => x.dayNumber === n)
      .sort((x, y) => String(x.a.horario || '').localeCompare(String(y.a.horario || '')))
      .map(({ a }) => ({
        id: String(a.id),
        time: from24h(a.horario),
        title: a.titulo,
        description: a.observacao || '',
        location: a.local || '',
        icon: 'compass',
      }));
    days.push({ dayNumber: n, dateStr: formatDayLabel(dayIso), activities: items });
  }
  return days;
}

function fromApi(viagem, atividades, checklist, despesas) {
  const id = String(viagem.id);
  const extras = { ...DEFAULT_EXTRAS, ...(readExtras()[id] || {}) };
  return {
    id,
    name: viagem.nome,
    destination: viagem.destino,
    startDate: isoToBr(viagem.dataIda),
    endDate: isoToBr(viagem.dataVolta),
    countdownDays: countdownFromIso(viagem.dataIda),
    bannerImage: resolveDestinationImage(viagem.destino),
    budgetLimit: Number(viagem.orcamento) || 0,
    ...extras,
    tasks: checklist.map((c) => ({
      id: String(c.id),
      title: c.descricao,
      completed: Boolean(c.concluido),
      category: c.categoria || 'Outros',
    })),
    itinerary: buildItinerary(atividades, viagem.dataIda),
    expenses: despesas.map((d) => ({
      id: String(d.id),
      description: d.descricao,
      value: Number(d.valor) || 0,
      category: CATEGORY_FROM_API[d.categoria] || 'Outros',
      dateIso: d.data,
      dateStr: formatLongDate(d.data),
    })),
  };
}

export async function fetchTrip(id) {
  const [viagem, atividades, checklist, despesas] = await Promise.all([
    apiGetTrip(id),
    apiListActivities(id),
    apiListChecklist(id),
    apiListExpenses(id),
  ]);
  return fromApi(viagem, atividades, checklist, despesas);
}

export async function loadAllTrips() {
  const viagens = await apiListTrips();
  return Promise.all(
    viagens.map(async (v) => {
      const [atividades, checklist, despesas] = await Promise.all([
        apiListActivities(v.id),
        apiListChecklist(v.id),
        apiListExpenses(v.id),
      ]);
      return fromApi(v, atividades, checklist, despesas);
    })
  );
}

// ---- frontend -> API ----
function tripBody(trip) {
  return {
    nome: String(trip.name || '').slice(0, 100),
    destino: String(trip.destination || '').slice(0, 150),
    dataIda: brToIso(trip.startDate),
    dataVolta: brToIso(trip.endDate),
    orcamento: Number(trip.budgetLimit) || 0,
  };
}

function startIsoOf(trip) {
  return brToIso(trip.startDate) || todayIso();
}

function activityBody(trip, dayNumber, act) {
  return {
    data: addDaysIso(startIsoOf(trip), dayNumber - 1),
    horario: to24h(act.time),
    titulo: String(act.title || '').trim().slice(0, 150),
    local: String(act.location || '').trim().slice(0, 150) || null,
    observacao: act.description || null,
  };
}

function expenseBody(exp) {
  const iso = isValidIso(exp.dateIso) ? exp.dateIso : todayIso();
  return {
    descricao: String(exp.description || '').trim().slice(0, 150),
    valor: Number(exp.value),
    data: iso,
    categoria: CATEGORY_TO_API[exp.category] || 'OUTROS',
  };
}

function flattenActivities(trip) {
  const map = new Map();
  for (const day of trip.itinerary || []) {
    for (const act of day.activities || []) {
      map.set(act.id, { dayNumber: day.dayNumber, act });
    }
  }
  return map;
}

function tripFieldsChanged(a, b) {
  return (
    a.name !== b.name ||
    a.destination !== b.destination ||
    a.startDate !== b.startDate ||
    a.endDate !== b.endDate ||
    Number(a.budgetLimit) !== Number(b.budgetLimit)
  );
}

// Compara a viagem antiga (já confirmada pelo servidor) com a nova e envia só o que mudou.
export async function syncTripChanges(oldTrip, newTrip) {
  const id = oldTrip.id;

  // se a data de ida mudou, as atividades precisam ser regravadas com as novas datas
  const startChanged = oldTrip.startDate !== newTrip.startDate;

  if (tripFieldsChanged(oldTrip, newTrip)) {
    await apiUpdateTrip(id, tripBody(newTrip));
  }

  // checklist
  const oldTasks = new Map((oldTrip.tasks || []).map((t) => [t.id, t]));
  const newTasks = newTrip.tasks || [];
  const newTaskIds = new Set(newTasks.map((t) => t.id));
  for (const t of oldTrip.tasks || []) {
    if (!newTaskIds.has(t.id)) await apiDeleteChecklistItem(t.id);
  }
  for (const t of newTasks) {
    const before = oldTasks.get(t.id);
    if (!before) {
      const created = await apiCreateChecklistItem(id, {
        descricao: String(t.title || '').trim().slice(0, 150),
        categoria: t.category || 'Outros',
      });
      if (t.completed) await apiSetChecklistDone(created.id, true);
    } else if (Boolean(before.completed) !== Boolean(t.completed)) {
      await apiSetChecklistDone(t.id, Boolean(t.completed));
    }
  }

  // itinerário
  const oldActs = flattenActivities(oldTrip);
  const newActs = flattenActivities(newTrip);
  for (const [actId] of oldActs) {
    if (!newActs.has(actId)) await apiDeleteActivity(actId);
  }
  for (const [actId, { dayNumber, act }] of newActs) {
    const before = oldActs.get(actId);
    if (!before) {
      await apiCreateActivity(id, activityBody(newTrip, dayNumber, act));
    } else if (
      before.dayNumber !== dayNumber ||
      before.act.title !== act.title ||
      before.act.description !== act.description ||
      (before.act.location || '') !== (act.location || '') ||
      before.act.time !== act.time ||
      startChanged
    ) {
      await apiUpdateActivity(actId, activityBody(newTrip, dayNumber, act));
    }
  }

  // despesas
  const oldExp = new Map((oldTrip.expenses || []).map((e) => [e.id, e]));
  const newExp = newTrip.expenses || [];
  const newExpIds = new Set(newExp.map((e) => e.id));
  for (const e of oldTrip.expenses || []) {
    if (!newExpIds.has(e.id)) await apiDeleteExpense(e.id);
  }
  for (const e of newExp) {
    const before = oldExp.get(e.id);
    if (!before) {
      await apiCreateExpense(id, expenseBody(e));
    } else if (
      before.description !== e.description ||
      Number(before.value) !== Number(e.value) ||
      before.category !== e.category ||
      before.dateIso !== e.dateIso
    ) {
      await apiUpdateExpense(e.id, expenseBody(e));
    }
  }
}

// Cria a viagem no servidor (com os itens iniciais do assistente) e devolve ela já com os IDs reais.
export async function createTripOnServer(newTrip) {
  const created = await apiCreateTrip(tripBody(newTrip));
  const id = String(created.id);
  saveExtras(id, newTrip);

  for (const t of newTrip.tasks || []) {
    const item = await apiCreateChecklistItem(id, {
      descricao: String(t.title || '').trim().slice(0, 150),
      categoria: t.category || 'Outros',
    });
    if (t.completed) await apiSetChecklistDone(item.id, true);
  }
  for (const day of newTrip.itinerary || []) {
    for (const act of day.activities || []) {
      await apiCreateActivity(id, activityBody(newTrip, day.dayNumber, act));
    }
  }
  for (const e of newTrip.expenses || []) {
    await apiCreateExpense(id, expenseBody(e));
  }
  return fetchTrip(id);
}
