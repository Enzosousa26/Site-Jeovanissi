const crypto = require('crypto');
const {
  criarCookieSessao,
  limparCookieSessao,
  obterSessao,
  enviarCorsSeguro,
  validarOrigem,
} = require('./auth-utils');

const USUARIOS_FALLBACK = {
  'aminadabe.santos': { perfil: 'admin', nome: 'Aminadabe', salt: 'jeovanissi:aminadabe.santos:v1', senhaHash: 'wByHZMyKhRRbO6fykZ7of8fuhWVbMfK8gH5O9E0I2K8=' },
  'patrick.prudente': { perfil: 'admin', nome: 'Patrick', salt: 'jeovanissi:patrick.prudente:v1', senhaHash: '+OGjkF5MPoL/RqvdiaSH/JvAQky3FdvJbdqN+j9sfWc=' },
  'moises.souza': { perfil: 'admin', nome: 'Moises', salt: 'jeovanissi:moises.souza:v1', senhaHash: '0v3fdJBFPh+JPF2VNyBAdlKNWB/1YtpnDHiWdQRt2pQ=' },
  'enzo.santos': { perfil: 'membro', nome: 'Enzo', salt: 'jeovanissi:enzo.santos:v1', senhaHash: 'ZycztWtxvnZWGdpJPSL7zapaMXd2ZC/5fS5SH/lJkho=' },
  'alesio.ribeiro': { perfil: 'membro', nome: 'Alesio', salt: 'jeovanissi:alesio.ribeiro:v1', senhaHash: '4Yd8xqQs24MDaW+kyRvqxwIDZJT80lniTcTKtIqVVEY=' },
  'douglas.batista': { perfil: 'membro', nome: 'Douglas', salt: 'jeovanissi:douglas.batista:v1', senhaHash: 'Ap4TMCLQ0CaziEQFKTnhddpdJ2n491FyrxUzZ4Xsr8Y=' },
  'davi.ricardo': { perfil: 'membro', nome: 'Davi', salt: 'jeovanissi:davi.ricardo:v1', senhaHash: 'cj2w/uAVusbYSfRlPKrz++nN/XyKIjH0jRYQh70g76c=' },
  'edilane.santos': { perfil: 'membro', nome: 'Edilane', salt: 'jeovanissi:edilane.santos:v1', senhaHash: 'pfzpjhav8HmRUI6MiMeuiMC6NDxLhjNuLXYOpJViRfs=' },
  'joao.pinheiro': { perfil: 'membro', nome: 'Joao', salt: 'jeovanissi:joao.pinheiro:v1', senhaHash: 'tDuFCQjCSuvY3z5vBXdI7FGT5KRfK1cyw7OjHaANGpI=' },
  'larrisa.brenda': { perfil: 'membro', nome: 'Larrisa', salt: 'jeovanissi:larrisa.brenda:v1', senhaHash: 'Jl/VkFHQXgNhGmzhqQutwKHPB2rl7dWuEL9oiecVB6Y=' },
  'miguel.pinheiro': { perfil: 'membro', nome: 'Miguel', salt: 'jeovanissi:miguel.pinheiro:v1', senhaHash: 'r6OVogJMWp4VN7gFMH28CmmohnrMu3eUlrInv/nTlTg=' },
  'nicole.cruz': { perfil: 'membro', nome: 'Nicole', salt: 'jeovanissi:nicole.cruz:v1', senhaHash: 'ebtBvSQP1wcvAdOFuYMsr0agGAYm4hQI4CLW3gRz0JQ=' },
  'vanessa.rodrigues': { perfil: 'membro', nome: 'Vanessa', salt: 'jeovanissi:vanessa.rodrigues:v1', senhaHash: 'LmWIaNXgB2mfDMWoK4GdhOdzn72+ZKrIUEnffmneXDQ=' },
  'vitoria.moreira': { perfil: 'membro', nome: 'Vitoria', salt: 'jeovanissi:vitoria.moreira:v1', senhaHash: 'HVUo61q2saQ3XiB+gqHDjPH3uLoi8JDqKtj9sgThO7c=' },
  'wagao.barcelos': { perfil: 'membro', nome: 'Wagao', salt: 'jeovanissi:wagao.barcelos:v1', senhaHash: 'L5ORwvS9gDF3lZYn1FrmdnlQe7TsQkZknNOdcHF20fU=' },
  'eliane.oliveira': { perfil: 'membro', nome: 'Eliane', salt: 'jeovanissi:eliane.oliveira:v1', senhaHash: 'FjZb8K/Pz1zUj0ztSBq9sltjXafY3DUTjYV9Ca99FpI=' },
  'erika.goncalves': { perfil: 'membro', nome: 'Erika', salt: 'jeovanissi:erika.goncalves:v1', senhaHash: 'JEXrysIQ4z181uPX7ElUCbRaBAoala//BgnpjIwYUy4=' },
};

function normalizarUsuario(usuario) {
  return String(usuario || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function senhaConfere(senha, usuarioFallback) {
  const hash = crypto.pbkdf2Sync(String(senha), usuarioFallback.salt, 120000, 32, 'sha256');
  const hashSalvo = Buffer.from(usuarioFallback.senhaHash, 'base64');

  if (hash.length !== hashSalvo.length) return false;
  return crypto.timingSafeEqual(hash, hashSalvo);
}

function autenticarUsuarioFallback(usuario, senha) {
  const usuarioFallback = USUARIOS_FALLBACK[normalizarUsuario(usuario)];
  if (!usuarioFallback || !senhaConfere(senha, usuarioFallback)) return null;

  return {
    perfil: usuarioFallback.perfil,
    nome: usuarioFallback.nome,
  };
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
  const { autenticarUsuario } = require('./supabase-client');
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
      console.warn('Falha no Supabase durante login; tentando autenticacao reserva:', erro);
      encontrado = autenticarUsuarioFallback(usuario, senha);
    }

    if (!encontrado) {
      encontrado = autenticarUsuarioFallback(usuario, senha);
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
