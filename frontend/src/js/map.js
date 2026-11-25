// Mapa real com Leaflet + OpenStreetMap.
// - Tiles (imagens do mapa): OpenStreetMap (gratuito, sem chave).
// - Busca de coordenadas (geocodificação): Nominatim/OpenStreetMap, no máximo 1 busca por segundo.
//   Os resultados ficam guardados no navegador para não repetir a busca.
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CACHE_KEY = 'tripeasy_geocache_v1';
const MIN_INTERVAL_MS = 1100;

// ---------- geocodificação ----------
let diskCache = {};
try {
  diskCache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') || {};
} catch {
  diskCache = {};
}
const missCache = new Set(); // buscas sem resultado (só nesta sessão)
const inflight = new Map();
let queue = Promise.resolve();
let lastRequestAt = 0;

function saveCache() {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(diskCache));
  } catch {
    /* sem espaço ou bloqueado: segue sem cache */
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function geocode(query) {
  const key = String(query || '').trim().toLowerCase();
  if (!key) return Promise.resolve(null);
  if (diskCache[key]) return Promise.resolve(diskCache[key]);
  if (missCache.has(key)) return Promise.resolve(null);
  if (inflight.has(key)) return inflight.get(key);

  const job = queue.then(async () => {
    const wait = lastRequestAt + MIN_INTERVAL_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastRequestAt = Date.now();
    try {
      const url =
        'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=pt-BR&q=' +
        encodeURIComponent(query);
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) return null;
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        missCache.add(key);
        return null;
      }
      const point = { lat: Number(data[0].lat), lon: Number(data[0].lon) };
      if (Number.isNaN(point.lat) || Number.isNaN(point.lon)) return null;
      diskCache[key] = point;
      saveCache();
      return point;
    } catch {
      return null; // sem internet: tenta de novo na próxima vez
    }
  });
  queue = job.then(() => undefined, () => undefined);
  const tracked = job.finally(() => inflight.delete(key));
  inflight.set(key, tracked);
  return tracked;
}

// ---------- mapa ----------
let current = null; // { map, observer }
let savedView = null; // { key, center, zoom } — mantém o zoom/posição entre as atualizações da tela

export function destroyMap() {
  if (!current) return;
  try {
    current.observer?.disconnect();
    current.map.remove();
  } catch {
    /* já removido */
  }
  current = null;
}

function pinIcon(active) {
  return L.divIcon({
    className: `tz-pin${active ? ' is-active' : ''}`,
    html: '<span></span>',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    tooltipAnchor: [0, -28],
  });
}

/**
 * Desenha o mapa dentro de `el`.
 * opts: { key, destination, pins: [{ id, title, location }], activeId, interactive, onSelect, onStatus }
 */
export function mountMap(el, opts) {
  destroyMap();
  if (!el) return;

  const {
    key = '',
    destination = '',
    pins = [],
    activeId = null,
    interactive = true,
    onSelect = () => {},
    onStatus = () => {},
  } = opts;

  let map;
  try {
    map = L.map(el, {
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      touchZoom: interactive,
      boxZoom: interactive,
      keyboard: interactive,
    });
  } catch (err) {
    console.error('Não foi possível iniciar o mapa:', err);
    onStatus('Não foi possível carregar o mapa.');
    return;
  }

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
  }).addTo(map);

  const observer = typeof ResizeObserver === 'function'
    ? new ResizeObserver(() => map.invalidateSize())
    : null;
  observer?.observe(el);
  current = { map, observer };

  const viewKey = `${key}|${pins.map((p) => `${p.id}:${p.location}`).join(',')}`;
  const restored = savedView && savedView.key === viewKey;
  if (restored) {
    map.setView(savedView.center, savedView.zoom);
  } else {
    map.setView([-14.24, -51.93], 4); // Brasil, até achar o destino
  }
  map.on('moveend', () => {
    savedView = { key: viewKey, center: map.getCenter(), zoom: map.getZoom() };
  });

  const alive = () => current && current.map === map;
  const markers = [];
  const bounds = [];

  const addMarker = (point, title, id) => {
    const isActive = id != null && id === activeId;
    const marker = L.marker([point.lat, point.lon], { icon: pinIcon(isActive), title, keyboard: interactive })
      .addTo(map)
      .bindTooltip(title, { direction: 'top', offset: [0, -4] });
    if (interactive && id != null) marker.on('click', () => onSelect(id));
    markers.push(marker);
    bounds.push([point.lat, point.lon]);
    return marker;
  };

  (async () => {
    const destPoint = await geocode(destination);
    if (!alive()) return;
    if (destPoint && !restored) map.setView([destPoint.lat, destPoint.lon], 12);

    const withLocation = pins.filter((p) => (p.location || '').trim());
    if (withLocation.length === 0) {
      if (destPoint) addMarker(destPoint, String(destination).split(',')[0], null);
      onStatus(pins.length > 0 ? 'Informe o local das atividades para ver cada uma no mapa.' : '');
      return;
    }

    let found = 0;
    for (const pin of withLocation) {
      const point = await geocode(`${pin.location}, ${destination}`);
      if (!alive()) return;
      if (!point) continue;
      found += 1;
      const marker = addMarker(point, pin.title, pin.id);
      if (pin.id === activeId) {
        map.setView(marker.getLatLng(), Math.max(map.getZoom(), 14));
      }
    }

    if (found === 0 && destPoint) addMarker(destPoint, String(destination).split(',')[0], null);
    if (!restored && !activeId && bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else if (!restored && !activeId && bounds.length === 1) {
      map.setView(bounds[0], 14);
    }
    const missing = withLocation.length - found;
    onStatus(missing > 0 ? `${missing} local(is) não encontrado(s) no mapa. Tente um nome mais completo.` : '');
  })();

  requestAnimationFrame(() => alive() && map.invalidateSize());
}
