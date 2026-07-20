const {
  criarCookieSessao,
  limparCookieSessao,
  obterSessao,
  enviarCorsSeguro,
  validarOrigem,
} = require('./auth-utils');

function normalizarUsuario(usuario) {
  return String(usuario || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function obterBody(req) {
  if (Buffer.isBuffer(req.body)) {
    try {
      return JSON.parse(req.body.toString('utf8'));
    } catch (erro) {
      return {};
    }
  }

  if (!req.body || typeof req.body !== 'string') return req.body || {};

  try {
    return JSON.parse(req.body);
  } catch (erro) {
    return {};
  }
}

function enviarJson(res, statusCode, body) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(body);
  }

  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.end(JSON.stringify(body));
}

function encerrar(res, statusCode) {
  if (typeof res.status === 'function') {
    return res.status(statusCode).end();
  }

  res.statusCode = statusCode;
  return res.end();
}

async function autenticarUsuarioRemoto(usuario, senha) {
  const { autenticarUsuario, possuiConfigSupabase } = require('./supabase-client');

  if (!possuiConfigSupabase()) {
    throw new Error('Autenticacao indisponivel: Supabase nao configurado.');
  }

  return autenticarUsuario(usuario, senha);
}

function normalizarResultadoAutenticacao(resultado) {
  if (Array.isArray(resultado)) return resultado[0] || null;
  return resultado || null;
}

async function handlerAuth(req, res) {
  enviarCorsSeguro(req, res);

  if (req.method === 'OPTIONS') {
    return encerrar(res, 200);
  }

  if (req.method === 'GET') {
    const sessao = obterSessao(req);
    if (!sessao) return enviarJson(res, 401, { autenticado: false });

    return enviarJson(res, 200, {
      autenticado: true,
      perfil: sessao.perfil,
      nome: sessao.nome,
    });
  }

  if (req.method === 'POST') {
    if (!validarOrigem(req)) {
      return enviarJson(res, 403, { error: 'Origem nao permitida.' });
    }

    const body = obterBody(req);
    const usuario = normalizarUsuario(body.usuario);
    const senha = String(body.senha || '');

    if (!usuario || !senha) {
      return enviarJson(res, 400, { error: 'Informe usuario e senha.' });
    }

    let encontrado;

    try {
      encontrado = normalizarResultadoAutenticacao(await autenticarUsuarioRemoto(usuario, senha));
    } catch (erro) {
      console.error('Falha no servico de autenticacao:', erro.message);
      return enviarJson(res, 503, { error: 'Servico de autenticacao temporariamente indisponivel.' });
    }

    if (!encontrado || !encontrado.perfil || !encontrado.nome) {
      return enviarJson(res, 401, { error: 'Acesso nao encontrado.' });
    }

    const sessao = {
      usuario,
      perfil: encontrado.perfil,
      nome: encontrado.nome,
    };

    if (encontrado.token) {
      sessao.token = encontrado.token;
    }

    res.setHeader('Set-Cookie', criarCookieSessao(sessao, req));

    return enviarJson(res, 200, {
      perfil: encontrado.perfil,
      nome: encontrado.nome,
    });
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', limparCookieSessao(req));
    return encerrar(res, 204);
  }

  res.setHeader('Allow', 'GET, POST, DELETE');
  return enviarJson(res, 405, { error: 'Metodo nao permitido' });
}

module.exports = async (req, res) => {
  try {
    return await handlerAuth(req, res);
  } catch (erro) {
    console.error('Erro inesperado na rota de autenticacao:', erro);
    enviarCorsSeguro(req, res);
    return enviarJson(res, 500, { error: 'Erro interno ao autenticar.' });
  }
};
