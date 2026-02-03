# Configuração de Autenticação Google OAuth no Supabase

## 📋 Pré-requisitos
- Projeto Supabase criado
- Projeto no Google Cloud Console

## 🔧 Passo 1: Google Cloud Console

1. **Acesse:** https://console.cloud.google.com/
2. **Crie um novo projeto** ou selecione um existente
3. **Navegue para:** APIs & Services → Credentials
4. **Clique em:** Create Credentials → OAuth 2.0 Client ID
5. **Configure o OAuth consent screen:**
   - User Type: External
   - App name: CIAS Irrigação
   - User support email: seu@email.com
   - Developer contact: seu@email.com

6. **Crie as credenciais OAuth 2.0:**
   - Application type: Web application
   - Name: CIAS Supabase Auth
   
7. **Authorized JavaScript origins:**
   ```
   https://seu-projeto.supabase.co
   ```

8. **Authorized redirect URIs:**
   ```
   https://seu-projeto.supabase.co/auth/v1/callback
   ```

9. **Salve as credenciais:**
   - Client ID 61219170218-2enjjo0dr0fsambe4q4lggd90l8k6pnd.apps.googleusercontent.com
   - Client Secret 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

## 🔧 Passo 2: Configuração no Supabase

1. **Acesse seu projeto Supabase:** https://app.supabase.com/
2. **Navegue para:** Authentication → Providers
3. **Encontre "Google" e clique em "Enable"**
4. **Configure:**
   - Client ID: (cole o Client ID do Google)
   - Client Secret: (cole o Client Secret do Google)
5. **Clique em "Save"**

## 🔧 Passo 3: Configuração no Vercel

1. **Acesse:** Vercel Dashboard → Seu Projeto
2. **Navegue para:** Settings → Environment Variables
3. **Adicione as variáveis:**

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

**Onde encontrar essas variáveis:**
- Supabase Dashboard → Settings → API
- Project URL = `VITE_SUPABASE_URL`
- Anon/Public Key = `VITE_SUPABASE_ANON_KEY`

4. **Redeploy a aplicação** para aplicar as variáveis

## 🎯 Teste da Autenticação

### Teste Local (Desenvolvimento)

1. Crie um arquivo `.env` na raiz do projeto:
```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

2. Execute:
```bash
npm run dev
```

3. Acesse: http://localhost:5173/login
4. Clique em "Continuar com Google"

### Teste em Produção

1. Acesse: https://seu-app.vercel.app/login
2. Clique em "Continuar com Google"
3. Autorize o aplicativo
4. Você será redirecionado para a página inicial

## 🔒 Configurações de Segurança (Recomendado)

### No Supabase

1. **Email Templates:** Customize os emails de confirmação
   - Authentication → Email Templates

2. **URL Configuration:**
   - Settings → Auth Settings
   - Site URL: `https://seu-app.vercel.app`
   - Redirect URLs: Adicione `https://seu-app.vercel.app/**`

3. **Políticas RLS (Row Level Security):**
   - Certifique-se de que suas tabelas têm políticas adequadas
   - Exemplo para tabela `users`:

```sql
-- Política para permitir leitura
CREATE POLICY "Users can view their own data"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- Política para permitir atualização
CREATE POLICY "Users can update their own data"
ON public.users
FOR UPDATE
USING (auth.uid() = id);
```

### No Google Cloud Console

1. **OAuth consent screen:**
   - Status: In production (após revisar)
   - Adicione escopos necessários:
     - email
     - profile
     - openid

2. **Domínios autorizados:**
   - Adicione: `seu-app.vercel.app`
   - Adicione: `seu-projeto.supabase.co`

## 🐛 Troubleshooting

### Erro: "redirect_uri_mismatch"
- Verifique se a URL de callback no Google Cloud Console está correta
- Formato: `https://seu-projeto.supabase.co/auth/v1/callback`

### Erro: "Invalid credentials"
- Verifique se o Client ID e Client Secret estão corretos no Supabase
- Re-crie as credenciais se necessário

### Usuário não é redirecionado após login
- Verifique se o Site URL está configurado corretamente no Supabase
- Verifique o `redirectTo` no código de autenticação

### Página em branco após deploy
- Verifique se as variáveis de ambiente estão configuradas no Vercel
- Verifique os logs do browser (F12 → Console)

## ✅ Verificação Final

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Provider Google habilitado no Supabase
- [ ] Credenciais configuradas no Google Cloud Console
- [ ] URLs de callback configuradas corretamente
- [ ] Site URL configurado no Supabase
- [ ] Teste de login funcionando

## 📚 Recursos Adicionais

- [Documentação Supabase Auth](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Supabase + Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google)
