# Lucre Certo Hub - Sistema Fullstack

Este documento detalha a migração do seu projeto frontend Vite (React) para uma arquitetura fullstack, incorporando um backend robusto em Node.js com Express. O sistema agora está dividido em duas partes principais: um **Frontend (React)** e um **Backend (Node.js/Express)**, com integração de banco de dados PostgreSQL via Supabase e autenticação JWT.

## 1. Estrutura do Projeto

O projeto foi reestruturado para acomodar a arquitetura fullstack. A nova estrutura de diretórios é a seguinte:

```
lucre-certo-fullstack/
├── backend/                  # Contém todo o código do backend Node.js
│   ├── controllers/          # Lógica de negócio das rotas
│   ├── config/               # Configurações (ex: Supabase)
│   ├── database/             # Scripts SQL para o banco de dados
│   ├── middleware/           # Middlewares (ex: autenticação, tratamento de erros)
│   ├── models/               # Modelos de dados (interação com o banco)
│   ├── routes/               # Definição das rotas da API
│   ├── services/             # Lógica de serviço e integração com APIs externas
│   ├── utils/                # Funções utilitárias
│   ├── .env.example          # Exemplo de variáveis de ambiente
│   ├── Dockerfile            # Configuração Docker para o backend
│   ├── package.json          # Dependências e scripts do backend
│   ├── render.yaml           # Configuração para deploy no Render
│   ├── railway.json          # Configuração para deploy no Railway
│   └── server.js             # Ponto de entrada do servidor Express
├── frontend/                 # Contém todo o código do frontend React (original do Vite)
│   ├── public/               # Arquivos estáticos
│   ├── src/                  # Código fonte React
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/          # Contextos React (ex: AuthContext)
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── services/         # Serviços (ex: api.js para comunicação com o backend)
│   │   └── utils/
│   ├── .env.example          # Exemplo de variáveis de ambiente
│   ├── Dockerfile            # Configuração Docker para o frontend
│   ├── package.json          # Dependências e scripts do frontend
│   ├── vercel.json           # Configuração para deploy no Vercel
│   └── vite.config.js        # Configuração do Vite
├── package.json              # Script raiz para gerenciar ambos (frontend e backend)
└── docker-compose.yml        # Configuração Docker Compose para desenvolvimento local
```

## 2. Configuração do Banco de Dados (Supabase)

O banco de dados utilizado é o PostgreSQL, gerenciado via Supabase. Siga os passos abaixo para configurar seu ambiente:

1.  **Crie um Projeto Supabase**: Acesse [Supabase](https://supabase.com/) e crie um novo projeto. Anote o `Project URL` e a `anon key` (chave pública) e `service_role key` (chave secreta) que serão fornecidas na seção `Project Settings > API`.

2.  **Configure as Tabelas**: O arquivo `backend/database/schema.sql` contém o esquema completo do banco de dados, incluindo tabelas para usuários, pesquisas de mercado, conexões com lojas, cálculos DRE e precificação, além de políticas de Row Level Security (RLS) e triggers para `updated_at`. Você pode executar este script diretamente no SQL Editor do Supabase para criar todas as tabelas necessárias.

    *   **Tabelas Criadas:**
        *   `users`: Gerencia informações de usuários, senhas (hash), planos e status.
        *   `market_research`: Armazena dados de pesquisas de mercado realizadas.
        *   `store_connections`: Detalhes das conexões com marketplaces (Shopee, Mercado Livre, etc.).
        *   `synced_products`: Produtos sincronizados das lojas conectadas.
        *   `dre_calculations`: Registros de cálculos de DRE.
        *   `pricing_calculations`: Registros de cálculos de precificação.
        *   `activity_logs`: Logs de atividades dos usuários.

3.  **Variáveis de Ambiente**: As chaves do Supabase (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) devem ser configuradas no arquivo `.env` do backend e `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` no `.env` do frontend (se ainda for usar o cliente Supabase no frontend).

## 3. Configuração do Backend (Node.js/Express)

### 3.1. Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend/` com base no `backend/.env.example`:

```dotenv
# Configurações do Servidor
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=7d

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_chave_anonima_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui

# APIs Externas (para futuras integrações)
SHOPEE_API_KEY=sua_chave_shopee
MERCADOLIVRE_API_KEY=sua_chave_mercadolivre
SHEIN_API_KEY=sua_chave_shein

# Configurações de Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app
```

Certifique-se de substituir os valores `seu_jwt_secret_super_seguro_aqui`, `https://seu-projeto.supabase.co`, `sua_chave_anonima_aqui` e `sua_chave_service_role_aqui` pelos seus próprios valores. O `JWT_SECRET` deve ser uma string longa e aleatória para segurança.

### 3.2. Como Rodar Localmente

1.  **Instalar Dependências**: Navegue até a pasta raiz do projeto (`lucre-certo-fullstack/`) e instale as dependências de ambos os projetos:
    ```bash
    npm install
    cd backend && npm install
    cd ../frontend && npm install
    ```
    Ou, usando o script `install:all` que foi adicionado ao `package.json` da raiz:
    ```bash
    npm run install:all
    ```

2.  **Iniciar o Backend**: Na pasta `backend/`:
    ```bash
    npm run dev
    ```
    Isso iniciará o servidor Node.js com `nodemon` para recarregamento automático.

3.  **Iniciar o Frontend**: Na pasta `frontend/`:
    ```bash
    npm run dev
    ```
    Isso iniciará o servidor de desenvolvimento Vite para o React.

4.  **Rodar Ambos Simultaneamente (Recomendado)**: Na pasta raiz do projeto (`lucre-certo-fullstack/`):
    ```bash
    npm run dev
    ```
    Este comando usará `concurrently` para iniciar o backend e o frontend ao mesmo tempo.

### 3.3. Como Fazer Build para Produção

1.  **Build do Backend**: Na pasta `backend/`:
    ```bash
    npm run build
    ```
    (Para Node.js, `npm run build` geralmente não é necessário, pois o código JavaScript é executado diretamente. Este script é um placeholder e pode ser removido se não houver etapas de transpilação ou otimização específicas para o backend).

2.  **Build do Frontend**: Na pasta `frontend/`:
    ```bash
    npm run build
    ```
    Isso criará uma versão otimizada do seu aplicativo React na pasta `frontend/dist/`.

3.  **Build de Ambos (Recomendado)**: Na pasta raiz do projeto (`lucre-certo-fullstack/`):
    ```bash
    npm run build
    ```

## 4. Como Conectar o Frontend (React) ao Backend (Node.js)

O frontend React foi atualizado para consumir as APIs do backend Node.js. As principais mudanças e pontos de conexão são:

1.  **`frontend/src/services/api.js`**: Este arquivo é um serviço centralizado para todas as chamadas à API do backend. Ele gerencia a URL base da API, o token de autenticação (JWT) e a estrutura das requisições.

    *   A URL base da API é definida pela variável de ambiente `VITE_API_URL`. Em desenvolvimento local, ela aponta para `http://localhost:3001` (porta padrão do backend).

2.  **`frontend/src/context/AuthContext.jsx`**: O contexto de autenticação foi modificado para usar o `apiService` para `signIn`, `signUp`, `signOut`, `getProfile`, `updateProfile`, `updatePlan` e `refreshToken`. A autenticação agora é baseada em JWT emitido pelo backend, e não mais diretamente pelo Supabase (embora o Supabase ainda seja o banco de dados subjacente para armazenar os usuários).

3.  **`frontend/src/pages/MarketResearch.jsx` e `frontend/src/pages/Connections.jsx`**: Estas páginas foram atualizadas para interagir com as novas APIs do backend para criar, listar, visualizar e gerenciar pesquisas de mercado e conexões com lojas, respectivamente.

### Variável de Ambiente para o Frontend

Crie um arquivo `.env` na pasta `frontend/` com base no `frontend/.env.example`:

```dotenv
# URL da API do Backend
VITE_API_URL=http://localhost:3001

# Configurações do Supabase (se ainda for usar para alguma funcionalidade)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui

# Ambiente
VITE_NODE_ENV=development
```

Durante o desenvolvimento local, `VITE_API_URL` deve apontar para o endereço do seu backend (geralmente `http://localhost:3001`). Para deploy, esta variável será configurada na plataforma de hospedagem (Vercel).

## 5. APIs Iniciais Expostas pelo Backend

O backend Node.js expõe as seguintes APIs, protegidas por autenticação JWT (exceto rotas de autenticação):

*   **`/api/auth`**: Rotas para registro, login, logout, renovação de token e perfil do usuário.
    *   `POST /api/auth/register`
    *   `POST /api/auth/login`
    *   `POST /api/auth/refresh` (protegida)
    *   `POST /api/auth/logout` (protegida)
    *   `GET /api/auth/profile` (protegida)

*   **`/api/pesquisa-mercado`**: Gerenciamento de pesquisas de mercado.
    *   `POST /api/pesquisa-mercado` (protegida)
    *   `GET /api/pesquisa-mercado` (protegida)
    *   `GET /api/pesquisa-mercado/trends` (protegida)
    *   `GET /api/pesquisa-mercado/:id` (protegida)
    *   `PUT /api/pesquisa-mercado/:id` (protegida)
    *   `DELETE /api/pesquisa-mercado/:id` (protegida)

*   **`/api/conexao-lojas`**: Gerenciamento de conexões com marketplaces.
    *   `POST /api/conexao-lojas` (protegida, requer plano Premium)
    *   `GET /api/conexao-lojas` (protegida)
    *   `GET /api/conexao-lojas/products` (protegida)
    *   `GET /api/conexao-lojas/:id` (protegida)
    *   `PUT /api/conexao-lojas/:id` (protegida)
    *   `DELETE /api/conexao-lojas/:id` (protegida)
    *   `POST /api/conexao-lojas/:id/sync` (protegida, requer plano Premium)

*   **`/api/calculadoras`**: APIs para DRE e precificação.
    *   `POST /api/calculadoras/dre` (protegida)
    *   `GET /api/calculadoras/dre` (protegida)
    *   `GET /api/calculadoras/dre/:id` (protegida)
    *   `POST /api/calculadoras/dre/quick` (protegida, cálculo rápido sem salvar)
    *   `POST /api/calculadoras/pricing` (protegida)
    *   `GET /api/calculadoras/pricing` (protegida)
    *   `GET /api/calculadoras/pricing/:id` (protegida)
    *   `POST /api/calculadoras/pricing/quick` (protegida, cálculo rápido sem salvar)

*   **`/api/users`**: Gerenciamento de perfil e planos do usuário.
    *   `PUT /api/users/profile` (protegida)
    *   `PUT /api/users/plan` (protegida)
    *   `GET /api/users/stats` (protegida)
    *   `GET /api/users/plans` (protegida)

## 6. Hospedagem e Deploy

### 6.1. Frontend (React) → Vercel

1.  **Crie um Repositório Git**: Certifique-se de que seu projeto `lucre-certo-fullstack/frontend` esteja em um repositório Git (GitHub, GitLab, Bitbucket).

2.  **Conecte ao Vercel**: Acesse [Vercel](https://vercel.com/) e importe seu repositório Git. O Vercel detectará automaticamente que é um projeto Vite/React.

3.  **Configuração de Build**: O arquivo `frontend/vercel.json` já está configurado para o Vercel. Ele instrui o Vercel a usar `npm run build` e servir os arquivos da pasta `dist/`.

4.  **Variáveis de Ambiente**: No Vercel, vá para `Project Settings > Environment Variables` e adicione a variável `VITE_API_URL`. O valor desta variável deve ser a URL do seu backend implantado (ex: `https://seu-backend.render.com`).

### 6.2. Backend (Node.js) → Render ou Railway

#### Opção 1: Render

1.  **Crie um Repositório Git**: Seu projeto `lucre-certo-fullstack/backend` deve estar em um repositório Git.

2.  **Conecte ao Render**: Acesse [Render](https://render.com/) e crie um novo `Web Service`. Conecte-o ao seu repositório Git.

3.  **Configuração de Build**: O Render detectará o `Dockerfile` ou o `package.json`. O arquivo `backend/render.yaml` fornece uma configuração explícita para o Render, incluindo comandos de build e start.

4.  **Variáveis de Ambiente**: No Render, vá para `Environment` e adicione as variáveis de ambiente do seu arquivo `backend/.env`, especialmente:
    *   `NODE_ENV=production`
    *   `PORT=3001` (ou a porta que o Render atribuir)
    *   `JWT_SECRET` (gere uma nova chave segura)
    *   `SUPABASE_URL`
    *   `SUPABASE_ANON_KEY`
    *   `SUPABASE_SERVICE_ROLE_KEY`
    *   `FRONTEND_URL` (a URL do seu frontend implantado no Vercel, ex: `https://seu-frontend.vercel.app`)

#### Opção 2: Railway

1.  **Crie um Repositório Git**: Seu projeto `lucre-certo-fullstack/backend` deve estar em um repositório Git.

2.  **Conecte ao Railway**: Acesse [Railway](https://railway.app/) e crie um novo projeto. Conecte-o ao seu repositório Git.

3.  **Configuração de Build**: O Railway detectará o `package.json` e o `backend/railway.json` que fornece configurações de deploy.

4.  **Variáveis de Ambiente**: No Railway, adicione as variáveis de ambiente do seu arquivo `backend/.env`, similarmente ao Render.

## 7. Próximos Passos e Considerações

*   **Integração ERP**: A estrutura do backend foi projetada para ser modular, facilitando a adição de módulos de estoque, financeiro e fiscal para integração com ERPs no futuro.
*   **Testes**: Implemente testes unitários e de integração para garantir a robustez das APIs e do frontend.
*   **Segurança**: Revise as políticas de segurança (RLS no Supabase, validações no backend) e considere adicionar mais camadas de proteção, como autenticação de dois fatores.
*   **Monitoramento**: Configure ferramentas de monitoramento para o backend e frontend para acompanhar a performance e identificar problemas rapidamente.

Com esta migração, seu sistema está agora em uma base fullstack moderna e escalável, pronto para futuras expansões e integrações.
