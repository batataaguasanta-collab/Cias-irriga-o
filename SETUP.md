# 🚀 Guia de Configuração - Sistema CIAS

Este guia te ajudará a configurar e executar o Sistema de Gestão de Irrigação por Pivô Central com Supabase.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita)
- Git (opcional)

---

## 1️⃣ Configurar o Banco de Dados Supabase

### Passo 1: Criar Projeto no Supabase

1. Acesse https://supabase.com e faça login
2. Clique em **"New Project"**
3. Preencha:
   - **Name**: CIAS Irrigação
   - **Database Password**: Crie uma senha forte (anote!)
   - **Region**: South America (São Paulo)
4. Clique em **"Create new project"**
5. Aguarde ~2 minutos para o projeto ser criado

### Passo 2: Executar o Schema SQL

1. No painel do Supabase, vá em **SQL Editor** (menu lateral)
2. Clique em **"+ New query"**
3. Abra o arquivo `supabase-schema.sql` deste projeto
4. Copie TODO o conteúdo do arquivo
5. Cole no editor SQL do Supabase
6. Clique em **"Run"** (ou pressione Ctrl/Cmd + Enter)
7. Verifique a mensagem de sucesso ✅

### Passo 3: Obter Credenciais

1. Vá em **Project Settings** (ícone de engrenagem no menu lateral)
2. Clique em **API**
3. Copie:
   - **Project URL** (algo como: `https://xxxxx.supabase.co`)
   - **anon public** key  (chave longa começando com `eyJ...`)

---

## 2️⃣ Configurar o Aplicativo

### Passo 1: Configurar Variáveis de Ambiente

1. Abra o arquivo `.env` na raiz do projeto
2. Substitua os valores pelas suas credenciais:

```env
VITE_SUPABASE_URL=https://dhpmsgvisuyaguuhphja.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_4Ty_9KRtZov4_rwv2s0xkw_YzDrKIR4
```

### Passo 2: Instalar Dependências

Abra o terminal na pasta raiz do projeto e execute:

```bash
npm install
```

Aguarde a instalação de todas as dependências (~2-5 minutos).

---

## 3️⃣ Executar o Aplicativo

### Modo Desenvolvimento

```bash
npm run dev
```

O aplicativo estará disponível em: **http://localhost:5173**

### Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão na pasta `dist/`.

---

## 4️⃣ Configurar Autenticação

### Habilitar Provedores de Login

1. No Supabase, vá em **Authentication** → **Providers**
2. Configure os provedores desejados:

#### Email/Password (Recomendado)
- Já está habilitado por padrão
- Configure **Email Confirmação** se necessário

#### Google OAuth (Opcional)
1. Ative o provedor **Google**
2. Siga as instruções para criar credenciais OAuth no Google Cloud Console
3. Adicione as credenciais no Supabase

### Criar Primeiro Usuário

**Opção 1: Via Interface do Supabase**
1. Vá em **Authentication** → **Users**
2. Clique em **"Add user"** → **"Create new user"**
3. Preencha email e senha
4. Clique em **"Create user"**

**Opção 2: Via Aplicativo** (se configurado signup)
1. Acesse a página de registro do app
2. Crie uma conta normalmente

---

## 5️⃣ Testar o Sistema

### Checklist de Testes

- [ ] Acessar http://localhost:5173
- [ ] Fazer login com usuário criado
- [ ] Ver dashboard inicial
- [ ] Ir em **Cadastros** e criar:
  - [ ] 1 Operador
  - [ ] 1 Pivô
- [ ] Criar uma **Nova Ordem de Serviço**
- [ ] Ver ordem criada na Home
- [ ] Filtrar por status
- [ ] Buscar por nome

---

## 🔧 Comandos Úteis

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Visualizar build de produção
npm run preview

# Verificar erros de lint
npm run lint

# Corrigir erros de lint automaticamente
npm run lint:fix
```

---

## 📁 Estrutura do Projeto

```
Aplicativo/
├── src/
│   ├── pages/          # Páginas do aplicativo
│   │   ├── Home.jsx
│   │   ├── Cadastros.jsx
│   │   ├── NovaOrdem.jsx
│   │   └── ...
│   ├── components/     # Componentes reutilizáveis
│   │   ├── ui/         # Componentes shadcn
│   │   └── os/         # Componentes de ordem de serviço
│   ├── lib/            # Utilitários e configurações
│   │   ├── supabaseClient.js
│   │   ├── supabase.js
│   │   └── AuthContext.jsx
│   ├── api/            # APIs e integrações
│   ├── App.jsx         # Componente raiz
│   └── main.jsx        # Entry point
├── .env                # Variáveis de ambiente (NÃO COMMITAR!)
├── .env.example        # Template de variáveis
├── supabase-schema.sql # Schema do banco de dados
└── package.json        # Dependências
```

---

## 🐛 Solução de Problemas

### Erro: "Missing Supabase environment variables"

**Causa**: Arquivo `.env` não configurado ou variáveis vazias

**Solução**:
1. Certifique-se que o arquivo `.env` existe na raiz
2. Verifique se as variáveis estão preenchidas corretamente
3. Reinicie o servidor de desenvolvimento (`npm run dev`)

---

### Erro: "relation does not exist" ao executar queries

**Causa**: Schema SQL não foi executado no Supabase

**Solução**:
1. Acesse SQL Editor no Supabase
2. Execute todo o conteúdo de `supabase-schema.sql`
3. Verifique se há erros na execução

---

### Erro 403 ao fazer requisições

**Causa**: Políticas RLS bloqueando acesso

**Solução**:
1. Verifique se você está autenticado
2. Confirme que as políticas RLS foram criadas corretamente
3. No Supabase, vá em **Table Editor** → selecione uma tabela → **RLS**
4. Certifique-se que as políticas estão ativas

---

### Página em branco após login

**Causa**: Dados não estão sendo carregados

**Solução**:
1. Abra o Console do navegador (F12)
2. Vá na aba **Console** e verifique erros
3. Vá na aba **Network** e veja se as requisições estão falhando
4. Verifique se há dados nas tabelas no Supabase

---

## 🔐 Segurança

### Variáveis de Ambiente

- **NUNCA** commite o arquivo `.env` no Git
- O arquivo `.gitignore` já está configurado para ignorá-lo
- Use `.env.example` como template para outros desenvolvedores

### Chaves Supabase

- **ANON_KEY**: Segura para uso no cliente (já está limitada por RLS)
- **SERVICE_ROLE_KEY**: NÃO use no cliente! Apenas no backend server-side

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique este guia de solução de problemas
2. Consulte a documentação do Supabase: https://supabase.com/docs
3. Verifique o console do navegador para erros JavaScript
4. Confira logs no painel do Supabase em **Logs**

---

## 6️⃣ Deploy no Vercel

### Passo 1: Preparação
1. Crie um repositório no GitHub.
2. Faça o push do código:
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git
   git branch -M main
   git push -u origin main
   ```

### Passo 2: Importar no Vercel
1. Acesse https://vercel.com/new
2. Importe o repositório do GitHub.
3. Configure as **Environment Variables** com os valores do seu `.env`.
4. Clique em **Deploy**.

---

## ✨ Próximos Passos

Após configurar o sistema com sucesso:

1. Customize as páginas e componentes conforme sua necessidade
2. Adicione mais funcionalidades
3. Configure backup automático do banco
4. Implemente notificações em tempo real
5. Adicione mais provedores de autenticação

---

**Bom uso do Sistema CIAS! 🌱💧**
