const express = require('express');
const path = require('path');
const authHandler = require('./api/auth');
const healthHandler = require('./api/health');
const membrosHandler = require('./api/membros');
const repertorioHandler = require('./api/repertorio');
const escalasHandler = require('./api/escalas');

const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');

const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; upgrade-insecure-requests",
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

app.use((req, res, next) => {
  Object.entries(SECURITY_HEADERS).forEach(([nome, valor]) => res.setHeader(nome, valor));
  next();
});

app.use(express.json({ limit: '1mb' }));
app.use((erro, req, res, next) => {
  if (erro instanceof SyntaxError && erro.status === 400 && 'body' in erro) {
    return res.status(400).json({ error: 'JSON invalido.' });
  }

  return next(erro);
});
app.get(['/', '/index.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'style.css'));
});
app.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'script.js'));
});
app.use('/assets', express.static(path.join(__dirname, 'assets'), {
  dotfiles: 'deny',
  index: false,
}));
app.use('/lib', express.static(path.join(__dirname, 'lib'), {
  dotfiles: 'deny',
  index: false,
}));
const PAGINAS_MOVIMENTACOES = new Set(['home.html', 'musicas.html', 'escalas.html']);

app.use((req, res, next) => {
  if (!['GET', 'HEAD'].includes(req.method)) return next();

  let caminhoDecodificado = req.path;

  try {
    for (let tentativa = 0; tentativa < 2 && caminhoDecodificado.includes('%'); tentativa += 1) {
      caminhoDecodificado = decodeURIComponent(caminhoDecodificado);
    }
  } catch (erro) {
    return next();
  }

  const prefixoEsperado = '/movimentações/';
  if (!caminhoDecodificado.startsWith(prefixoEsperado)) return next();

  const arquivo = caminhoDecodificado.slice(prefixoEsperado.length);
  if (!PAGINAS_MOVIMENTACOES.has(arquivo)) {
    return res.status(404).end();
  }

  return res.sendFile(path.join(__dirname, 'movimentações', arquivo));
});

app.all('/api/auth', authHandler);
app.all('/api/health', healthHandler);
app.all('/api/membros', membrosHandler);
app.all('/api/repertorio', repertorioHandler);
app.all('/api/escalas', escalasHandler);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
