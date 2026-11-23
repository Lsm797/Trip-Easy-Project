import { icon } from '../icons.js';
import { formatLongDate, isValidIso, todayIso } from '../dates.js';
import { escapeHtml, formatBRL } from '../utils.js';

const CATEGORIES = ['Alimentação', 'Transporte', 'Hospedagem', 'Atividades', 'Outros'];

const CATEGORY_COLORS = {
  Alimentação: '#F97316',
  Transporte: '#0D5C46',
  Hospedagem: '#2E8B57',
  Atividades: '#F59E0B',
  Outros: '#78716C',
};

export function renderDespesasView(state, activeTrip) {
  if (!activeTrip) {
    return `
      <div class="empty-state-card animate-fade-in">
        <div style="color:var(--brand-600);">${icon('dollar', 'icon-2xl')}</div>
        <h2 style="margin:0;font-size:1.25rem;font-weight:800;color:var(--stone-900);">Sem controle financeiro ativo</h2>
        <p style="margin:0;color:var(--stone-500);max-width:380px;font-size:0.85rem;">
          É necessário ter uma viagem ativa criada para poder visualizar e registrar despesas.
        </p>
        <button type="button" class="btn btn-primary" style="margin-top:0.75rem;" data-nav="nova-viagem">
          Criar Nova Viagem
        </button>
      </div>
    `;
  }

  const totalSpent = activeTrip.expenses.reduce((sum, exp) => sum + exp.value, 0);
  const budgetLimit = activeTrip.budgetLimit || 1;
  const percentageSpent = Math.min(100, Math.round((totalSpent / budgetLimit) * 100));
  const remainingValue = Math.max(0, budgetLimit - totalSpent);
  const expenseCount = activeTrip.expenses.length;
  const averageSpent = expenseCount > 0 ? totalSpent / expenseCount : 0;
  const highestExpenseVal = expenseCount > 0 ? Math.max(...activeTrip.expenses.map((e) => e.value)) : 0;
  const lowestExpenseVal = expenseCount > 0 ? Math.min(...activeTrip.expenses.map((e) => e.value)) : 0;

  const categoryTotals = {};
  const categoryPercentages = {};
  for (const cat of CATEGORIES) {
    const sum = activeTrip.expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.value, 0);
    categoryTotals[cat] = sum;
    categoryPercentages[cat] = totalSpent > 0 ? Math.round((sum / totalSpent) * 100) : 0;
  }

  const selectedCat = state.selectedExpenseCategory || 'Tudo';
  const filteredExpenses =
    selectedCat === 'Tudo'
      ? activeTrip.expenses
      : activeTrip.expenses.filter((e) => e.category === selectedCat);

  const topCategory =
    categoryPercentages['Hospedagem'] >= categoryPercentages['Alimentação'] ? 'Hospedagem' : 'Alimentação';

  return `
    <div class="stack-lg animate-fade-in">
      <div class="page-header" style="margin-bottom:0;">
        <div>
          <span class="page-kicker" style="font-size:0.65rem;">Financeiro</span>
          <h1 class="page-title" style="font-size:1.85rem;">Controle Financeiro</h1>
          <p class="page-subtitle">
            Organize e acompanhe os gastos reais da jornada "${escapeHtml(activeTrip.name)}"
          </p>
        </div>
        <div class="row-gap">
          <button type="button" class="btn btn-secondary" data-action="export-expense-report">
            ${icon('download', 'icon-sm')}
            <span>Exportar Relatório</span>
          </button>
          <button type="button" class="btn btn-sunset" data-action="open-expense-modal" id="btn-add-expense-modal">
            ${icon('plus', 'icon-sm')}
            <span>Adicionar Despesa</span>
          </button>
        </div>
      </div>

      ${state.expenseFeedback ? `
        <div class="feedback-banner feedback-banner--success" style="margin-bottom:0;">
          <div style="display:flex;align-items:center;gap:0.5rem;">
            ${icon('checkCircle', 'icon-sm')}
            <span>${escapeHtml(state.expenseFeedback)}</span>
          </div>
          <button type="button" class="btn btn-ghost btn-sm" data-action="dismiss-expense-feedback">${icon('x', 'icon-xs')}</button>
        </div>
      ` : ''}

      <div class="expenses-grid">
        <div class="surface-card col-lg-8" style="display:flex;flex-direction:column;justify-content:space-between;">
          <div>
            <div class="row-between">
              <h3 class="card-label">Resumo do Orçamento</h3>
              <span class="tabular-nums" style="font-size:0.75rem;font-weight:700;color:var(--stone-500);">
                Limite Diário: R$ ${formatBRL(budgetLimit / 7, 0)}
              </span>
            </div>

            <div style="margin-top:1.35rem;">
              <span class="tabular-nums" style="font-size:2.2rem;font-weight:900;color:var(--brand-600);letter-spacing:-0.025em;">
                R$ ${formatBRL(totalSpent)}
              </span>
              <span class="tabular-nums" style="font-size:0.78rem;font-weight:600;color:var(--stone-400);margin-left:0.4rem;">
                de R$ ${formatBRL(budgetLimit)} planejados
              </span>
            </div>

            <div style="margin-top:1.25rem;">
              <div class="progress-track">
                <div class="progress-fill" style="width:${percentageSpent}%;background-color:${percentageSpent > 85 ? 'var(--red-600)' : 'var(--brand-600)'};"></div>
              </div>
              <div class="row-between tabular-nums" style="margin-top:0.5rem;font-size:0.74rem;font-weight:700;color:var(--stone-500);">
                <span>${percentageSpent}% Consumido</span>
                <span style="color:var(--brand-600);">R$ ${formatBRL(remainingValue)} Restante</span>
              </div>
            </div>
          </div>

          <div class="mini-stats-3">
            <div class="mini-stat-box">
              <span style="font-size:0.65rem;font-weight:700;text-transform:uppercase;color:var(--stone-400);">Média por Item</span>
              <p class="tabular-nums" style="margin:0.2rem 0 0;font-size:1rem;font-weight:900;color:var(--stone-800);">R$ ${formatBRL(averageSpent)}</p>
            </div>
            <div class="mini-stat-box">
              <span style="font-size:0.65rem;font-weight:700;text-transform:uppercase;color:var(--stone-400);">Menor Valor</span>
              <p class="tabular-nums" style="margin:0.2rem 0 0;font-size:1rem;font-weight:900;color:var(--brand-600);">R$ ${formatBRL(lowestExpenseVal)}</p>
            </div>
            <div class="mini-stat-box">
              <span style="font-size:0.65rem;font-weight:700;text-transform:uppercase;color:var(--stone-400);">Maior Gasto Único</span>
              <p class="tabular-nums" style="margin:0.2rem 0 0;font-size:1rem;font-weight:900;color:var(--sunset-500);">R$ ${formatBRL(highestExpenseVal)}</p>
            </div>
          </div>
        </div>

        <div class="surface-card col-lg-4" style="display:flex;flex-direction:column;justify-content:space-between;gap:1.25rem;">
          <h3 class="card-label">Gastos por Categoria</h3>

          <div class="stack-sm">
            ${CATEGORIES.map((cat) => {
              const pct = categoryPercentages[cat];
              const total = categoryTotals[cat];
              const col = CATEGORY_COLORS[cat];
              return `
                <div>
                  <div class="row-between" style="font-size:0.72rem;font-weight:700;margin-bottom:0.25rem;">
                    <span style="display:flex;align-items:center;gap:0.4rem;color:var(--stone-600);">
                      <span style="width:8px;height:8px;border-radius:9999px;background:${col};"></span>
                      <span>${cat}</span>
                    </span>
                    <span class="tabular-nums" style="color:var(--stone-900);">
                      ${pct}% <span style="color:var(--stone-400);font-weight:600;">(R$ ${formatBRL(total, 0)})</span>
                    </span>
                  </div>
                  <div style="height:6px;width:100%;background:var(--canvas-warm);border-radius:9999px;overflow:hidden;">
                    <div style="height:100%;width:${pct}%;background:${col};border-radius:9999px;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div style="background:var(--brand-50);border:1px solid var(--brand-100);border-radius:1rem;padding:0.75rem;display:flex;align-items:flex-start;gap:0.5rem;font-size:0.74rem;font-weight:600;color:var(--brand-900);">
            <span style="color:var(--sunset-500);display:flex;margin-top:2px;">${icon('sparkles', 'icon-sm')}</span>
            <span>A maior fatia de gastos da viagem recai sobre ${topCategory}.</span>
          </div>
        </div>
      </div>

      <div class="surface-card">
        <div class="row-between" style="padding-bottom:1rem;border-bottom:1px solid var(--stone-100);margin-bottom:1.25rem;">
          <h3 style="margin:0;font-size:0.95rem;font-weight:800;color:var(--stone-900);">Transações Recentes</h3>
          <div class="row-gap">
            <span style="font-size:0.74rem;font-weight:700;color:var(--stone-400);display:inline-flex;align-items:center;gap:0.3rem;">
              ${icon('filter', 'icon-xs')} Filtrar:
            </span>
            <div class="segmented-bar">
              ${['Tudo', ...CATEGORIES].map((catName) => `
                <button
                  type="button"
                  class="seg-btn ${selectedCat === catName ? 'is-active' : ''}"
                  data-action="filter-expense-cat"
                  data-cat="${catName}"
                >
                  ${catName}
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="stack-sm">
          ${filteredExpenses.length === 0 ? `
            <p style="text-align:center;padding:2.5rem 1rem;color:var(--stone-400);font-size:0.8rem;">
              Nenhuma despesa registrada para a categoria selecionada.
            </p>
          ` : filteredExpenses.map((exp) => `
            <div class="expense-row">
              <div style="display:flex;align-items:center;gap:0.85rem;min-width:0;">
                <div style="width:40px;height:40px;border-radius:0.75rem;background:#fff;border:1px solid var(--stone-200);display:flex;align-items:center;justify-content:center;color:var(--brand-600);flex-shrink:0;">
                  ${icon('receipt', 'icon-md')}
                </div>
                <div style="min-width:0;">
                  <h4 style="margin:0;font-size:0.86rem;font-weight:700;color:var(--stone-900);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${escapeHtml(exp.description)}
                  </h4>
                  <div style="display:flex;align-items:center;gap:0.45rem;margin-top:0.2rem;font-size:0.72rem;font-weight:600;color:var(--stone-500);">
                    <span style="color:${CATEGORY_COLORS[exp.category] || 'var(--stone-600)'};">${escapeHtml(exp.category)}</span>
                    <span aria-hidden="true">·</span>
                    <span>${escapeHtml(exp.dateStr)}</span>
                  </div>
                </div>
              </div>

              <div class="row-gap">
                <span class="tabular-nums" style="font-size:0.88rem;font-weight:900;color:var(--stone-900);">
                  R$ ${formatBRL(exp.value)}
                </span>
                <button
                  type="button"
                  class="btn btn-danger-soft btn-sm"
                  data-action="delete-expense"
                  data-exp-id="${escapeHtml(exp.id)}"
                >
                  Excluir
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      ${state.showAddExpenseModal ? `
        <div class="modal-backdrop" data-action="close-expense-backdrop" role="dialog" aria-modal="true" aria-labelledby="expense-modal-title">
          <div class="modal-card animate-modal-in">
            <div class="modal-header">
              <h3 id="expense-modal-title" style="margin:0;font-size:1.05rem;font-weight:800;color:var(--stone-900);">
                Registrar Nova Despesa
              </h3>
              <button type="button" class="btn btn-secondary btn-icon" style="width:32px;height:32px;min-height:32px;" data-action="close-expense-modal" aria-label="Fechar">
                ${icon('x', 'icon-sm')}
              </button>
            </div>
            <div class="modal-body">
              ${state.expenseModalError ? `<div class="feedback-banner feedback-banner--error">${escapeHtml(state.expenseModalError)}</div>` : ''}
              <form id="add-expense-form" class="stack-sm">
                <div>
                  <label class="field-label" for="exp-desc">Descrição</label>
                  <input
                    type="text"
                    id="exp-desc"
                    name="description"
                    class="field-input"
                    placeholder="Ex: Almoço no Restaurante Panorâmico"
                    value="${escapeHtml(state.expenseDraft.description)}"
                  />
                </div>
                <div class="grid-2" style="gap:0.85rem;">
                  <div>
                    <label class="field-label" for="exp-val">Valor (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      id="exp-val"
                      name="value"
                      class="field-input tabular-nums"
                      placeholder="250.00"
                      value="${escapeHtml(state.expenseDraft.value)}"
                    />
                  </div>
                  <div>
                    <label class="field-label" for="exp-date">Data</label>
                    <input
                      type="date"
                      id="exp-date"
                      name="dateStr"
                      class="field-input"
                      value="${escapeHtml(state.expenseDraft.dateStr)}"
                    />
                  </div>
                </div>
                <div>
                  <label class="field-label" for="exp-cat">Categoria</label>
                  <select id="exp-cat" name="category" class="field-select">
                    ${CATEGORIES.map((cat) => `
                      <option value="${cat}" ${state.expenseDraft.category === cat ? 'selected' : ''}>${cat}</option>
                    `).join('')}
                  </select>
                </div>
                <button type="submit" class="btn btn-sunset" style="width:100%;min-height:44px;margin-top:0.5rem;font-weight:800;">
                  Salvar Despesa
                </button>
              </form>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

export function bindDespesasEvents(container, state, activeTrip, { updateState, onUpdateTrip }) {
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn || !activeTrip) return;
    const action = btn.dataset.action;

    if (action === 'filter-expense-cat') {
      updateState({ selectedExpenseCategory: btn.dataset.cat });
    } else if (action === 'open-expense-modal') {
      updateState({
        showAddExpenseModal: true,
        expenseModalError: '',
        expenseDraft: {
          description: '',
          value: '',
          category: 'Alimentação',
          dateStr: todayIso(),
        },
      });
    } else if (action === 'close-expense-modal' || action === 'close-expense-backdrop') {
      if (action === 'close-expense-backdrop' && e.target !== btn) return;
      updateState({ showAddExpenseModal: false, expenseModalError: '' });
    } else if (action === 'delete-expense') {
      const expId = btn.dataset.expId;
      onUpdateTrip({
        ...activeTrip,
        expenses: activeTrip.expenses.filter((item) => item.id !== expId),
      });
    } else if (action === 'export-expense-report') {
      const totalSpent = activeTrip.expenses.reduce((s, item) => s + item.value, 0);
      const reportStr = `TripEasy Relatório - ${activeTrip.name}\nOrçamento: R$ ${formatBRL(
        activeTrip.budgetLimit
      )}\nTotal Gasto: R$ ${formatBRL(totalSpent)}\nItens: ${activeTrip.expenses.length}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(reportStr).catch(() => {});
      }
      updateState({ expenseFeedback: 'Relatório financeiro copiado para a área de transferência.' });
    } else if (action === 'dismiss-expense-feedback') {
      updateState({ expenseFeedback: '' });
    }
  });

  const form = container.querySelector('#add-expense-form');
  if (form && activeTrip) {
    form.addEventListener('input', (e) => {
      const el = e.target;
      if (el.name) {
        state.expenseDraft[el.name] = el.value;
      }
    });
    form.addEventListener('change', (e) => {
      const el = e.target;
      if (el.name) {
        state.expenseDraft[el.name] = el.value;
      }
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const desc = (state.expenseDraft.description || '').trim();
      const valFloat = parseFloat(state.expenseDraft.value);
      if (!desc || Number.isNaN(valFloat) || valFloat <= 0) {
        updateState({
          expenseModalError: 'Por favor, insira uma descrição e um valor numérico maior que zero.',
        });
        return;
      }

      const dateIso = isValidIso(state.expenseDraft.dateStr) ? state.expenseDraft.dateStr : todayIso();
      const newExpense = {
        id: `exp-${Date.now()}`,
        description: desc,
        category: state.expenseDraft.category || 'Alimentação',
        value: valFloat,
        dateIso,
        dateStr: formatLongDate(dateIso),
      };

      state.showAddExpenseModal = false;
      state.expenseModalError = '';
      state.expenseFeedback = `Despesa "${newExpense.description}" adicionada.`;
      onUpdateTrip({
        ...activeTrip,
        expenses: [newExpense, ...activeTrip.expenses],
      });
    });
  }
}
