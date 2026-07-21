(function criarValidadores(raiz, fabrica) {
  const api = fabrica();

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }

  raiz.ValidadoresJeovaNissi = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function fabricaValidadores() {
  function dataDiaMesValida(valor) {
    const correspondencia = /^(\d{2})\/(\d{2})$/.exec(String(valor || '').trim());
    if (!correspondencia) return false;

    const dia = Number(correspondencia[1]);
    const mes = Number(correspondencia[2]);
    if (mes < 1 || mes > 12) return false;

    const diasNoMes = new Date(Date.UTC(2000, mes, 0)).getUTCDate();
    return dia >= 1 && dia <= diasNoMes;
  }

  return { dataDiaMesValida };
});
