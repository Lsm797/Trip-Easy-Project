// Regra de senha (a mesma validada no backend):
// mínimo 6 caracteres, com letra maiúscula, minúscula, número e caractere especial.
export const PASSWORD_HINT =
  'Mínimo de 6 caracteres, com letra maiúscula, letra minúscula, número e caractere especial (ex: ! @ # $).';

export function validatePassword(password = '') {
  const missing = [];
  if (password.length < 6) missing.push('no mínimo 6 caracteres');
  if (!/[a-z]/.test(password)) missing.push('uma letra minúscula');
  if (!/[A-Z]/.test(password)) missing.push('uma letra maiúscula');
  if (!/\d/.test(password)) missing.push('um número');
  if (!/[^A-Za-z0-9]/.test(password)) missing.push('um caractere especial');
  if (password.length > 72) return 'A senha pode ter no máximo 72 caracteres.';
  if (missing.length === 0) return '';
  return `A senha precisa ter ${missing.join(', ')}.`;
}

export function isValidEmail(email = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}
