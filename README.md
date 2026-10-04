# Loja Valora Pods NS — Vercel (Node)

## Estrutura
Arquivos estáticos na raiz (index.html, admin.html, css/js) + `api/index.js` (backend serverless) + `package.json`.

## Deploy
1. **Apague do repositório os arquivos antigos do PHP** (pastas `api/`, `app/`, `data/`, `uploads/`, `install.php`, `.htaccess`, `.env.example`) e suba o conteúdo desta pasta na **raiz** do repositório. O `package.json` precisa ficar na raiz.
2. Na Vercel: *Add New → Project* e escolha o repositório. Framework: **Other**. Não precisa de Build Command.
3. No projeto, aba **Storage**: crie um **Upstash Redis** (Marketplace) e conecte ao projeto. Isso adiciona `KV_REST_API_URL` e `KV_REST_API_TOKEN` sozinho.
4. Ainda em **Storage**: crie um **Blob** (acesso público) e conecte. Isso adiciona `BLOB_READ_WRITE_TOKEN` (fotos dos produtos).
5. Em **Settings → Environment Variables** adicione:
   - `SESSION_SECRET`: texto longo e aleatório
   - `WEBHOOK_SECRET`: outro texto longo
   - `ABACATEPAY_KEY` e `SITE_URL` (opcional, só para pagamento online)
6. Faça **Redeploy** (as variáveis só valem em um novo deploy).
7. Abra `/admin.html`, entre com **pods123** e troque a senha em Configurações.

Webhook da AbacatePay: `https://SEUSITE/api?r=webhook&secret=SEU_WEBHOOK_SECRET`
Confira o formato da API e dos eventos na documentação da AbacatePay e teste antes de vender.

## Backup
Use *Exportar backup* no painel (Configurações) com frequência.
