# Manutenção operacional

Este documento é o procedimento de operação do Site Jeova Nissi.

## Automação incluída

- `.github/workflows/maintenance.yml`: valida sintaxe e dependências em cada
  push, pull request e uma vez por semana.
- `.github/workflows/health-monitor.yml`: verifica a página, a API e o banco a
  cada seis horas. Se o banco estiver indisponível e o projeto Supabase estiver
  realmente `INACTIVE`, solicita a restauração e aguarda a saúde da aplicação.
- `.github/dependabot.yml`: propõe atualizações mensais de dependências. A
  migração principal do Express 4 para o 5 fica bloqueada até ser avaliada
  separadamente.
- `/api/health`: informa somente disponibilidade, sem expor dados.

Os agendamentos do GitHub podem atrasar. Para alertas com intervalo curto,
configure também um monitor externo apontando para `/api/health`.

## Recuperação automática do Supabase

O monitor precisa de um token da Management API guardado como secret do
repositório. Sem ele, a verificação continua funcionando, mas uma queda do
banco não pode ser recuperada automaticamente.

1. No Supabase, abra **Account > Access Tokens** e crie um token dedicado para
   a automação. Use o menor escopo disponível que permita consultar e restaurar
   o projeto `Site-Jeovanissi`.
2. No GitHub, abra **Settings > Secrets and variables > Actions > New repository
   secret**.
3. Crie o secret com o nome exato `SUPABASE_MANAGEMENT_API_TOKEN` e cole o
   token. Nunca coloque esse valor no workflow, no código ou nos logs.
4. Abra **Actions > Monitor de producao > Run workflow** e acompanhe o resumo
   da execução.

A automação só envia `POST /v1/projects/{ref}/restore` quando a Management API
confirma o estado `INACTIVE`. Estados transitórios, como `RESTORING`, são apenas
acompanhados. Se o Supabase estiver `ACTIVE_HEALTHY` e `/api/health` falhar, o
workflow termina com erro para que problemas de Vercel, configuração ou código
não sejam mascarados por uma restauração indevida.

Se o token for revogado ou rotacionado, atualize o secret do GitHub. Revise esse
acesso periodicamente e mantenha autenticação em dois fatores nas duas contas.

## Antes de publicar

1. Crie uma branch e preserve a produção.
2. Execute:

   ```powershell
   npm.cmd ci
   npm.cmd run check
   npm.cmd run audit
   ```

3. Se houver mudança SQL, faça backup antes de aplicá-la.
4. Use sempre uma migration versionada em `supabase/migrations`.
5. Confira Security Advisor e Performance Advisor no Supabase.
6. Abra a Preview da Vercel.
7. Valide manualmente:

   - entrada como visitante;
   - login de membro e administrador;
   - consulta de membros;
   - criação e alteração de repertório;
   - criação e alteração de escala;
   - atualização em outra aba sem perda de dados;
   - logout e bloqueio das ações administrativas.

8. Publique e acompanhe os Runtime Logs da Vercel.

## Toda semana

1. Confira se os workflows do GitHub estão verdes.
2. Na Vercel, filtre os Runtime Logs por `warning`, `error` e códigos `5xx`.
3. No Supabase, confira uso, logs, conexões e espaço em disco.
4. Execute novamente os Advisors após qualquer mudança de banco.
5. Confirme que existe um backup recente.

## Todo mês

1. Revise os pull requests do Dependabot.
2. Execute `npm.cmd run audit`.
3. Revise usuários administradores e desative acessos que não são necessários.
4. Confira as variáveis da Vercel sem copiar os valores para arquivos:

   - `SESSION_SECRET`;
   - `SUPABASE_URL`;
   - `SUPABASE_SECRET_KEY`.

5. Verifique o changelog do Supabase e as versões suportadas pela Vercel.

## Backup do Supabase

- Planos Pro, Team e Enterprise possuem backups diários no Dashboard.
- No plano gratuito, faça exportação externa regularmente.
- Antes de usar a CLI, execute `supabase db dump --help` e siga as opções da
  versão instalada.
- Guarde o backup fora do projeto e fora do próprio Supabase.
- A cada três meses, restaure uma cópia em outro projeto e confira membros,
  repertórios, escalas, usuários e auditoria.

Nunca valide um backup restaurando diretamente sobre a produção.

## Segurança

- Nunca coloque chaves reais no Git, HTML, JavaScript do navegador ou logs.
- Ative autenticação em dois fatores no GitHub, Vercel e Supabase.
- Ao trocar `SESSION_SECRET`, todas as sessões atuais devem ser consideradas
  encerradas.
- Ao trocar a chave secreta do Supabase, atualize a Vercel e faça um novo
  deployment.
- Toda tabela nova exposta pela Data API precisa de permissões explícitas, RLS
  e políticas compatíveis com o acesso esperado.

## Resposta a incidentes

### A página não abre

1. Confira o último deployment e os Build Logs da Vercel.
2. Se a falha começou após uma publicação, faça rollback para o último
   deployment estável.
3. Confirme `/api/health` depois do rollback.

### A página abre, mas login ou dados falham

1. Consulte `/api/health`.
2. Confira os Runtime Logs das rotas `/api/auth`, `/api/membros`,
   `/api/repertorio` e `/api/escalas`.
3. Confira status, logs e Advisors do Supabase.
4. Verifique se as três variáveis obrigatórias continuam configuradas.
5. Não limpe dados locais dos navegadores antes de verificar se existem
   alterações pendentes.

### Dados incorretos ou ausentes

1. Interrompa novas alterações administrativas.
2. Preserve um backup do estado atual.
3. Restaure o backup anterior em outro projeto.
4. Compare os documentos e o log de auditoria.
5. Recupere somente os registros necessários.

Não exclua o projeto Supabase como tentativa de correção.
