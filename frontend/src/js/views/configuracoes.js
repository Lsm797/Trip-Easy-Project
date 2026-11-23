import { icon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import { brToIso, isoToBr, isValidIso, todayIso } from '../dates.js';
import { ASSETS, resolveDestinationImage } from '../data.js';

// menor data aceita: hoje (ou a data já salva, se ela já estiver no passado)
function minFor(savedIso) {
  const today = todayIso();
  return savedIso && savedIso < today ? savedIso : today;
}

// Lê a imagem escolhida, recorta o centro em quadrado e reduz para 256px (JPEG).
function imageFileToAvatar(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Esse arquivo não é uma imagem válida.'));
      img.onload = () => {
        const size = 256;
        const side = Math.min(img.width, img.height);
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        canvas.getContext('2d').drawImage(
          img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size
        );
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export function renderConfiguracoesView(state, activeTrip) {
  return `
    <div style="max-width:820px;margin:0 auto;" class="stack-lg animate-fade-in">
      <div>
        <span class="page-kicker" style="font-size:0.65rem;">Preferências</span>
        <h1 class="page-title" style="font-size:1.85rem;">Configurações Gerais</h1>
        <p class="page-subtitle">
          Gerencie seu perfil de passageiro, controle os destinos cadastrados e redefina os parâmetros.
        </p>
      </div>

      ${state.settingsFeedback ? `
        <div class="feedback-banner feedback-banner--success" style="margin-bottom:0;">
          <div style="display:flex;align-items:center;gap:0.5rem;">
            ${icon('checkCircle', 'icon-sm')}
            <span>${escapeHtml(state.settingsFeedback)}</span>
          </div>
          <button type="button" class="btn btn-ghost btn-sm" data-action="dismiss-settings-feedback">${icon('x', 'icon-xs')}</button>
        </div>
      ` : ''}

      <div class="grid-2">
        <div class="surface-card stack-sm">
          <h3 class="card-label" style="display:flex;align-items:center;gap:0.45rem;">
            <span style="color:var(--brand-600);display:flex;">${icon('user', 'icon-sm')}</span>
            <span>Perfil do Viajante</span>
          </h3>

          <div style="display:flex;align-items:center;gap:1rem;">
            <img src="${escapeHtml(state.avatarUrl || ASSETS.avatarImg)}" alt="Foto de perfil"
              style="width:72px;height:72px;border-radius:9999px;object-fit:cover;border:2px solid var(--stone-200);flex-shrink:0;" />
            <div class="stack-sm" style="gap:0.4rem;">
              <div class="row-gap">
                <label for="settings-avatar-file" class="btn btn-secondary btn-sm" style="cursor:pointer;">
                  ${icon('edit', 'icon-xs')}<span>Alterar foto</span>
                </label>
                ${state.avatarUrl ? `<button type="button" class="btn btn-ghost btn-sm" data-action="remove-avatar">Remover</button>` : ''}
              </div>
              <input type="file" id="settings-avatar-file" accept="image/*" style="display:none;" />
              ${state.avatarError ? `<span style="font-size:0.72rem;font-weight:700;color:var(--red-600);">${escapeHtml(state.avatarError)}</span>` : `
                <span style="font-size:0.7rem;color:var(--stone-400);">JPG ou PNG. Fica salva só neste navegador.</span>`}
            </div>
          </div>

          <form id="settings-profile-form" class="stack-sm">
            <div>
              <label class="field-label" for="settings-username">Seu Nome</label>
              <input
                type="text"
                id="settings-username"
                class="field-input"
                value="${escapeHtml(state.settingsNameDraft ?? state.userName)}"
                required
              />
            </div>
            <div>
              <button type="submit" class="btn btn-primary">Salvar Perfil</button>
            </div>
          </form>
        </div>

        <div class="surface-card stack-sm">
          <h3 class="card-label" style="display:flex;align-items:center;gap:0.45rem;">
            <span style="color:var(--sunset-500);display:flex;">${icon('layers', 'icon-sm')}</span>
            <span>Alternar Viagem Ativa</span>
          </h3>
          <p style="margin:0;font-size:0.76rem;color:var(--stone-500);line-height:1.5;">
            Escolha qual roteiro cadastrado está ativo no momento no seu painel principal.
          </p>
          <div>
            <label class="field-label" for="settings-active-trip-select">Viagens Criadas</label>
            <select id="settings-active-trip-select" class="field-select">
              ${state.tripsList.map((trip) => `
                <option value="${escapeHtml(trip.id)}" ${state.activeTripId === trip.id ? 'selected' : ''}>
                  ${escapeHtml(trip.name)} (${escapeHtml(trip.destination)})
                </option>
              `).join('')}
            </select>
          </div>
        </div>
      </div>

      ${activeTrip ? `
        <div class="surface-card stack-sm">
          <h3 class="card-label" style="display:flex;align-items:center;gap:0.45rem;">
            <span style="color:var(--brand-600);display:flex;">${icon('edit', 'icon-sm')}</span>
            <span>Dados da Viagem</span>
          </h3>
          ${state.tripEditError ? `
            <div class="feedback-banner feedback-banner--error" style="margin-bottom:0;">
              <span>${escapeHtml(state.tripEditError)}</span>
            </div>
          ` : ''}
          <form id="trip-edit-form" class="stack-sm" novalidate>
            <div class="grid-2">
              <div>
                <label class="field-label" for="trip-edit-name">Nome da viagem</label>
                <input type="text" id="trip-edit-name" class="field-input" maxlength="100" required
                  value="${escapeHtml(activeTrip.name)}" />
              </div>
              <div>
                <label class="field-label" for="trip-edit-destination">Destino</label>
                <input type="text" id="trip-edit-destination" class="field-input" maxlength="150" required
                  value="${escapeHtml(activeTrip.destination)}" />
              </div>
              <div>
                <label class="field-label" for="trip-edit-start">Data de ida</label>
                <input type="date" id="trip-edit-start" class="field-input" required
                  min="${escapeHtml(minFor(brToIso(activeTrip.startDate)))}"
                  value="${escapeHtml(brToIso(activeTrip.startDate) || '')}" />
              </div>
              <div>
                <label class="field-label" for="trip-edit-end">Data de volta</label>
                <input type="date" id="trip-edit-end" class="field-input" required
                  min="${escapeHtml(minFor(brToIso(activeTrip.endDate)))}"
                  value="${escapeHtml(brToIso(activeTrip.endDate) || '')}" />
              </div>
              <div>
                <label class="field-label" for="trip-edit-budget">Orçamento (R$)</label>
                <input type="number" id="trip-edit-budget" class="field-input" min="0" step="0.01" required
                  value="${escapeHtml(String(activeTrip.budgetLimit ?? 0))}" />
              </div>
            </div>
            <div>
              <button type="submit" class="btn btn-primary">Salvar alterações</button>
            </div>
          </form>
        </div>
      ` : ''}

      ${activeTrip ? `
        <div class="surface-card stack-sm">
          <div class="row-between" style="padding-bottom:0.75rem;border-bottom:1px solid var(--stone-100);">
            <h3 class="card-label" style="display:flex;align-items:center;gap:0.45rem;">
              <span style="color:var(--brand-600);display:flex;">${icon('checkSquare', 'icon-sm')}</span>
              <span>Todos os Itens do Checklist (${escapeHtml(activeTrip.name)})</span>
            </h3>
            <span style="font-size:0.72rem;font-weight:700;color:var(--stone-400);">Verifique os preparativos offline</span>
          </div>

          <div class="stack-sm" style="max-height:260px;overflow-y:auto;">
            ${activeTrip.tasks.length === 0 ? `
              <p style="margin:0;font-size:0.78rem;color:var(--stone-400);padding:1rem 0;">Nenhuma tarefa no checklist.</p>
            ` : activeTrip.tasks.map((task) => `
              <div class="row-between" style="padding:0.4rem 0.5rem;border-radius:0.6rem;">
                <label class="checklist-row ${task.completed ? 'is-done' : ''}" style="padding:0;flex:1;">
                  <input type="checkbox" ${task.completed ? 'checked' : ''} data-action="settings-toggle-task" data-task-id="${escapeHtml(task.id)}" />
                  <span>${escapeHtml(task.title)}</span>
                </label>
                <button
                  type="button"
                  class="btn btn-danger-soft btn-icon-sq"
                  style="width:30px;height:30px;min-height:30px;"
                  data-action="settings-delete-task"
                  data-task-id="${escapeHtml(task.id)}"
                  title="Remover tarefa"
                >
                  ${icon('trash', 'icon-xs')}
                </button>
              </div>
            `).join('')}
          </div>

          <form id="settings-add-task-form" style="display:flex;gap:0.5rem;margin-top:0.25rem;">
            <input
              type="text"
              id="settings-new-task"
              class="field-input"
              placeholder="Adicionar tarefa extra ao checklist..."
              value="${escapeHtml(state.settingsTaskDraft || '')}"
            />
            <button type="submit" class="btn btn-primary">
              ${icon('plus', 'icon-sm')}
              <span>Adicionar</span>
            </button>
          </form>
        </div>
      ` : ''}

      <div class="surface-card row-between">
        <div>
          <h4 style="margin:0;font-size:0.95rem;font-weight:800;color:var(--stone-900);">Sessão do Usuário</h4>
          <p style="margin:0.25rem 0 0;font-size:0.78rem;color:var(--stone-500);max-width:440px;">
            Você está conectado como <strong style="color:var(--brand-600);">${escapeHtml(state.userName)}</strong>. Clique no botão ao lado para desconectar de forma segura.
          </p>
        </div>
        <button type="button" class="btn" style="background:var(--brand-950);color:#fff;" data-action="logout">
          Sair da Conta
        </button>
      </div>

      ${activeTrip ? `
        <div style="background:var(--red-50);border:1px solid var(--red-100);border-radius:1.5rem;padding:1.5rem;" class="row-between">
          <div>
            <h4 style="margin:0;font-size:0.95rem;font-weight:800;color:var(--red-800);">Excluir esta viagem</h4>
            <p style="margin:0.25rem 0 0;font-size:0.78rem;color:var(--red-600);max-width:440px;">
              Apaga "${escapeHtml(activeTrip.name)}" com todo o roteiro, checklist e despesas. Essa ação não pode ser desfeita.
            </p>
          </div>

          ${state.confirmDeleteTrip ? `
            <div class="row-gap">
              <button type="button" class="btn btn-danger" data-action="confirm-delete-trip">Confirmar exclusão</button>
              <button type="button" class="btn btn-secondary" data-action="cancel-delete-trip">Cancelar</button>
            </div>
          ` : `
            <button type="button" class="btn btn-danger" data-action="ask-delete-trip">
              ${icon('trash', 'icon-sm')}
              <span>Excluir viagem</span>
            </button>
          `}
        </div>
      ` : ''}
    </div>
  `;
}

export function bindConfiguracoesEvents(
  container,
  state,
  activeTrip,
  { updateState, onChangeUserName, onChangeAvatar, onChangeActiveTripId, onUpdateTrip, onDeleteTrip, onLogout }
) {
  const nameInput = container.querySelector('#settings-username');
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      state.settingsNameDraft = nameInput.value;
    });
  }

  const profileForm = container.querySelector('#settings-profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = (state.settingsNameDraft ?? state.userName).trim();
      if (val) {
        onChangeUserName(val);
        updateState({ settingsNameDraft: val, settingsFeedback: 'Nome de usuário salvo com sucesso.' });
      }
    });
  }

  const tripSelect = container.querySelector('#settings-active-trip-select');
  if (tripSelect) {
    tripSelect.addEventListener('change', () => {
      onChangeActiveTripId(tripSelect.value);
      updateState({ settingsFeedback: 'Viagem ativa atualizada.' });
    });
  }

  const avatarFile = container.querySelector('#settings-avatar-file');
  if (avatarFile) {
    avatarFile.addEventListener('change', async () => {
      const file = avatarFile.files && avatarFile.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        updateState({ avatarError: 'Escolha um arquivo de imagem (JPG ou PNG).' });
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        updateState({ avatarError: 'A imagem é grande demais (máximo 8 MB).' });
        return;
      }
      try {
        const dataUrl = await imageFileToAvatar(file);
        state.avatarError = '';
        onChangeAvatar(dataUrl);
        updateState({ settingsFeedback: 'Foto de perfil atualizada.' });
      } catch (err) {
        updateState({ avatarError: err.message });
      }
    });
  }

  const tripEditForm = container.querySelector('#trip-edit-form');
  if (tripEditForm && activeTrip) {
    tripEditForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = tripEditForm.querySelector('#trip-edit-name').value.trim();
      const destination = tripEditForm.querySelector('#trip-edit-destination').value.trim();
      const startIso = tripEditForm.querySelector('#trip-edit-start').value;
      const endIso = tripEditForm.querySelector('#trip-edit-end').value;
      const budget = Number(tripEditForm.querySelector('#trip-edit-budget').value);

      const fail = (msg) => updateState({ tripEditError: msg });
      if (!name) return fail('Informe o nome da viagem.');
      if (!destination) return fail('Informe o destino.');
      if (!isValidIso(startIso) || !isValidIso(endIso)) return fail('Informe datas válidas.');
      if (endIso < startIso) return fail('A data de volta não pode ser anterior à data de ida.');
      // só exige "não passado" nas datas que o usuário de fato alterou
      const oldStart = brToIso(activeTrip.startDate);
      const oldEnd = brToIso(activeTrip.endDate);
      if (startIso !== oldStart && startIso < todayIso()) return fail('A nova data de ida não pode estar no passado.');
      if (endIso !== oldEnd && endIso < todayIso()) return fail('A nova data de volta não pode estar no passado.');
      if (Number.isNaN(budget) || budget < 0) return fail('Informe um orçamento válido.');

      state.tripEditError = '';
      state.settingsFeedback = 'Dados da viagem salvos.';
      onUpdateTrip({
        ...activeTrip,
        name,
        destination,
        startDate: isoToBr(startIso),
        endDate: isoToBr(endIso),
        budgetLimit: budget,
        bannerImage: resolveDestinationImage(destination),
      });
    });
  }

  const addTaskForm = container.querySelector('#settings-add-task-form');
  if (addTaskForm && activeTrip) {
    const taskInput = addTaskForm.querySelector('#settings-new-task');
    if (taskInput) {
      taskInput.addEventListener('input', () => {
        state.settingsTaskDraft = taskInput.value;
      });
    }
    addTaskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = (state.settingsTaskDraft || '').trim();
      if (!title) return;
      state.settingsTaskDraft = '';
      onUpdateTrip({
        ...activeTrip,
        tasks: [...activeTrip.tasks, { id: `task-conf-${Date.now()}`, title, completed: false }],
      });
    });
  }

  container.addEventListener('change', (e) => {
    const cb = e.target.closest('[data-action="settings-toggle-task"]');
    if (!cb || !activeTrip) return;
    const id = cb.dataset.taskId;
    onUpdateTrip({
      ...activeTrip,
      tasks: activeTrip.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    });
  });

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'settings-delete-task' && activeTrip) {
      const id = btn.dataset.taskId;
      onUpdateTrip({
        ...activeTrip,
        tasks: activeTrip.tasks.filter((t) => t.id !== id),
      });
    } else if (action === 'remove-avatar') {
      state.avatarError = '';
      onChangeAvatar('');
      updateState({ settingsFeedback: 'Foto de perfil removida.' });
    } else if (action === 'ask-delete-trip') {
      updateState({ confirmDeleteTrip: true });
    } else if (action === 'cancel-delete-trip') {
      updateState({ confirmDeleteTrip: false });
    } else if (action === 'confirm-delete-trip' && activeTrip) {
      state.confirmDeleteTrip = false;
      state.settingsFeedback = 'Viagem excluída.';
      onDeleteTrip(activeTrip.id);
    } else if (action === 'dismiss-settings-feedback') {
      updateState({ settingsFeedback: '' });
    } else if (action === 'logout') {
      onLogout();
    }
  });
}
