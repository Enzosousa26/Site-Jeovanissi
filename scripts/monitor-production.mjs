#!/usr/bin/env node

import { appendFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const DEFAULT_SITE_URL = 'https://jeova-nissi.vercel.app';
const DEFAULT_PROJECT_REF = 'brlmggncnoyngukztxhi';
const DEFAULT_MANAGEMENT_API_URL = 'https://api.supabase.com/v1';
const ACTIVE_STATUS = 'ACTIVE_HEALTHY';
const INACTIVE_STATUS = 'INACTIVE';

function normalizarUrl(valor) {
  return String(valor || '').trim().replace(/\/$/, '');
}

function numeroPositivo(valor, padrao) {
  const numero = Number(valor);
  return Number.isFinite(numero) && numero > 0 ? numero : padrao;
}

function textoSeguro(valor, limite = 300) {
  return String(valor || '').replace(/[\r\n]+/g, ' ').slice(0, limite);
}

async function aguardar(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function requisitar(fetchImpl, url, opcoes = {}, timeoutMs = 30_000) {
  const controlador = new AbortController();
  const timeout = setTimeout(() => controlador.abort(), timeoutMs);

  try {
    return await fetchImpl(url, {
      ...opcoes,
      signal: controlador.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function lerJson(response) {
  const texto = await response.text();
  if (!texto) return null;

  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
}

async function verificarPagina(configuracao, dependencias) {
  let ultimoErro = null;

  for (let tentativa = 1; tentativa <= configuracao.pageAttempts; tentativa += 1) {
    try {
      const response = await requisitar(
        dependencias.fetch,
        `${configuracao.siteUrl}/`,
        { headers: { Accept: 'text/html' } },
        configuracao.requestTimeoutMs,
      );

      if (response.ok) return;
      ultimoErro = `HTTP ${response.status}`;
    } catch (erro) {
      ultimoErro = erro.message;
    }

    if (tentativa < configuracao.pageAttempts) {
      await dependencias.wait(configuracao.healthRetryDelayMs);
    }
  }

  throw new Error(`A pagina principal esta indisponivel (${textoSeguro(ultimoErro)}).`);
}

async function verificarSaude(configuracao, dependencias) {
  let ultimoResultado = null;

  for (let tentativa = 1; tentativa <= configuracao.healthAttempts; tentativa += 1) {
    try {
      const response = await requisitar(
        dependencias.fetch,
        `${configuracao.siteUrl}/api/health`,
        { headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' } },
        configuracao.requestTimeoutMs,
      );
      const body = await lerJson(response);
      const saudavel = response.ok && body?.status === 'ok' && body?.banco === 'ok';

      ultimoResultado = { saudavel, statusCode: response.status, body };
      if (saudavel) return ultimoResultado;
    } catch (erro) {
      ultimoResultado = { saudavel: false, statusCode: null, erro: erro.message };
    }

    if (tentativa < configuracao.healthAttempts) {
      await dependencias.wait(configuracao.healthRetryDelayMs);
    }
  }

  return ultimoResultado;
}

function headersAdministrativos(token) {
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function consultarProjeto(configuracao, dependencias) {
  const response = await requisitar(
    dependencias.fetch,
    `${configuracao.managementApiUrl}/projects/${encodeURIComponent(configuracao.projectRef)}`,
    { headers: headersAdministrativos(configuracao.managementToken) },
    configuracao.requestTimeoutMs,
  );

  if (!response.ok) {
    throw new Error(`A API administrativa do Supabase respondeu HTTP ${response.status}.`);
  }

  const projeto = await lerJson(response);
  const status = String(projeto?.status || '').trim().toUpperCase();
  if (!status) throw new Error('O Supabase nao informou o status do projeto.');
  return status;
}

async function restaurarProjeto(configuracao, dependencias) {
  const response = await requisitar(
    dependencias.fetch,
    `${configuracao.managementApiUrl}/projects/${encodeURIComponent(configuracao.projectRef)}/restore`,
    {
      method: 'POST',
      headers: headersAdministrativos(configuracao.managementToken),
    },
    configuracao.requestTimeoutMs,
  );

  if (!response.ok) {
    throw new Error(`A restauracao do Supabase respondeu HTTP ${response.status}.`);
  }
}

function descreverFalhaSaude(resultado) {
  if (resultado?.statusCode) return `HTTP ${resultado.statusCode}`;
  return textoSeguro(resultado?.erro || 'sem resposta valida');
}

export function criarConfiguracao(env = process.env) {
  return {
    siteUrl: normalizarUrl(env.SITE_URL || DEFAULT_SITE_URL),
    projectRef: String(env.SUPABASE_PROJECT_REF || DEFAULT_PROJECT_REF).trim(),
    managementApiUrl: normalizarUrl(
      env.SUPABASE_MANAGEMENT_API_URL || DEFAULT_MANAGEMENT_API_URL,
    ),
    managementToken: String(env.SUPABASE_MANAGEMENT_API_TOKEN || '').trim(),
    requestTimeoutMs: numeroPositivo(env.MONITOR_REQUEST_TIMEOUT_MS, 30_000),
    pageAttempts: numeroPositivo(env.MONITOR_PAGE_ATTEMPTS, 3),
    healthAttempts: numeroPositivo(env.MONITOR_HEALTH_ATTEMPTS, 3),
    healthRetryDelayMs: numeroPositivo(env.MONITOR_HEALTH_RETRY_DELAY_MS, 5_000),
    recoveryPollAttempts: numeroPositivo(env.MONITOR_RECOVERY_POLL_ATTEMPTS, 30),
    recoveryPollIntervalMs: numeroPositivo(env.MONITOR_RECOVERY_POLL_INTERVAL_MS, 30_000),
  };
}

export async function executarMonitor(configuracao, dependencias = {}) {
  const deps = {
    fetch: dependencias.fetch || globalThis.fetch,
    wait: dependencias.wait || aguardar,
    log: dependencias.log || console.log,
  };

  await verificarPagina(configuracao, deps);
  deps.log('Pagina principal: ok.');

  const saudeInicial = await verificarSaude(configuracao, deps);
  if (saudeInicial.saudavel) {
    deps.log('API e banco: ok. Nenhuma recuperacao foi necessaria.');
    return { saudavel: true, restauracaoSolicitada: false, statusSupabase: ACTIVE_STATUS };
  }

  deps.log(`API e banco indisponiveis (${descreverFalhaSaude(saudeInicial)}).`);

  if (!configuracao.managementToken) {
    throw new Error(
      'Configure o secret SUPABASE_MANAGEMENT_API_TOKEN para permitir a recuperacao automatica.',
    );
  }

  let status = await consultarProjeto(configuracao, deps);
  deps.log(`Status do projeto Supabase: ${textoSeguro(status)}.`);

  if (status === ACTIVE_STATUS) {
    throw new Error(
      'O Supabase esta ativo; a restauracao automatica foi bloqueada porque a falha tem outra causa.',
    );
  }

  let restauracaoSolicitada = false;

  if (status === INACTIVE_STATUS) {
    await restaurarProjeto(configuracao, deps);
    restauracaoSolicitada = true;
    deps.log('Restauracao do projeto Supabase solicitada.');
  } else {
    deps.log('O projeto ja esta em transicao; aguardando sem solicitar outra restauracao.');
  }

  for (let tentativa = 1; tentativa <= configuracao.recoveryPollAttempts; tentativa += 1) {
    await deps.wait(configuracao.recoveryPollIntervalMs);
    status = await consultarProjeto(configuracao, deps);
    deps.log(
      `Acompanhamento ${tentativa}/${configuracao.recoveryPollAttempts}: ${textoSeguro(status)}.`,
    );

    if (status === INACTIVE_STATUS && !restauracaoSolicitada) {
      await restaurarProjeto(configuracao, deps);
      restauracaoSolicitada = true;
      deps.log('Restauracao do projeto Supabase solicitada.');
      continue;
    }

    if (status !== ACTIVE_STATUS) continue;

    const saudeFinal = await verificarSaude(configuracao, deps);
    if (saudeFinal.saudavel) {
      deps.log('Supabase ativo e /api/health saudavel.');
      return { saudavel: true, restauracaoSolicitada, statusSupabase: status };
    }

    deps.log(
      `Supabase ativo, mas a API ainda nao respondeu como saudavel (${descreverFalhaSaude(saudeFinal)}).`,
    );
  }

  throw new Error(
    `A recuperacao nao foi concluida apos ${configuracao.recoveryPollAttempts} verificacoes. Ultimo status: ${textoSeguro(status)}.`,
  );
}

async function registrarResumo(caminho, titulo, linhas) {
  if (!caminho) return;
  const conteudo = [`## ${titulo}`, '', ...linhas.map((linha) => `- ${textoSeguro(linha, 500)}`), ''].join('\n');
  await appendFile(caminho, conteudo, 'utf8');
}

async function main() {
  const configuracao = criarConfiguracao();

  try {
    const resultado = await executarMonitor(configuracao);
    await registrarResumo(process.env.GITHUB_STEP_SUMMARY, 'Monitor de producao', [
      'Pagina principal, API e banco estao saudaveis.',
      resultado.restauracaoSolicitada
        ? 'O Supabase foi restaurado automaticamente nesta execucao.'
        : 'Nenhuma restauracao precisou ser solicitada.',
      `Status final do Supabase: ${resultado.statusSupabase}.`,
    ]);
  } catch (erro) {
    console.error(`Monitor de producao falhou: ${erro.message}`);
    await registrarResumo(process.env.GITHUB_STEP_SUMMARY, 'Falha no monitor de producao', [
      erro.message,
      'Consulte o status do Supabase e os Runtime Logs da Vercel.',
    ]);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
