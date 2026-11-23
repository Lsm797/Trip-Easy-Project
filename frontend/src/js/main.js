import { ASSETS } from './data.js';
import { apiDeleteTrip, apiLogout } from './api.js';
import { defaultWizardDates, todayIso } from './dates.js';
import { createTripOnServer, fetchTrip, loadAllTrips, syncTripChanges } from './sync.js';
import { icon } from './icons.js';
import {
  getPlatformSettings,
  loadSession,
  saveActiveTripId,
  saveSessionAuth,
  saveUserName,
} from './store.js';
import { escapeHtml, renderBrandLogo, renderImgWithFallback } from './utils.js';
import { bindLandingEvents, renderLandingPage } from './views/landing.js';
import { bindDashboardEvents, renderDashboardView } from './views/dashboard.js';
import { bindItinerarioEvents, renderItinerarioView } from './views/itinerario.js';
import { bindDespesasEvents, renderDespesasView } from './views/despesas.js';
import { bindChecklistEvents, renderChecklistView } from './views/checklist.js';
import { bindCreatorEvents, renderCreatorView } from './views/creator.js';
import { bindConfiguracoesEvents, renderConfiguracoesView } from './views/configuracoes.js';

const session = loadSession();

const state = {
  isLoggedIn: session.isLoggedIn,
  userName: session.userName,
  userEmail: session.userEmail,
  activeTripId: session.activeTripId,
  activeTab: 'visao-geral',
  tripsList: [],
  loadingTrips: session.isLoggedIn,
  apiError: '',
  platformSettings: getPlatformSettings(),

  // Landing auth state
  authMode: 'none',
  showPassword: false,
  authForm: { name: '', email: '', password: '' },
  authError: '',
  authSuccess: '',

  // Dashboard state
  dashboardTaskInput: '',
  dashboardToast: '',
  showShareModal: false,

  // Itinerario state
  selectedDayNumber: 1,
  newActivityTitle: '',
  editingActivityId: null,
  editingTitle: '',
  editingDesc: '',
  editingTime: '10:00 AM',
  activePin: null,
  mapZoom: 1,

  // Checklist state
  checklistCategory: 'Tudo',
  checklistStatus: 'todos',
  checklistSearch: '',
  checklistError: '',
  checklistDraft: { title: '', category: 'Bagagem' },

  // Despesas state
  selectedExpenseCategory: 'Tudo',
  showAddExpenseModal: false,
  expenseModalError: '',
  expenseFeedback: '',
  expenseDraft: {
    description: '',
    value: '',
    category: 'Alimentação',
    dateStr: todayIso(),
  },

  // Creator wizard state
  wizardError: '',
  wizard: {
    step: 1,
    destination: '',
    ...defaultWizardDates(),
    adults: 2,
    children: 0,
    tripStyle: 'Solo',
    budgetLevel: 'Econômico',
    interests: [],
  },

  // Configuracoes state
  settingsNameDraft: null,
  settingsTaskDraft: '',
  settingsFeedback: '',
  confirmDeleteTrip: false,

};

const rootEl = document.getElementById('app');

function updateState(patch, afterRender) {
  Object.assign(state, patch);
  render();
  if (typeof afterRender === 'function') afterRender();
}

function getActiveTrip() {
  return state.tripsList.find((t) => t.id === state.activeTripId) || null;
}

async function loadTripsFromServer() {
  const trips = await loadAllTrips();
  let activeId = state.activeTripId;
  if (!trips.some((t) => t.id === activeId)) activeId = trips[0]?.id || '';
  saveActiveTripId(activeId);
  updateState({ tripsList: trips, activeTripId: activeId, loadingTrips: false });
}

function forceLogout(message) {
  saveSessionAuth({ isLoggedIn: false });
  updateState({
    isLoggedIn: false,
    loadingTrips: false,
    tripsList: [],
    activeTab: 'visao-geral',
    settingsNameDraft: null,
    authMode: message ? 'login' : 'none',
    authError: message || '',
    authSuccess: '',
  });
}

function handleApiError(err) {
  if (err && err.status === 403) {
    forceLogout('Sua sessão expirou. Entre novamente.');
    return;
  }
  updateState({ loadingTrips: false, apiError: (err && err.message) || 'Algo deu errado. Tente novamente.' });
}

async function reloadSilently() {
  try {
    await loadTripsFromServer();
  } catch (err) {
    handleApiError(err);
  }
}

// Só uma sincronização por vez: ações feitas enquanto uma está em andamento são ignoradas.
let syncing = false;
async function runSync(job) {
  if (syncing) return;
  syncing = true;
  try {
    await job();
  } catch (err) {
    if (err && err.status === 403) {
      handleApiError(err);
    } else {
      state.apiError = (err && err.message) || 'Não foi possível salvar a alteração.';
      await reloadSilently();
    }
  } finally {
    syncing = false;
  }
}

async function handleLoginSuccess(name, email) {
  saveSessionAuth({ isLoggedIn: true, userName: name, userEmail: email });
  updateState({
    isLoggedIn: true,
    loadingTrips: true,
    apiError: '',
    userName: name,
    userEmail: email || state.userEmail,
    activeTab: 'visao-geral',
    authMode: 'none',
    authError: '',
    authSuccess: '',
    settingsNameDraft: null,
  });
  await reloadSilently();
}

function handleLogout() {
  apiLogout().catch(() => {});
  saveSessionAuth({ isLoggedIn: false });
  updateState({
    isLoggedIn: false,
    tripsList: [],
    apiError: '',
    activeTab: 'visao-geral',
    settingsNameDraft: null,
  });
}

function handleUpdateTrip(updatedTrip) {
  const oldTrip = state.tripsList.find((t) => t.id === updatedTrip.id);
  if (!oldTrip) return;
  runSync(async () => {
    await syncTripChanges(oldTrip, updatedTrip);
    const fresh = await fetchTrip(updatedTrip.id);
    updateState({
      tripsList: state.tripsList.map((t) => (t.id === fresh.id ? fresh : t)),
      apiError: '',
    });
  });
}

function handleCreateTrip(newTrip) {
  runSync(async () => {
    const fresh = await createTripOnServer(newTrip);
    saveActiveTripId(fresh.id);
    updateState({
      tripsList: [...state.tripsList, fresh],
      activeTripId: fresh.id,
      activeTab: 'visao-geral',
      apiError: '',
    });
  });
}

function handleDeleteTrip(tripId) {
  runSync(async () => {
    await apiDeleteTrip(tripId);
    const next = state.tripsList.filter((t) => t.id !== tripId);
    let nextActiveId = state.activeTripId;
    if (state.activeTripId === tripId) {
      nextActiveId = next[0]?.id || '';
      saveActiveTripId(nextActiveId);
    }
    updateState({ tripsList: next, activeTripId: nextActiveId, apiError: '', confirmDeleteTrip: false });
  });
}

function handleChangeUserName(name) {
  saveUserName(name);
  updateState({ userName: name });
}

function handleChangeActiveTripId(id) {
  saveActiveTripId(id);
  updateState({ activeTripId: id, confirmDeleteTrip: false });
}

function renderWorkspaceHeader() {
  const navLinks = [
    { id: 'visao-geral', label: 'Dashboard' },
    { id: 'itinerario', label: 'Viagens' },
    { id: 'checklist', label: 'Checklist' },
    { id: 'despesas', label: 'Despesas' },
    { id: 'configuracoes', label: 'Configurações' },
  ];

  return `
    <header class="app-header">
      <div class="app-header__inner">
        <div style="display:flex;align-items:center;gap:2rem;">
          <div id="brand-logo">
            ${renderBrandLogo({ variant: 'header', actionAttr: 'data-nav="visao-geral"' })}
          </div>

          <nav class="app-header__nav" aria-label="Navegação principal">
            ${navLinks
              .map(
                (link) => `
              <button
                type="button"
                class="app-nav-link ${state.activeTab === link.id ? 'is-active' : ''}"
                data-nav="${link.id}"
              >
                ${link.label}
              </button>
            `
              )
              .join('')}
          </nav>
        </div>

        <div class="app-header__right">
          <button type="button" class="user-pill-trigger" data-nav="configuracoes" title="Perfil e Configurações">
            <div class="user-avatar-sm">
              ${renderImgWithFallback(ASSETS.avatarImg, 'Foto de perfil', state.userName)}
            </div>
            <span class="user-name-label">${escapeHtml(state.userName)}</span>
          </button>

          <button type="button" class="btn btn-secondary btn-sm" data-action="global-logout" id="header-logout-btn">
            ${icon('logout', 'icon-xs')}
            <span>Sair</span>
          </button>
        </div>
      </div>
    </header>
  `;
}

function renderSidebar(activeTrip) {
  const navItems = [
    { id: 'visao-geral', label: 'Visão Geral', ic: 'dashboard' },
    { id: 'itinerario', label: 'Itinerário', ic: 'calendar' },
    { id: 'checklist', label: 'Checklist', ic: 'checkSquare' },
    { id: 'despesas', label: 'Despesas', ic: 'receipt' },
    { id: 'configuracoes', label: 'Configurações', ic: 'settings' },
  ];

  return `
    <aside class="app-sidebar">
      <div class="sidebar-active-card">
        ${activeTrip ? `
          <div class="sidebar-trip-row">
            <div class="sidebar-trip-thumb">
              ${renderImgWithFallback(activeTrip.bannerImage, activeTrip.name, activeTrip.name)}
            </div>
            <div class="sidebar-trip-meta">
              <h3>${escapeHtml(activeTrip.name)}</h3>
              <p class="tabular-nums">${activeTrip.countdownDays > 0 ? `${activeTrip.countdownDays} dias restantes` : 'Em andamento'}</p>
            </div>
          </div>
        ` : `
          <div style="display:flex;align-items:center;gap:0.5rem;padding:0.4rem;color:var(--stone-400);font-size:0.74rem;">
            ${icon('mapPin', 'icon-sm')}
            <span>Nenhuma viagem ativa</span>
          </div>
        `}

        <button type="button" class="btn btn-sunset" style="width:100%;margin-top:0.75rem;" data-nav="nova-viagem" id="sidebar-new-trip-btn">
          ${icon('plus', 'icon-sm')}
          <span>Nova Viagem</span>
        </button>
      </div>

      <nav class="sidebar-nav" aria-label="Menu lateral">
        ${navItems
          .map(
            (item) => `
          <button
            type="button"
            class="sidebar-link ${state.activeTab === item.id ? 'is-active' : ''}"
            data-nav="${item.id}"
            id="sidebar-link-${item.id}"
          >
            ${icon(item.ic, 'icon-sm')}
            <span>${item.label}</span>
          </button>
        `
          )
          .join('')}
      </nav>

      <div class="sidebar-footer">
        <div style="font-weight:800;">
          <span class="brand-wordmark-trip">Trip</span><span class="brand-wordmark-easy">Easy</span>
        </div>
        <div style="color:var(--stone-400);margin-top:0.15rem;">Tudo da sua viagem em um só lugar</div>
      </div>
    </aside>
  `;
}

function renderMobileBottomNav() {
  const items = [
    { id: 'visao-geral', label: 'Dashboard', ic: 'dashboard' },
    { id: 'itinerario', label: 'Itinerário', ic: 'calendar' },
    { id: 'checklist', label: 'Checklist', ic: 'checkSquare' },
    { id: 'nova-viagem', label: 'Criar', ic: 'plus', accent: true },
    { id: 'despesas', label: 'Despesas', ic: 'receipt' },
    { id: 'configuracoes', label: 'Config', ic: 'settings' },
  ];

  return `
    <nav class="mobile-bottom-nav" aria-label="Navegação móvel">
      ${items
        .map(
          (item) => `
        <button
          type="button"
          class="mobile-nav-btn ${item.accent ? 'mobile-nav-btn--accent' : ''} ${state.activeTab === item.id ? 'is-active' : ''}"
          data-nav="${item.id}"
        >
          ${icon(item.ic, 'icon-md')}
          <span>${item.label}</span>
        </button>
      `
        )
        .join('')}
    </nav>
  `;
}

function renderActiveView(activeTrip) {
  if (state.loadingTrips) {
    return `
      <div class="empty-state-card animate-fade-in">
        <h2 style="margin:0;font-size:1.25rem;font-weight:800;color:var(--stone-900);">Carregando suas viagens...</h2>
        <p style="margin:0;color:var(--stone-500);font-size:0.85rem;">Buscando os dados no servidor.</p>
      </div>
    `;
  }
  switch (state.activeTab) {
    case 'visao-geral':
      return renderDashboardView(state, activeTrip);
    case 'itinerario':
      return renderItinerarioView(state, activeTrip);
    case 'checklist':
      return renderChecklistView(state, activeTrip);
    case 'despesas':
      return renderDespesasView(state, activeTrip);
    case 'nova-viagem':
      return renderCreatorView(state);
    case 'configuracoes':
      return renderConfiguracoesView(state, activeTrip);
    default:
      return renderDashboardView(state, activeTrip);
  }
}

function bindGlobalNavigation(container) {
  container.addEventListener('click', (e) => {
    const navTarget = e.target.closest('[data-nav]');
    if (navTarget) {
      const nextTab = navTarget.dataset.nav;
      updateState({ activeTab: nextTab });
      return;
    }

    if (e.target.closest('[data-action="dismiss-api-error"]')) {
      updateState({ apiError: '' });
      return;
    }

    const logoutBtn = e.target.closest('[data-action="global-logout"]');
    if (logoutBtn) {
      handleLogout();
    }
  });
}

function render() {
  if (!rootEl) return;

  if (!state.isLoggedIn) {
    rootEl.innerHTML = `<div id="landing-root">${renderLandingPage(state)}</div>`;
    const landingRoot = rootEl.querySelector('#landing-root');
    if (landingRoot) {
      bindLandingEvents(landingRoot, state, updateState, handleLoginSuccess);
    }
    return;
  }

  const activeTrip = getActiveTrip();

  rootEl.innerHTML = `
    <div class="app-shell">
      ${renderWorkspaceHeader()}
      <div class="workspace-body">
        ${renderSidebar(activeTrip)}
        <main class="workspace-main" id="workspace-viewport">
          ${state.apiError ? `
            <div class="feedback-banner feedback-banner--error" style="display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1rem;">
              <span>${escapeHtml(state.apiError)}</span>
              <button type="button" class="btn btn-ghost btn-sm" data-action="dismiss-api-error">Fechar</button>
            </div>
          ` : ''}
          ${renderActiveView(activeTrip)}
        </main>
      </div>
      ${renderMobileBottomNav()}
    </div>
  `;

  const viewport = rootEl.querySelector('#workspace-viewport');
  if (!viewport) return;

  switch (state.activeTab) {
    case 'visao-geral':
      bindDashboardEvents(viewport, state, activeTrip, {
        updateState,
        onUpdateTrip: handleUpdateTrip,
      });
      break;
    case 'itinerario':
      bindItinerarioEvents(viewport, state, activeTrip, {
        updateState,
        onUpdateTrip: handleUpdateTrip,
      });
      break;
    case 'checklist':
      bindChecklistEvents(viewport, state, activeTrip, {
        updateState,
        onUpdateTrip: handleUpdateTrip,
      });
      break;
    case 'despesas':
      bindDespesasEvents(viewport, state, activeTrip, {
        updateState,
        onUpdateTrip: handleUpdateTrip,
      });
      break;
    case 'nova-viagem':
      bindCreatorEvents(viewport, state, {
        updateState,
        onCreateTrip: handleCreateTrip,
      });
      break;
    case 'configuracoes':
      bindConfiguracoesEvents(viewport, state, activeTrip, {
        updateState,
        onChangeUserName: handleChangeUserName,
        onChangeActiveTripId: handleChangeActiveTripId,
        onUpdateTrip: handleUpdateTrip,
        onDeleteTrip: handleDeleteTrip,
        onLogout: handleLogout,
      });
      break;
  }
}

if (rootEl) {
  bindGlobalNavigation(rootEl);
}
render();

// Se já havia login salvo, confere a sessão no servidor e carrega as viagens.
if (state.isLoggedIn) {
  loadTripsFromServer().catch((err) => {
    if (err && err.status === 403) {
      forceLogout('Sua sessão expirou. Entre novamente.');
    } else {
      handleApiError(err);
    }
  });
}
