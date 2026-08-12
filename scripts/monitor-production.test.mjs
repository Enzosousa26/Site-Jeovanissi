import assert from 'node:assert/strict';
import test from 'node:test';

import { criarConfiguracao, executarMonitor } from './monitor-production.mjs';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function html(status = 200) {
  return new Response('<!doctype html>', { status });
}

function cenario(respostas) {
  const chamadas = [];
  const fila = [...respostas];

  return {
    chamadas,
    fetch: async (url, opcoes = {}) => {
      chamadas.push({ url: String(url), method: opcoes.method || 'GET' });
      assert.ok(fila.length > 0, `Requisicao inesperada: ${url}`);
      return fila.shift();
    },
    wait: async () => {},
    log: () => {},
    verificarFim() {
      assert.equal(fila.length, 0, 'Nem todas as respostas simuladas foram usadas.');
    },
  };
}

function configuracao(extra = {}) {
  return {
    ...criarConfiguracao({
      SITE_URL: 'https://site.test',
      SUPABASE_PROJECT_REF: 'projeto-teste',
      SUPABASE_MANAGEMENT_API_URL: 'https://api.supabase.test/v1',
      SUPABASE_MANAGEMENT_API_TOKEN: 'token-secreto-de-teste',
      MONITOR_PAGE_ATTEMPTS: '1',
      MONITOR_HEALTH_ATTEMPTS: '1',
      MONITOR_RECOVERY_POLL_ATTEMPTS: '3',
      MONITOR_RECOVERY_POLL_INTERVAL_MS: '1',
    }),
    ...extra,
  };
}

test('encerra sem consultar a API administrativa quando o site esta saudavel', async () => {
  const mock = cenario([
    html(),
    json({ status: 'ok', banco: 'ok' }),
  ]);

  const resultado = await executarMonitor(configuracao(), mock);

  assert.equal(resultado.restauracaoSolicitada, false);
  assert.equal(mock.chamadas.length, 2);
  mock.verificarFim();
});

test('restaura apenas um projeto INACTIVE e valida o health depois', async () => {
  const mock = cenario([
    html(),
    json({ status: 'indisponivel', banco: 'indisponivel' }, 503),
    json({ status: 'INACTIVE' }),
    json({ message: 'restore started' }),
    json({ status: 'ACTIVE_HEALTHY' }),
    json({ status: 'ok', banco: 'ok' }),
  ]);

  const resultado = await executarMonitor(configuracao(), mock);

  assert.equal(resultado.restauracaoSolicitada, true);
  assert.equal(mock.chamadas.filter((chamada) => chamada.method === 'POST').length, 1);
  assert.match(mock.chamadas[3].url, /\/projects\/projeto-teste\/restore$/);
  mock.verificarFim();
});

test('aguarda RESTORING sem solicitar uma segunda restauracao', async () => {
  const mock = cenario([
    html(),
    json({ status: 'indisponivel', banco: 'indisponivel' }, 503),
    json({ status: 'RESTORING' }),
    json({ status: 'ACTIVE_HEALTHY' }),
    json({ status: 'ok', banco: 'ok' }),
  ]);

  const resultado = await executarMonitor(configuracao(), mock);

  assert.equal(resultado.restauracaoSolicitada, false);
  assert.equal(mock.chamadas.some((chamada) => chamada.method === 'POST'), false);
  mock.verificarFim();
});

test('nao restaura quando o Supabase esta ativo e a falha tem outra causa', async () => {
  const mock = cenario([
    html(),
    json({ status: 'indisponivel', banco: 'indisponivel' }, 503),
    json({ status: 'ACTIVE_HEALTHY' }),
  ]);

  await assert.rejects(
    executarMonitor(configuracao(), mock),
    /falha tem outra causa/,
  );

  assert.equal(mock.chamadas.some((chamada) => chamada.method === 'POST'), false);
  mock.verificarFim();
});

test('explica qual secret falta antes de tentar restaurar', async () => {
  const mock = cenario([
    html(),
    json({ status: 'indisponivel', banco: 'indisponivel' }, 503),
  ]);

  await assert.rejects(
    executarMonitor(configuracao({ managementToken: '' }), mock),
    /SUPABASE_MANAGEMENT_API_TOKEN/,
  );

  mock.verificarFim();
});
