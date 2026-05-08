const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const REPO_DB_FILE = path.join(DATA_DIR, 'db.json');
const TMP_DB_FILE = '/tmp/vercel-db.json';

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

module.exports = {
  carregarBanco,
  salvarBanco,
  DEFAULT_DB,
};
