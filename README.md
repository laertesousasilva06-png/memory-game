# Memory Game

Jogo da memória responsivo com cadastro, login, perfil e ranking, construído com HTML, CSS, JavaScript e Cloudflare Pages Functions + D1.

## Desenvolvimento local

O site estático pode ser aberto diretamente, mas os recursos de conta e ranking precisam das Pages Functions e de um banco D1 configurado.

1. Instale Node.js e Wrangler: `npm install -g wrangler`.
2. Clone o repositório e entre na pasta.
3. Crie um banco D1: `npx wrangler d1 create memory-game-db`.
4. Crie `wrangler.toml` na raiz com o ID retornado pelo comando:

```toml
name = "memory-game"
compatibility_date = "2026-11-10"
pages_build_output_dir = "."

[[d1_databases]]
binding = "DB"
database_name = "memory-game-db"
database_id = "COLE_AQUI_O_DATABASE_ID"
```

5. Execute o esquema no banco remoto: `npx wrangler d1 execute memory-game-db --remote --file=./schema.sql`.
6. Rode localmente: `npx wrangler pages dev .`.

Para desenvolvimento local com banco local, remova `--remote` do comando de execução do schema e use `npx wrangler pages dev .`.

## Configuração no Cloudflare Pages

1. Crie um banco em **Workers & Pages → D1 SQL Database → Create database**, com o nome `memory-game-db`.
2. Abra o banco, entre em **Console**, cole o conteúdo de `schema.sql` e execute.
3. No projeto Pages, abra **Settings → Functions → D1 database bindings → Add binding**.
4. Defina o **Variable name** exatamente como `DB` e selecione o banco `memory-game-db`.
5. Em **Settings → Builds & deployments**, use:
   - Production branch: `main`
   - Framework preset: `None`
   - Build command: vazio
   - Build output directory: `.`
6. Salve e faça um novo deploy. As funções da pasta `functions/api` serão publicadas como rotas `/api/*`.

## Funcionalidades

- Cadastro com usuário, e-mail e senha.
- Senhas protegidas com PBKDF2 e salt individual.
- Sessão persistente em cookie HttpOnly, Secure e SameSite=Lax.
- Login e logout.
- Registro de partidas concluídas para usuários autenticados.
- Ranking por dificuldade, ordenado por menor número de jogadas e depois menor tempo.
- Perfil com posição do usuário em cada dificuldade.

## Rotas da API

- `POST /api/register`
- `POST /api/login`
- `POST /api/logout`
- `GET /api/me`
- `GET /api/leaderboard?difficulty=easy|medium|hard`
- `POST /api/score`

**Nota:** o navegador envia o resultado da partida para a API. Para um ranking competitivo de alto rigor, será necessário validar a partida no servidor em vez de confiar apenas nos dados enviados pelo navegador.
