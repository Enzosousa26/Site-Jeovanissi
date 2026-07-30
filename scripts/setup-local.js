const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const raiz = path.resolve(__dirname, '..');
const arquivoModelo = path.join(raiz, '.env.example');
const arquivoLocal = path.join(raiz, '.env.local');

if (fs.existsSync(arquivoLocal)) {
  console.log('.env.local ja existe. Nenhum valor foi sobrescrito.');
  console.log('Use npm.cmd start para iniciar o projeto.');
  process.exit(0);
}

if (!fs.existsSync(arquivoModelo)) {
  console.error('Nao foi possivel encontrar .env.example.');
  process.exit(1);
}

const segredoSessao = crypto.randomBytes(48).toString('base64url');
const modelo = fs.readFileSync(arquivoModelo, 'utf8');
const configuracaoLocal = modelo
  .replace(/^SESSION_SECRET=.*$/m, `SESSION_SECRET=${segredoSessao}`)
  .replace(/^# LOCAL_DB_FALLBACK=true$/m, 'LOCAL_DB_FALLBACK=true');

fs.writeFileSync(arquivoLocal, configuracaoLocal, {
  encoding: 'utf8',
  flag: 'wx',
});

console.log('.env.local criado com SESSION_SECRET seguro.');
console.log('O banco local esta habilitado ate as variaveis da Vercel serem baixadas.');
console.log('Use npm.cmd start para iniciar o projeto.');
