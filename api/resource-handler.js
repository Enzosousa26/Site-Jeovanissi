const { buscarTabela, deveUsarBancoLocal, salvarTabela } = require('./supabase-client');
const { carregarBanco, salvarBanco } = require('./db');
const { enviarCorsSeguro, obterSessao, validarOrigem } = require('./auth-utils');
const { dadosIguais } = require('../lib/sync-utils');

function buscarTabelaLocal(tabela) {
  const banco = carregarBanco();
  return {
    dados: banco[tabela] ?? null,
    atualizado_em: null,
  };
}

function salvarTabelaLocal(tabela, dados) {
  const banco = carregarBanco();
  banco[tabela] = dados;
  salvarBanco(banco);

  return {
    dados,
    atualizado_em: null,
  };
}

function responderFalhaSupabase(res, erro, acao, tabela) {
  console.error(`Falha no Supabase ao ${acao} ${tabela}:`, erro.message);
  const status = [400, 401, 403, 409].includes(erro.status) ? erro.status : 503;
  const mensagens = {
    400: 'Os dados enviados sao invalidos.',
    401: 'Sua sessao expirou. Entre novamente como admin.',
    403: 'Voce nao tem permissao para esta operacao.',
    409: 'Os dados foram alterados por outro administrador. Recarregue a pagina.',
    503: 'Servico de dados temporariamente indisponivel.',
  };
  return res.status(status).json({ error: mensagens[status] });
}

async function responderConflitoIdempotente(
  res,
  erro,
  tabela,
  dadosEnviados,
  buscarDadosAtuais = buscarTabela
) {
  if (erro.status !== 409) return false;

  try {
    const resultadoAtual = await buscarDadosAtuais(tabela);
    if (!dadosIguais(resultadoAtual.dados, dadosEnviados)) return false;

    // O salvamento anterior terminou, mas o navegador mudou de pagina antes
    // de guardar a nova versao. Confirmo o estado atual sem sobrescrever dados.
    res.status(200).json(resultadoAtual);
    return true;
  } catch (erroReconciliacao) {
    console.error(`Falha ao reconciliar conflito de ${tabela}:`, erroReconciliacao.message);
    return false;
  }
}

async function responderRecurso(req, res, tabela) {
  enviarCorsSeguro(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    if (deveUsarBancoLocal()) {
      return res.status(200).json(buscarTabelaLocal(tabela));
    }

    try {
      const resultado = await buscarTabela(tabela);
      return res.status(200).json(resultado);
    } catch (erro) {
      return responderFalhaSupabase(res, erro, 'buscar', tabela);
    }
  }

  if (req.method === 'PUT') {
    if (!validarOrigem(req)) {
      return res.status(403).json({ error: 'Origem nao permitida.' });
    }

    const sessao = obterSessao(req);
    if (!sessao || sessao.perfil !== 'admin') {
      return res.status(401).json({ error: 'Entre como admin para salvar alteracoes.' });
    }

    if (deveUsarBancoLocal()) {
      return res.status(200).json(salvarTabelaLocal(tabela, req.body?.dados));
    }

    try {
      const resultado = await salvarTabela(
        tabela,
        req.body?.dados,
        sessao,
        req.body?.atualizado_em ?? null
      );
      return res.status(200).json(resultado);
    } catch (erro) {
      if (await responderConflitoIdempotente(res, erro, tabela, req.body?.dados)) {
        return;
      }
      return responderFalhaSupabase(res, erro, 'salvar', tabela);
    }
  }

  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'Metodo nao permitido' });
}

module.exports = {
  responderConflitoIdempotente,
  responderRecurso,
};
