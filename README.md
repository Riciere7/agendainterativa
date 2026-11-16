# 🌸 Agenda Interativa & Carinhosa com Alertas no WhatsApp (Evolution API) 💕
> Uma aplicação moderna, elegante e acolhedora, feita especialmente para organizar **estudos, trabalhos e rotina pessoal**, com **notificações automáticas no WhatsApp via Evolution API** (e suporte a Telegram), contagem regressiva para provas, pomodoro de foco, rastreador de hidratação e mural de bilhetinhos de amor. Hospedagem 100% pronta para **Cloudflare Pages**.

---

## ✨ Destaques & Recursos Criados para Ela

1. **🔔 Sistema Inteligente de Alertas no WhatsApp via Evolution API**:
   - Notificações automáticas disparadas diretamente para o **WhatsApp da sua esposa** através da sua própria instância da **Evolution API** (v1 ou v2).
   - Mensagens formatadas com carinho em Markdown do WhatsApp (`*negrito*`, `_itálico_`, emojis), contendo título do compromisso, categoria, data, horário, links clicáveis (Google Meet, Zoom, etc.) e um recado motivacional de você!
   - Botão **"Alertar no WhatsApp"** em cada compromisso para disparo individual com 1 clique.
   - Botão **"Enviar Roteiro WhatsApp"** com a programação completa do dia.
   - Verificação em tempo real da conexão da instância diretamente no app.
   - Também suporta **Telegram Bot** como canal alternativo ou redundante (*Ambos*).
   - Verificação em segundo plano no navegador com aviso sonoro suave (*chime*) e chuva de confetes 🎉 ao concluir tarefas.

2. **📅 Calendário Visual & Linha do Tempo Diária**:
   - Visão mensal intuitiva com filtros rápidos: 📚 **Estudos**, 💼 **Trabalho**, 💅 **Autocuidado & Saúde**, 💑 **Momentos a Dois**, 🎯 **Rotina**.
   - Linha do tempo do dia com horário, prioridade (Alta, Média, Baixa), links diretos e status de conclusão.

3. **📚 Espaço de Estudos & Foco (Study Hub)**:
   - **Cronômetro Pomodoro Especial**: modos de Foco (25m), Pausa Curta (5m) e Descanso Longo (15m) com sino relaxante sintetizado via Web Audio API.
   - **Quadro de Provas & Entregas**: contagem regressiva automática mostrando *"Faltam 4 dias para a Prova!"*, *"É HOJE! 🎯"*, etc.

4. **💧 Bem-Estar, Hidratação & Humor do Dia**:
   - **Rastreador de Água**: 8 copos interativos de 250ml com efeito sonoro de gota d'água e meta diária de 2 Litros.
   - **Mood Tracker**: Ela escolhe como está se sentindo (*Radiante*, *Focada*, *Tranquila*, *Cansada*, *Sobrecarregada*) e recebe um recadinho acolhedor do marido.

5. **💌 Mural de Bilhetinhos com Amor**:
   - Um quadro de post-its coloridos onde você pode deixar mensagens de incentivo, recados românticos e votos de boa sorte para as provas e entregas de trabalho.
   - Disparo do bilhetinho direto para o WhatsApp dela com 1 clique!

6. **🎨 5 Temas Visuais Encantadores**:
   - 🌸 **Sakura & Rosa Chic**
   - 💜 **Lavanda & Serenidade**
   - ☕ **Cappuccino & Vanilla**
   - 🌿 **Menta & Eucalipto**
   - 🌙 **Noite Aveludada (Modo Escuro)**

7. **📱 PWA Instalável no Celular**:
   - Pode ser adicionada à tela inicial do iPhone e Android funcionando como um aplicativo nativo.

---

## 📲 Como Configurar a Evolution API (WhatsApp)

Leva apenas **1 minuto**:

### Passo 1: Obter os dados da sua Evolution API
1. Tenha uma instância ativa na sua **Evolution API** (ex: nome `agenda` ou `esposa`).
2. Conecte o WhatsApp escaneando o QR Code na sua Evolution API.
3. Obtenha:
   - **URL da API**: Ex: `https://api.meuservidor.com` (ou `http://localhost:8080`)
   - **API Key**: A chave definida na variável `AUTHENTICATION_API_KEY` da sua Evolution API
   - **Nome da Instância**: Ex: `agenda`
   - **WhatsApp da Esposa**: Número com DDD (o DDI 55 do Brasil é inserido automaticamente se você digitar apenas DDD + número, ex: `(11) 98765-4321` ou `5511987654321`).

### Passo 2: Configurar no Aplicativo
1. Na sua Agenda, clique no botão **WhatsApp** no menu superior.
2. Certifique-se de que o canal **WhatsApp (Evolution API)** está selecionado.
3. Preencha a URL, API Key, Instância e o WhatsApp da sua esposa.
4. Clique em **"Verificar Conexão da Instância"** para confirmar que a instância está online e conectada.
5. Clique em **"Testar Envio no WhatsApp"** para disparar uma mensagem de teste para ela!
6. Clique em **Salvar Configurações**.

---

## 🚀 Como Publicar no Cloudflare Pages

O projeto já inclui:
- `dist/` (build estático ultra rápido)
- `_redirects` e `_headers` (para roteamento SPA e segurança)
- `functions/api/send-evolution.ts` (Edge serverless proxy que evita qualquer bloqueio de CORS ao comunicar com a Evolution API)
- `functions/api/send-telegram.ts` (Edge serverless proxy para Telegram)

### Método 1: Conectar pelo GitHub (Recomendado)
1. Suba o código para o seu repositório:
   ```bash
   git add .
   git commit -m "feat: Integracao com Evolution API para alertas no WhatsApp"
   git push origin main
   ```
2. Acesse o painel da [Cloudflare Dashboard](https://dash.cloudflare.com).
3. Vá em **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
4. Escolha seu repositório do GitHub e configure:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. *(Opcional)* Em **Settings** > **Environment variables**, você pode definir valores padrão:
   - `EVOLUTION_API_URL`: URL padrão da Evolution API
   - `EVOLUTION_API_KEY`: Chave de API padrão
   - `EVOLUTION_INSTANCE_NAME`: Instância padrão
   - `DEFAULT_WHATSAPP_PHONE`: Telefone padrão
6. Clique em **Save and Deploy**. Em menos de 1 minuto, seu link estará online: `https://agenda-esposa.pages.dev` (com HTTPS gratuito e certificado SSL automático).

### Método 2: Deploy Direto via Terminal (Wrangler CLI)
```bash
npm run build
npx wrangler pages deploy dist --project-name agenda-esposa
```
