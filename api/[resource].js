const fs = require('fs');
const path = require('path');

const VALID_KEYS = ['membros', 'repertorio', 'escalas'];
const TMP_DB_FILE = '/tmp/vercel-db.json';
const REPO_DB_FILE = path.join(__dirname, '..', 'data', 'db.json');

const DEFAULT_DB = {
  membros: [
    { nome: 'Aminadabe / Binho', cargo: 'Líder Geral', categoria: 'lider' },
    { nome: 'Patrick', cargo: 'Líder Instrumental', categoria: 'instrumental' },
    { nome: 'Moises', cargo: 'Líder Vocal', categoria: 'vocal' },
    { nome: 'Alesio', cargo: 'Vocalista', categoria: 'vocal' },
    { nome: 'Douglas', cargo: 'Baterista / Baixista', categoria: 'instrumental' },
    { nome: 'Edilane', cargo: 'Vocalista', categoria: 'vocal' },
    { nome: 'Enzo', cargo: 'Baterista', categoria: 'instrumental' },
    { nome: 'Joao', cargo: 'Instrumental', categoria: 'instrumental' },
    { nome: 'Larrisa', cargo: 'Vocalista', categoria: 'vocal' },
    { nome: 'Miguel', cargo: 'Instrumental', categoria: 'instrumental' },
    { nome: 'Nicole', cargo: 'Vocalista / Mídia', categoria: 'vocal' },
    { nome: 'Vanessa', cargo: 'Vocalista', categoria: 'vocal' },
    { nome: 'Vitoria', cargo: 'Vocalista', categoria: 'vocal' },
    { nome: 'Wagao', cargo: 'Baixista', categoria: 'instrumental' },
    { nome: 'Eliane', cargo: 'Vocalista', categoria: 'vocal' },
    { nome: 'Erika', cargo: 'Vocalista', categoria: 'vocal' },
    { nome: 'Davi', cargo: 'Vocalista', categoria: 'vocal' }
  ],
  repertorio: {},
  escalas: {}
};

function carregarBanco() {
  try {
    if (fs.existsSync(TMP_DB_FILE)) {
      return JSON.parse(fs.readFileSync(TMP_DB_FILE, 'utf8'));
    }

    if (fs.existsSync(REPO_DB_FILE)) {
      return JSON.parse(fs.readFileSync(REPO_DB_FILE, 'utf8'));
    }
  } catch (erro) {
    console.warn('Erro ao carregar banco de dados:', erro);
  }

  return DEFAULT_DB;
}

function salvarBanco(banco) {
  try {
    fs.writeFileSync(TMP_DB_FILE, JSON.stringify(banco, null, 2), 'utf8');
  } catch (erro) {
    console.warn('Erro ao salvar banco de dados:', erro);
  }
}

module.exports = (req, res) => {
  const resource = req.query.resource;

  if (!VALID_KEYS.includes(resource)) {
    res.status(404).json({ error: 'Recurso não encontrado' });
    return;
  }

  const banco = carregarBanco();

  if (req.method === 'GET') {
    return res.status(200).json(banco[resource] ?? DEFAULT_DB[resource]);
  }

  if (req.method === 'PUT') {
    banco[resource] = req.body ?? DEFAULT_DB[resource];
    salvarBanco(banco);
    return res.status(200).json(banco[resource]);
  }

  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'Método não permitido' });
};