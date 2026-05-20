const { buscarTabela, salvarTabela } = require('./supabase-client');
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

async function responderRecurso(req, res, tabela) {
  enviarCorsSeguro(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    let resultado;

    try {
      resultado = await buscarTabela(tabela);
    } catch (erro) {
      console.warn(`Supabase indisponível para buscar ${tabela}, usando banco local:`, erro);
      resultado = buscarTabelaLocal(tabela);
    }

    return res.status(200).json(resultado);
  }

  if (req.method === 'PUT') {
    if (!validarOrigem(req)) {
      return res.status(403).json({ error: 'Origem não permitida.' });
    }

    const sessao = obterSessao(req);
    if (!sessao || sessao.perfil !== 'admin') {
      return res.status(401).json({ error: 'Entre como admin para salvar alterações.' });
    }

    let resultado;

    try {
      resultado = await salvarTabela(
        tabela,
        req.body?.dados,
        sessao,
        req.body?.atualizado_em ?? null
      );
    } catch (erro) {
      console.warn(`Supabase indisponível para salvar ${tabela}, usando banco local:`, erro);
      resultado = salvarTabelaLocal(tabela, req.body?.dados);
    }

    return res.status(200).json(resultado);
  }

  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'Método não permitido' });
}

module.exports = {
  responderRecurso,
};
