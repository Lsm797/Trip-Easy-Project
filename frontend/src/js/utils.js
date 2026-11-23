import { icon } from './icons.js';
import { LOGO_ICON_SRC } from './data.js';

export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatBRL(value, decimals = 2) {
  const num = Number(value) || 0;
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function renderBrandLogo({ variant = 'header', actionAttr = '' } = {}) {
  if (variant === 'badge') {
    return `
      <div class="brand-badge">
        <div class="brand-logo__mark brand-logo__mark--lg">
          <img src="${LOGO_ICON_SRC}" alt="TripEasy logotipo" referrerpolicy="no-referrer" />
        </div>
        <div style="text-align:left;">
          <span class="brand-badge__title">
            <span class="brand-wordmark-trip">Trip</span><span class="brand-wordmark-easy">Easy</span>
          </span>
          <span class="brand-badge__sub">Tudo da sua viagem em um só lugar</span>
        </div>
      </div>
    `;
  }

  if (variant === 'footer') {
    return `
      <div class="brand-logo brand-logo--static">
        <div class="brand-logo__mark brand-logo__mark--lg">
          <img src="${LOGO_ICON_SRC}" alt="TripEasy logotipo" referrerpolicy="no-referrer" />
        </div>
        <div>
          <span class="brand-logo__text" style="font-size:1.5rem;">
            <span class="brand-wordmark-trip">Trip</span><span class="brand-wordmark-easy">Easy</span>
          </span>
          <span class="brand-badge__sub">Tudo da sua viagem em um só lugar</span>
        </div>
      </div>
    `;
  }

  const tag = actionAttr ? 'button' : 'div';
  const attrs = actionAttr ? `type="button" ${actionAttr}` : '';
  return `
    <${tag} class="brand-logo ${actionAttr ? '' : 'brand-logo--static'}" ${attrs}>
      <div class="brand-logo__mark">
        <img src="${LOGO_ICON_SRC}" alt="TripEasy logotipo" referrerpolicy="no-referrer" />
      </div>
      <span class="brand-logo__text">
        <span class="brand-wordmark-trip">Trip</span><span class="brand-wordmark-easy">Easy</span>
      </span>
    </${tag}>
  `;
}

export function renderImgWithFallback(src, alt, fallbackLabel = '') {
  const safeSrc = escapeHtml(src);
  const safeAlt = escapeHtml(alt);
  const safeLabel = escapeHtml(fallbackLabel || alt);
  return `
    <div class="img-fallback-wrap">
      <img
        src="${safeSrc}"
        alt="${safeAlt}"
        referrerpolicy="no-referrer"
        onerror="this.parentElement.classList.add('is-broken')"
      />
      <div class="img-fallback-placeholder">
        ${icon('mapPin', 'icon-md')}
        <span>${safeLabel}</span>
      </div>
    </div>
  `;
}
