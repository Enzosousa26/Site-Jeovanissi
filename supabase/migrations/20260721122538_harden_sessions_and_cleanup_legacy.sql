create table if not exists public.sessoes_site (
  token_hash text primary key,
  usuario text not null references public.usuarios_site(usuario) on delete cascade,
  perfil text not null check (perfil in ('admin', 'membro')),
  expira_em timestamptz not null,
  criado_em timestamptz not null default now()
);

create table if not exists public.tentativas_login_site (
  identificador text primary key,
  falhas integer not null default 0,
  janela_inicio timestamptz not null default now(),
  bloqueado_ate timestamptz,
  constraint tentativas_login_site_falhas_check check (falhas >= 0)
);

alter table public.sessoes_site enable row level security;
alter table public.tentativas_login_site enable row level security;

drop policy if exists "Service role gerencia sessoes" on public.sessoes_site;
create policy "Service role gerencia sessoes"
  on public.sessoes_site for all to service_role
  using (true) with check (true);

drop policy if exists "Service role gerencia tentativas de login" on public.tentativas_login_site;
create policy "Service role gerencia tentativas de login"
  on public.tentativas_login_site for all to service_role
  using (true) with check (true);

revoke all privileges on table public.sessoes_site, public.tentativas_login_site
  from public, anon, authenticated;
grant select, insert, update, delete on public.sessoes_site, public.tentativas_login_site
  to service_role;

create index if not exists sessoes_site_usuario_idx
  on public.sessoes_site (usuario);
create index if not exists sessoes_site_expira_em_idx
  on public.sessoes_site (expira_em);

drop function if exists public.autenticar_usuario_site(text, text, text);

create function public.autenticar_usuario_site(
  p_usuario text,
  p_senha text,
  p_identificador text
)
returns table (perfil text, nome text, token text, bloqueado boolean)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  usuario_encontrado public.usuarios_site%rowtype;
  tentativa public.tentativas_login_site%rowtype;
  hash_calculado text;
  novo_token text;
begin
  if coalesce(length(p_identificador), 0) <> 64 then
    raise sqlstate 'PT400' using message = 'Identificador de tentativa invalido.';
  end if;

  delete from public.sessoes_site where expira_em <= now();
  delete from public.tentativas_login_site
    where janela_inicio < now() - interval '1 day';

  select * into tentativa
    from public.tentativas_login_site
   where identificador = p_identificador
   for update;

  if found and tentativa.bloqueado_ate > now() then
    perfil := null;
    nome := null;
    token := null;
    bloqueado := true;
    return next;
    return;
  end if;

  select * into usuario_encontrado
    from public.usuarios_site
   where usuario = public.normalizar_usuario_site(p_usuario)
     and ativo = true;

  if found and usuario_encontrado.salt is not null then
    hash_calculado := encode(
      public.pbkdf2_sha256(coalesce(p_senha, ''), usuario_encontrado.salt, 120000, 32),
      'base64'
    );
  end if;

  if not found or hash_calculado is distinct from usuario_encontrado.senha_hash then
    insert into public.tentativas_login_site (
      identificador, falhas, janela_inicio, bloqueado_ate
    ) values (
      p_identificador, 1, now(), null
    )
    on conflict (identificador) do update
      set falhas = case
            when tentativas_login_site.janela_inicio < now() - interval '10 minutes' then 1
            else tentativas_login_site.falhas + 1
          end,
          janela_inicio = case
            when tentativas_login_site.janela_inicio < now() - interval '10 minutes' then now()
            else tentativas_login_site.janela_inicio
          end,
          bloqueado_ate = case
            when (
              case
                when tentativas_login_site.janela_inicio < now() - interval '10 minutes' then 1
                else tentativas_login_site.falhas + 1
              end
            ) >= 5 then now() + interval '15 minutes'
            else null
          end;

    select * into tentativa
      from public.tentativas_login_site
     where identificador = p_identificador;

    if tentativa.bloqueado_ate > now() then
      perfil := null;
      nome := null;
      token := null;
      bloqueado := true;
      return next;
    end if;
    return;
  end if;

  delete from public.tentativas_login_site where identificador = p_identificador;
  novo_token := encode(extensions.gen_random_bytes(32), 'hex');

  insert into public.sessoes_site (token_hash, usuario, perfil, expira_em)
  values (
    encode(extensions.digest(novo_token, 'sha256'), 'hex'),
    usuario_encontrado.usuario,
    usuario_encontrado.perfil,
    now() + interval '8 hours'
  );

  perfil := usuario_encontrado.perfil;
  nome := usuario_encontrado.nome;
  token := novo_token;
  bloqueado := false;
  return next;
end;
$$;

create or replace function public.validar_sessao_site(p_usuario text, p_token text)
returns table (perfil text, nome text)
language sql
security invoker
set search_path = ''
as $$
  select u.perfil, u.nome
    from public.sessoes_site s
    join public.usuarios_site u on u.usuario = s.usuario
   where s.usuario = public.normalizar_usuario_site(p_usuario)
     and s.token_hash = encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex')
     and s.expira_em > now()
     and u.ativo = true
     and u.perfil = s.perfil
   limit 1;
$$;

create or replace function public.encerrar_sessao_site(p_usuario text, p_token text)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  linhas_removidas integer;
begin
  delete from public.sessoes_site
   where usuario = public.normalizar_usuario_site(p_usuario)
     and token_hash = encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex');
  get diagnostics linhas_removidas = row_count;
  return linhas_removidas > 0;
end;
$$;

create or replace function public.salvar_dados_site(
  p_tabela text,
  p_dados jsonb,
  p_usuario text,
  p_token text,
  p_atualizado_em timestamptz default null
)
returns table (atualizado_em timestamptz, versao bigint)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  usuario_encontrado public.usuarios_site%rowtype;
  documento_atual public.site_documents%rowtype;
  nova_versao bigint;
  novo_atualizado_em timestamptz;
begin
  if p_tabela not in ('membros', 'repertorio', 'escalas') then
    raise sqlstate 'PT400' using message = 'Documento nao permitido.';
  end if;

  if (p_tabela = 'membros' and jsonb_typeof(p_dados) <> 'array')
     or (p_tabela in ('repertorio', 'escalas') and jsonb_typeof(p_dados) <> 'object') then
    raise sqlstate 'PT400' using message = 'Formato de dados invalido.';
  end if;

  select u.* into usuario_encontrado
    from public.sessoes_site s
    join public.usuarios_site u on u.usuario = s.usuario
   where s.usuario = public.normalizar_usuario_site(p_usuario)
     and s.token_hash = encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex')
     and s.expira_em > now()
     and s.perfil = 'admin'
     and u.perfil = 'admin'
     and u.ativo = true;

  if not found then
    raise sqlstate 'PT401' using message = 'Sessao de administrador invalida.';
  end if;

  select * into documento_atual
    from public.site_documents
   where chave = p_tabela
   for update;

  if not found then
    insert into public.site_documents (chave, dados)
    values (p_tabela, p_dados)
    returning site_documents.atualizado_em, site_documents.versao
      into novo_atualizado_em, nova_versao;

    insert into public.site_audit_log (chave, usuario, acao, versao_anterior, versao_nova)
    values (p_tabela, usuario_encontrado.usuario, 'insert', null, nova_versao);
  else
    if p_atualizado_em is null or documento_atual.atualizado_em <> p_atualizado_em then
      raise sqlstate 'PT409' using message = 'Os dados foram alterados por outro administrador.';
    end if;

    update public.site_documents
       set dados = p_dados,
           versao = documento_atual.versao + 1
     where chave = p_tabela
     returning site_documents.atualizado_em, site_documents.versao
       into novo_atualizado_em, nova_versao;

    insert into public.site_audit_log (chave, usuario, acao, versao_anterior, versao_nova)
    values (p_tabela, usuario_encontrado.usuario, 'update', documento_atual.versao, nova_versao);
  end if;

  atualizado_em := novo_atualizado_em;
  versao := nova_versao;
  return next;
end;
$$;

revoke execute on function public.autenticar_usuario_site(text, text, text)
  from public, anon, authenticated;
revoke execute on function public.validar_sessao_site(text, text)
  from public, anon, authenticated;
revoke execute on function public.encerrar_sessao_site(text, text)
  from public, anon, authenticated;
revoke execute on function public.salvar_dados_site(text, jsonb, text, text, timestamptz)
  from public, anon, authenticated;

grant execute on function public.autenticar_usuario_site(text, text, text) to service_role;
grant execute on function public.validar_sessao_site(text, text) to service_role;
grant execute on function public.encerrar_sessao_site(text, text) to service_role;
grant execute on function public.salvar_dados_site(text, jsonb, text, text, timestamptz) to service_role;

do $migration$
declare
  tabela text;
  politica text;
begin
  for tabela in
    select c.relname
      from pg_catalog.pg_class c
      join pg_catalog.pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relkind in ('r', 'p')
       and c.relname ~ '^(membros|repertorio|escalas)_legacy_[0-9]+$'
  loop
    for politica in
      select p.polname
        from pg_catalog.pg_policy p
       where p.polrelid = format('public.%I', tabela)::regclass
    loop
      execute format('drop policy if exists %I on public.%I', politica, tabela);
    end loop;

    execute format(
      'revoke all privileges on table public.%I from public, anon, authenticated',
      tabela
    );
  end loop;
end
$migration$;
