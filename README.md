# Site estudo/Jeova nissi
Criei esse site para testar algumas coisas que estava aprendendo, mas mudei para um site do ministerio de louvor JEOVA NISSI
Use esse login para ver o site

Acesso visitantes: Visitante //
Senha: 1234

## Configuracao do Supabase

O banco fica versionado em `supabase/migrations` e os dados iniciais ficam em `supabase/seed.sql`.

Para configurar pelo painel:

1. Abra o projeto no Supabase.
2. Va em SQL Editor > New query.
3. Execute `supabase/migrations/20260520183000_initial_schema.sql`.
4. Execute `supabase/seed.sql`.
5. Na Vercel, configure as variaveis de ambiente:
   - `SUPABASE_URL`: URL do projeto Supabase.
   - `SUPABASE_ANON_KEY`: chave anon/public.
   - `SUPABASE_SERVICE_ROLE_KEY`: chave service_role. Use somente no servidor/Vercel.
   - `SESSION_SECRET`: uma frase longa e secreta para assinar o cookie de login.
6. Faca um novo deploy na Vercel depois de salvar as variaveis.

O arquivo `supabase-setup.sql` existe so como lembrete da ordem de execucao no painel.
