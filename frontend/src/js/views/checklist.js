import { icon } from '../icons.js';
import { escapeHtml } from '../utils.js';

export const CHECKLIST_CATEGORIES = ['Documentos', 'Bagagem', 'Reservas', 'Saúde', 'Outros'];

const CATEGORY_COLORS = {
  Documentos: '#0D5C46',
  Bagagem: '#F97316',
  Reservas: '#F59E0B',
  Saúde: '#2E8B57',
  Outros: '#78716C',
};

function categoryOf(task) {
  return CHECKLIST_CATEGORIES.includes(task.category) ? task.category : 'Outros';
}

export function renderChecklistView(state, activeTrip) {
  if (!activeTrip) {
    return `
      <div class="empty-state-card animate-fade-in">
        <div style="color:var(--brand-600);">${icon('checkSquare', 'icon-2xl')}</div>
        <h2 style="margin:0;font-size:1.25rem;font-weight:800;color:var(--stone-900);">Sem checklist ativo</h2>
        <p style="margin:0;color:var(--stone-500);max-width:380px;font-size:0.85rem;">
          É necessário ter uma viagem ativa criada para organizar o checklist.
        </p>
        <button type="button" class="btn btn-primary" style="margin-top:0.75rem;" data-nav="nova-viagem">
          Criar Nova Viagem
        </button>
      </div>
    `;
  }

  const tasks = activeTrip.tasks || [];
  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const pending = total - done;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const catFilter = state.checklistCategory || 'Tudo';
  const statusFilter = state.checklistStatus || 'todos';
  const search = (state.checklistSearch || '').trim().toLowerCase();

  const visible = tasks.filter((t) => {
    if (catFilter !== 'Tudo' && categoryOf(t) !== catFilter) return false;
    if (statusFilter === 'pendentes' && t.completed) return false;
    if (statusFilter === 'concluidos' && !t.completed) return false;
    if (search && !t.title.toLowerCase().includes(search)) return false;
    return true;
  });

  const draft = state.checklistDraft || { title: '', category: 'Bagagem' };

  return `
    <div class="stack-lg animate-fade-in">
      <div class="page-header" style="margin-bottom:0;">
        <div>
          <span class="page-kicker" style="font-size:0.65rem;">Preparação</span>
          <h1 class="page-title" style="font-size:1.85rem;">Checklist da Viagem</h1>
          <p class="page-subtitle">
            Tudo o que precisa ficar pronto antes de embarcar em "${escapeHtml(activeTrip.name)}"
          </p>
        </div>
        <div class="row-gap">
          <button type="button" class="btn btn-secondary" data-action="checklist-check-all" ${total === 0 || pending === 0 ? 'disabled' : ''}>
            ${icon('checkCircle', 'icon-sm')}
            <span>Marcar todos</span>
          </button>
          <button type="button" class="btn btn-secondary" data-action="checklist-uncheck-all" ${done === 0 ? 'disabled' : ''}>
            ${icon('refresh', 'icon-sm')}
            <span>Desmarcar todos</span>
          </button>
        </div>
      </div>

      <div class="surface-card">
        <div class="row-between">
          <h3 class="card-label">Progresso</h3>
          <span class="tabular-nums" style="font-size:0.75rem;font-weight:700;color:var(--stone-500);">
            ${pending} ${pending === 1 ? 'pendente' : 'pendentes'}
          </span>
        </div>
        <div style="margin-top:1rem;">
          <span class="tabular-nums" style="font-size:2.2rem;font-weight:900;color:var(--brand-600);letter-spacing:-0.025em;">${pct}%</span>
          <span class="tabular-nums" style="font-size:0.78rem;font-weight:600;color:var(--stone-400);margin-left:0.4rem;">
            ${done} de ${total} concluídos
          </span>
        </div>
        <div class="progress-track" style="margin-top:0.85rem;">
          <div class="progress-fill" style="width:${pct}%;background-color:var(--brand-600);"></div>
        </div>
      </div>

      <div class="surface-card">
        <h3 style="margin:0 0 1rem;font-size:0.95rem;font-weight:800;color:var(--stone-900);">Adicionar item</h3>
        <form id="checklist-add-form" class="row-gap" style="align-items:stretch;">
          <input
            type="text"
            id="checklist-new-title"
            name="title"
            class="field-input"
            style="flex:1;min-width:200px;"
            placeholder="Ex: Comprar adaptador de tomada"
            maxlength="150"
            value="${escapeHtml(draft.title)}"
          />
          <select id="checklist-new-category" name="category" class="field-select" style="width:auto;min-width:150px;">
            ${CHECKLIST_CATEGORIES.map(
              (c) => `<option value="${c}" ${draft.category === c ? 'selected' : ''}>${c}</option>`
            ).join('')}
          </select>
          <button type="submit" class="btn btn-sunset" id="checklist-add-btn">
            ${icon('plus', 'icon-sm')}
            <span>Adicionar</span>
          </button>
        </form>
        ${state.checklistError ? `<p style="margin:0.6rem 0 0;font-size:0.76rem;font-weight:700;color:var(--red-600);">${escapeHtml(state.checklistError)}</p>` : ''}
      </div>

      <div class="surface-card">
        <div class="row-between" style="padding-bottom:1rem;border-bottom:1px solid var(--stone-100);margin-bottom:1.25rem;">
          <h3 style="margin:0;font-size:0.95rem;font-weight:800;color:var(--stone-900);">Seus itens</h3>
          <div class="row-gap">
            <div class="segmented-bar">
              ${[
                ['todos', 'Todos'],
                ['pendentes', 'Pendentes'],
                ['concluidos', 'Concluídos'],
              ]
                .map(
                  ([id, label]) => `
                <button type="button" class="seg-btn ${statusFilter === id ? 'is-active' : ''}" data-action="checklist-status" data-status="${id}">
                  ${label}
                </button>`
                )
                .join('')}
            </div>
          </div>
        </div>

        <div class="row-between" style="margin-bottom:1.1rem;">
          <div class="segmented-bar">
            ${['Tudo', ...CHECKLIST_CATEGORIES]
              .map(
                (c) => `
              <button type="button" class="seg-btn ${catFilter === c ? 'is-active' : ''}" data-action="checklist-category" data-cat="${c}">
                ${c}
              </button>`
              )
              .join('')}
          </div>
          <input
            type="search"
            id="checklist-search"
            class="field-input"
            style="width:220px;height:38px;"
            placeholder="Buscar item..."
            value="${escapeHtml(state.checklistSearch || '')}"
          />
        </div>

        <div class="stack-sm">
          ${visible.length === 0
            ? `
            <p style="text-align:center;padding:2.5rem 1rem;color:var(--stone-400);font-size:0.8rem;">
              ${total === 0 ? 'Nenhum item ainda. Adicione o primeiro acima!' : 'Nenhum item encontrado com esses filtros.'}
            </p>`
            : visible
                .map((task) => {
                  const cat = categoryOf(task);
                  return `
            <div class="task-row ${task.completed ? 'is-done' : ''}">
              <label class="task-row__main">
                <input type="checkbox" ${task.completed ? 'checked' : ''} data-action="checklist-toggle" data-task-id="${escapeHtml(task.id)}" />
                <span class="task-row__text">
                  <span class="task-row__title">${escapeHtml(task.title)}</span>
                  <span class="task-row__meta">
                    <span style="width:8px;height:8px;border-radius:9999px;background:${CATEGORY_COLORS[cat]};display:inline-block;"></span>
                    ${cat} · ${task.completed ? 'Concluído' : 'Pendente'}
                  </span>
                </span>
              </label>
              <button type="button" class="btn btn-danger-soft btn-sm" data-action="checklist-delete" data-task-id="${escapeHtml(task.id)}">
                Excluir
              </button>
            </div>`;
                })
                .join('')}
        </div>
      </div>
    </div>
  `;
}

export function bindChecklistEvents(container, state, activeTrip, { updateState, onUpdateTrip }) {
  if (!activeTrip) return;

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn || btn.disabled) return;
    const action = btn.dataset.action;
    const tasks = activeTrip.tasks || [];

    if (action === 'checklist-category') {
      updateState({ checklistCategory: btn.dataset.cat });
    } else if (action === 'checklist-status') {
      updateState({ checklistStatus: btn.dataset.status });
    } else if (action === 'checklist-delete') {
      const id = btn.dataset.taskId;
      onUpdateTrip({ ...activeTrip, tasks: tasks.filter((t) => t.id !== id) });
    } else if (action === 'checklist-check-all') {
      onUpdateTrip({ ...activeTrip, tasks: tasks.map((t) => ({ ...t, completed: true })) });
    } else if (action === 'checklist-uncheck-all') {
      onUpdateTrip({ ...activeTrip, tasks: tasks.map((t) => ({ ...t, completed: false })) });
    }
  });

  container.addEventListener('change', (e) => {
    const cb = e.target.closest('[data-action="checklist-toggle"]');
    if (!cb) return;
    const id = cb.dataset.taskId;
    onUpdateTrip({
      ...activeTrip,
      tasks: (activeTrip.tasks || []).map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    });
  });

  const search = container.querySelector('#checklist-search');
  if (search) {
    search.addEventListener('input', () => {
      updateState({ checklistSearch: search.value }, () => {
        const el = document.getElementById('checklist-search');
        if (el) {
          el.focus();
          el.setSelectionRange(el.value.length, el.value.length);
        }
      });
    });
  }

  const form = container.querySelector('#checklist-add-form');
  if (form) {
    const titleInput = form.querySelector('#checklist-new-title');
    const catSelect = form.querySelector('#checklist-new-category');
    const saveDraft = () => {
      state.checklistDraft = { title: titleInput.value, category: catSelect.value };
    };
    titleInput.addEventListener('input', saveDraft);
    catSelect.addEventListener('change', saveDraft);

    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const title = titleInput.value.trim();
      if (!title) {
        updateState({ checklistError: 'Digite o nome do item antes de adicionar.' });
        return;
      }
      const newTask = {
        id: `task-${Date.now()}`,
        title,
        completed: false,
        category: catSelect.value,
      };
      state.checklistDraft = { title: '', category: catSelect.value };
      state.checklistError = '';
      onUpdateTrip({ ...activeTrip, tasks: [...(activeTrip.tasks || []), newTask] });
    });
  }
}
