const crypto = require('crypto');

function obterIp(req) {
  const encaminhado = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return encaminhado || req.socket?.remoteAddress || 'ip-desconhecido';
}

function obterIdentificadorTentativa(req, usuario) {
  return crypto
    .createHash('sha256')
    .update(`${obterIp(req)}|${String(usuario || '').toLowerCase()}`)
    .digest('hex');
}

module.exports = { obterIdentificadorTentativa };
