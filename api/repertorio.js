const { carregarBanco, salvarBanco, DEFAULT_DB } = require('./db');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const banco = carregarBanco();

  if (req.method === 'GET') {
    return res.status(200).json(banco.repertorio || DEFAULT_DB.repertorio);
  }

  if (req.method === 'PUT') {
    banco.repertorio = req.body || DEFAULT_DB.repertorio;
    salvarBanco(banco);
    return res.status(200).json(banco.repertorio);
  }

  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'Método não permitido' });
};