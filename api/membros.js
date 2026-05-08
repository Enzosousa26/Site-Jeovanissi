const { carregarBanco, salvarBanco, DEFAULT_DB } = require('./db');

module.exports = (req, res) => {
  const banco = carregarBanco();

  if (req.method === 'GET') {
    return res.status(200).json(banco.membros || DEFAULT_DB.membros);
  }

  if (req.method === 'PUT') {
    banco.membros = req.body || DEFAULT_DB.membros;
    salvarBanco(banco);
    return res.status(200).json(banco.membros);
  }

  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'Método não permitido' });
};
