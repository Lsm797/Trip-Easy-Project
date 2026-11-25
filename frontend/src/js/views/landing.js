import { ASSETS } from '../data.js';
import { icon } from '../icons.js';
import {
  apiLogin,
  apiRegister,
  apiRequestPasswordReset,
  apiResetPassword,
  knownUserName,
  rememberUserName,
} from '../api.js';
import { escapeHtml, renderBrandLogo, renderImgWithFallback } from '../utils.js';
import { PASSWORD_HINT, isValidEmail, validatePassword } from '../password.js';

export function renderLandingPage(state) {
  const { authMode, showPassword, authForm, authError, authSuccess } = state;

  return `
    <div class="landing-shell">
      <header class="landing-header">
        <div class="landing-header__inner">
          <div id="landing-brand-logo">
            ${renderBrandLogo({ variant: 'header' })}
          </div>

          <nav class="landing-nav" aria-label="Navegação principal">
            <a href="#recursos">Recursos</a>
            <a href="#beneficios">Benefícios</a>
            <a href="#comecar">Começar</a>
          </nav>

          <div class="landing-header__actions">
            <button type="button" class="btn btn-ghost" data-action="open-auth" data-mode="login" id="landing-btn-login">
              Fazer Login
            </button>
            <button type="button" class="btn btn-primary" data-action="open-auth" data-mode="register" id="landing-btn-signup">
              Criar Conta
            </button>
          </div>
        </div>
      </header>

      <section class="hero-section">
        <div class="hero-section__bg">
          ${renderImgWithFallback(ASSETS.gramadoImg, 'Paisagem Brasileira', 'Brasil')}
          <div class="hero-section__scrim"></div>
        </div>

        <div class="hero-section__content animate-fade-in">
          <div style="display:flex;justify-content:center;">
            ${renderBrandLogo({ variant: 'badge' })}
          </div>

          <p class="hero-kicker">Planejamento de Viagem Inteligente</p>

          <h1 class="hero-title">Viaje com Inteligência pelo Brasil</h1>

          <p class="hero-subtitle">
            A TripEasy simplifica sua jornada brasileira, dos Lençóis Maranhenses às praias do Rio, com roteiros inteligentes, checklists e despesas sob controle constante.
          </p>

          <div style="display:flex;justify-content:center;gap:1rem;flex-wrap:wrap;">
            <button
              type="button"
              class="btn btn-sunset btn-lg"
              data-action="open-auth"
              data-mode="register"
              id="hero-btn-action-register"
            >
              <span>Começar Agora</span>
              ${icon('arrowRight', 'icon-sm')}
            </button>
          </div>
        </div>
      </section>

      <section class="landing-section" id="recursos">
        <div class="section-head">
          <p class="section-kicker">Recursos Inteligentes</p>
          <h2 class="section-title">
            Sua próxima aventura no Brasil merece uma organização de alto nível sem estresse
          </h2>
          <div class="section-bar"></div>
        </div>

        <div class="landing-bento">
          <div class="bento-card col-span-8">
            <div style="max-width:420px;position:relative;z-index:2;">
              <div class="bento-icon-box">
                ${icon('dashboard', 'icon-md')}
              </div>
              <h3 class="bento-card__title">Dashboard Centralizado</h3>
              <p class="bento-card__desc">
                Visualize todos os detalhes de sua viagem por destinos brasileiros em um único lugar intuitivo. Gerencie cronogramas, acompanhe prazos e tenha controle total em segundos.
              </p>
            </div>
          </div>

          <div class="bento-card bento-card--sunset col-span-4">
            <div>
              <div class="bento-icon-box">
                ${icon('receipt', 'icon-md')}
              </div>
              <h3 class="bento-card__title">Controle de Custos</h3>
              <p class="bento-card__desc">
                Organize e monitore seus gastos divididos por categorias automáticas, com limites de orçamento e estimativas reais para não extrapolar.
              </p>
            </div>
            <div style="margin-top:1.5rem;background:rgba(255,255,255,0.16);border:1px solid rgba(255,255,255,0.25);border-radius:0.875rem;padding:0.75rem 1rem;font-size:0.74rem;font-weight:700;">
              Orçamento e metas sob controle
            </div>
          </div>

          <div class="bento-card col-span-6">
            <div>
              <div class="bento-icon-box">
                ${icon('compass', 'icon-md')}
              </div>
              <h3 class="bento-card__title">Roteiros Customizados</h3>
              <p class="bento-card__desc" style="margin-bottom:1.5rem;">
                Monte roteiros detalhados por hora ou por blocos do dia para os melhores pontos turísticos do Rio de Janeiro, dunas do Nordeste ou floresta da Amazônia.
              </p>
            </div>
            <div style="padding-top:0.9rem;border-top:1px solid var(--stone-100);">
              <button
                type="button"
                class="btn btn-ghost btn-sm"
                style="padding-left:0;color:var(--brand-600);font-weight:800;"
                data-action="open-auth"
                data-mode="register"
              >
                <span>Criar meu primeiro roteiro</span>
                ${icon('arrowRight', 'icon-xs')}
              </button>
            </div>
          </div>

          <div class="bento-card bento-card--emerald col-span-6">
            <div>
              <p style="font-size:0.68rem;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;color:var(--sunset-400);margin:0 0 0.5rem;">
                Confiabilidade e Experiência
              </p>
              <h3 style="font-size:1.15rem;font-weight:700;line-height:1.35;margin:0;">
                A confiança de milhares de viajantes explorando novos caminhos pelo Brasil.
              </h3>
            </div>
            <div class="bento-stats-grid">
              <div>
                <p class="bento-stat-value tabular-nums">15k+</p>
                <p class="bento-stat-label">Viagens</p>
              </div>
              <div>
                <p class="bento-stat-value tabular-nums">50k</p>
                <p class="bento-stat-label">Usuários</p>
              </div>
              <div>
                <p class="bento-stat-value tabular-nums">99%</p>
                <p class="bento-stat-label">Satisfação</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="benefits-band" id="beneficios">
        <div class="benefits-grid">
          <div class="benefit-item">
            <div class="benefit-icon" style="background:var(--sunset-100);color:var(--sunset-600);">
              ${icon('sun', 'icon-md')}
            </div>
            <div>
              <h4>Destinos Brasileiros</h4>
              <p>Suporte nativo para os melhores municípios brasileiros, praias paradisíacas e destinos ecológicos.</p>
            </div>
          </div>

          <div class="benefit-item">
            <div class="benefit-icon" style="background:var(--brand-100);color:var(--brand-700);">
              ${icon('shield', 'icon-md')}
            </div>
            <div>
              <h4>Backup na Nuvem Local</h4>
              <p>Seus dados de itinerário e listas salvos de forma rápida para acesso offline a qualquer hora da viagem.</p>
            </div>
          </div>

          <div class="benefit-item">
            <div class="benefit-icon" style="background:var(--amber-100);color:var(--amber-700);">
              ${icon('globe', 'icon-md')}
            </div>
            <div>
              <h4>Interface Fluida e Leve</h4>
              <p>Carregamento ultra-rápido para manter você focado no que importa: curtir seus trajetos sem preocupação.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="cta-band" id="comecar">
        <div class="cta-band__inner">
          <h3>Pronto para sua próxima aventura brasileira?</h3>
          <p>
            Junte-se à TripEasy e experimente a liberdade de planejar e gerenciar sua viagem pelo Brasil com extrema facilidade e controle.
          </p>
          <button
            type="button"
            class="btn btn-primary btn-lg"
            data-action="open-auth"
            data-mode="register"
          >
            <span>Cadastrar Gratuitamente</span>
            ${icon('arrowRight', 'icon-sm')}
          </button>
        </div>
      </section>

      <footer class="landing-footer">
        <div class="landing-footer__top">
          <div style="display:flex;flex-wrap:wrap;align-items:center;gap:1.5rem;">
            ${renderBrandLogo({ variant: 'footer' })}
            <p style="font-size:0.78rem;color:var(--stone-500);max-width:300px;margin:0;">
              Sua viagem, simplificada por completo. Um aplicativo nacional focado no planejamento inteligente e controle de despesas.
            </p>
          </div>
          <div class="landing-footer__cols">
            <div class="landing-footer__col">
              <p class="landing-footer__col-title">Explorar</p>
              <ul>
                <li><a href="#recursos">Recursos</a></li>
                <li><a href="#beneficios">Benefícios</a></li>
              </ul>
            </div>
            <div class="landing-footer__col">
              <p class="landing-footer__col-title">Conta</p>
              <ul>
                <li><button type="button" data-action="open-auth" data-mode="login">Entrar</button></li>
                <li><button type="button" data-action="open-auth" data-mode="register">Criar conta</button></li>
              </ul>
            </div>
            <div class="landing-footer__col">
              <p class="landing-footer__col-title">Conecte-se</p>
              <ul>
                <li><a href="#comecar">Começar agora</a></li>
                <li><a href="#recursos">Roteiros</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div class="landing-footer__bottom">
          <p style="margin:0;">© ${new Date().getFullYear()} TripEasy. Todos os direitos reservados.</p>
          <div style="display:flex;align-items:center;gap:0.65rem;">
            <span>Orgulhosamente brasileiro</span>
            <span aria-hidden="true">·</span>
            <span>Seguro e Protegido</span>
          </div>
        </div>
      </footer>

      ${authMode !== 'none' ? renderAuthModal({ authMode, showPassword, authForm, authError, authSuccess }) : ''}
    </div>
  `;
}

function renderAuthModal({ authMode, showPassword, authForm, authError, authSuccess }) {
  const isLogin = authMode === 'login';
  const isForgot = authMode === 'forgot';
  const isReset = authMode === 'reset';
  const isRegister = authMode === 'register';
  const titles = {
    login: ['Acessar Conta', 'Digite suas credenciais de acesso.'],
    register: ['Criar Nova Conta', 'Preencha os dados abaixo gratuitamente.'],
    forgot: ['Recuperar Senha', 'Informe o e-mail da conta para gerar um código de recuperação.'],
    reset: ['Criar Nova Senha', 'Digite o código recebido e escolha a nova senha.'],
  };
  const [modalTitle, modalSubtitle] = titles[authMode] || titles.login;
  const submitLabel = { login: 'Entrar', register: 'Cadastrar', forgot: 'Enviar código', reset: 'Redefinir senha' }[authMode] || 'Entrar';
  return `
    <div class="modal-backdrop" data-action="close-auth-backdrop" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <div class="modal-card animate-modal-in">
        <div class="modal-header">
          ${renderBrandLogo({ variant: 'header' })}
          <button type="button" class="btn btn-secondary btn-icon" style="width:32px;height:32px;min-height:32px;" data-action="close-auth" aria-label="Fechar modal">
            ${icon('x', 'icon-sm')}
          </button>
        </div>

        <div class="modal-body">
          <div style="margin-bottom:1.25rem;">
            <h3 id="auth-modal-title" style="margin:0;font-size:1.15rem;font-weight:800;color:var(--stone-900);">
              ${modalTitle}
            </h3>
            <p style="margin:0.25rem 0 0;font-size:0.78rem;font-weight:500;color:var(--stone-500);">
              ${modalSubtitle}
            </p>
          </div>

          ${authError ? `<div class="feedback-banner feedback-banner--error">${escapeHtml(authError)}</div>` : ''}
          ${authSuccess ? `<div class="feedback-banner feedback-banner--success">${icon('checkCircle', 'icon-sm')}<span>${escapeHtml(authSuccess)}</span></div>` : ''}

          <form id="auth-form" class="stack-sm">
            ${isRegister ? `
              <div>
                <label class="field-label" for="auth-name-field">Seu Nome</label>
                <div class="input-with-icon">
                  <span class="input-with-icon__left">${icon('user', 'icon-sm')}</span>
                  <input
                    type="text"
                    id="auth-name-field"
                    name="name"
                    class="field-input"
                    placeholder="Alex Silva"
                    value="${escapeHtml(authForm.name)}"
                  />
                </div>
              </div>
            ` : ''}

            <div>
              <label class="field-label" for="auth-email-field">E-mail</label>
              <div class="input-with-icon">
                <span class="input-with-icon__left">${icon('mail', 'icon-sm')}</span>
                <input
                  type="email"
                  id="auth-email-field"
                  name="email"
                  class="field-input"
                  placeholder="nome@exemplo.com"
                  value="${escapeHtml(authForm.email)}"
                  ${isReset ? 'readonly' : ''}
                />
              </div>
            </div>

            ${isReset ? `
              <div>
                <label class="field-label" for="auth-code-field">Código de 6 dígitos</label>
                <div class="input-with-icon">
                  <span class="input-with-icon__left">${icon('lock', 'icon-sm')}</span>
                  <input
                    type="text"
                    id="auth-code-field"
                    name="code"
                    class="field-input"
                    inputmode="numeric"
                    maxlength="6"
                    autocomplete="one-time-code"
                    placeholder="000000"
                    value="${escapeHtml(authForm.code || '')}"
                  />
                </div>
              </div>
            ` : ''}

            ${!isForgot ? `
            <div>
              <label class="field-label" for="auth-password-field">${isReset ? 'Nova senha' : 'Senha'}</label>
              <div class="input-with-icon">
                <span class="input-with-icon__left">${icon('lock', 'icon-sm')}</span>
                <input
                  type="${showPassword ? 'text' : 'password'}"
                  id="auth-password-field"
                  name="password"
                  class="field-input"
                  style="padding-right:2.5rem;"
                  placeholder="••••••••"
                  value="${escapeHtml(authForm.password)}"
                />
                <button
                  type="button"
                  class="input-with-icon__right"
                  data-action="toggle-password"
                  aria-label="Alternar visibilidade da senha"
                >
                  ${icon(showPassword ? 'eyeOff' : 'eye', 'icon-sm')}
                </button>
              </div>
              ${(isRegister || isReset) ? `
                <p style="margin:0.35rem 0 0;font-size:0.7rem;color:var(--stone-400);">${PASSWORD_HINT}</p>
              ` : ''}
            </div>
            ` : ''}

            ${isReset ? `
              <div>
                <label class="field-label" for="auth-confirm-field">Confirmar nova senha</label>
                <div class="input-with-icon">
                  <span class="input-with-icon__left">${icon('lock', 'icon-sm')}</span>
                  <input
                    type="${showPassword ? 'text' : 'password'}"
                    id="auth-confirm-field"
                    name="confirm"
                    class="field-input"
                    placeholder="••••••••"
                    value="${escapeHtml(authForm.confirm || '')}"
                  />
                </div>
              </div>
            ` : ''}

            ${isLogin ? `
              <div style="text-align:right;margin-top:-0.25rem;">
                <button type="button" class="btn btn-ghost btn-sm" style="color:var(--brand-600);font-weight:700;padding:0;min-height:auto;" data-action="switch-auth" data-mode="forgot">
                  Esqueceu a senha?
                </button>
              </div>
            ` : ''}

            <button type="submit" class="btn btn-primary" style="width:100%;margin-top:0.35rem;min-height:44px;font-weight:800;">
              ${submitLabel}
            </button>
          </form>


          <div style="display:flex;align-items:center;gap:0.75rem;margin:1rem 0 0.75rem;">
            <div style="flex:1;border-top:1px solid var(--stone-100);"></div>
            <span style="font-size:0.65rem;font-weight:800;color:var(--stone-400);text-transform:uppercase;letter-spacing:0.08em;">ou</span>
            <div style="flex:1;border-top:1px solid var(--stone-100);"></div>
          </div>

          <div style="text-align:center;">
            ${isReset ? `
              <button type="button" class="btn btn-ghost btn-sm" style="color:var(--brand-600);font-weight:700;" data-action="switch-auth" data-mode="forgot">
                Não recebeu? Gerar novo código
              </button>
              <br />
              <button type="button" class="btn btn-ghost btn-sm" style="color:var(--brand-600);font-weight:700;" data-action="switch-auth" data-mode="login">
                Voltar para o login
              </button>
            ` : isForgot ? `
              <button type="button" class="btn btn-ghost btn-sm" style="color:var(--brand-600);font-weight:700;" data-action="switch-auth" data-mode="login">
                Voltar para o login
              </button>
            ` : isLogin ? `
              <button type="button" class="btn btn-ghost btn-sm" style="color:var(--brand-600);font-weight:700;" data-action="switch-auth" data-mode="register">
                Não tem uma conta? Crie aqui
              </button>
            ` : `
              <button type="button" class="btn btn-ghost btn-sm" style="color:var(--brand-600);font-weight:700;" data-action="switch-auth" data-mode="login">
                Já tem uma conta? Faça login
              </button>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function bindLandingEvents(container, state, updateState, onLoginSuccess) {
  container.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;

    if (action === 'open-auth' || action === 'switch-auth') {
      const mode = target.dataset.mode || 'login';
      updateState({
        authMode: mode,
        authError: '',
        authSuccess: '',
        showPassword: false,
      });
    } else if (action === 'close-auth' || action === 'close-auth-backdrop') {
      if (action === 'close-auth-backdrop' && e.target !== target) return;
      updateState({ authMode: 'none', authError: '', authSuccess: '' });
    } else if (action === 'toggle-password') {
      updateState({ showPassword: !state.showPassword });
    }
  });

  const authFormEl = container.querySelector('#auth-form');
  if (authFormEl) {
    authFormEl.addEventListener('input', (e) => {
      const input = e.target;
      if (input.name) {
        state.authForm[input.name] = input.value;
      }
    });

    let submitting = false;
    authFormEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (submitting) return;
      const email = (state.authForm.email || '').trim();
      const password = state.authForm.password || '';
      const name = (state.authForm.name || '').trim();

      if (state.authMode === 'forgot') {
        if (!email) {
          updateState({ authError: 'Informe o e-mail da conta.' });
          return;
        }
        if (!isValidEmail(email)) {
          updateState({ authError: 'Informe um e-mail válido.' });
          return;
        }
        submitting = true;
        try {
          await apiRequestPasswordReset(email);
        } catch (err) {
          submitting = false;
          updateState({ authError: err.message || 'Não foi possível gerar o código.' });
          return;
        }
        submitting = false;
        updateState({
          authMode: 'reset',
          authError: '',
          authSuccess: 'Código gerado! Digite-o abaixo para criar a nova senha.',
          showPassword: false,
          authForm: { name: '', email, password: '', code: '', confirm: '' },
        });
      } else if (state.authMode === 'reset') {
        const code = (state.authForm.code || '').trim();
        const confirm = state.authForm.confirm || '';
        if (!/^\d{6}$/.test(code)) {
          updateState({ authError: 'Digite o código de 6 dígitos.', authSuccess: '' });
          return;
        }
        const passwordError = validatePassword(password);
        if (passwordError) {
          updateState({ authError: passwordError, authSuccess: '' });
          return;
        }
        if (password !== confirm) {
          updateState({ authError: 'A confirmação da senha não confere.', authSuccess: '' });
          return;
        }
        submitting = true;
        try {
          await apiResetPassword(email, code, password);
        } catch (err) {
          submitting = false;
          updateState({ authError: err.message || 'Não foi possível redefinir a senha.', authSuccess: '' });
          return;
        }
        submitting = false;
        updateState({
          authMode: 'login',
          authError: '',
          authSuccess: 'Senha redefinida com sucesso! Entre com a nova senha.',
          showPassword: false,
          authForm: { name: '', email, password: '' },
        });
      } else if (state.authMode === 'login') {
        if (!email || !password) {
          updateState({ authError: 'Por favor, preencha todos os campos.' });
          return;
        }
        submitting = true;
        try {
          await apiLogin(email, password);
        } catch (err) {
          submitting = false;
          updateState({ authError: err.message || 'Não foi possível entrar.' });
          return;
        }
        submitting = false;
        const displayName = knownUserName(email);
        onLoginSuccess(displayName, email);
      } else {
        if (!name || !email || !password) {
          updateState({ authError: 'Por favor, preencha todos os campos.' });
          return;
        }
        const passwordError = validatePassword(password);
        if (passwordError) {
          updateState({ authError: passwordError });
          return;
        }
        submitting = true;
        try {
          await apiRegister(name, email, password);
        } catch (err) {
          submitting = false;
          updateState({ authError: err.message || 'Não foi possível criar a conta.' });
          return;
        }
        submitting = false;
        rememberUserName(email, name);
        updateState({
          authError: '',
          authSuccess: 'Conta criada com sucesso! Você já pode fazer login.',
          authForm: { name: '', email, password: '' },
        });
        setTimeout(() => {
          if (state.authMode === 'register') {
            updateState({ authMode: 'login', authSuccess: '' });
          }
        }, 1400);
      }
    });
  }
}
