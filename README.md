# Site Jeova Nissi

Esse site foi criado com o intuito de ajudar e divulgar o ministerio de louvor JEOVA NISSI.

https://jeova-nissi.vercel.app/index.html

## Preparar uma nova maquina

Requisitos:

- Git;
- Node.js 24;
- acesso ao repositorio no GitHub;
- acesso ao projeto na Vercel para obter as variaveis de ambiente.

No PowerShell:

```powershell
git clone https://github.com/Enzosousa26/Site-Jeovanissi.git
cd Site-Jeovanissi
npm.cmd ci
npm.cmd run setup:local
npm.cmd start
```

O comando `setup:local` cria `.env.local`, gera um `SESSION_SECRET` seguro e
habilita temporariamente o banco local. O arquivo não e enviado ao Git.

Para trabalhar com os dados reais do Supabase, conecte o projeto a Vercel e
baixe as variaveis do ambiente de desenvolvimento:

```powershell
npx vercel login
npx vercel link
npx vercel env pull .env.local --environment=development
npm.cmd start
```

Confira se `.env.local` possui `SESSION_SECRET`, `SUPABASE_URL` e
`SUPABASE_SECRET_KEY`. Nunca envie esses valores em commits ou mensagens.

Depois de iniciar, acesse:

- `http://localhost:3000`;
- `http://localhost:3000/api/health`.

O procedimento completo esta em `TRANSFERENCIA-MAQUINA.md`.
