create extension if not exists pgcrypto;
create extension if not exists unaccent;

create table if not exists public.site_documents (
  chave text primary key,
  dados jsonb not null,
  versao bigint not null default 1,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint site_documents_chave_check check (chave in ('membros', 'repertorio', 'escalas'))
);

create table if not exists public.usuarios_site (
  usuario text primary key,
  nome text not null,
  perfil text not null check (perfil in ('admin', 'membro')),
  salt text not null,
  senha_hash text not null,
  token text,
  token_expira_em timestamptz,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table public.usuarios_site
  add column if not exists usuario text,
  add column if not exists nome text,
  add column if not exists perfil text,
  add column if not exists salt text,
  add column if not exists senha_hash text,
  add column if not exists token text,
  add column if not exists token_expira_em timestamptz,
  add column if not exists ativo boolean not null default true,
  add column if not exists criado_em timestamptz not null default now(),
  add column if not exists atualizado_em timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
      from pg_constraint
     where conname = 'usuarios_site_pkey'
       and conrelid = 'public.usuarios_site'::regclass
  ) then
    alter table public.usuarios_site add constraint usuarios_site_pkey primary key (usuario);
  end if;
end;
$$;

create table if not exists public.site_audit_log (
  id bigint generated always as identity primary key,
  chave text not null check (chave in ('membros', 'repertorio', 'escalas')),
  usuario text,
  acao text not null,
  versao_anterior bigint,
  versao_nova bigint,
  criado_em timestamptz not null default now()
);

do $$
declare
  recurso text;
  tipo_relacao "char";
  nome_legado text;
begin
  foreach recurso in array array['membros', 'repertorio', 'escalas'] loop
    select c.relkind
      into tipo_relacao
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relname = recurso;

    if tipo_relacao in ('r', 'p') then
      execute format(
        'insert into public.site_documents (chave, dados, atualizado_em)
         select %L, dados, coalesce(atualizado_em, now())
           from public.%I
          where id = 1
         on conflict (chave) do nothing',
        recurso,
        recurso
      );

      nome_legado := recurso || '_legacy_' || to_char(clock_timestamp(), 'YYYYMMDDHH24MISS');
      execute format('alter table public.%I rename to %I', recurso, nome_legado);
    end if;
  end loop;
end;
$$;

create or replace function public.atualizar_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists site_documents_atualizado_em on public.site_documents;
create trigger site_documents_atualizado_em
before update on public.site_documents
for each row execute function public.atualizar_atualizado_em();

drop trigger if exists usuarios_site_atualizado_em on public.usuarios_site;
create trigger usuarios_site_atualizado_em
before update on public.usuarios_site
for each row execute function public.atualizar_atualizado_em();

create or replace function public.bytea_xor(a bytea, b bytea)
returns bytea
language plpgsql
immutable
strict
as $$
declare
  resultado bytea := a;
  indice integer;
begin
  if length(a) <> length(b) then
    raise exception 'Bytea com tamanhos diferentes.';
  end if;

  if length(a) = 0 then
    return resultado;
  end if;

  for indice in 0..length(a) - 1 loop
    resultado := set_byte(resultado, indice, get_byte(resultado, indice) # get_byte(b, indice));
  end loop;

  return resultado;
end;
$$;

create or replace function public.pbkdf2_sha256(
  senha text,
  salt text,
  iteracoes integer,
  tamanho_chave integer
)
returns bytea
language plpgsql
immutable
strict
as $$
declare
  tamanho_hash constant integer := 32;
  total_blocos integer := ceil(tamanho_chave::numeric / tamanho_hash)::integer;
  bloco integer;
  rodada integer;
  u bytea;
  t bytea;
  resultado bytea := ''::bytea;
begin
  if iteracoes < 1 or tamanho_chave < 1 then
    raise exception 'Parametros invalidos para PBKDF2.';
  end if;

  for bloco in 1..total_blocos loop
    u := hmac(
      convert_to(salt, 'utf8') || decode(lpad(to_hex(bloco), 8, '0'), 'hex'),
      convert_to(senha, 'utf8'),
      'sha256'
    );
    t := u;

    for rodada in 2..iteracoes loop
      u := hmac(u, convert_to(senha, 'utf8'), 'sha256');
      t := public.bytea_xor(t, u);
    end loop;

    resultado := resultado || t;
  end loop;

  return substring(resultado from 1 for tamanho_chave);
end;
$$;

create or replace function public.normalizar_usuario_site(valor text)
returns text
language sql
stable
as $$
  select lower(regexp_replace(unaccent(trim(coalesce(valor, ''))), '\s+', '', 'g'));
$$;

drop function if exists public.buscar_dados_site(text);
drop function if exists public.autenticar_usuario_site(text, text);
drop function if exists public.salvar_dados_site(text, jsonb, text, text, timestamptz);

create or replace function public.buscar_dados_site(p_chave text)
returns table (dados jsonb, atualizado_em timestamptz, versao bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_chave not in ('membros', 'repertorio', 'escalas') then
    raise exception 'Documento nao permitido: %', p_chave;
  end if;

  return query
    select sd.dados, sd.atualizado_em, sd.versao
      from public.site_documents sd
     where sd.chave = p_chave;
end;
$$;

create or replace function public.autenticar_usuario_site(p_usuario text, p_senha text)
returns table (perfil text, nome text, token text)
language plpgsql
security definer
set search_path = public
as $$
declare
  usuario_encontrado public.usuarios_site%rowtype;
  hash_calculado text;
  novo_token text;
begin
  select *
    into usuario_encontrado
    from public.usuarios_site
   where usuario = public.normalizar_usuario_site(p_usuario)
     and ativo = true;

  if not found then
    return;
  end if;

  hash_calculado := encode(
    public.pbkdf2_sha256(coalesce(p_senha, ''), usuario_encontrado.salt, 120000, 32),
    'base64'
  );

  if hash_calculado <> usuario_encontrado.senha_hash then
    return;
  end if;

  novo_token := encode(gen_random_bytes(32), 'hex');

  update public.usuarios_site
     set token = novo_token,
         token_expira_em = now() + interval '8 hours'
   where usuario = usuario_encontrado.usuario;

  perfil := usuario_encontrado.perfil;
  nome := usuario_encontrado.nome;
  token := novo_token;
  return next;
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
security definer
set search_path = public
as $$
declare
  usuario_encontrado public.usuarios_site%rowtype;
  documento_atual public.site_documents%rowtype;
  nova_versao bigint;
  novo_atualizado_em timestamptz;
begin
  if p_tabela not in ('membros', 'repertorio', 'escalas') then
    raise exception 'Documento nao permitido: %', p_tabela;
  end if;

  select *
    into usuario_encontrado
    from public.usuarios_site
   where usuario = public.normalizar_usuario_site(p_usuario)
     and token = p_token
     and token_expira_em > now()
     and perfil = 'admin'
     and ativo = true;

  if not found then
    raise exception 'Sessao de administrador invalida.';
  end if;

  select *
    into documento_atual
    from public.site_documents
   where chave = p_tabela
   for update;

  if not found then
    insert into public.site_documents (chave, dados)
    values (p_tabela, coalesce(p_dados, '{}'::jsonb))
    returning site_documents.atualizado_em, site_documents.versao
      into novo_atualizado_em, nova_versao;

    insert into public.site_audit_log (chave, usuario, acao, versao_anterior, versao_nova)
    values (p_tabela, usuario_encontrado.usuario, 'insert', null, nova_versao);

    atualizado_em := novo_atualizado_em;
    versao := nova_versao;
    return next;
    return;
  end if;

  if p_atualizado_em is not null and documento_atual.atualizado_em <> p_atualizado_em then
    raise exception 'Os dados foram alterados por outro administrador. Recarregue a pagina.';
  end if;

  update public.site_documents
     set dados = coalesce(p_dados, '{}'::jsonb),
         versao = documento_atual.versao + 1
   where chave = p_tabela
   returning site_documents.atualizado_em, site_documents.versao
      into novo_atualizado_em, nova_versao;

  insert into public.site_audit_log (chave, usuario, acao, versao_anterior, versao_nova)
  values (p_tabela, usuario_encontrado.usuario, 'update', documento_atual.versao, nova_versao);

  atualizado_em := novo_atualizado_em;
  versao := nova_versao;
  return next;
end;
$$;

create or replace view public.membros
with (security_invoker = true)
as
select 1 as id, dados, atualizado_em
from public.site_documents
where chave = 'membros';

create or replace view public.repertorio
with (security_invoker = true)
as
select 1 as id, dados, atualizado_em
from public.site_documents
where chave = 'repertorio';

create or replace view public.escalas
with (security_invoker = true)
as
select 1 as id, dados, atualizado_em
from public.site_documents
where chave = 'escalas';

alter table public.site_documents enable row level security;
alter table public.usuarios_site enable row level security;
alter table public.site_audit_log enable row level security;

drop policy if exists "Leitura publica dos documentos do site" on public.site_documents;
create policy "Leitura publica dos documentos do site"
on public.site_documents for select
using (true);

drop policy if exists "Service role gerencia documentos do site" on public.site_documents;
create policy "Service role gerencia documentos do site"
on public.site_documents for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists "Service role gerencia usuarios do site" on public.usuarios_site;
create policy "Service role gerencia usuarios do site"
on public.usuarios_site for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists "Service role le auditoria do site" on public.site_audit_log;
create policy "Service role le auditoria do site"
on public.site_audit_log for select
using (auth.role() = 'service_role');

grant usage on schema public to anon, authenticated;
grant select on public.membros, public.repertorio, public.escalas to anon, authenticated;
grant execute on function public.buscar_dados_site(text) to anon, authenticated;
grant execute on function public.autenticar_usuario_site(text, text) to anon, authenticated;
grant execute on function public.salvar_dados_site(text, jsonb, text, text, timestamptz) to anon, authenticated;
