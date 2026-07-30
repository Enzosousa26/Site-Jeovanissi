const { carregarBanco } = require('./db');
const { buscarTabela, deveUsarBancoLocal } = require('./supabase-client');

function responderJson(res, statusCode, body, somenteCabecalhos = false) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  if (typeof res.status === 'function') {
    res.status(statusCode);
  } else {
    res.statusCode = statusCode;
  }

  if (somenteCabecalhos) return res.end();
  if (typeof res.json === 'function') return res.json(body);
  return res.end(JSON.stringify(body));
}

function bancoLocalDisponivel() {
  const banco = carregarBanco();
  return (
    Array.isArray(banco?.membros)
    && banco?.repertorio
    && typeof banco.repertorio === 'object'
    && banco?.escalas
    && typeof banco.escalas === 'object'
  );
}

async function bancoRemotoDisponivel() {
  const resultado = await buscarTabela('membros');
  return Array.isArray(resultado?.dados);
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, HEAD, OPTIONS');
    return responderJson(res, 204, null, true);
  }

  if (!['GET', 'HEAD'].includes(req.method)) {
    res.setHeader('Allow', 'GET, HEAD, OPTIONS');
    return responderJson(res, 405, { status: 'erro', mensagem: 'Metodo nao permitido.' });
  }

  const inicio = Date.now();

  try {
    const bancoDisponivel = deveUsarBancoLocal()
      ? bancoLocalDisponivel()
      : await bancoRemotoDisponivel();

    if (!bancoDisponivel) {
      throw new Error('Estrutura de dados indisponivel.');
    }

    return responderJson(res, 200, {
      status: 'ok',
      servico: 'site-jeova-nissi',
      banco: 'ok',
      verificado_em: new Date().toISOString(),
      duracao_ms: Date.now() - inicio,
    }, req.method === 'HEAD');
  } catch (erro) {
    console.error('Verificacao de saude falhou:', erro.message);
    return responderJson(res, 503, {
      status: 'indisponivel',
      servico: 'site-jeova-nissi',
      banco: 'indisponivel',
      verificado_em: new Date().toISOString(),
      duracao_ms: Date.now() - inicio,
    }, req.method === 'HEAD');
  }
};
