# 🌸 Agenda Interativa & Carinhosa com Alertas no Telegram 💕
> Uma aplicação moderna, elegante e acolhedora, feita especialmente para organizar **estudos, trabalhos e rotina pessoal**, com **notificações automáticas e ilimitadas no Telegram**, contagem regressiva para provas, pomodoro de foco, rastreador de hidratação e mural de bilhetinhos de amor. Hospedagem 100% pronta para **Cloudflare Pages**.

---

## ✨ Destaques & Recursos Criados para Ela

1. **🔔 Sistema Inteligente de Alertas no Telegram (100% Grátis & Ilimitado)**:
   - Notificações enviadas pelo **Bot Oficial do Telegram** diretamente para o chat dela (ou para um grupo do casal!) com mensagens formatadas com carinho em HTML, contendo título, categoria, data, horário, links clicáveis (Google Meet, Zoom, etc.) e um recado motivacional de você!
   - **Sem limitações ou bloqueios**: ao contrário de bots de WhatsApp não oficiais que expiram ou limitam mensagens, o **Telegram Bot API é oficial, 100% gratuito e vitalício**.
   - Botão **"Alertar no Telegram"** individual em cada compromisso e botão **"Enviar Roteiro Telegram"** completo com 1 clique.
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
   - Você ou ela podem disparar o bilhete direto para o Telegram com 1 clique!

6. **🎨 5 Temas Visuais Encantadores**:
   - 🌸 **Sakura & Rosa Chic**
   - 💜 **Lavanda & Serenidade**
   - ☕ **Cappuccino & Vanilla**
   - 🌿 **Menta & Eucalipto**
   - 🌙 **Noite Aveludada (Modo Escuro)**

7. **📱 PWA Instalável no Celular**:
   - Pode ser adicionada à tela inicial do iPhone e Android funcionando como um aplicativo nativo.

---

## 📲 Como Configurar o Telegram Bot (Passo a Passo Rápido)

Leva apenas **1 minuto** e não requer conhecimentos técnicos:

### Passo 1: Criar o seu Bot no Telegram
1. No Telegram, abra a conversa com o bot oficial [@BotFather](https://t.me/BotFather).
2. Envie a mensagem: `/newbot`
3. Ele pedirá um nome para o bot (ex: *Agenda do Meu Amor*).
4. Em seguida, pedirá um username que termine com `bot` (ex: *AgendaDaMinhaEsposa_bot*).
5. O BotFather enviará o **HTTP API Token** (algo como `7123456789:AAHqKlxabcdef12345...`). Copie esse token!

### Passo 2: Pegar o Chat ID
1. Abra uma conversa com o bot que você acabou de criar e clique no botão **Iniciar / Start** (ou envie um "Oi").
2. Abra a conversa com o bot [@userinfobot](https://t.me/userinfobot) ou [@getmyid_bot](https://t.me/getmyid_bot). Ele responderá na mesma hora com o seu número de **Id** (ex: `987654321`).
3. *(Dica do Casal)*: Se quiserem receber juntos, você pode criar um grupo no Telegram com você e sua esposa, adicionar o bot no grupo e usar o Chat ID do grupo!

### Passo 3: Colocar no App
1. Na sua Agenda, clique no botão **Telegram** no menu superior.
2. Cole o **Bot Token** e o **Chat ID**.
3. Clique em **"Testar Alerta no Telegram Dela Agora"** e pronto!

---

## 🚀 Como Publicar no Cloudflare Pages

O projeto já está 100% estruturado com:
- `dist/` (build estático ultra rápido)
- `_redirects` e `_headers` (para roteamento SPA e segurança)
- `functions/api/send-telegram.ts` (API serverless Edge nativa do Cloudflare Pages)

### Método 1: Conectar pelo GitHub (Recomendado)
1. Suba o código para o seu repositório:
   ```bash
   git add .
   git commit -m "feat: Migração para Telegram Bot ilimitado e gratuito"
   git push origin main
   ```
2. Acesse o painel da [Cloudflare Dashboard](https://dash.cloudflare.com).
3. Vá em **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
4. Escolha seu repositório do GitHub e configure:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Clique em **Save and Deploy**. Em menos de 1 minuto, seu link estará online: `https://agenda-esposa.pages.dev` (com HTTPS gratuito e certificado SSL automático).

### Método 2: Deploy Direto via Terminal (Wrangler CLI)
```bash
npm run build
npx wrangler pages deploy dist --project-name agenda-esposa
```
