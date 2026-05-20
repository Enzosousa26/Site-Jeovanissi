const { autenticarUsuario } = require('./supabase-client');
const {
  criarCookieSessao,
  limparCookieSessao,
  obterSessao,
  enviarCorsSeguro,
  validarOrigem,
} = require('./auth-utils');

module.exports = async (req, res) => {
  enviarCorsSeguro(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const sessao = obterSessao(req);
    if (!sessao) return res.status(401).json({ autenticado: false });

    return res.status(200).json({
      autenticado: true,
      perfil: sessao.perfil,
      nome: sessao.nome,
    });
  }

  if (req.method === 'POST') {
    if (!validarOrigem(req)) {
      return res.status(403).json({ error: 'Origem não permitida.' });
    }

    const usuario = String(req.body?.usuario || '').trim();
    const senha = String(req.body?.senha || '');

    if (!usuario || !senha) {
      return res.status(400).json({ error: 'Informe usuário e senha.' });
    }

    const encontrado = await autenticarUsuario(usuario, senha);

    if (!encontrado || !encontrado.perfil || !encontrado.nome) {
      return res.status(401).json({ error: 'Acesso não encontrado.' });
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

    return res.status(200).json({
      perfil: encontrado.perfil,
      nome: encontrado.nome,
    });
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', limparCookieSessao(req));
    return res.status(204).end();
  }

  res.setHeader('Allow', 'GET, POST, DELETE');
  return res.status(405).json({ error: 'Método não permitido' });
};
