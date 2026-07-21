const test = require('node:test');
const assert = require('node:assert/strict');
const { dadosIguais } = require('../lib/sync-utils');
const { responderConflitoIdempotente } = require('../api/resource-handler');

function criarRespostaTeste() {
  return {
    statusCode: null,
    corpo: null,
    status(codigo) {
      this.statusCode = codigo;
      return this;
    },
    json(corpo) {
      this.corpo = corpo;
      return this;
    },
  };
}

test('reconhece como iguais dados JSON com chaves em ordens diferentes', () => {
  const local = {
    '25/07': [{ nome: 'Eli Soares', link: '' }],
    observacoes: { som: 'Aminadabe', vocal: ['Nicole', 'Moises'] },
  };
  const remoto = {
    observacoes: { vocal: ['Nicole', 'Moises'], som: 'Aminadabe' },
    '25/07': [{ link: '', nome: 'Eli Soares' }],
  };

  assert.equal(dadosIguais(local, remoto), true);
});

test('nao trata alteracoes reais como repeticao idempotente', () => {
  assert.equal(
    dadosIguais(
      { '25/07': [{ nome: 'Eli Soares', link: '' }] },
      { '25/07': [{ nome: 'Outra musica', link: '' }] }
    ),
    false
  );
  assert.equal(dadosIguais(['Nicole', 'Moises'], ['Moises', 'Nicole']), false);
});

test('converte conflito repetido em sucesso com a versao atual do servidor', async () => {
  const resposta = criarRespostaTeste();
  const resultadoAtual = {
    dados: { '25/07': [{ link: '', nome: 'Eli Soares' }] },
    atualizado_em: '2026-07-21T13:36:48.409467+00:00',
    versao: 7,
  };

  const reconciliado = await responderConflitoIdempotente(
    resposta,
    { status: 409 },
    'repertorio',
    { '25/07': [{ nome: 'Eli Soares', link: '' }] },
    async () => resultadoAtual
  );

  assert.equal(reconciliado, true);
  assert.equal(resposta.statusCode, 200);
  assert.deepEqual(resposta.corpo, resultadoAtual);
});

test('preserva o conflito quando o servidor tem alteracoes diferentes', async () => {
  const resposta = criarRespostaTeste();

  const reconciliado = await responderConflitoIdempotente(
    resposta,
    { status: 409 },
    'repertorio',
    { '25/07': [{ nome: 'Minha alteracao', link: '' }] },
    async () => ({
      dados: { '25/07': [{ nome: 'Alteracao de outro admin', link: '' }] },
      atualizado_em: '2026-07-21T13:40:00.000000+00:00',
      versao: 8,
    })
  );

  assert.equal(reconciliado, false);
  assert.equal(resposta.statusCode, null);
  assert.equal(resposta.corpo, null);
});
