import { ASSETS, POPULAR_DESTINATIONS, resolveDestinationImage } from '../data.js';
import { icon } from '../icons.js';
import { defaultWizardDates, formatLongDate, todayIso, validateTripPeriod } from '../dates.js';
import { escapeHtml, renderImgWithFallback } from '../utils.js';

const INTEREST_OPTIONS = [
  { id: 'praias', label: 'Praias & Mar' },
  { id: 'museus', label: 'Museus & Arte' },
  { id: 'culinaria', label: 'Culinária Local' },
  { id: 'natureza', label: 'Trilhas & Natureza' },
  { id: 'compras', label: 'Compras & Feiras' },
  { id: 'vida-noturna', label: 'Vida Noturna & Shows' },
  { id: 'esportes', label: 'Aventura & Esportes' },
  { id: 'fotografia', label: 'Mirantes & Fotos' },
];

export function renderCreatorView(state) {
  const w = state.wizard;
  const settings = state.platformSettings;
  const hasDest = Boolean(w.destination.trim());

  return `
    <div style="max-width:980px;margin:0 auto;" class="stack-lg animate-fade-in">
      <div class="surface-card">
        <div class="stepper-box">
          <button type="button" class="stepper-node ${w.step >= 1 ? 'is-active' : ''}" data-action="wizard-step" data-step="1">
            <span class="stepper-circle">1</span>
            <span class="stepper-label">Destino</span>
          </button>
          <div class="stepper-connector ${w.step >= 2 ? 'is-active' : ''}"></div>
          <button type="button" class="stepper-node ${w.step >= 2 ? 'is-active' : ''}" data-action="wizard-step" data-step="2" ${!hasDest ? 'disabled' : ''}>
            <span class="stepper-circle">2</span>
            <span class="stepper-label">Detalhes</span>
          </button>
          <div class="stepper-connector ${w.step >= 3 ? 'is-active' : ''}"></div>
          <button type="button" class="stepper-node ${w.step >= 3 ? 'is-active' : ''}" data-action="wizard-step" data-step="3" ${!hasDest ? 'disabled' : ''}>
            <span class="stepper-circle">3</span>
            <span class="stepper-label">Preferências</span>
          </button>
        </div>
      </div>

      ${w.step === 1 ? `
        <div class="surface-card" style="padding:0;overflow:hidden;">
          <div style="position:relative;height:230px;display:flex;align-items:center;justify-content:center;">
            <div style="position:absolute;inset:0;">
              ${renderImgWithFallback(ASSETS.rioImg, 'Para onde vamos?', 'Destino')}
              <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(4,26,20,0.86) 0%, rgba(4,26,20,0.4) 100%);"></div>
            </div>
            <div style="position:relative;z-index:2;text-align:center;padding:0 1rem;">
              <h2 style="margin:0;font-size:1.75rem;font-weight:900;color:#fff;">Para onde vamos?</h2>
              <p style="margin:0.35rem 0 0;font-size:0.8rem;font-weight:600;color:var(--stone-200);">
                Planeje sua escapada perfeita em poucos passos.
              </p>
            </div>
          </div>

          <div style="padding:1.5rem;" class="stack-md">
            <div>
              <label class="field-label" for="wizard-destination-input">Buscar Destino</label>
              <div class="input-with-icon">
                <span class="input-with-icon__left">${icon('mapPin', 'icon-md')}</span>
                <input
                  type="text"
                  id="wizard-destination-input"
                  class="field-input"
                  style="height:50px;"
                  placeholder="Digite qualquer destino: Salvador, Paris, Bonito..."
                  value="${escapeHtml(w.destination)}"
                />
              </div>
            </div>

            <div class="stack-sm">
              <p class="field-label" style="margin:0;">Sugestões (ou digite qualquer outro destino acima)</p>
              <div class="popular-grid">
                ${POPULAR_DESTINATIONS.map((dest) => `
                  <button
                    type="button"
                    class="popular-dest-card"
                    data-action="select-popular-dest"
                    data-dest="${escapeHtml(dest.name)}"
                  >
                    ${dest.image
                      ? renderImgWithFallback(dest.image, dest.name, dest.name)
                      : '<div style="position:absolute;inset:0;background:linear-gradient(135deg,var(--brand-800),var(--brand-500));"></div>'}
                    <div class="popular-dest-card__scrim"></div>
                    <div class="popular-dest-card__info">
                      <p style="margin:0;font-size:0.9rem;font-weight:900;">${escapeHtml(dest.name)}</p>
                      <p style="margin:0.1rem 0 0;font-size:0.7rem;color:var(--stone-200);font-weight:600;">${escapeHtml(dest.country)}</p>
                    </div>
                  </button>
                `).join('')}
              </div>
            </div>

            <div style="display:flex;justify-content:flex-end;padding-top:1rem;border-top:1px solid var(--stone-100);">
              <button
                type="button"
                class="btn btn-primary"
                data-action="wizard-step"
                data-step="2"
                ${!hasDest ? 'disabled' : ''}
              >
                <span>Continuar</span>
                ${icon('arrowRight', 'icon-sm')}
              </button>
            </div>
          </div>
        </div>
      ` : ''}

      ${w.step === 2 ? `
        <div class="expenses-grid">
          <div class="surface-card col-lg-8 stack-md">
            <h3 style="margin:0;font-size:1.25rem;font-weight:900;color:var(--stone-900);">Detalhes da Viagem</h3>

            <div>
              <span class="field-label">Período Selecionado</span>
              <div class="grid-2" style="gap:0.85rem;">
                <div class="input-with-icon">
                  <span class="input-with-icon__left">${icon('calendar', 'icon-sm')}</span>
                  <input type="text" id="wizard-start-date" class="field-input" value="${escapeHtml(w.startDate)}" placeholder="Data Ida (dd/mm/aaaa)" />
                </div>
                <div class="input-with-icon">
                  <span class="input-with-icon__left">${icon('calendar', 'icon-sm')}</span>
                  <input type="text" id="wizard-end-date" class="field-input" value="${escapeHtml(w.endDate)}" placeholder="Data Volta (dd/mm/aaaa)" />
                </div>
              </div>
              ${state.wizardError ? `<p style="margin:0.6rem 0 0;font-size:0.76rem;font-weight:700;color:var(--red-600);">${escapeHtml(state.wizardError)}</p>` : ''}
            </div>

            <div>
              <span class="field-label">Passageiros</span>
              <div class="grid-2" style="gap:0.85rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;padding:0.9rem;border:1px solid var(--stone-200);border-radius:0.875rem;background:var(--canvas);">
                  <div>
                    <p style="margin:0;font-size:0.78rem;font-weight:800;color:var(--stone-800);">Adultos</p>
                    <p style="margin:0.1rem 0 0;font-size:0.68rem;color:var(--stone-400);font-weight:600;">Acima de 12 anos</p>
                  </div>
                  <div class="row-gap">
                    <button type="button" class="btn btn-secondary btn-icon" style="width:32px;height:32px;min-height:32px;" data-action="adults-dec">${icon('minus', 'icon-xs')}</button>
                    <span class="tabular-nums" style="width:20px;text-align:center;font-weight:800;font-size:0.88rem;">${w.adults}</span>
                    <button type="button" class="btn btn-secondary btn-icon" style="width:32px;height:32px;min-height:32px;" data-action="adults-inc">${icon('plus', 'icon-xs')}</button>
                  </div>
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;padding:0.9rem;border:1px solid var(--stone-200);border-radius:0.875rem;background:var(--canvas);">
                  <div>
                    <p style="margin:0;font-size:0.78rem;font-weight:800;color:var(--stone-800);">Crianças</p>
                    <p style="margin:0.1rem 0 0;font-size:0.68rem;color:var(--stone-400);font-weight:600;">De 2 a 12 anos</p>
                  </div>
                  <div class="row-gap">
                    <button type="button" class="btn btn-secondary btn-icon" style="width:32px;height:32px;min-height:32px;" data-action="children-dec">${icon('minus', 'icon-xs')}</button>
                    <span class="tabular-nums" style="width:20px;text-align:center;font-weight:800;font-size:0.88rem;">${w.children}</span>
                    <button type="button" class="btn btn-secondary btn-icon" style="width:32px;height:32px;min-height:32px;" data-action="children-inc">${icon('plus', 'icon-xs')}</button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <span class="field-label">Estilo de Viagem</span>
              <div class="style-grid">
                ${['Solo', 'Casal', 'Família', 'Amigos'].map((style) => `
                  <button type="button" class="choice-tile ${w.tripStyle === style ? 'is-selected' : ''}" data-action="set-trip-style" data-style="${style}">
                    ${icon('users', 'icon-md')}
                    <span>${style}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <div>
              <span class="field-label">Orçamento Estimado</span>
              <div class="segmented-bar" style="background:var(--canvas-warm);">
                ${['Econômico', 'Moderado', 'Luxo'].map((level) => `
                  <button
                    type="button"
                    class="seg-btn seg-btn--light ${w.budgetLevel === level ? 'is-active' : ''}"
                    data-action="set-budget-level"
                    data-level="${level}"
                  >
                    ${level}
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="row-between" style="padding-top:1rem;border-top:1px solid var(--stone-100);">
              <button type="button" class="btn btn-secondary" data-action="wizard-step" data-step="1">
                ${icon('arrowLeft', 'icon-sm')}
                <span>Voltar</span>
              </button>
              <button type="button" class="btn btn-primary" data-action="wizard-step" data-step="3">
                <span>Escolher Preferências</span>
                ${icon('arrowRight', 'icon-sm')}
              </button>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="surface-card">
              <p class="field-label" style="margin-bottom:1rem;">Resumo da Viagem</p>
              <div style="display:flex;align-items:center;gap:0.85rem;">
                <div style="width:60px;height:60px;border-radius:0.875rem;overflow:hidden;flex-shrink:0;">
                  ${renderImgWithFallback(resolveDestinationImage(w.destination), w.destination, w.destination)}
                </div>
                <div>
                  <span style="font-size:0.65rem;font-weight:800;color:var(--brand-600);text-transform:uppercase;">Destino Escolhido</span>
                  <h4 style="margin:0.15rem 0 0;font-size:0.95rem;font-weight:800;color:var(--stone-900);">${escapeHtml(w.destination)}</h4>
                </div>
              </div>

              <div class="stack-sm" style="margin-top:1.25rem;padding-top:1.1rem;border-top:1px solid var(--stone-100);font-size:0.78rem;">
                <div class="row-between">
                  <span style="color:var(--stone-500);font-weight:600;">Estilo de Viagem</span>
                  <strong style="color:var(--stone-900);">${w.tripStyle}</strong>
                </div>
                <div class="row-between">
                  <span style="color:var(--stone-500);font-weight:600;">Adultos / Crianças</span>
                  <strong class="tabular-nums" style="color:var(--stone-900);">${w.adults}a, ${w.children}c</strong>
                </div>
                <div class="row-between">
                  <span style="color:var(--stone-500);font-weight:600;">Orçamento Est.</span>
                  <strong style="color:var(--brand-600);">${w.budgetLevel}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      ` : ''}

      ${w.step === 3 ? `
        <div class="surface-card stack-md" style="max-width:680px;margin:0 auto;width:100%;">
          <div>
            <span class="page-kicker" style="font-size:0.65rem;">Preferências</span>
            <h3 style="margin:0.25rem 0 0;font-size:1.45rem;font-weight:900;color:var(--stone-900);">
              Quais as suas preferências turísticas?
            </h3>
            <p style="margin:0.35rem 0 0;font-size:0.78rem;color:var(--stone-500);">
              A TripEasy utilizará estas categorias para calibrar os tempos estimativos e organizar seu roteiro inicial.
            </p>
          </div>

          <div class="interest-grid">
            ${INTEREST_OPTIONS.map((item) => {
              const checked = w.interests.includes(item.id);
              return `
                <button
                  type="button"
                  class="interest-btn ${checked ? 'is-selected' : ''}"
                  data-action="toggle-interest"
                  data-interest="${item.id}"
                >
                  <span>${item.label}</span>
                  ${checked ? icon('checkCircle', 'icon-sm') : ''}
                </button>
              `;
            }).join('')}
          </div>

          <div class="row-between" style="padding-top:1rem;border-top:1px solid var(--stone-100);">
            <button type="button" class="btn btn-secondary" data-action="wizard-step" data-step="2">
              ${icon('arrowLeft', 'icon-sm')}
              <span>Voltar</span>
            </button>
            <button type="button" class="btn btn-sunset" data-action="finish-create-trip">
              ${icon('plus', 'icon-sm')}
              <span>Criar Roteiro Inteligente</span>
            </button>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

export function bindCreatorEvents(container, state, { updateState, onCreateTrip }) {
  const destInput = container.querySelector('#wizard-destination-input');
  if (destInput) {
    destInput.addEventListener('input', () => {
      state.wizard.destination = destInput.value;
      const nextBtn = container.querySelector('[data-action="wizard-step"][data-step="2"]');
      const stepNodes = container.querySelectorAll('.stepper-node[data-step="2"], .stepper-node[data-step="3"]');
      const hasVal = Boolean(destInput.value.trim());
      if (nextBtn) nextBtn.disabled = !hasVal;
      stepNodes.forEach((n) => {
        n.disabled = !hasVal;
      });
    });
  }

  const startInput = container.querySelector('#wizard-start-date');
  const endInput = container.querySelector('#wizard-end-date');
  if (startInput) startInput.addEventListener('input', () => { state.wizard.startDate = startInput.value; });
  if (endInput) endInput.addEventListener('input', () => { state.wizard.endDate = endInput.value; });

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const w = state.wizard;

    if (action === 'wizard-step') {
      const nextStep = Number(btn.dataset.step);
      if (nextStep > 1 && !w.destination.trim()) return;
      if (nextStep > 2) {
        const periodError = validateTripPeriod(w.startDate, w.endDate);
        if (periodError) {
          updateState({ wizardError: periodError, wizard: { ...w, step: 2 } });
          return;
        }
      }
      updateState({ wizardError: '', wizard: { ...w, step: nextStep } });
    } else if (action === 'select-popular-dest') {
      updateState({ wizard: { ...w, destination: btn.dataset.dest, step: 2 } });
    } else if (action === 'adults-inc') {
      updateState({ wizard: { ...w, adults: w.adults + 1 } });
    } else if (action === 'adults-dec') {
      updateState({ wizard: { ...w, adults: Math.max(1, w.adults - 1) } });
    } else if (action === 'children-inc') {
      updateState({ wizard: { ...w, children: w.children + 1 } });
    } else if (action === 'children-dec') {
      updateState({ wizard: { ...w, children: Math.max(0, w.children - 1) } });
    } else if (action === 'set-trip-style') {
      updateState({ wizard: { ...w, tripStyle: btn.dataset.style } });
    } else if (action === 'set-budget-level') {
      updateState({ wizard: { ...w, budgetLevel: btn.dataset.level } });
    } else if (action === 'toggle-interest') {
      const id = btn.dataset.interest;
      const exists = w.interests.includes(id);
      const nextInterests = exists ? w.interests.filter((i) => i !== id) : [...w.interests, id];
      updateState({ wizard: { ...w, interests: nextInterests } });
    } else if (action === 'finish-create-trip') {
      const dest = w.destination.trim();
      if (!dest) return;
      const periodError = validateTripPeriod(w.startDate, w.endDate);
      if (periodError) {
        updateState({ wizardError: periodError, wizard: { ...w, step: 2 } });
        return;
      }
      const settings = state.platformSettings;
      const budgetLimit =
        w.budgetLevel === 'Luxo'
          ? settings.defaultBudgetLuxury
          : w.budgetLevel === 'Moderado'
            ? settings.defaultBudgetModerate
            : settings.defaultBudgetEconomic;

      const newTrip = {
        id: `trip-${Date.now()}`,
        name: `Aventura em ${dest.split(',')[0]}`,
        destination: dest,
        startDate: w.startDate,
        endDate: w.endDate,
        countdownDays: 14,
        bannerImage: resolveDestinationImage(dest),
        budgetLimit,
        travelersAdults: w.adults,
        travelersChildren: w.children,
        tripStyle: w.tripStyle,
        budgetLevel: w.budgetLevel,
        tasks: [
          { id: 't-gen-1', title: 'Conferir passaportes e documentos físicos', completed: true },
          { id: 't-gen-2', title: 'Arrumar roupas adequadas para o clima local', completed: false },
          { id: 't-gen-3', title: 'Fazer orçamento de despesas sobressalentes', completed: false },
        ],
        itinerary: [
          {
            dayNumber: 1,
            dateStr: 'Primeiro Dia de Viagem',
            activities: [
              {
                id: `act-gen-1-${Date.now()}`,
                time: '10:00 AM',
                title: `Chegada em ${dest}`,
                description: 'Check-in na hospedagem e breve reconhecimento da vizinhança.',
                icon: 'mapPin',
              },
              {
                id: `act-gen-2-${Date.now()}`,
                time: '04:00 PM',
                title: 'Explorar Pontos Principais',
                description: 'Sair para tirar as primeiras fotos e conferir monumentos locais.',
                icon: 'compass',
              },
            ],
          },
          {
            dayNumber: 2,
            dateStr: 'Segundo Dia de Viagem',
            activities: [
              {
                id: `act-gen-3-${Date.now()}`,
                time: '09:00 AM',
                title: 'Passeio Cultural Orientado',
                description: 'Visitar museus renomados ou parques ecológicos característicos.',
                icon: 'navigation',
              },
            ],
          },
        ],
        expenses: [
          {
            id: `exp-gen-1-${Date.now()}`,
            description: 'Reserva Inicial / Taxas da Hospedagem',
            category: 'Hospedagem',
            value: Math.round(budgetLimit * 0.4),
            dateIso: todayIso(),
            dateStr: formatLongDate(todayIso()),
          },
        ],
      };
      state.wizard = {
        step: 1,
        destination: '',
        ...defaultWizardDates(),
        adults: 2,
        children: 0,
        tripStyle: 'Solo',
        budgetLevel: 'Econômico',
        interests: [],
      };
      state.wizardError = '';
      onCreateTrip(newTrip);
    }
  });
}
