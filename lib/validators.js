(function criarValidadores(raiz, fabrica) {
  const api = fabrica();

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }

  raiz.ValidadoresJeovaNissi = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function fabricaValidadores() {
  const NOMES_DIAS_SEMANA = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ];

  function obterAnoReferencia(ano) {
    const anoNumerico = Number(ano);
    return Number.isInteger(anoNumerico) && anoNumerico > 0
      ? anoNumerico
      : new Date().getFullYear();
  }

  function obterPartesDataDiaMes(valor) {
    const correspondencia = /^(\d{2})\/(\d{2})$/.exec(String(valor || '').trim());
    if (!correspondencia) return false;

    const dia = Number(correspondencia[1]);
    const mes = Number(correspondencia[2]);
    if (mes < 1 || mes > 12) return false;

    return { dia, mes };
  }

  function criarDataDiaMes(valor, ano) {
    const partes = obterPartesDataDiaMes(valor);
    if (!partes) return null;

    const anoReferencia = obterAnoReferencia(ano);
    const data = new Date(anoReferencia, partes.mes - 1, partes.dia);

    if (
      data.getFullYear() !== anoReferencia ||
      data.getMonth() !== partes.mes - 1 ||
      data.getDate() !== partes.dia
    ) {
      return null;
    }

    return data;
  }

  function dataDiaMesValida(valor, ano) {
    return Boolean(criarDataDiaMes(valor, ano));
  }

  function obterDiaSemanaData(valor, ano) {
    const data = criarDataDiaMes(valor, ano);
    return data ? NOMES_DIAS_SEMANA[data.getDay()] : '';
  }

  function formatarDataComDiaSemana(valor, ano) {
    const data = String(valor || '').trim();
    const diaSemana = obterDiaSemanaData(data, ano);
    return diaSemana ? `${diaSemana} ${data}` : data;
  }

  return {
    criarDataDiaMes,
    dataDiaMesValida,
    formatarDataComDiaSemana,
    obterDiaSemanaData,
  };
});
