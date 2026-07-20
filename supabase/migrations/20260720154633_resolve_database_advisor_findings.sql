-- Keep extensions outside exposed schemas and use an explicit function lookup path.
alter extension unaccent set schema extensions;

do $migration$
begin
  if to_regprocedure('public.atualizar_data_alteracao()') is not null then
    execute 'alter function public.atualizar_data_alteracao() '
      'set search_path = public, extensions, pg_temp';
  end if;
end
$migration$;

alter function public.atualizar_atualizado_em()
  set search_path = public, extensions, pg_temp;
alter function public.bytea_xor(bytea, bytea)
  set search_path = public, extensions, pg_temp;
alter function public.pbkdf2_sha256(text, text, integer, integer)
  set search_path = public, extensions, pg_temp;
alter function public.normalizar_usuario_site(text)
  set search_path = public, extensions, pg_temp;

-- Legacy backup tables remain preserved, but are no longer exposed to web roles.
do $migration$
declare
  tabela text;
begin
  foreach tabela in array array[
    'membros_legacy_20260520205501',
    'repertorio_legacy_20260520205501',
    'escalas_legacy_20260520205501'
  ] loop
    if to_regclass(format('public.%I', tabela)) is not null then
      execute format('drop policy if exists %I on public.%I',
        case tabela
          when 'membros_legacy_20260520205501' then 'Leitura publica membros'
          when 'repertorio_legacy_20260520205501' then 'Leitura publica repertorio'
          else 'Leitura publica escalas'
        end,
        tabela
      );
      execute format('drop policy if exists %I on public.%I',
        case tabela
          when 'membros_legacy_20260520205501' then 'acesso_publico_membros'
          when 'repertorio_legacy_20260520205501' then 'acesso_publico_repertorio'
          else 'acesso_publico_escalas'
        end,
        tabela
      );
      execute format(
        'revoke all privileges on table public.%I from public, anon, authenticated',
        tabela
      );
    end if;
  end loop;
end
$migration$;

-- Session access is explicitly service-only and the foreign key is indexed.
do $migration$
begin
  if to_regclass('public.sessoes_site') is not null then
    drop policy if exists "Service role gerencia sessoes"
      on public.sessoes_site;
    create policy "Service role gerencia sessoes"
      on public.sessoes_site
      for all
      to service_role
      using (true)
      with check (true);

    create index if not exists sessoes_site_usuario_idx
      on public.sessoes_site (usuario);
  end if;
end
$migration$;
