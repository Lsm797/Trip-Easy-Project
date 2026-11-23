import { ASSETS } from '../data.js';
import { icon } from '../icons.js';
import { escapeHtml, formatBRL, renderImgWithFallback } from '../utils.js';

export function renderDashboardView(state, activeTrip) {
  if (!activeTrip) {
    return `
      <div class="empty-state-card animate-fade-in">
        <div style="color:var(--brand-600);">${icon('compass', 'icon-2xl')}</div>
        <h2 style="margin:0;font-size:1.25rem;font-weight:800;color:var(--stone-900);">Pronto para a sua próxima aventura?</h2>
        <p style="margin:0;color:var(--stone-500);max-width:420px;font-size:0.85rem;">
          Você não possui nenhuma viagem criada ou ativa no momento. Crie um itinerário inteligente agora mesmo!
        </p>
        <button type="button" class="btn btn-primary" style="margin-top:0.75rem;" data-nav="nova-viagem">
          ${icon('plus', 'icon-sm')}
          <span>Começar Planejamento</span>
        </button>
      </div>
    `;
  }

  const totalTasks = activeTrip.tasks.length;
  const completedTasks = activeTrip.tasks.filter((t) => t.completed).length;

  const totalSpent = activeTrip.expenses.reduce((sum, exp) => sum + exp.value, 0);
  const budgetLimit = activeTrip.budgetLimit || 1;
  const percentageSpent = Math.min(100, Math.round((totalSpent / budgetLimit) * 100));
  const strokeDashoffset = 377 - (377 * percentageSpent) / 100;
  const strokeColor =
    percentageSpent > 85 ? '#DC2626' : percentageSpent > 60 ? '#F97316' : '#0D5C46';

  const lodgingExpense = (activeTrip.expenses || []).find((e) => e.category === 'Hospedagem');
  const lodgingName = lodgingExpense ? lodgingExpense.description : 'Nenhuma hospedagem registrada';

  return `
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <span class="page-kicker">Dashboard</span>
          <h1 class="page-title">Olá, ${escapeHtml(state.userName)}</h1>
          <p class="page-subtitle">
            Sua viagem para <strong style="color:var(--brand-600);">${escapeHtml(activeTrip.destination)}</strong> começa em apenas
            <strong class="tabular-nums" style="color:var(--sunset-500);">${activeTrip.countdownDays} dias</strong>.
          </p>
        </div>

        <div class="row-gap">
          <button type="button" class="btn btn-sunset" data-nav="itinerario" id="btn-fab-planning">
            ${icon('plus', 'icon-sm')}
            <span>Planejar Atividade</span>
          </button>
          <button type="button" class="btn btn-secondary btn-icon" style="width:42px;height:42px;" data-action="open-share" title="Compartilhar Viagem" id="btn-share-trip">
            ${icon('share', 'icon-md')}
          </button>
        </div>
      </div>

      ${state.dashboardToast ? `
        <div class="feedback-banner feedback-banner--success">
          <div style="display:flex;align-items:center;gap:0.5rem;">
            ${icon('checkCircle', 'icon-sm')}
            <span>${escapeHtml(state.dashboardToast)}</span>
          </div>
          <button type="button" class="btn btn-ghost btn-sm" data-action="dismiss-toast">${icon('x', 'icon-xs')}</button>
        </div>
      ` : ''}

      <div class="dashboard-grid">
        <!-- 1. Voyage Highlight Summary Card -->
        <div class="surface-card trip-hero-card col-span-8">
          <div class="trip-hero-card__body">
            <div>
              <span class="page-kicker" style="font-size:0.68rem;">Viagem Confirmada</span>
              <h2 class="trip-hero-card__title">${escapeHtml(activeTrip.name)}</h2>
              <div class="trip-hero-card__dates">
                <span style="color:var(--brand-600);display:flex;">${icon('calendar', 'icon-sm')}</span>
                <span class="tabular-nums">De ${escapeHtml(activeTrip.startDate)} até ${escapeHtml(activeTrip.endDate)}</span>
              </div>
            </div>

            <div class="trip-hero-stats">
              <div class="trip-stat-box">
                <p class="trip-stat-box__label">Destino</p>
                <p class="trip-stat-box__val" style="color:var(--brand-600);">${escapeHtml(activeTrip.destination)}</p>
              </div>
              <div class="trip-stat-box">
                <p class="trip-stat-box__label">Contagem Regressiva</p>
                <p class="trip-stat-box__val tabular-nums" style="color:var(--sunset-500);">${activeTrip.countdownDays} Dias</p>
              </div>
            </div>
          </div>

          <div class="trip-hero-media">
            ${renderImgWithFallback(activeTrip.bannerImage, activeTrip.destination, activeTrip.destination)}
          </div>
        </div>

        <!-- 2. Budget Circular Progress Gauge -->
        <div class="surface-card budget-card col-span-4">
          <div style="width:100%;text-align:left;">
            <h3 class="card-label">Orçamento Consumido</h3>
          </div>

          <div class="gauge-wrap">
            <svg class="gauge-svg" viewBox="0 0 144 144">
              <circle cx="72" cy="72" r="60" fill="transparent" stroke="#EFECE5" stroke-width="10"></circle>
              <circle
                cx="72"
                cy="72"
                r="60"
                fill="transparent"
                stroke="${strokeColor}"
                stroke-width="10"
                stroke-dasharray="377"
                stroke-dashoffset="${strokeDashoffset}"
                stroke-linecap="round"
              ></circle>
            </svg>
            <div class="gauge-center">
              <p class="gauge-percent tabular-nums">${percentageSpent}%</p>
              <p class="gauge-sub">Utilizado</p>
            </div>
          </div>

          <div style="width:100%;">
            <p class="tabular-nums" style="margin:0;font-size:0.78rem;font-weight:700;color:var(--stone-600);">
              R$ ${formatBRL(totalSpent)} de R$ ${formatBRL(budgetLimit)}
            </p>
            <button type="button" class="btn btn-ghost btn-sm" style="width:100%;margin-top:0.65rem;color:var(--brand-600);font-weight:800;" data-nav="despesas">
              <span>Ver Despesas</span>
              ${icon('arrowRight', 'icon-xs')}
            </button>
          </div>
        </div>

        <!-- 4. Mini Checklist -->
        <div class="surface-card checklist-card col-span-8">
          <div class="row-between">
            <h3 class="card-label">Checklist Pré-viagem</h3>
            <span class="tabular-nums" style="font-size:0.7rem;font-weight:700;color:var(--brand-700);">
              ${completedTasks} de ${totalTasks} feito
            </span>
          </div>

          <div class="checklist-items no-scrollbar">
            ${activeTrip.tasks.length === 0 ? `
              <p style="text-align:center;color:var(--stone-400);font-size:0.78rem;padding:1.5rem 0;">
                Nenhuma tarefa. Adicione abaixo!
              </p>
            ` : activeTrip.tasks.slice(0, 4).map((task) => `
              <label class="checklist-row ${task.completed ? 'is-done' : ''}">
                <input type="checkbox" ${task.completed ? 'checked' : ''} data-action="toggle-task" data-task-id="${escapeHtml(task.id)}" />
                <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(task.title)}</span>
              </label>
            `).join('')}

            ${activeTrip.tasks.length > 4 ? `
              <button type="button" class="btn btn-ghost btn-sm" style="color:var(--brand-600);font-size:0.7rem;" data-nav="checklist">
                + ${activeTrip.tasks.length - 4} adicionais no Checklist
              </button>
            ` : ''}
          </div>

          <form id="dashboard-add-task-form" style="display:flex;gap:0.5rem;">
            <input
              type="text"
              id="dashboard-new-task"
              class="field-input"
              style="height:38px;"
              placeholder="Criar nova tarefa..."
              value="${escapeHtml(state.dashboardTaskInput || '')}"
            />
            <button type="submit" class="btn btn-primary btn-icon-sq" style="height:38px;width:38px;" title="Adicionar tarefa">
              ${icon('plus', 'icon-sm')}
            </button>
          </form>
        </div>

        <!-- 5. Accommodation Map Preview -->
        <div class="surface-card map-preview-card col-span-4">
          ${renderImgWithFallback(ASSETS.mapImg, 'Preview do mapa da hospedagem', activeTrip.destination)}
          <div class="map-preview-overlay">
            <div class="map-preview-inner">
              <span style="padding:0.5rem;background:var(--brand-50);color:var(--brand-600);border-radius:0.65rem;display:flex;flex-shrink:0;">
                ${icon('mapPin', 'icon-sm')}
              </span>
              <div style="flex:1;min-width:0;">
                <p style="margin:0;font-size:0.6rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:var(--brand-600);">
                  Hospedagem Ativa
                </p>
                <p style="margin:0.1rem 0 0;font-size:0.78rem;font-weight:700;color:var(--stone-900);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  ${escapeHtml(lodgingName)}
                </p>
              </div>
              <button type="button" class="btn btn-primary btn-icon-sq" data-nav="itinerario" title="Abrir Itinerário">
                ${icon('map', 'icon-sm')}
              </button>
            </div>
          </div>
        </div>
      </div>

      ${state.showShareModal ? `
        <div class="modal-backdrop" data-action="close-share-backdrop" role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
          <div class="modal-card animate-modal-in" style="max-width:380px;">
            <div class="modal-body">
              <h3 id="share-modal-title" style="margin:0 0 0.5rem;font-size:1.1rem;font-weight:800;color:var(--stone-900);">
                Compartilhar Viagem
              </h3>
              <p style="margin:0 0 1.25rem;font-size:0.78rem;color:var(--stone-500);line-height:1.5;">
                Deseja compartilhar os detalhes de planejamento de "${escapeHtml(activeTrip.name)}" com outros passageiros?
              </p>
              <div class="stack-sm">
                <button type="button" class="btn btn-primary" style="width:100%;" data-action="copy-share-trip">
                  Copiar itinerário formatado
                </button>
                <button type="button" class="btn btn-secondary" style="width:100%;" data-action="close-share">
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

export function bindDashboardEvents(container, state, activeTrip, { updateState, onUpdateTrip }) {
  container.addEventListener('change', (e) => {
    const checkbox = e.target.closest('[data-action="toggle-task"]');
    if (!checkbox || !activeTrip) return;
    const taskId = checkbox.dataset.taskId;
    const updatedTasks = activeTrip.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    onUpdateTrip({ ...activeTrip, tasks: updatedTasks });
  });

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'open-share') {
      updateState({ showShareModal: true });
    } else if (action === 'close-share' || action === 'close-share-backdrop') {
      if (action === 'close-share-backdrop' && e.target !== btn) return;
      updateState({ showShareModal: false });
    } else if (action === 'copy-share-trip' && activeTrip) {
      const text = `TripEasy Planner: Vou viajar para ${activeTrip.destination} de ${activeTrip.startDate} até ${activeTrip.endDate}!`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
      updateState({
        showShareModal: false,
        dashboardToast: 'Resumo da viagem copiado para a área de transferência.',
      });
    } else if (action === 'dismiss-toast') {
      updateState({ dashboardToast: '' });
    }
  });

  const taskForm = container.querySelector('#dashboard-add-task-form');
  if (taskForm && activeTrip) {
    const input = taskForm.querySelector('#dashboard-new-task');
    if (input) {
      input.addEventListener('input', () => {
        state.dashboardTaskInput = input.value;
      });
    }
    taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = (state.dashboardTaskInput || '').trim();
      if (!title) return;
      const newTask = {
        id: `task-${Date.now()}`,
        title,
        completed: false,
      };
      state.dashboardTaskInput = '';
      onUpdateTrip({
        ...activeTrip,
        tasks: [...activeTrip.tasks, newTask],
      });
    });
  }
}
