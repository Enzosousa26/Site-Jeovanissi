const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const TABELAS_ID = {
  membros: 1,
  repertorio: 1,
  escalas: 1,
};

function validarConfigSupabase() {
  if (!SUPABASE_URL || (!SUPABASE_ANON_KEY && !SUPABASE_SERVICE_ROLE_KEY)) {
    throw new Error('Configure SUPABASE_URL e SUPABASE_ANON_KEY nas variáveis de ambiente.');
  }
}

function headersSupabase() {
  validarConfigSupabase();
  const chave = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

  return {
    apikey: chave,
    Authorization: `Bearer ${chave}`,
    'Content-Type': 'application/json',
  };
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

async function autenticarUsuario(usuario, senha) {
  return chamarRpc('autenticar_usuario_site', {
    p_usuario: usuario,
    p_senha: senha,
  });
}

async function buscarTabela(tabela) {
  validarConfigSupabase();

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${tabela}?id=eq.${TABELAS_ID[tabela]}&select=dados,atualizado_em`,
    {
      headers: headersSupabase(),
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw await montarErroSupabase(response, `buscar ${tabela}`);
  }

  const rows = await response.json();
  if (!rows || rows.length === 0) {
    return { dados: null, atualizado_em: null };
  }

  return rows[0];
}

async function salvarTabela(tabela, dados, sessao, atualizadoEm) {
  if (!sessao.token) {
    return salvarTabelaSemToken(tabela, dados);
  }

  const resultado = await chamarRpc('salvar_dados_site', {
    p_tabela: tabela,
    p_dados: dados,
    p_usuario: sessao.usuario,
    p_token: sessao.token,
    p_atualizado_em: atualizadoEm,
  });

  return {
    dados,
    atualizado_em: resultado?.atualizado_em ?? null,
  };
}

async function salvarTabelaSemToken(tabela, dados) {
  validarConfigSupabase();

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${tabela}?id=eq.${TABELAS_ID[tabela]}`, {
    method: 'PATCH',
    headers: {
      ...headersSupabase(),
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ dados }),
  });

  if (!response.ok) {
    throw await montarErroSupabase(response, `salvar ${tabela} sem token`);
  }

  const rows = await response.json();
  if (rows && rows.length > 0) {
    return {
      dados: rows[0].dados ?? dados,
      atualizado_em: rows[0].atualizado_em ?? null,
    };
  }

  const criarResponse = await fetch(`${SUPABASE_URL}/rest/v1/${tabela}`, {
    method: 'POST',
    headers: {
      ...headersSupabase(),
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      id: TABELAS_ID[tabela],
      dados,
    }),
  });

  if (!criarResponse.ok) {
    throw await montarErroSupabase(criarResponse, `criar ${tabela} sem token`);
  }

  const criadas = await criarResponse.json();
  const criada = criadas?.[0];

  return {
    dados: criada?.dados ?? dados,
    atualizado_em: criada?.atualizado_em ?? null,
  };
}

module.exports = {
  autenticarUsuario,
  buscarTabela,
  salvarTabela,
};
