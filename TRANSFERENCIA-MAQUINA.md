# Transferencia para uma nova maquina

Este arquivo e o ponto de continuidade para configurar o Site Jeova Nissi em
outro computador.

## Antes de sair da maquina atual

As alteracoes precisam estar no GitHub. Confira e publique:

```powershell
git status
git add -A
git status
git commit -m "Manutencao e preparacao para nova maquina"
git push origin main
```

O `.env.local` nunca deve aparecer no `git status`.

## Na maquina pessoal

Instale Git e Node.js 24. Depois execute:

```powershell
cd C:\Users\SEU_USUARIO\Documents
git clone https://github.com/Enzosousa26/Site-Jeovanissi.git
cd Site-Jeovanissi
npm.cmd ci
npm.cmd run setup:local
npm.cmd run check
npm.cmd start
```

O site estara disponivel em `http://localhost:3000`. Verifique tambem
`http://localhost:3000/api/health`.

## Conectar ao Supabase pela Vercel

O banco permanece hospedado no Supabase; ele nao precisa ser copiado. Para
baixar as variaveis cadastradas na Vercel:

```powershell
npx vercel login
npx vercel link
npx vercel env pull .env.local --environment=development
```

O comando `vercel env pull` substitui todo o `.env.local`. Depois confirme,
sem exibir os valores na conversa, que existem:

- `SESSION_SECRET`;
- `SUPABASE_URL`;
- `SUPABASE_SECRET_KEY`.

Se essas variaveis nao estiverem configuradas no ambiente Development da
Vercel, configure-as no painel antes de baixar. Nao use
`LOCAL_DB_FALLBACK=true` quando quiser acessar os dados reais do Supabase.

Inicie novamente:

```powershell
npm.cmd start
```

O script `start` carrega `.env.local` automaticamente.

## Mensagem para continuar com o Codex

Abra este mesmo chat com o repositorio clonado e informe:

> Estou na minha maquina pessoal, clonei o Site-Jeovanissi e quero continuar a
> configuracao descrita em TRANSFERENCIA-MAQUINA.md. Verifique Git, Node,
> dependencias e variaveis sem mostrar nenhum segredo.

O Codex deve verificar somente os nomes e a presenca das variaveis, nunca
mostrar os valores de `SESSION_SECRET` ou `SUPABASE_SECRET_KEY`.

## Verificacao final

```powershell
git status
npm.cmd run check
npm.cmd run audit
```

Depois da configuracao, `git status` deve continuar limpo. Arquivos
`.env.local`, `.env` e `.vercel/` sao configuracoes locais e nao devem entrar
em commits.
