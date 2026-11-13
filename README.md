# 🌸 Agenda Interativa & Carinhosa com Alertas no WhatsApp 💕
> Uma aplicação moderna, elegante e acolhedora, feita especialmente para organizar **estudos, trabalhos e rotina pessoal**, com **notificações automáticas no WhatsApp**, contagem regressiva para provas, pomodoro de foco, rastreador de hidratação e mural de bilhetinhos de amor. Hospedagem 100% pronta para **Cloudflare Pages**.

---

## ✨ Destaques & Surpresas Criadas para Ela

1. **🔔 Sistema Inteligente de Alertas no WhatsApp**:
   - Notificações enviadas diretamente para o WhatsApp dela com mensagens formatadas com carinho, contendo data, horário, local/link e um recado motivacional de você!
   - Três modos de envio:
     - **CallMeBot (100% Gratuito & Automático)**: envia em segundo plano sem custo algum.
     - **Link Direto WhatsApp (1 Clique)**: abre a mensagem pronta no WhatsApp dela.
     - **Evolution API / Z-API**: para quem tem servidor próprio.
   - Botão **"Alertar no WhatsApp"** individual em cada compromisso e botão **"Enviar Roteiro do Dia"** completo com 1 clique.
   - Verificação em segundo plano no navegador com aviso sonoro suave (*chime*) e chuva de confetes 🎉 ao concluir tarefas.

2. **📅 Calendário Visual & Linha do Tempo Diária**:
   - Visão mensal intuitiva com filtros rápidos: 📚 **Estudos**, 💼 **Trabalho**, 💅 **Autocuidado & Saúde**, 💑 **Momentos a Dois**, 🎯 **Rotina**.
   - Linha do tempo do dia com horário, prioridade (Alta, Média, Baixa), links diretos (Google Meet, Zoom, etc.) e status de conclusão.

3. **📚 Espaço de Estudos & Foco (Study Hub)**:
   - **Cronômetro Pomodoro Especial**: modos de Foco (25m), Pausa Curta (5m) e Descanso Longo (15m) com sino relaxante sintetizado via Web Audio API.
   - **Quadro de Provas & Entregas**: contagem regressiva automática mostrando *"Faltam 4 dias para a Prova!"*, *"É HOJE! 🎯"*, etc.

4. **💧 Bem-Estar, Hidratação & Humor do Dia**:
   - **Rastreador de Água**: 8 copos interativos de 250ml com efeito sonoro de gota d'água e meta diária de 2 Litros.
   - **Mood Tracker**: Ela escolhe como está se sentindo (*Radiante*, *Focada*, *Tranquila*, *Cansada*, *Sobrecarregada*) e recebe um recadinho acolhedor do marido.

5. **💌 Mural de Bilhetinhos com Amor**:
   - Um quadro de post-its coloridos onde você pode deixar mensagens de incentivo, recados românticos e votos de boa sorte para as provas e entregas de trabalho.
   - Ela pode fixar no topo e até reenviar os bilhetinhos para o WhatsApp dela!

6. **🎨 5 Temas Visuais Encantadores**:
   - 🌸 **Sakura & Rosa Chic**
   - 💜 **Lavanda & Serenidade**
   - ☕ **Cappuccino & Vanilla**
   - 🌿 **Menta & Eucalipto**
   - 🌙 **Noite Aveludada (Modo Escuro)**

7. **📱 PWA Instalável no Celular**:
   - Pode ser adicionada à tela inicial do iPhone e Android funcionando como um aplicativo nativo.

---

## 🚀 Como Publicar no Cloudflare Pages (Passo a Passo)

O projeto já está 100% estruturado com:
- `dist/` (build estático ultra rápido)
- `_redirects` e `_headers` (para roteamento SPA e segurança)
- `functions/api/send-whatsapp.ts` (API serverless Edge nativa do Cloudflare Pages sem precisar de backend extra)

### Método 1: Conectar pelo GitHub (Mais Fácil & Recomendado)
1. Crie um repositório no seu GitHub e envie o código:
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/agenda.git
   git branch -M main
   git push -u origin main
   ```
2. Acesse o painel da [Cloudflare Dashboard](https://dash.cloudflare.com).
3. Vá em **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
4. Escolha seu repositório do GitHub e configure:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Clique em **Save and Deploy**.
6. Em menos de 1 minuto, seu link estará online: `https://agenda-esposa.pages.dev` (com HTTPS gratuito e certificado SSL automático).

### Método 2: Deploy Direto via Terminal (Wrangler CLI)
```bash
npm run build
npx wrangler pages deploy dist --project-name agenda-esposa
```

---

## 📲 Como Configurar o WhatsApp Gratuito (CallMeBot)

1. No aplicativo, clique em **WhatsApp** no menu superior.
2. Digite o número da sua esposa com DDI e DDD (exemplo: `5511999999999`).
3. Para ativar o envio automático gratuito via **CallMeBot**:
   - No celular dela, envie uma mensagem para o número oficial do bot no WhatsApp: **+34 911 06 14 36** com o texto:
     ```
     I allow callmebot to send me messages
     ```
   - O bot responderá em poucos segundos com a sua **API Key** (ex: `1234567`).
   - Cole a API Key no campo indicado nas configurações e clique em **Salvar**.
4. Clique no botão **"Testar Alerta no WhatsApp Dela Agora"** para ver a mágica acontecer!

*(Se preferir não usar o CallMeBot, você pode escolher o modo "Link Direto", que abrirá o WhatsApp com a mensagem pronta para enviar em 1 clique).*

---

## 🛠️ Tecnologias Utilizadas

- **React 19 & TypeScript**
- **Vite**
- **Tailwind CSS v4**
- **Lucide Icons**
- **Date-fns** (em português do Brasil)
- **Canvas-Confetti**
- **Web Audio API** (sons harmônicos sintetizados sem depender de arquivos externos)
- **Cloudflare Pages Functions** (Edge API serverless)
