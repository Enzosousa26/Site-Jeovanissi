const { buscarTabela, deveUsarBancoLocal, salvarTabela } = require('./supabase-client');
const { carregarBanco, salvarBanco } = require('./db');
const { enviarCorsSeguro, obterSessao, validarOrigem } = require('./auth-utils');

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
  return res.status(503).json({
    error: 'Servico de dados temporariamente indisponivel.',
  });
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
      return responderFalhaSupabase(res, erro, 'salvar', tabela);
    }
  }

  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'Metodo nao permitido' });
}

module.exports = {
  responderRecurso,
};
