const { carregarBanco, salvarBanco, DEFAULT_DB } = require('./db');

module.exports = (req, res) => {
  const banco = carregarBanco();

  if (req.method === 'GET') {
    return res.status(200).json(banco.escalas || DEFAULT_DB.escalas);
  }

  if (req.method === 'PUT') {
    banco.escalas = req.body || DEFAULT_DB.escalas;
    salvarBanco(banco);
    return res.status(200).json(banco.escalas);
  }

  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'Método não permitido' });
};
