# Supabase

Banco do site Jeova Nissi.

## Ordem de execucao pelo painel

1. Execute `migrations/20260520183000_initial_schema.sql`.
2. Execute `seed.sql`.

## Estrutura

- `site_documents`: guarda os documentos editaveis do site (`membros`, `repertorio`, `escalas`) com versao e data de atualizacao.
- `usuarios_site`: guarda usuarios, perfil, hash de senha e token de sessao remota.
- `site_audit_log`: registra alteracoes feitas por administradores.
- `buscar_dados_site`: RPC usada pela API para carregar dados.
- `autenticar_usuario_site`: RPC usada pela API de login.
- `salvar_dados_site`: RPC usada pela API para salvar com sessao de admin.
