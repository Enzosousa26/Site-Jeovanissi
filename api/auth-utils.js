const crypto = require('crypto');

const COOKIE_NAME = 'jeovanissi_session';
const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;
const AMBIENTE_PRODUCAO = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
const SESSION_SECRET_CONFIGURADO = String(
  process.env.SESSION_SECRET || process.env.AUTH_SECRET || ''
).trim();

if (AMBIENTE_PRODUCAO && !SESSION_SECRET_CONFIGURADO) {
  throw new Error('Configure SESSION_SECRET nas variaveis de ambiente de producao.');
}

if (SESSION_SECRET_CONFIGURADO && Buffer.byteLength(SESSION_SECRET_CONFIGURADO, 'utf8') < 32) {
  throw new Error('SESSION_SECRET deve ter pelo menos 32 bytes.');
}

const SESSION_SECRET = SESSION_SECRET_CONFIGURADO || crypto.randomBytes(48).toString('base64url');

if (!SESSION_SECRET_CONFIGURADO) {
  console.warn('SESSION_SECRET nao configurado; usando segredo efemero apenas para desenvolvimento local.');
}

function getSessionSecret() {
  return SESSION_SECRET;
}

function base64UrlEncode(valor) {
  return Buffer.from(valor)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(valor) {
  const texto = String(valor || '').replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (texto.length % 4)) % 4);
  return Buffer.from(texto + padding, 'base64');
}

function obterChaveCriptografia() {
  return crypto.createHash('sha256').update(getSessionSecret()).digest();
}

function criptografarSessao(sessao) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', obterChaveCriptografia(), iv);
  const payload = Buffer.concat([
    cipher.update(JSON.stringify(sessao), 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    base64UrlEncode(iv),
    base64UrlEncode(payload),
    base64UrlEncode(tag),
  ].join('.');
}

function descriptografarSessao(valor) {
  const [ivTexto, payloadTexto, tagTexto] = String(valor || '').split('.');
  if (!ivTexto || !payloadTexto || !tagTexto) return null;

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    obterChaveCriptografia(),
    base64UrlDecode(ivTexto)
  );
  decipher.setAuthTag(base64UrlDecode(tagTexto));

  const texto = Buffer.concat([
    decipher.update(base64UrlDecode(payloadTexto)),
    decipher.final(),
  ]).toString('utf8');

  return JSON.parse(texto);
}

function criarCookieSessao(sessao, req) {
  const payload = criptografarSessao({
    ...sessao,
    expiraEm: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  });
  const secure = deveUsarCookieSeguro(req) ? '; Secure' : '';

  return `${COOKIE_NAME}=${payload}; Path=/; HttpOnly${secure}; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}`;
}

function limparCookieSessao(req) {
  const secure = deveUsarCookieSeguro(req) ? '; Secure' : '';
  return `${COOKIE_NAME}=; Path=/; HttpOnly${secure}; SameSite=Lax; Max-Age=0`;
}

function lerCookies(req) {
  return String(req.headers.cookie || '')
    .split(';')
    .map((parte) => parte.trim())
    .filter(Boolean)
    .reduce((cookies, parte) => {
      const indice = parte.indexOf('=');
      if (indice === -1) return cookies;
      cookies[parte.slice(0, indice)] = parte.slice(indice + 1);
      return cookies;
    }, {});
}

function obterSessao(req) {
  const valor = lerCookies(req)[COOKIE_NAME];
  if (!valor) return null;

  try {
    const sessao = descriptografarSessao(valor);
    if (!sessao.expiraEm || sessao.expiraEm < Date.now()) return null;
    return sessao;
  } catch (erro) {
    return null;
  }
}

function deveUsarCookieSeguro(req) {
  const host = String(req?.headers?.host || req?.headers?.['x-forwarded-host'] || '');
  if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) return false;

  return true;
}

function validarOrigem(req) {
  const origem = req.headers.origin;
  if (!origem) return true;

  try {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    return new URL(origem).host === host;
  } catch (erro) {
    return false;
  }
}

function enviarCorsSeguro(req, res) {
  const origem = req.headers.origin;
  if (origem && validarOrigem(req)) {
    res.setHeader('Access-Control-Allow-Origin', origem);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = {
  criarCookieSessao,
  limparCookieSessao,
  obterSessao,
  validarOrigem,
  enviarCorsSeguro,
};
