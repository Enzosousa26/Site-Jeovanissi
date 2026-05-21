const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const RECURSOS_PERMITIDOS = new Set(['membros', 'repertorio', 'escalas']);

function validarConfigSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente.');
  }
}

function headersSupabase() {
  validarConfigSupabase();

  return {
    apikey: SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  };
}

function validarRecurso(tabela) {
  if (!RECURSOS_PERMITIDOS.has(tabela)) {
    throw new Error(`Recurso nao permitido: ${tabela}`);
  }
}

async function montarErroSupabase(response, acao) {
  let detalhe = '';

  try {
    detalhe = await response.text();
  } catch (erro) {
    detalhe = '';
  }

  return new Error(`Falha ao ${acao}: ${response.status}${detalhe ? ` - ${detalhe}` : ''}`);
}

async function chamarRpc(nomeFuncao, parametros) {
  validarConfigSupabase();

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${nomeFuncao}`, {
    method: 'POST',
    headers: headersSupabase(),
    body: JSON.stringify(parametros),
  });

  if (!response.ok) {
    throw await montarErroSupabase(response, `executar ${nomeFuncao}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

function primeiraLinha(resultado) {
  if (Array.isArray(resultado)) return resultado[0] || null;
  return resultado || null;
}

async function autenticarUsuario(usuario, senha) {
  return chamarRpc('autenticar_usuario_site', {
    p_usuario: usuario,
    p_senha: senha,
  });
}

async function buscarTabela(tabela) {
  validarRecurso(tabela);
  const linha = primeiraLinha(await chamarRpc('buscar_dados_site', { p_chave: tabela }));

  if (!linha) {
    return { dados: null, atualizado_em: null };
  }

  return {
    dados: linha.dados ?? null,
    atualizado_em: linha.atualizado_em ?? null,
    versao: linha.versao ?? null,
  };
}

async function salvarTabela(tabela, dados, sessao, atualizadoEm) {
  if (!sessao.token) {
    return salvarTabelaSemToken(tabela, dados);
  }

  validarRecurso(tabela);

  const resultado = primeiraLinha(await chamarRpc('salvar_dados_site', {
    p_tabela: tabela,
    p_dados: dados,
    p_usuario: sessao.usuario,
    p_token: sessao.token,
    p_atualizado_em: atualizadoEm,
  }));

  return {
    dados,
    atualizado_em: resultado?.atualizado_em ?? null,
    versao: resultado?.versao ?? null,
  };
}

async function salvarTabelaSemToken(tabela, dados) {
  validarRecurso(tabela);
  throw new Error('Sessao remota sem token. Entre novamente como admin para salvar no Supabase.');
}

module.exports = {
  autenticarUsuario,
  buscarTabela,
  salvarTabela,
};
