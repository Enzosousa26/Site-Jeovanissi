(function criarUtilitariosSincronizacao(raiz, fabrica) {
  const api = fabrica();

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }

  raiz.SincronizacaoJeovaNissi = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function fabricaUtilitariosSincronizacao() {
  function normalizarDados(valor) {
    if (Array.isArray(valor)) {
      return valor.map(normalizarDados);
    }

    if (valor && typeof valor === 'object') {
      return Object.keys(valor)
        .sort()
        .reduce((resultado, chave) => {
          resultado[chave] = normalizarDados(valor[chave]);
          return resultado;
        }, {});
    }

    return valor;
  }

  function dadosIguais(primeiro, segundo) {
    return JSON.stringify(normalizarDados(primeiro)) === JSON.stringify(normalizarDados(segundo));
  }

  return {
    dadosIguais,
  };
});
