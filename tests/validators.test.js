const test = require('node:test');
const assert = require('node:assert/strict');
const {
  dataDiaMesValida,
  formatarDataComDiaSemana,
  obterDiaSemanaData,
} = require('../lib/validators');

test('aceita datas reais no formato dd/mm', () => {
  assert.equal(dataDiaMesValida('01/01', 2026), true);
  assert.equal(dataDiaMesValida('29/02', 2028), true);
  assert.equal(dataDiaMesValida('31/12', 2026), true);
});

test('rejeita datas impossiveis e formatos invalidos', () => {
  for (const valor of ['29/02', '31/02', '31/04', '00/10', '10/13', '1/01', 'abc', '']) {
    assert.equal(dataDiaMesValida(valor, 2026), false, valor);
  }
});

test('calcula o dia da semana conforme o ano de referencia', () => {
  assert.equal(obterDiaSemanaData('22/07', 2026), 'Quarta-feira');
  assert.equal(formatarDataComDiaSemana('22/07', 2026), 'Quarta-feira 22/07');
});
