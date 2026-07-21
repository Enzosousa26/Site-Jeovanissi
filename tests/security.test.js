const test = require('node:test');
const assert = require('node:assert/strict');

process.env.SESSION_SECRET = 'segredo-de-teste-com-mais-de-trinta-e-dois-bytes';

const {
  criarCookieSessao,
  obterSessao,
  validarOrigem,
} = require('../api/auth-utils');
const { normalizarSupabaseUrl } = require('../api/supabase-client');
const { obterIdentificadorTentativa } = require('../api/request-security');

function req(headers = {}) {
  return { headers, socket: { remoteAddress: '127.0.0.1' } };
}

test('normaliza uma referencia Supabase e preserva URL completa', () => {
  assert.equal(
    normalizarSupabaseUrl('brlmggncnoyngukztxhi'),
    'https://brlmggncnoyngukztxhi.supabase.co'
  );
  assert.equal(normalizarSupabaseUrl('https://exemplo.supabase.co/'), 'https://exemplo.supabase.co');
});

test('cookie de sessao e autenticado e rejeita adulteracao', () => {
  const requisicao = req({ host: 'localhost:3000' });
  const setCookie = criarCookieSessao({ usuario: 'admin', perfil: 'admin', token: 'token' }, requisicao);
  const cookie = setCookie.split(';')[0];
  const sessao = obterSessao(req({ cookie }));
  assert.equal(sessao.usuario, 'admin');
  assert.equal(obterSessao(req({ cookie: `${cookie}x` })), null);
});

test('origem precisa corresponder ao host e identificador nao expoe IP', () => {
  assert.equal(validarOrigem(req({ host: 'site.test', origin: 'https://site.test' })), true);
  assert.equal(validarOrigem(req({ host: 'site.test', origin: 'https://malicioso.test' })), false);

  const identificador = obterIdentificadorTentativa(
    req({ 'x-forwarded-for': '203.0.113.8', host: 'site.test' }),
    'admin'
  );
  assert.match(identificador, /^[a-f0-9]{64}$/);
  assert.equal(identificador.includes('203.0.113.8'), false);
});
