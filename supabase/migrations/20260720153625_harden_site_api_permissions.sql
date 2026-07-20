-- Harden the RPC boundary while preserving public read-only site content.
alter function public.autenticar_usuario_site(text, text) security invoker;
alter function public.buscar_dados_site(text) security invoker;
alter function public.salvar_dados_site(text, jsonb, text, text, timestamptz) security invoker;

alter view public.membros set (security_invoker = true);
alter view public.repertorio set (security_invoker = true);
alter view public.escalas set (security_invoker = true);

alter table public.site_documents enable row level security;
alter table public.usuarios_site enable row level security;
alter table public.site_audit_log enable row level security;

drop policy if exists "Leitura publica dos documentos do site"
  on public.site_documents;
create policy "Leitura publica dos documentos do site"
  on public.site_documents
  for select
  to anon, authenticated, service_role
  using (true);

drop policy if exists "Service role gerencia documentos do site"
  on public.site_documents;
create policy "Service role gerencia documentos do site"
  on public.site_documents
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "Service role gerencia usuarios do site"
  on public.usuarios_site;
create policy "Service role gerencia usuarios do site"
  on public.usuarios_site
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "Service role le auditoria do site"
  on public.site_audit_log;
create policy "Service role le auditoria do site"
  on public.site_audit_log
  for select
  to service_role
  using (true);

grant usage on schema public to anon, authenticated, service_role;
grant select on public.site_documents, public.membros, public.repertorio, public.escalas
  to anon, authenticated, service_role;
grant select, insert, update, delete on public.site_documents, public.usuarios_site, public.site_audit_log
  to service_role;
grant usage, select on all sequences in schema public to service_role;

revoke execute on function public.buscar_dados_site(text) from public;
revoke execute on function public.autenticar_usuario_site(text, text)
  from public, anon, authenticated;
revoke execute on function public.salvar_dados_site(text, jsonb, text, text, timestamptz)
  from public, anon, authenticated;

grant execute on function public.buscar_dados_site(text)
  to anon, authenticated, service_role;
grant execute on function public.autenticar_usuario_site(text, text)
  to service_role;
grant execute on function public.salvar_dados_site(text, jsonb, text, text, timestamptz)
  to service_role;
