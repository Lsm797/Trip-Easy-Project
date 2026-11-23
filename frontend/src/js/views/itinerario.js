import { ASSETS, getSuggestedActivities } from '../data.js';
import { icon } from '../icons.js';
import { to24h, maskTime } from '../dates.js';
import { escapeHtml, renderImgWithFallback } from '../utils.js';

export function renderItinerarioView(state, activeTrip) {
  if (!activeTrip) {
    return `
      <div class="empty-state-card animate-fade-in">
        <div style="color:var(--brand-600);">${icon('compass', 'icon-2xl')}</div>
        <h2 style="margin:0;font-size:1.25rem;font-weight:800;color:var(--stone-900);">Nenhuma jornada em andamento</h2>
        <p style="margin:0;color:var(--stone-500);max-width:380px;font-size:0.85rem;">
          Crie ou selecione uma viagem ativa nas configurações para poder gerenciar o Roteiro Inteligente.
        </p>
        <button type="button" class="btn btn-primary" style="margin-top:0.75rem;" data-nav="nova-viagem">
          Criar Viagem
        </button>
      </div>
    `;
  }

  const selectedDayNumber = state.selectedDayNumber || 1;
  const mapZoom = state.mapZoom || 1;
  const activePin = state.activePin;

  // Gather activities for map pins
  const allActivities = activeTrip.itinerary.flatMap((d) =>
    d.activities.map((a, idx) => ({
      ...a,
      dayNumber: d.dayNumber,
      posLeft: 25 + ((idx * 23 + d.dayNumber * 17) % 52),
      posTop: 26 + ((idx * 27 + d.dayNumber * 13) % 48),
    }))
  );

  return `
    <div class="itinerary-shell animate-fade-in">
      <div class="itinerary-timeline-col no-scrollbar">
        <div class="row-between" style="margin-bottom:1rem;">
          <div>
            <span class="page-kicker" style="font-size:0.65rem;">Planejamento</span>
            <h2 style="margin:0.15rem 0 0;font-size:1.45rem;font-weight:800;color:var(--stone-900);">Roteiro Inteligente</h2>
          </div>

          <div class="row-gap">
            <button type="button" class="btn btn-secondary btn-sm" data-action="auto-recommend" id="btn-auto-recommend">
              ${icon('sparkles', 'icon-xs')}
              <span>Sugerir Roteiro</span>
            </button>

            <label for="itinerary-day-select" style="font-size:0.72rem;font-weight:600;color:var(--stone-500);">Dia:</label>
            <select id="itinerary-day-select" class="field-select" style="width:auto;height:34px;padding:0 0.65rem;font-size:0.74rem;color:var(--brand-700);">
              ${activeTrip.itinerary.map((day) => `
                <option value="${day.dayNumber}" ${selectedDayNumber === day.dayNumber ? 'selected' : ''}>
                  Dia ${day.dayNumber} (${escapeHtml(day.dateStr.split(',')[0])})
                </option>
              `).join('')}
              <option value="${activeTrip.itinerary.length + 1}" ${selectedDayNumber === activeTrip.itinerary.length + 1 ? 'selected' : ''}>
                Dia ${activeTrip.itinerary.length + 1} (Novo)
              </option>
            </select>
          </div>
        </div>

        <form id="itinerary-add-form" style="margin-bottom:1.5rem;display:flex;gap:0.5rem;flex-wrap:wrap;">
          <div class="input-with-icon" style="flex:1 1 220px;min-width:0;">
            <span class="input-with-icon__left">${icon('search', 'icon-sm')}</span>
            <input
              type="text"
              id="itinerary-search-input"
              class="field-input"
              style="height:46px;border-radius:1rem;"
              placeholder="Adicionar atividade (Museu, Parque, Almoço, Jantar...)"
              value="${escapeHtml(state.newActivityTitle || '')}"
            />
          </div>
          <input
            type="text"
            id="itinerary-location-input"
            class="field-input"
            style="height:46px;border-radius:1rem;flex:1 1 130px;min-width:0;"
            placeholder="Local (opcional)"
            maxlength="150"
            value="${escapeHtml(state.newActivityLocation || '')}"
          />
          <input
            type="text"
            id="itinerary-time-input"
            class="field-input"
            style="height:46px;border-radius:1rem;flex:0 0 84px;text-align:center;"
            inputmode="numeric"
            maxlength="5"
            placeholder="14:30"
            value="${escapeHtml(state.newActivityTime || '')}"
            title="Horário (24h, ex: 14:30)"
          />
          <button type="submit" class="btn btn-primary" style="height:46px;border-radius:1rem;">
            ${icon('plus', 'icon-sm')}
            <span>Adicionar</span>
          </button>
        </form>
        ${state.activityError ? `
          <p style="margin:-1rem 0 1rem;font-size:0.76rem;font-weight:700;color:var(--red-600);">${escapeHtml(state.activityError)}</p>
        ` : ''}

        <div style="flex:1;">
          ${activeTrip.itinerary.length === 0 ? `
            <div style="text-align:center;padding:3rem 1rem;color:var(--stone-400);">
              ${icon('compass', 'icon-xl')}
              <p style="font-size:0.8rem;font-weight:600;margin:0.75rem 0 0.25rem;">Você não possui atividades inseridas.</p>
              <p style="font-size:0.72rem;margin:0;">Use o campo acima ou clique em "Sugerir Roteiro" para começar.</p>
            </div>
          ` : activeTrip.itinerary.map((day) => `
            <section class="timeline-day-section">
              <div class="timeline-day-header">
                <span class="timeline-day-badge">Dia ${day.dayNumber}</span>
                <span style="font-size:0.74rem;font-weight:800;color:var(--stone-500);text-transform:uppercase;letter-spacing:0.05em;">
                  ${escapeHtml(day.dateStr)}
                </span>
              </div>

              <div class="timeline-line">
                ${day.activities.length === 0 ? `
                  <div style="padding:1rem;background:var(--canvas);border:1px dashed var(--stone-200);border-radius:1rem;font-size:0.76rem;text-align:center;color:var(--stone-400);">
                    Nenhuma atividade programada para este dia.
                  </div>
                ` : day.activities.map((act) => {
                  const isEditing = state.editingActivityId === act.id;
                  const isHighlighted = activePin === act.id;
                  return `
                    <div
                      class="activity-card ${isHighlighted ? 'is-highlighted' : ''}"
                      data-action="select-pin"
                      data-act-id="${escapeHtml(act.id)}"
                    >
                      <div class="activity-dot">${icon('mapPin', 'icon-xs')}</div>

                      ${isEditing ? `
                        <div class="stack-sm" data-stop-select>
                          <div class="grid-2" style="gap:0.5rem;">
                            <input
                              type="text"
                              id="edit-act-time"
                              class="field-input"
                              style="height:36px;background:#fff;"
                              inputmode="numeric"
                              maxlength="5"
                              placeholder="Horário (ex: 14:30)"
                              value="${escapeHtml(state.editingTime || '')}"
                            />
                            <input
                              type="text"
                              id="edit-act-title"
                              class="field-input"
                              style="height:36px;background:#fff;"
                              value="${escapeHtml(state.editingTitle)}"
                              placeholder="Nome da atividade"
                            />
                          </div>
                          <input
                            type="text"
                            id="edit-act-location"
                            class="field-input"
                            style="height:36px;background:#fff;"
                            maxlength="150"
                            value="${escapeHtml(state.editingLocation || '')}"
                            placeholder="Local (opcional)"
                          />
                          <textarea
                            id="edit-act-desc"
                            class="field-textarea"
                            rows="2"
                            style="background:#fff;"
                            placeholder="Descrição"
                          >${escapeHtml(state.editingDesc)}</textarea>
                          <div style="display:flex;justify-content:flex-end;gap:0.4rem;">
                            <button type="button" class="btn btn-primary btn-sm" data-action="save-edit-act" data-day="${day.dayNumber}">
                              ${icon('check', 'icon-xs')}
                              <span>Salvar</span>
                            </button>
                            <button type="button" class="btn btn-secondary btn-sm" data-action="cancel-edit-act">
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ` : `
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.75rem;">
                          <div style="flex:1;min-width:0;">
                            <div style="display:flex;align-items:center;gap:0.35rem;font-size:0.68rem;font-weight:800;color:var(--sunset-500);text-transform:uppercase;">
                              ${icon('clock', 'icon-xs')}
                              <span class="tabular-nums">${escapeHtml(act.time)}</span>
                            </div>
                            <h4 style="margin:0.25rem 0 0;font-size:0.9rem;font-weight:800;color:var(--stone-900);">${escapeHtml(act.title)}</h4>
                            ${act.location ? `
                              <div style="display:flex;align-items:center;gap:0.3rem;margin-top:0.2rem;font-size:0.72rem;font-weight:700;color:var(--brand-600);">
                                ${icon('mapPin', 'icon-xs')}<span>${escapeHtml(act.location)}</span>
                              </div>
                            ` : ''}
                            <p style="margin:0.25rem 0 0;font-size:0.78rem;font-weight:500;color:var(--stone-600);line-height:1.5;">
                              ${escapeHtml(act.description)}
                            </p>
                          </div>
                          <div style="display:flex;gap:0.25rem;flex-shrink:0;" data-stop-select>
                            <button
                              type="button"
                              class="btn btn-ghost btn-icon-sq"
                              style="color:var(--brand-600);"
                              data-action="start-edit-act"
                              data-act-id="${escapeHtml(act.id)}"
                              title="Editar atividade"
                            >
                              ${icon('edit', 'icon-xs')}
                            </button>
                            <button
                              type="button"
                              class="btn btn-ghost btn-icon-sq"
                              style="color:var(--red-500);"
                              data-action="delete-act"
                              data-day="${day.dayNumber}"
                              data-act-id="${escapeHtml(act.id)}"
                              title="Remover atividade"
                            >
                              ${icon('trash', 'icon-xs')}
                            </button>
                          </div>
                        </div>
                      `}
                    </div>
                  `;
                }).join('')}
              </div>
            </section>
          `).join('')}
        </div>
      </div>

      <div class="itinerary-map-col">
        <div class="itinerary-map-canvas" style="transform:scale(${mapZoom});">
          ${renderImgWithFallback(ASSETS.mapImg, 'Mapa interativo do destino', activeTrip.destination)}
          ${allActivities.map((pin) => `
            <button
              type="button"
              class="map-pin-cluster ${activePin === pin.id ? 'is-active' : ''}"
              style="left:${pin.posLeft}%;top:${pin.posTop}%;background:transparent;border:none;padding:0;"
              data-action="select-pin"
              data-act-id="${escapeHtml(pin.id)}"
              title="${escapeHtml(pin.title)}"
            >
              <span class="map-pin-label">${escapeHtml(pin.title)}</span>
              <span class="map-pin-dot">${icon('mapPin', 'icon-sm')}</span>
            </button>
          `).join('')}
          ${allActivities.length === 0 ? `
            <div class="map-pin-cluster is-active" style="left:50%;top:48%;">
              <span class="map-pin-label">${escapeHtml(activeTrip.destination.split(',')[0])}</span>
              <span class="map-pin-dot">${icon('compass', 'icon-md')}</span>
            </div>
          ` : ''}
        </div>

        <div class="map-controls">
          <button type="button" class="map-ctrl-btn" data-action="map-zoom-in" title="Aumentar zoom">${icon('zoomIn', 'icon-sm')}</button>
          <button type="button" class="map-ctrl-btn" data-action="map-zoom-out" title="Diminuir zoom">${icon('zoomOut', 'icon-sm')}</button>
          <button type="button" class="map-ctrl-btn" style="color:var(--brand-600);" data-action="map-recenter" title="Centralizar mapa">${icon('navigation', 'icon-sm')}</button>
        </div>
      </div>
    </div>
  `;
}

export function bindItinerarioEvents(container, state, activeTrip, { updateState, onUpdateTrip }) {
  const daySelect = container.querySelector('#itinerary-day-select');
  if (daySelect) {
    daySelect.addEventListener('change', () => {
      updateState({ selectedDayNumber: Number(daySelect.value) });
    });
  }

  const addForm = container.querySelector('#itinerary-add-form');
  if (addForm && activeTrip) {
    const input = addForm.querySelector('#itinerary-search-input');
    if (input) {
      input.addEventListener('input', () => {
        state.newActivityTitle = input.value;
      });
    }
    const locInput = addForm.querySelector('#itinerary-location-input');
    if (locInput) locInput.addEventListener('input', () => { state.newActivityLocation = locInput.value; });
    const timeInput = addForm.querySelector('#itinerary-time-input');
    if (timeInput) {
      timeInput.addEventListener('input', () => {
        timeInput.value = maskTime(timeInput.value);
        state.newActivityTime = timeInput.value;
      });
    }
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = (state.newActivityTitle || '').trim();
      if (!title) return;
      const timeText = (state.newActivityTime || '').trim();
      const time24 = timeText ? to24h(timeText) : '09:00';
      if (!time24) {
        updateState({ activityError: 'Horário inválido. Use o formato 24h, por exemplo 14:30.' });
        return;
      }
      state.activityError = '';
      const dayNum = state.selectedDayNumber || 1;
      const newAct = {
        id: `act-${Date.now()}`,
        time: time24,
        title,
        location: (state.newActivityLocation || '').trim(),
        description: '',
        icon: 'compass',
      };
      const updatedItinerary = activeTrip.itinerary.map((d) => ({ ...d, activities: [...d.activities] }));
      let targetDay = updatedItinerary.find((d) => d.dayNumber === dayNum);
      if (!targetDay) {
        targetDay = { dayNumber: dayNum, dateStr: `Dia ${dayNum}`, activities: [] };
        updatedItinerary.push(targetDay);
      }
      targetDay.activities.push(newAct);
      state.newActivityTitle = '';
      state.newActivityLocation = '';
      state.activePin = newAct.id;
      onUpdateTrip({ ...activeTrip, itinerary: updatedItinerary });
    });
  }

  // Edit inputs binding
  const editTimeInput = container.querySelector('#edit-act-time');
  const editTitleInput = container.querySelector('#edit-act-title');
  const editDescInput = container.querySelector('#edit-act-desc');
  const editLocInput = container.querySelector('#edit-act-location');
  if (editLocInput) editLocInput.addEventListener('input', () => { state.editingLocation = editLocInput.value; });
  if (editTimeInput) {
    editTimeInput.addEventListener('input', () => {
      editTimeInput.value = maskTime(editTimeInput.value);
      state.editingTime = editTimeInput.value;
    });
  }
  if (editTitleInput) editTitleInput.addEventListener('input', () => { state.editingTitle = editTitleInput.value; });
  if (editDescInput) editDescInput.addEventListener('input', () => { state.editingDesc = editDescInput.value; });

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn || !activeTrip) return;
    const action = btn.dataset.action;
    if (action === 'select-pin' && e.target.closest('[data-stop-select]')) return;

    if (action === 'select-pin') {
      updateState({ activePin: btn.dataset.actId });
    } else if (action === 'map-zoom-in') {
      updateState({ mapZoom: Math.min(1.6, Number(((state.mapZoom || 1) + 0.15).toFixed(2))) });
    } else if (action === 'map-zoom-out') {
      updateState({ mapZoom: Math.max(0.85, Number(((state.mapZoom || 1) - 0.15).toFixed(2))) });
    } else if (action === 'map-recenter') {
      updateState({ mapZoom: 1 });
    } else if (action === 'delete-act') {
      const dayNum = Number(btn.dataset.day);
      const actId = btn.dataset.actId;
      const updatedItinerary = activeTrip.itinerary.map((d) =>
        d.dayNumber === dayNum
          ? { ...d, activities: d.activities.filter((a) => a.id !== actId) }
          : d
      );
      onUpdateTrip({ ...activeTrip, itinerary: updatedItinerary });
    } else if (action === 'start-edit-act') {
      const actId = btn.dataset.actId;
      for (const day of activeTrip.itinerary) {
        const found = day.activities.find((a) => a.id === actId);
        if (found) {
          updateState({
            editingActivityId: found.id,
            editingTitle: found.title,
            editingDesc: found.description,
            editingLocation: found.location || '',
            editingTime: found.time,
          });
          break;
        }
      }
    } else if (action === 'cancel-edit-act') {
      updateState({ editingActivityId: null, activityError: '' });
    } else if (action === 'save-edit-act') {
      const editTime24 = to24h(state.editingTime);
      if (!editTime24) {
        updateState({ activityError: 'Horário inválido. Use o formato 24h, por exemplo 14:30.' });
        return;
      }
      state.activityError = '';
      state.editingTime = editTime24;
      const dayNum = Number(btn.dataset.day);
      const updatedItinerary = activeTrip.itinerary.map((day) => {
        if (day.dayNumber !== dayNum) return day;
        return {
          ...day,
          activities: day.activities.map((a) =>
            a.id === state.editingActivityId
              ? {
                  ...a,
                  title: state.editingTitle,
                  description: state.editingDesc,
                  location: (state.editingLocation || '').trim(),
                  time: state.editingTime,
                }
              : a
          ),
        };
      });
      state.editingActivityId = null;
      onUpdateTrip({ ...activeTrip, itinerary: updatedItinerary });
    } else if (action === 'auto-recommend') {
      const dayNum = state.selectedDayNumber || 1;
      const suggested = getSuggestedActivities(activeTrip.destination);

      const updatedItinerary = activeTrip.itinerary.map((d) => ({ ...d, activities: [...d.activities] }));
      let targetDay = updatedItinerary.find((d) => d.dayNumber === dayNum);
      if (!targetDay) {
        targetDay = { dayNumber: dayNum, dateStr: `Dia ${dayNum}`, activities: [] };
        updatedItinerary.push(targetDay);
      }
      targetDay.activities.push(...suggested);
      state.activePin = suggested[0].id;
      onUpdateTrip({ ...activeTrip, itinerary: updatedItinerary });
    }
  });
}
