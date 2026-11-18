import { INITIAL_TRIPS } from './data.js';

const STORAGE_TRIPS_KEY = 'tripeasy_html_trips_v1';
const STORAGE_ACTIVE_ID_KEY = 'tripeasy_html_active_id_v1';

const EXPENSE_CATEGORIES = ['Alimentação', 'Transporte', 'Hospedagem', 'Atividades', 'Outros'];
const EXPENSE_COLORS = {
  Alimentação: '#F97316',
  Transporte: '#0D5C46',
  Hospedagem: '#2E8B57',
  Atividades: '#D97706',
  Outros: '#78716C',
};

const ACTIVITY_CATEGORIES = ['Passeio', 'Gastronomia', 'Transporte', 'Hospedagem', 'Lazer'];

// Estado da aplicação
const state = {
  trips: loadTrips(),
  activeTripId: loadActiveTripId(),
  activeTab: 'dashboard',
  roteiroDayFilter: 'all',
  editingActivityId: null,
  checklistFilter: 'todos',
  checklistSearch: '',
  expenseFilter: 'Tudo',
  editingDashboardBudget: false,
  editingExpensesBudget: false,
};

function loadTrips() {
  try {
    const raw = localStorage.getItem(STORAGE_TRIPS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback para dados iniciais
  }
  return structuredClone(INITIAL_TRIPS);
}

function loadActiveTripId() {
  const saved = localStorage.getItem(STORAGE_ACTIVE_ID_KEY);
  return saved || INITIAL_TRIPS[0].id;
}

function saveState() {
  localStorage.setItem(STORAGE_TRIPS_KEY, JSON.stringify(state.trips));
  localStorage.setItem(STORAGE_ACTIVE_ID_KEY, state.activeTripId);
}

function getActiveTrip() {
  return state.trips.find((t) => t.id === state.activeTripId) || state.trips[0];
}

function updateActiveTrip(updater) {
  const active = getActiveTrip();
  const updated = updater(active);
  state.trips = state.trips.map((t) => (t.id === updated.id ? updated : t));
  saveState();
  renderAll();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = String(text ?? '');
  return div.innerHTML;
}

function formatBRL(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// =========================================
// Navegação entre telas
// =========================================
function setActiveTab(tab) {
  state.activeTab = tab;

  document.querySelectorAll('[data-nav]').forEach((el) => {
    const isCurrent = el.getAttribute('data-nav') === tab;
    if (!el.classList.contains('brand-btn') && !el.classList.contains('btn') && !el.classList.contains('link-btn')) {
      el.classList.toggle('is-active', isCurrent);
    }
  });

  ['dashboard', 'roteiro', 'checklist', 'despesas'].forEach((id) => {
    const section = document.getElementById(`view-${id}`);
    if (section) {
      section.hidden = id !== tab;
      section.classList.toggle('is-active', id === tab);
    }
  });

  window.scrollTo({ top: 0, behavior: 'auto' });
}

// =========================================
// Renderização Global
// =========================================
function renderTripSelectorAndSidebar() {
  const trip = getActiveTrip();
  const selector = document.getElementById('trip-selector');
  if (selector) {
    selector.innerHTML = state.trips
      .map(
        (t) =>
          `<option value="${escapeHtml(t.id)}" ${t.id === trip.id ? 'selected' : ''}>${escapeHtml(t.name)}</option>`
      )
      .join('');
  }

  const sidebarSummary = document.getElementById('sidebar-trip-summary');
  if (sidebarSummary) {
    sidebarSummary.innerHTML = `
      <div class="sidebar-trip-row">
        <div class="sidebar-thumb">
          <img src="${escapeHtml(trip.bannerImage)}" alt="${escapeHtml(trip.destination)}" referrerpolicy="no-referrer" />
        </div>
        <div style="min-width: 0;">
          <p class="sidebar-trip-name">${escapeHtml(trip.name)}</p>
          <p class="sidebar-trip-dest">${escapeHtml(trip.destination)}</p>
        </div>
      </div>
    `;
  }

  const sidebarDates = document.getElementById('sidebar-trip-dates');
  if (sidebarDates) {
    sidebarDates.innerHTML = `
      <strong>Período da viagem</strong>
      <span class="tabular-nums">${escapeHtml(trip.startDate)} – ${escapeHtml(trip.endDate)}</span>
    `;
  }
}

// =========================================
// 1. Renderizar Dashboard
// =========================================
function renderDashboard() {
  const trip = getActiveTrip();

  document.getElementById('dashboard-title').textContent = trip.name;
  document.getElementById('dashboard-meta').textContent = `${trip.destination} · ${trip.startDate} até ${trip.endDate} · ${trip.travelersAdults} viajantes`;
  document.getElementById('dashboard-countdown-heading').innerHTML = `Faltam <span class="highlight tabular-nums">${trip.countdownDays} dias</span> para o embarque`;

  const factsEl = document.getElementById('dashboard-facts');
  const budgetFactHtml = state.editingDashboardBudget
    ? `
      <form id="dash-budget-form" class="dash-budget-form" novalidate>
        <input
          id="dash-budget-input"
          type="number"
          step="0.01"
          min="0"
          value="${Number(trip.budgetLimit)}"
          aria-label="Novo saldo planejado em reais"
          class="input dash-budget-input tabular-nums"
        />
        <button type="submit" class="btn btn-primary btn-sm">Salvar</button>
        <button type="button" id="dash-budget-cancel" class="link-btn link-btn-muted">Cancelar</button>
      </form>
    `
    : `
      <div class="fact-value-row">
        <p class="fact-value fact-value-brand tabular-nums">R$ ${formatBRL(trip.budgetLimit)}</p>
        <button type="button" id="dash-budget-edit" class="link-btn">Editar</button>
      </div>
    `;

  factsEl.innerHTML = `
    <div>
      <p class="fact-label">Estilo</p>
      <p class="fact-value">${escapeHtml(trip.tripStyle)}</p>
    </div>
    <div>
      <p class="fact-label">Perfil de Custo</p>
      <p class="fact-value">${escapeHtml(trip.budgetLevel)}</p>
    </div>
    <div>
      <p class="fact-label">Saldo Planejado</p>
      ${budgetFactHtml}
    </div>
  `;

  if (state.editingDashboardBudget) {
    const dashForm = document.getElementById('dash-budget-form');
    const dashInput = document.getElementById('dash-budget-input');
    const dashCancel = document.getElementById('dash-budget-cancel');

    dashCancel.addEventListener('click', () => {
      state.editingDashboardBudget = false;
      renderDashboard();
    });

    dashForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = parseFloat(dashInput.value.replace(',', '.'));
      if (Number.isNaN(val) || val < 0) {
        dashInput.focus();
        return;
      }
      state.editingDashboardBudget = false;
      updateActiveTrip((current) => ({ ...current, budgetLimit: val }));
    });
  } else {
    document.getElementById('dash-budget-edit').addEventListener('click', () => {
      state.editingDashboardBudget = true;
      renderDashboard();
      document.getElementById('dash-budget-input')?.focus();
    });
  }

  document.getElementById('dashboard-media').innerHTML = `
    <img src="${escapeHtml(trip.bannerImage)}" alt="Destino ${escapeHtml(trip.destination)}" referrerpolicy="no-referrer" />
    <div class="hero-media-scrim">
      <div>
        <small>Destino principal</small>
        <strong>${escapeHtml(trip.destination)}</strong>
      </div>
    </div>
  `;

  // Cálculos dos KPIs
  const totalDays = trip.itinerary.length;
  const totalActivities = trip.itinerary.reduce((sum, d) => sum + d.activities.length, 0);
  const totalTasks = trip.tasks.length;
  const doneTasks = trip.tasks.filter((t) => t.completed).length;
  const taskPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const totalSpent = trip.expenses.reduce((sum, e) => sum + Number(e.value), 0);
  const remaining = trip.budgetLimit - totalSpent;
  const spentPct = trip.budgetLimit > 0 ? Math.min(100, Math.round((totalSpent / trip.budgetLimit) * 100)) : 0;

  const kpiContainer = document.getElementById('dashboard-kpis');
  kpiContainer.innerHTML = `
    <button type="button" class="kpi-card" data-jump="roteiro">
      <p class="kpi-label">Roteiro Planejado</p>
      <p class="kpi-value tabular-nums">${totalActivities} atividades</p>
      <p class="kpi-note tabular-nums">Distribuídas em ${totalDays} ${totalDays === 1 ? 'dia' : 'dias'}</p>
    </button>
    <button type="button" class="kpi-card" data-jump="checklist">
      <p class="kpi-label">Checklist</p>
      <p class="kpi-value tabular-nums">${doneTasks} / ${totalTasks}</p>
      <p class="kpi-note tabular-nums">${taskPct}% dos preparativos concluídos</p>
    </button>
    <button type="button" class="kpi-card" data-jump="despesas">
      <p class="kpi-label">Total Gasto</p>
      <p class="kpi-value tabular-nums">R$ ${formatBRL(totalSpent)}</p>
      <p class="kpi-note tabular-nums">${spentPct}% do orçamento utilizado</p>
    </button>
    <button type="button" class="kpi-card" data-jump="despesas">
      <p class="kpi-label">Saldo Disponível</p>
      <p class="kpi-value tabular-nums ${remaining < 0 ? 'is-negative' : 'is-positive'}">R$ ${formatBRL(remaining)}</p>
      <p class="kpi-note">${remaining < 0 ? 'Acima do limite previsto' : 'Dentro do limite previsto'}</p>
    </button>
  `;

  kpiContainer.querySelectorAll('[data-jump]').forEach((btn) => {
    btn.addEventListener('click', () => setActiveTab(btn.getAttribute('data-jump')));
  });

  // Prévia das atividades
  const upcoming = trip.itinerary
    .slice()
    .sort((a, b) => a.dayNumber - b.dayNumber)
    .flatMap((day) => day.activities.map((act) => ({ ...act, dayNumber: day.dayNumber })))
    .slice(0, 4);

  const actPreviewEl = document.getElementById('dashboard-activities-preview');
  if (upcoming.length === 0) {
    actPreviewEl.innerHTML = `<p class="empty-state">Nenhuma atividade cadastrada ainda.</p>`;
  } else {
    actPreviewEl.innerHTML = `
      <ul class="simple-list">
        ${upcoming
          .map(
            (act) => `
          <li>
            <div class="preview-item-meta">
              <span class="preview-item-day">Dia ${act.dayNumber}</span>
              <span aria-hidden="true">·</span>
              <span class="tabular-nums">${escapeHtml(act.time)}</span>
              ${act.category ? `<span aria-hidden="true">·</span><span>${escapeHtml(act.category)}</span>` : ''}
            </div>
            <p class="preview-item-title">${escapeHtml(act.title)}</p>
            <p class="preview-item-desc">${escapeHtml(act.description)}</p>
          </li>
        `
          )
          .join('')}
      </ul>
    `;
  }

  // Prévia do checklist (interativa)
  const checkPreviewEl = document.getElementById('dashboard-checklist-preview');
  if (trip.tasks.length === 0) {
    checkPreviewEl.innerHTML = `<p class="empty-state">Nenhum item no checklist.</p>`;
  } else {
    checkPreviewEl.innerHTML = `
      <ul class="simple-list">
        ${trip.tasks
          .slice(0, 4)
          .map(
            (task) => `
          <li class="checklist-row">
            <div class="checklist-toggle-area" data-dash-toggle="${escapeHtml(task.id)}">
              <button
                type="button"
                role="checkbox"
                aria-checked="${task.completed}"
                class="check-box ${task.completed ? 'is-checked' : ''}"
              >${task.completed ? '✓' : ''}</button>
              <span class="checklist-item-title ${task.completed ? 'is-checked' : ''}">${escapeHtml(task.title)}</span>
            </div>
            <span class="checklist-item-meta">${escapeHtml(task.category || 'Outros')}</span>
          </li>
        `
          )
          .join('')}
      </ul>
    `;

    checkPreviewEl.querySelectorAll('[data-dash-toggle]').forEach((row) => {
      row.addEventListener('click', () => {
        toggleChecklistTask(row.getAttribute('data-dash-toggle'));
      });
    });
  }

  // Prévia dos últimos gastos
  const expPreviewEl = document.getElementById('dashboard-expenses-preview');
  if (trip.expenses.length === 0) {
    expPreviewEl.innerHTML = `<p class="empty-state">Nenhuma despesa registrada.</p>`;
  } else {
    expPreviewEl.innerHTML = `
      <ul class="simple-list">
        ${trip.expenses
          .slice(0, 4)
          .map(
            (exp) => `
          <li style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
            <div style="min-width:0;">
              <p class="preview-item-title" style="margin-top:0;">${escapeHtml(exp.description)}</p>
              <p class="preview-item-meta">${escapeHtml(exp.category)} · <span class="tabular-nums">${escapeHtml(exp.dateStr)}</span></p>
            </div>
            <strong class="tabular-nums" style="flex-shrink:0;">R$ ${formatBRL(exp.value)}</strong>
          </li>
        `
          )
          .join('')}
      </ul>
    `;
  }
}

// =========================================
// 2. Renderizar Roteiro
// =========================================
function renderRoteiro() {
  const trip = getActiveTrip();
  const sortedDays = trip.itinerary.slice().sort((a, b) => a.dayNumber - b.dayNumber);
  const nextDayNum = sortedDays.length > 0 ? sortedDays[sortedDays.length - 1].dayNumber + 1 : 1;
  const totalActivities = sortedDays.reduce((acc, d) => acc + d.activities.length, 0);

  document.getElementById('roteiro-subtitle').textContent = `${trip.name} · ${sortedDays.length} ${sortedDays.length === 1 ? 'dia' : 'dias'} · ${totalActivities} atividades`;
  document.getElementById('btn-add-day').textContent = `+ Adicionar Dia ${nextDayNum}`;

  // Select de dias no formulário
  const daySelect = document.getElementById('activity-day');
  const prevDayVal = daySelect.value;
  daySelect.innerHTML = `
    ${sortedDays
      .map((d) => `<option value="${d.dayNumber}">Dia ${d.dayNumber} (${escapeHtml(d.dateStr)})</option>`)
      .join('')}
    <option value="${nextDayNum}">Dia ${nextDayNum} (Novo dia)</option>
  `;
  if (prevDayVal && Array.from(daySelect.options).some((o) => o.value === prevDayVal)) {
    daySelect.value = prevDayVal;
  }

  // Filtros por dia
  const dayFiltersEl = document.getElementById('roteiro-day-filters');
  dayFiltersEl.innerHTML = `
    <button type="button" class="segment-btn ${state.roteiroDayFilter === 'all' ? 'is-active' : ''}" data-day-filter="all">
      Todos os dias
    </button>
    ${sortedDays
      .map(
        (d) => `
      <button type="button" class="segment-btn tabular-nums ${state.roteiroDayFilter === d.dayNumber ? 'is-active' : ''}" data-day-filter="${d.dayNumber}">
        Dia ${d.dayNumber}
      </button>
    `
      )
      .join('')}
  `;

  dayFiltersEl.querySelectorAll('[data-day-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-day-filter');
      state.roteiroDayFilter = val === 'all' ? 'all' : Number(val);
      renderRoteiro();
    });
  });

  // Listagem organizada por dia
  const daysContainer = document.getElementById('roteiro-days-list');
  const visibleDays =
    state.roteiroDayFilter === 'all'
      ? sortedDays
      : sortedDays.filter((d) => d.dayNumber === state.roteiroDayFilter);

  if (visibleDays.length === 0) {
    daysContainer.innerHTML = `
      <div class="card card-padded empty-state">
        Nenhum dia planejado ainda. Utilize o formulário acima para cadastrar sua primeira atividade.
      </div>
    `;
    return;
  }

  daysContainer.innerHTML = visibleDays
    .map((day) => {
      const activitiesHtml =
        day.activities.length === 0
          ? `<div class="empty-state">Nenhuma atividade cadastrada para este dia.</div>`
          : day.activities
              .map((act) => {
                if (state.editingActivityId === act.id) {
                  return `
                    <li class="activity-row">
                      <div class="edit-box" data-edit-box="${escapeHtml(act.id)}">
                        <div class="edit-row">
                          <input type="time" class="input tabular-nums" data-edit-time value="${escapeHtml(act.time)}" />
                          <select class="input" data-edit-category>
                            ${ACTIVITY_CATEGORIES.map(
                              (c) =>
                                `<option value="${c}" ${act.category === c ? 'selected' : ''}>${c}</option>`
                            ).join('')}
                          </select>
                          <input type="text" class="input" data-edit-title value="${escapeHtml(act.title)}" placeholder="Nome da atividade" />
                        </div>
                        <input type="text" class="input" data-edit-desc value="${escapeHtml(act.description)}" placeholder="Descrição" />
                        <div class="edit-actions">
                          <button type="button" class="btn btn-outline" data-cancel-edit>Cancelar</button>
                          <button type="button" class="btn btn-primary" data-save-edit="${day.dayNumber}" data-act-id="${escapeHtml(act.id)}">Salvar</button>
                        </div>
                      </div>
                    </li>
                  `;
                }

                return `
                  <li class="activity-row">
                    <div class="activity-main">
                      <span class="activity-time tabular-nums">${escapeHtml(act.time)}</span>
                      <div class="activity-content">
                        <div class="activity-title-line">
                          <h3 class="activity-title">${escapeHtml(act.title)}</h3>
                          ${act.category ? `<span class="activity-cat">· ${escapeHtml(act.category)}</span>` : ''}
                        </div>
                        <p class="activity-desc">${escapeHtml(act.description)}</p>
                      </div>
                    </div>
                    <div class="activity-actions">
                      <button type="button" class="icon-btn" data-start-edit="${escapeHtml(act.id)}" title="Editar atividade" aria-label="Editar ${escapeHtml(act.title)}">
                        ✎
                      </button>
                      <button type="button" class="icon-btn icon-btn-danger" data-delete-act="${escapeHtml(act.id)}" data-day-num="${day.dayNumber}" title="Excluir atividade" aria-label="Excluir ${escapeHtml(act.title)}">
                        ✕
                      </button>
                    </div>
                  </li>
                `;
              })
              .join('');

      return `
        <div class="card card-padded">
          <div class="day-header">
            <div class="day-title-group">
              <span class="day-badge-text">Dia ${day.dayNumber}</span>
              <span class="sep" aria-hidden="true">·</span>
              <span class="day-date-text">${escapeHtml(day.dateStr)}</span>
            </div>
            <span class="muted-label tabular-nums">${day.activities.length} ${day.activities.length === 1 ? 'atividade' : 'atividades'}</span>
          </div>
          <ul>${activitiesHtml}</ul>
        </div>
      `;
    })
    .join('');

  // Eventos de editar / salvar / excluir atividade
  daysContainer.querySelectorAll('[data-start-edit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.editingActivityId = btn.getAttribute('data-start-edit');
      renderRoteiro();
    });
  });

  daysContainer.querySelectorAll('[data-cancel-edit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.editingActivityId = null;
      renderRoteiro();
    });
  });

  daysContainer.querySelectorAll('[data-save-edit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dayNum = Number(btn.getAttribute('data-save-edit'));
      const actId = btn.getAttribute('data-act-id');
      const box = daysContainer.querySelector(`[data-edit-box="${actId}"]`);
      const newTitle = box.querySelector('[data-edit-title]').value.trim();
      const newDesc = box.querySelector('[data-edit-desc]').value.trim();
      const newTime = box.querySelector('[data-edit-time]').value;
      const newCategory = box.querySelector('[data-edit-category]').value;

      if (!newTitle) return;

      updateActiveTrip((current) => ({
        ...current,
        itinerary: current.itinerary.map((day) => {
          if (day.dayNumber !== dayNum) return day;
          const updatedActs = day.activities
            .map((a) =>
              a.id === actId
                ? { ...a, title: newTitle, description: newDesc, time: newTime, category: newCategory }
                : a
            )
            .sort((a, b) => a.time.localeCompare(b.time));
          return { ...day, activities: updatedActs };
        }),
      }));
      state.editingActivityId = null;
      renderRoteiro();
    });
  });

  daysContainer.querySelectorAll('[data-delete-act]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const actId = btn.getAttribute('data-delete-act');
      const dayNum = Number(btn.getAttribute('data-day-num'));
      updateActiveTrip((current) => ({
        ...current,
        itinerary: current.itinerary.map((day) =>
          day.dayNumber === dayNum
            ? { ...day, activities: day.activities.filter((a) => a.id !== actId) }
            : day
        ),
      }));
    });
  });
}

// =========================================
// 3. Renderizar Checklist
// =========================================
function toggleChecklistTask(taskId) {
  updateActiveTrip((current) => ({
    ...current,
    tasks: current.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
  }));
}

function renderChecklist() {
  const trip = getActiveTrip();
  const total = trip.tasks.length;
  const done = trip.tasks.filter((t) => t.completed).length;
  const pending = total - done;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  document.getElementById('checklist-subtitle').textContent = `${trip.name} · ${trip.destination}`;
  document.getElementById('checklist-counts-summary').textContent = `${done} concluídos · ${pending} pendentes`;
  document.getElementById('checklist-progress-pct').textContent = `${pct}%`;
  document.getElementById('checklist-progress-bar').style.width = `${pct}%`;

  const filtersEl = document.getElementById('checklist-status-filters');
  const filterTabs = [
    { id: 'todos', label: `Todos (${total})` },
    { id: 'pendentes', label: `Pendentes (${pending})` },
    { id: 'concluidos', label: `Concluídos (${done})` },
  ];

  filtersEl.innerHTML = filterTabs
    .map(
      (tab) => `
      <button type="button" class="segment-btn tabular-nums ${state.checklistFilter === tab.id ? 'is-active' : ''}" data-check-filter="${tab.id}">
        ${tab.label}
      </button>
    `
    )
    .join('');

  filtersEl.querySelectorAll('[data-check-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.checklistFilter = btn.getAttribute('data-check-filter');
      renderChecklist();
    });
  });

  const q = state.checklistSearch.trim().toLowerCase();
  const filteredTasks = trip.tasks.filter((t) => {
    const matchStatus =
      state.checklistFilter === 'todos' ||
      (state.checklistFilter === 'pendentes' && !t.completed) ||
      (state.checklistFilter === 'concluidos' && t.completed);
    const matchSearch =
      !q || t.title.toLowerCase().includes(q) || (t.category || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const listEl = document.getElementById('checklist-items-list');
  if (filteredTasks.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        ${total === 0 ? 'Seu checklist está vazio. Adicione o primeiro item acima.' : 'Nenhum item encontrado com os filtros atuais.'}
      </div>
    `;
    return;
  }

  listEl.innerHTML = `
    <ul class="simple-list">
      ${filteredTasks
        .map(
          (task) => `
        <li class="checklist-row">
          <div class="checklist-toggle-area" data-toggle-task="${escapeHtml(task.id)}">
            <button
              type="button"
              role="checkbox"
              aria-checked="${task.completed}"
              aria-label="${task.completed ? 'Desmarcar' : 'Marcar'} ${escapeHtml(task.title)}"
              class="check-box ${task.completed ? 'is-checked' : ''}"
            >${task.completed ? '✓' : ''}</button>
            <div class="checklist-text-btn">
              <span class="checklist-item-title ${task.completed ? 'is-checked' : ''}">${escapeHtml(task.title)}</span>
              <span class="checklist-item-meta">${escapeHtml(task.category || 'Outros')} · ${task.completed ? 'Concluído' : 'Pendente'}</span>
            </div>
          </div>
          <button
            type="button"
            class="icon-btn icon-btn-danger"
            data-delete-task="${escapeHtml(task.id)}"
            title="Remover item"
            aria-label="Remover ${escapeHtml(task.title)}"
          >
            ✕
          </button>
        </li>
      `
        )
        .join('')}
    </ul>
  `;

  listEl.querySelectorAll('[data-toggle-task]').forEach((el) => {
    el.addEventListener('click', () => {
      toggleChecklistTask(el.getAttribute('data-toggle-task'));
    });
  });

  listEl.querySelectorAll('[data-delete-task]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-delete-task');
      updateActiveTrip((current) => ({
        ...current,
        tasks: current.tasks.filter((t) => t.id !== id),
      }));
    });
  });
}

// =========================================
// 4. Renderizar Despesas
// =========================================
function renderDespesas() {
  const trip = getActiveTrip();
  const totalSpent = trip.expenses.reduce((sum, e) => sum + Number(e.value), 0);
  const limit = trip.budgetLimit;
  const remaining = limit - totalSpent;
  const pct = limit > 0 ? Math.min(100, Math.round((totalSpent / limit) * 100)) : 0;
  const avg = trip.expenses.length > 0 ? totalSpent / trip.expenses.length : 0;

  document.getElementById('despesas-subtitle').textContent = `${trip.name} · ${trip.destination}`;
  document.getElementById('expenses-pct-label').textContent = `${pct}% utilizado`;
  document.getElementById('expenses-total-value').textContent = `R$ ${formatBRL(totalSpent)}`;
  document.getElementById('expenses-limit-label').textContent = `de R$ ${formatBRL(limit)} planejados`;

  const budgetFormEl = document.getElementById('form-budget');
  const budgetEditBtn = document.getElementById('btn-edit-budget');
  const budgetInputEl = document.getElementById('budget-limit-input');
  const budgetErrEl = document.getElementById('budget-form-error');

  budgetFormEl.hidden = !state.editingExpensesBudget;
  budgetEditBtn.hidden = state.editingExpensesBudget;
  if (state.editingExpensesBudget) {
    budgetInputEl.value = String(limit);
  }
  budgetErrEl.hidden = true;

  const barEl = document.getElementById('expenses-progress-bar');
  barEl.style.width = `${pct}%`;
  barEl.classList.toggle('is-over', remaining < 0);

  document.getElementById('expenses-mini-stats').innerHTML = `
    <div>
      <p class="fact-label">Registros</p>
      <p class="fact-value tabular-nums">${trip.expenses.length} gastos</p>
    </div>
    <div>
      <p class="fact-label">Média por gasto</p>
      <p class="fact-value tabular-nums">R$ ${formatBRL(avg)}</p>
    </div>
    <div>
      <p class="fact-label">Saldo disponível</p>
      <p class="fact-value tabular-nums" style="color:${remaining < 0 ? 'var(--danger-600)' : 'var(--brand-700)'};">R$ ${formatBRL(remaining)}</p>
    </div>
  `;

  // Distribuição por categoria
  const breakdownEl = document.getElementById('expenses-categories-breakdown');
  breakdownEl.innerHTML = EXPENSE_CATEGORIES.map((cat) => {
    const catTotal = trip.expenses
      .filter((e) => e.category === cat)
      .reduce((s, e) => s + Number(e.value), 0);
    const catPct = totalSpent > 0 ? Math.round((catTotal / totalSpent) * 100) : 0;
    return `
      <div>
        <div class="category-bar-head">
          <span class="category-bar-name">${cat}</span>
          <span class="category-bar-val tabular-nums">R$ ${formatBRL(catTotal)} <span style="color:var(--stone-400);">(${catPct}%)</span></span>
        </div>
        <div class="category-bar-track">
          <div class="category-bar-fill" style="width:${catPct}%; background-color:${EXPENSE_COLORS[cat]};"></div>
        </div>
      </div>
    `;
  }).join('');

  // Filtros de categoria
  const filtersEl = document.getElementById('expenses-category-filters');
  filtersEl.innerHTML = ['Tudo', ...EXPENSE_CATEGORIES]
    .map(
      (cat) => `
      <button type="button" class="segment-btn ${state.expenseFilter === cat ? 'is-active' : ''}" data-exp-filter="${cat}">
        ${cat}
      </button>
    `
    )
    .join('');

  filtersEl.querySelectorAll('[data-exp-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.expenseFilter = btn.getAttribute('data-exp-filter');
      renderDespesas();
    });
  });

  // Listagem de gastos
  const filtered =
    state.expenseFilter === 'Tudo'
      ? trip.expenses
      : trip.expenses.filter((e) => e.category === state.expenseFilter);
  const filteredTotal = filtered.reduce((s, e) => s + Number(e.value), 0);

  document.getElementById('expenses-filtered-summary').textContent = `${filtered.length} ${filtered.length === 1 ? 'lançamento' : 'lançamentos'} · Total: R$ ${formatBRL(filteredTotal)}`;

  const listContainer = document.getElementById('expenses-list-container');
  if (filtered.length === 0) {
    listContainer.innerHTML = `<div class="empty-state">Nenhuma despesa registrada para esta categoria.</div>`;
    return;
  }

  listContainer.innerHTML = `
    <div class="table-wrap">
      <table class="expenses-table">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Categoria</th>
            <th>Data</th>
            <th class="col-right">Valor</th>
            <th class="col-right">Ação</th>
          </tr>
        </thead>
        <tbody>
          ${filtered
            .map(
              (exp) => `
            <tr>
              <td class="expense-desc-cell">${escapeHtml(exp.description)}</td>
              <td>${escapeHtml(exp.category)}</td>
              <td class="tabular-nums">${escapeHtml(exp.dateStr)}</td>
              <td class="col-right expense-amount-cell tabular-nums">R$ ${formatBRL(exp.value)}</td>
              <td class="col-right">
                <button
                  type="button"
                  class="icon-btn icon-btn-danger"
                  data-delete-expense="${escapeHtml(exp.id)}"
                  title="Excluir gasto"
                  aria-label="Excluir ${escapeHtml(exp.description)}"
                >
                  ✕
                </button>
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;

  listContainer.querySelectorAll('[data-delete-expense]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-delete-expense');
      updateActiveTrip((current) => ({
        ...current,
        expenses: current.expenses.filter((e) => e.id !== id),
      }));
    });
  });
}

function renderAll() {
  renderTripSelectorAndSidebar();
  renderDashboard();
  renderRoteiro();
  renderChecklist();
  renderDespesas();
}

// =========================================
// Inicialização e Eventos de Formulário
// =========================================
function init() {
  // Navegação por data-nav
  document.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      setActiveTab(btn.getAttribute('data-nav'));
    });
  });

  // Seletor de viagem
  document.getElementById('trip-selector').addEventListener('change', (e) => {
    state.activeTripId = e.target.value;
    state.roteiroDayFilter = 'all';
    state.editingActivityId = null;
    state.editingDashboardBudget = false;
    state.editingExpensesBudget = false;
    saveState();
    renderAll();
  });

  // Edição do saldo planejado na tela de Despesas
  document.getElementById('btn-edit-budget').addEventListener('click', () => {
    state.editingExpensesBudget = true;
    renderDespesas();
    document.getElementById('budget-limit-input')?.focus();
  });

  document.getElementById('btn-cancel-budget').addEventListener('click', () => {
    state.editingExpensesBudget = false;
    renderDespesas();
  });

  document.getElementById('form-budget').addEventListener('submit', (e) => {
    e.preventDefault();
    const inputEl = document.getElementById('budget-limit-input');
    const errorEl = document.getElementById('budget-form-error');
    const newLimit = parseFloat(inputEl.value.replace(',', '.'));

    if (Number.isNaN(newLimit) || newLimit < 0) {
      errorEl.textContent = 'Informe um valor válido maior ou igual a zero.';
      errorEl.hidden = false;
      inputEl.focus();
      return;
    }

    errorEl.hidden = true;
    state.editingExpensesBudget = false;
    updateActiveTrip((current) => ({ ...current, budgetLimit: newLimit }));
  });

  // Botão Adicionar Dia no Roteiro
  document.getElementById('btn-add-day').addEventListener('click', () => {
    const trip = getActiveTrip();
    const sorted = trip.itinerary.slice().sort((a, b) => a.dayNumber - b.dayNumber);
    const nextNum = sorted.length > 0 ? sorted[sorted.length - 1].dayNumber + 1 : 1;
    updateActiveTrip((current) => ({
      ...current,
      itinerary: [
        ...current.itinerary,
        { dayNumber: nextNum, dateStr: `Dia ${nextNum} do roteiro`, activities: [] },
      ],
    }));
    document.getElementById('activity-day').value = String(nextNum);
  });

  // Formulário de Atividade (Roteiro)
  document.getElementById('form-activity').addEventListener('submit', (e) => {
    e.preventDefault();
    const dayNumber = Number(document.getElementById('activity-day').value);
    const time = document.getElementById('activity-time').value || '09:00';
    const category = document.getElementById('activity-category').value;
    const titleInput = document.getElementById('activity-title');
    const descInput = document.getElementById('activity-desc');
    const errorEl = document.getElementById('activity-form-error');

    const title = titleInput.value.trim();
    if (!title) {
      errorEl.textContent = 'Informe o nome da atividade para cadastrar.';
      errorEl.hidden = false;
      titleInput.focus();
      return;
    }
    errorEl.hidden = true;

    const newActivity = {
      id: `act-${Date.now()}`,
      time,
      title,
      description: descInput.value.trim() || 'Sem observações adicionais.',
      category,
    };

    updateActiveTrip((current) => {
      const exists = current.itinerary.some((d) => d.dayNumber === dayNumber);
      let updatedItinerary;
      if (exists) {
        updatedItinerary = current.itinerary.map((day) => {
          if (day.dayNumber !== dayNumber) return day;
          const acts = [...day.activities, newActivity].sort((a, b) => a.time.localeCompare(b.time));
          return { ...day, activities: acts };
        });
      } else {
        updatedItinerary = [
          ...current.itinerary,
          { dayNumber, dateStr: `Dia ${dayNumber} do roteiro`, activities: [newActivity] },
        ].sort((a, b) => a.dayNumber - b.dayNumber);
      }
      return { ...current, itinerary: updatedItinerary };
    });

    titleInput.value = '';
    descInput.value = '';
  });

  // Formulário do Checklist
  document.getElementById('form-checklist').addEventListener('submit', (e) => {
    e.preventDefault();
    const titleInput = document.getElementById('checklist-item-title');
    const category = document.getElementById('checklist-item-category').value;
    const errorEl = document.getElementById('checklist-form-error');

    const title = titleInput.value.trim();
    if (!title) {
      errorEl.textContent = 'Informe o nome do item para adicionar ao checklist.';
      errorEl.hidden = false;
      titleInput.focus();
      return;
    }
    errorEl.hidden = true;

    const newItem = {
      id: `task-${Date.now()}`,
      title,
      completed: false,
      category,
    };

    updateActiveTrip((current) => ({
      ...current,
      tasks: [newItem, ...current.tasks],
    }));

    titleInput.value = '';
  });

  // Busca e ações em massa no Checklist
  document.getElementById('checklist-search').addEventListener('input', (e) => {
    state.checklistSearch = e.target.value;
    renderChecklist();
  });

  document.getElementById('btn-check-all').addEventListener('click', () => {
    updateActiveTrip((current) => ({
      ...current,
      tasks: current.tasks.map((t) => ({ ...t, completed: true })),
    }));
  });

  document.getElementById('btn-uncheck-all').addEventListener('click', () => {
    updateActiveTrip((current) => ({
      ...current,
      tasks: current.tasks.map((t) => ({ ...t, completed: false })),
    }));
  });

  // Data padrão no formulário de despesas
  const dateInput = document.getElementById('expense-date');
  dateInput.value = new Date().toLocaleDateString('pt-BR');

  // Formulário de Despesas
  document.getElementById('form-expense').addEventListener('submit', (e) => {
    e.preventDefault();
    const descInput = document.getElementById('expense-desc');
    const valInput = document.getElementById('expense-value');
    const cat = document.getElementById('expense-category').value;
    const errorEl = document.getElementById('expense-form-error');

    const desc = descInput.value.trim();
    const value = parseFloat(valInput.value.replace(',', '.'));

    if (!desc) {
      errorEl.textContent = 'Informe a descrição do gasto.';
      errorEl.hidden = false;
      descInput.focus();
      return;
    }
    if (Number.isNaN(value) || value <= 0) {
      errorEl.textContent = 'Informe um valor numérico maior que zero.';
      errorEl.hidden = false;
      valInput.focus();
      return;
    }
    errorEl.hidden = true;

    const newExpense = {
      id: `exp-${Date.now()}`,
      description: desc,
      category: cat,
      value,
      dateStr: dateInput.value.trim() || new Date().toLocaleDateString('pt-BR'),
    };

    updateActiveTrip((current) => ({
      ...current,
      expenses: [newExpense, ...current.expenses],
    }));

    descInput.value = '';
    valInput.value = '';
  });

  renderAll();
  setActiveTab('dashboard');
}

document.addEventListener('DOMContentLoaded', init);
