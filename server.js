const express = require('express');
const fs = require('fs');
const path = require('path');
const authHandler = require('./api/auth');
const membrosHandler = require('./api/membros');
const repertorioHandler = require('./api/repertorio');
const escalasHandler = require('./api/escalas');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

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

function garantirBanco() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf8');
  }
}

function lerBanco() {
  garantirBanco();
  const conteudo = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(conteudo);
}

function salvarBanco(dados) {
  garantirBanco();
  fs.writeFileSync(DB_FILE, JSON.stringify(dados, null, 2), 'utf8');
}

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.all('/api/auth', authHandler);
app.all('/api/membros', membrosHandler);
app.all('/api/repertorio', repertorioHandler);
app.all('/api/escalas', escalasHandler);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
