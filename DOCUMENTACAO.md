# Bolão ICN Copa 2026 — Documentação Completa

> Documento de referência completo para entender, manter ou recriar esta aplicação do zero. Inclui arquitetura, funcionalidades, regras de negócio, estrutura de dados e decisões de design.

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Autenticação e Usuários](#3-autenticação-e-usuários)
4. [Navegação e Páginas](#4-navegação-e-páginas)
5. [Dashboard (Ranking)](#5-dashboard-ranking)
6. [Palpites (Apostas)](#6-palpites-apostas)
7. [Sistema de Pontuação](#7-sistema-de-pontuação)
8. [Ver Palpites de Outros](#8-ver-palpites-de-outros)
9. [Ver Todos os Palpites](#9-ver-todos-os-palpites)
10. [Tabelas de Grupos](#10-tabelas-de-grupos)
11. [Chaveamento (Fase Eliminatória)](#11-chaveamento-fase-eliminatória)
12. [Estatísticas e IA](#12-estatísticas-e-ia)
13. [Cardápio e Transporte](#13-cardápio-e-transporte)
14. [Regras](#14-regras)
15. [Painel Administrativo](#15-painel-administrativo)
16. [PWA (Progressive Web App)](#16-pwa-progressive-web-app)
17. [Sistema de Cache e Atualizações em Tempo Real](#17-sistema-de-cache-e-atualizações-em-tempo-real)
18. [Rastreamento de Leituras Firebase](#18-rastreamento-de-leituras-firebase)
19. [Geração de Imagens para Compartilhamento](#19-geração-de-imagens-para-compartilhamento)
20. [Design Visual](#20-design-visual)
21. [Estrutura do Firestore](#21-estrutura-do-firestore)
22. [Regras de Segurança do Firestore](#22-regras-de-segurança-do-firestore)
23. [Configuração Global (CFG)](#23-configuração-global-cfg)
24. [Estrutura de Arquivos](#24-estrutura-de-arquivos)
25. [Fluxos de Dados Principais](#25-fluxos-de-dados-principais)
26. [Ideias e Melhorias Futuras](#26-ideias-e-melhorias-futuras)

---

## 1. Visão Geral

### O que é

O **Bolão ICN Copa 2026** é uma aplicação web de bolão de futebol para a Copa do Mundo FIFA 2026 (EUA/Canadá/México). O sistema permite que um grupo fechado de pessoas:

- Cadastre seus palpites para todos os 104 jogos do torneio (48 times, 12 grupos, fase eliminatória completa)
- Acompanhe o ranking em tempo real conforme os resultados são inseridos pelo administrador
- Veja palpites de outros participantes, compare desempenhos e consulte estatísticas detalhadas
- Acesse o cardápio do refeitório e horários de transporte do local de trabalho (funcionalidade extra do grupo)
- Use o app como PWA instalado no celular

### Objetivo

Criar uma experiência de bolão **completa, bonita e fácil de usar** para um grupo corporativo (ICN), sem depender de planilhas ou grupos de WhatsApp para controle de pontuação. Tudo automatizado: basta o admin inserir o placar e todos veem o ranking atualizado.

### Contexto

- **Torneio**: Copa do Mundo FIFA 2026
- **Formato**: 48 seleções, 12 grupos, Rodada de 32, Oitavas, Quartas, Semifinais, Final e 3º Lugar
- **Total de jogos**: 104
- **Participação**: R$ 50 por pessoa; premiação 50/30/20% para 1º/2º/3º lugar
- **Idioma**: Português (Brasil)
- **Versão atual**: v1.12.2

---

## 2. Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | HTML5 + CSS3 + JavaScript vanilla (sem framework) |
| Banco de dados | Firebase Firestore (NoSQL, tempo real) |
| Autenticação | Firebase Auth (email/senha) |
| Hospedagem | Firebase Hosting |
| PWA | Service Worker + `manifest.json` |
| Export Excel | SheetJS (carregado por demanda via CDN) |
| Imagens canvas | API Canvas do browser (geração de PNG para compartilhar) |
| Deployment | GitHub Actions → Firebase Hosting |

> **Decisão de design:** nenhum framework JS (React/Vue/etc.) foi usado intencionalmente. O app é um único arquivo `index.html` com todo o JS inline, facilitando deploy simples e zero build step.

---

## 3. Autenticação e Usuários

### Fluxo de Login

1. Formulário com email + senha
2. `auth_.signInWithEmailAndPassword(email, senha)`
3. Erros tratados: `user-not-found`, `wrong-password`, `invalid-email`, `too-many-requests`
4. Após login: lê `usuarios/{uid}` no Firestore, carrega config global (`config/geral`), mostra o app

### Fluxo de Cadastro

1. Campos obrigatórios: **nome completo**, **apelido** (nickname), **email**, **senha** (mín. 6 chars) + confirmação
2. Cria conta no Firebase Auth
3. Cria documento `usuarios/{uid}` com `role: 'user'`, `ativo: true`
4. Cria documento pai `palpites/{uid}` para armazenar apostas

### Redefinição de Senha

- `auth_.sendPasswordResetEmail(email)`
- Rate limit: mínimo 30 segundos entre tentativas
- Aviso para checar spam

### Documento de Usuário

```json
{
  "nome": "string",
  "apelido": "string (máx 30 chars)",
  "email": "string",
  "role": "user | admin",
  "ativo": true,
  "pago": false,
  "createdAt": "timestamp"
}
```

### Permissões de Edição

- Usuário comum: pode alterar apenas o próprio **apelido** (via modal no header)
- Admin: pode alterar nome, email, role, ativo e pago de qualquer usuário
- Nenhum usuário pode se auto-promover a admin
- Nenhum usuário pode alterar o próprio status de pagamento

---

## 4. Navegação e Páginas

### Navegação Desktop (header)

10 abas visíveis + badge de ADMIN:

| Aba | Ícone | Página |
|-----|-------|--------|
| Ranking | 🏠 | `#dashboard` |
| Palpites | ⚽ | `#palpites` |
| Ver | 👁️ | `#ver-palpites` |
| Tabelas | 📊 | `#tabelas` |
| Chaves | 🔑 | `#chaveamento` |
| Bilateral | 🏆 | `#chaveamento-bilateral` |
| Stats | 📈 | `#estatisticas` |
| Corrida | 🏁 | `#corrida` |
| Cardápio | 🍽️ | `#cardapio` |
| Regras | 📋 | `#regras` |
| Admin | ⚙️ | `#admin` *(só admin)* |

Dropdown do usuário (canto superior direito): apelido clicável para editar, badge ADMIN, botão Sair, toggle de tema 🌙/☀️.

### Navegação Mobile (bottom nav)

6 botões fixos na base da tela:

```
🏠 Ranking | ⚽ Palpites | 👁️ Ver | 📈 Stats | 🍴 Cardápio | ☰ Mais
```

**Sheet "Mais":** overlay que expande mostrando mais páginas + ações (Alterar Apelido, Tema, Sair).

### Roteamento

- Hash-based: `navigateTo('#pagina')` atualiza a URL e renderiza a página
- Back button do browser funciona (histórico via `history.pushState`)
- `_restorePageFromHash()` na inicialização: restaura a página ao recarregar

---

## 5. Dashboard (Ranking)

### Conteúdo

**Próximos jogos (hero card):**
- Lista os 3-5 próximos jogos com countdown timer (atualiza a cada segundo)
- Mostra se o usuário já tem palpite para cada jogo (✅ ou ⚠️)
- Barra de progresso: % de palpites preenchidos no total do torneio

**Tabela de Ranking (desktop) / Cards (mobile):**

| Coluna | Descrição |
|--------|-----------|
| # | Posição atual + delta (↑↓=) |
| Participante | Apelido clicável → abre perfil modal |
| Pts | Total de pontos |
| Exatos | Nº de placares exatos (verde) |
| V+Saldo | Nº de acertos com vencedor+saldo (dourado) |
| Vencedor | Nº de acertos de vencedor simples |
| Jogos | Jogos com palpite / jogos com resultado |
| % | Taxa de aproveitamento |
| 🏆 | Palpite do campeão (🔒 até admin revelar) |
| Distância | Diferença de pontos para o 1º lugar |

**Delta de posição:** compara ranking atual com a última vez que o usuário abriu o dashboard. Mostra ↑3, ↓1, ou = ao lado de cada posição.

**Gráfico de evolução:** bump chart (SVG) mostrando a trajetória de pontos de cada participante ao longo dos jogos.

**🏁 Corrida do Ranking (aba própria):** bar chart race renderizado em `<canvas>` (sem reflow → fluido mesmo com muitos participantes), interpolando valor e posição a cada frame. Três modos: **Top 12 + Você** (você fica sempre visível, mesmo fora do top, numa faixa fixa), **Todos** e **Escolher** (corrida só entre os participantes que você selecionar). Tem controle de **velocidade** (0,25× a 2×), play/pausa, barra para percorrer/pausar e ler os nomes com calma, e o **dia** aparece no gráfico (marca d'água ao fundo + topo) para acompanhar o tempo. Exporta **vídeo vertical** reaproveitando o mesmo renderizador do canvas, com **opções**: quem aparece (como na tela ou **todos**) e velocidade (normal / lenta 0,5× / bem lenta 0,25×). No escopo "todos" a altura do vídeo cresce (até 720×1920) para caber todos os nomes legíveis. Ao tocar em **Baixar vídeo**, um diálogo pergunta na hora: **velocidade** (normal / lenta / bem lenta), **quem aparece** (como na tela ou todos) e **quem destacar com cor** (todos coloridos / só eu / eu + jogadores escolhidos — os escolhidos ficam coloridos e o resto em cinza). Gera **MP4/H.264** quando há suporte (via WebCodecs + mp4-muxer embutido — compatível com WhatsApp, inclusive no Chrome Android) e cai para `.webm` como fallback. No PC a caixa é bem maior; no modo Todos/Escolher a altura cresce para caber todos os nomes de forma legível.

**Resultados novos:** modal que aparece na primeira abertura após novos resultados, mostrando quais jogos tiveram placar inserido e os pontos ganhos por cada um.

### Botões de Compartilhamento

- 📸 **Minha Posição**: gera PNG do card do usuário atual
- 📸 **Top 10**: gera PNG do ranking top 10
- 📸 **Todos**: gera PNG do ranking completo
- Usa Canvas API em 2× resolução (alta definição para celular)

---

## 6. Palpites (Apostas)

### Formato dos Jogos

- **Fase de grupos**: 12 grupos (A–L) × 6 jogos = 72 jogos
- **Fase eliminatória**: Rodada de 32 (16), Oitavas (8), Quartas (4), Semis (2), Final + 3º lugar (2)
- **Total: 104 jogos**

### Interface de Apostas

```
[Time da Casa] [ H ] × [ A ] [Time Visitante]  🔒|✅
```

- Campos numéricos inteiros (0–N, sem limite de gols)
- Borda verde = palpite salvo
- Borda laranja piscante = salvando
- Borda vermelha = erro ao salvar
- Campo desabilitado (cinza) = jogo bloqueado

### Filtros Disponíveis

- Por **fase**: Grupos, R32, Oitavas, Quartas, Semis, Final
- Por **grupo**: checkboxes A–L (selecionar/desmarcar individualmente)
- Por **data**: todas as datas ou data específica
- Barra de progresso dinâmica: % de palpites preenchidos no filtro atual

### Lógica de Bloqueio

Um jogo fica bloqueado (sem edição) quando:
1. `resultados/{gameId}.locked === true` (admin bloqueou manualmente), **OU**
2. O horário de início do jogo já passou (comparado com fuso `America/Sao_Paulo`)

Horários de todos os 104 jogos estão mapeados em `GAME_TIMES` no código.

### Salvamento

- Salva automaticamente ao perder o foco (`onblur`) do campo de input
- Destino: `palpites/{uid}/jogos/{gameId}` com `{h: number, a: number}`
- Apagar ambos os campos = deletar o palpite
- Registra log no `palpites/{uid}/historico` (ver seção de auditoria)

### Palpite do Campeão

- Card destacado no topo da página de palpites
- Dropdown com todas as 48 seleções
- Bloqueado quando `CFG.campeao_locked === true`
- Salvo em `palpites/{uid}.campeao`
- Bônus de `CFG.pts_campeao` pontos se acertar o campeão final

---

## 7. Sistema de Pontuação

### Valores de Pontos (configuráveis pelo admin)

| Acerto | Pontos padrão |
|--------|--------------|
| Placar exato (casa e fora corretos) | **10 pts** |
| Vencedor + saldo de gols igual | **7 pts** |
| Apenas vencedor/empate correto | **5 pts** |
| Bônus campeão correto | **50 pts** |

### Algoritmo (`calcPontos`)

```javascript
function calcPontos(palpite, resultado) {
  const ph = palpite.h, pa = palpite.a;
  const rh = resultado.h_real, ra = resultado.a_real;

  // 1. Placar exato
  if (ph === rh && pa === ra) return CFG.pts_exato;

  const pSaldo = ph - pa;  // saldo previsto
  const rSaldo = rh - ra;  // saldo real
  const pRes = ph>pa ? 'H' : ph<pa ? 'A' : 'D';  // resultado previsto
  const rRes = rh>ra ? 'H' : rh<ra ? 'A' : 'D';  // resultado real

  // 2. Vencedor correto + mesmo saldo
  if (pRes === rRes && pSaldo === rSaldo) return CFG.pts_vencedor_saldo;

  // 3. Apenas vencedor/empate correto
  if (pRes === rRes) return CFG.pts_apenas_vencedor;

  // 4. Errou
  return 0;
}
```

### Critérios de Desempate (em ordem)

1. Total de pontos (DESC)
2. Número de placares exatos (DESC)
3. Número de acertos com vencedor+saldo (DESC)
4. Número de acertos com apenas vencedor (DESC)
5. Acertou o palpite de campeão (quem acertou fica à frente)

> Se o empate persistir em **todos** os critérios, o valor das posições empatadas é somado e **dividido igualmente** entre os participantes empatados.

---

## 8. Ver Palpites de Outros

### Perfil Modal

Ao clicar no nome de qualquer participante abre um modal com:
- Nome, posição no ranking, total de pontos
- Palpite do campeão (se revelado)
- Mini-cards: exatos, V+saldo, vencedor, % aproveitamento
- Breakdown por fase (% acertos em grupos, R32, oitavas, etc.)
- Botão **Comparar** (abre H2H modal)
- Botão **Ver todos os palpites** (navega para `#ver-palpites`)

### Página Ver Palpites

- Mesma interface da página de palpites, mas **read-only**
- Mostra os palpites do usuário selecionado
- Exibe badges de pontos ganhos por jogo (exato/vsaldo/vencedor/errou)
- Mostra o palpite do campeão no topo

### H2H — Comparação Direta

Modal que compara dois participantes lado a lado:
- Pontos totais de cada um
- Histórico de jogos: quem ganhou mais pontos em cada jogo
- Tabs por fase
- Linhas coloridas: verde = jogador 1 venceu, azul = jogador 2 venceu, cinza = empate

---

## 9. Ver Todos os Palpites

Página que exibe os palpites de **todos os participantes** organizados por jogo:

- Agrupado por fase (Grupos, Eliminatória, etc.)
- Cada jogo expansível: mostra grid com todos os palpites + pontos ganhos
- **Card Campeão**: grid com todas as 48 seleções, mostrando quais participantes apostaram em cada uma
- Identifica o campeão final (se determinado)

---

## 10. Tabelas de Grupos

- 12 tabelas (grupos A–L) com classificação da fase de grupos
- Colunas: Pos, Time, P (jogos), V-E-D, GF-GC, Saldo, Pts
- 1º e 2º colocados destacados em verde (classificados)
- 3º colocados em laranja (candidatos à Rodada de 32 nos melhores terceiros)
- Dados derivados dos resultados inseridos pelo admin

---

## 11. Chaveamento (Fase Eliminatória)

### Visão Linear (`#chaveamento`)

- Scroll horizontal com todas as fases em colunas
- R32 (16 jogos) → R16 (8) → Quartas (4) → Semis (2) → Final + 3º lugar
- Cada jogo mostra: nº oficial FIFA, times, placar, origem dos times ("Venc. A1")
- Vencedor destacado em dourado
- Suporte a prorrogação + pênaltis

### Visão Bilateral (`#chaveamento-bilateral`)

- Chaveamento visual em árvore (estilo torneio clássico)
- Lado esquerdo e lado direito se encontram na final
- Linhas conectando os jogos (SVG)
- Final destacada com borda dourada, 3º lugar com borda azul

---

## 12. Estatísticas e IA

### Estatísticas Exibidas

- **📊 Momento dos Participantes** (carrossel de destaques): com base nos **últimos 5 jogos com resultado**, seleciona apenas pessoas em fases marcantes — não é lista geral. Distingue **regularidade** (jogos em que pontuou), **precisão** (placares exatos) e **eficiência** (pontos feitos / pontos possíveis), evitando o "100%" ambíguo. Destaques possíveis: 🔥 Melhor momento, 📈 Maior evolução, 🎯 Sniper recente, 🧱 Sequência positiva, ❄️ Fase fria, 📉 Maior queda. Cada destaque escolhe uma pessoa distinta; exige ≥3 palpites nos 5 jogos recentes (e histórico ≥6 jogos para destaques negativos). Alterna automaticamente (respeita `prefers-reduced-motion`) com setas/bolinhas para navegação manual; mensagens neutras quando faltam dados.
- **Mais Certeiro**: participante com maior % de acertos
- **Rei do Placar Exato**: quem mais acertou placares exatos
- **Mais Indeciso**: quem mais editou os palpites (lê histórico de edições)
- Breakdown por fase: % de acertos em cada rodada
- Estatísticas por jogo: qual jogo teve mais acertos coletivos

### Sistema de Cards IA

1. Admin exporta todos os dados + prompt pré-formatado (botão "Copiar dados + prompt para IA")
2. Copia para o Claude (ou outra IA)
3. IA retorna JSON com cards analíticos
4. Admin cola o JSON na textarea do painel Admin → aba IA
5. Cards salvos em `config/ai_insights`
6. Exibidos automaticamente na página de Estatísticas

**Estrutura de um card:**
```json
{
  "icon": "🎯",
  "title": "Mais Certeiro",
  "value": "João Silva",
  "text": "73% de aproveitamento geral, 12 placares exatos"
}
```

---

## 13. Cardápio e Transporte

### Refeitório (Cardápio da Semana)

- Cardápio de Segunda a Sexta com café da manhã e almoço
- Hoje: card destacado com borda dourada e badge "Hoje"
- Grid semanal com todos os 5 dias
- Itens categorizados com chips coloridos:
  - 🥩 Proteína (vermelho/salmão)
  - 🍚 Carboidrato (âmbar)
  - 🥦 Vegetal (verde)
  - 🍎 Fruta (verde claro)
  - 🥤 Bebida (azul)
- Legenda das categorias
- Detecção automática do dia atual via fuso `America/Sao_Paulo`

> **Nota:** o cardápio muda automaticamente de dia à meia-noite no fuso de Brasília. O conteúdo do cardápio é atualizado manualmente no código semanalmente.

### Transporte entre Sites

- Rotas fixas com horários de saída (ex.: Site A ↔ Site B)
- Countdown em tempo real (atualiza a cada 1 segundo)
- Mostra: próxima saída, tempo restante, número de assentos
- Horários passados ficam acinzentados
- Fim de semana: exibe "Sem transporte hoje"
- Dados hardcoded no array `horariosTransporte`

---

## 14. Regras

Página estática com:
- Como participar (passo a passo)
- Tabela de pontuação com os valores
- Critérios de desempate
- Informações de pagamento: valor R$ 50, chave Pix
- Distribuição de prêmios: 50% (1º), 30% (2º), 20% (3º)
- Bônus de campeão
- QR Code do grupo WhatsApp (imagem base64 salva no Firestore)

---

## 15. Painel Administrativo

Acessível apenas para usuários com `role: 'admin'`. Possui **9 abas**:

### Aba 1 — Resultados

- Inputs de placar (casa/fora) para cada um dos 104 jogos
- Agrupados por fase
- Botão 🔒/🔓 por jogo para bloquear/desbloquear apostas
- Ao salvar um resultado: `_bumpDataVersion()` é chamado → notifica todos os clientes conectados em tempo real

### Aba 2 — Usuários

- Lista todos os participantes com: apelido, nome, email, role, ativo, pago
- Toggle de **Pago** (confirmação de pagamento da taxa)
- Botão de editar: abre modal para alterar nome/email do usuário
- Contador: "X participantes, Y pagos" com valor total arrecadado

### Aba 3 — Financeiro

- **Total arrecadado**: nº pagos × R$ 50
- Cards de premiação: 1º / 2º / 3º em reais
- **Upload de QR Code do WhatsApp**: drag-drop ou seleção de arquivo (máx 1 MB, PNG/JPG)
  - Salvo como base64 em `config/geral.qrcode_whatsapp`
  - Exibido automaticamente na tela de login e na página de Regras

### Aba 4 — Editar Palpites

- Dropdown para selecionar qualquer participante
- Interface completa de palpites para edição (mesma UI da página de palpites)
- Todas as edições registradas no histórico com `adminEdit: true`
- Header de aviso: "Editando palpites de [nome] (Admin)"

### Aba 5 — Config

Campos editáveis:

| Campo | Descrição |
|-------|-----------|
| `pts_exato` | Pontos por placar exato (padrão: 10) |
| `pts_vencedor_saldo` | Pontos por vencedor + saldo (padrão: 7) |
| `pts_apenas_vencedor` | Pontos só pelo vencedor (padrão: 5) |
| `pts_campeao` | Bônus de campeão (padrão: 50) |
| `nome_bolao` | Nome exibido no header |
| `valor_participacao` | Taxa em R$ (padrão: 50) |
| `chave_pix` | Chave Pix para pagamento |
| `campeao_locked` | Toggle para revelar/ocultar palpites de campeão |
| `app_version` | Versão atual (read-only) |

### Aba 6 — Histórico (Auditoria)

- Log de todas as ações do admin lidas da coleção `audit`
- Mostra: ação, usuário, jogo, data/hora
- Append-only (ninguém pode deletar o histórico)

### Aba 7 — Exportar

- Gera arquivo Excel (`.xlsx`) com planilhas:
  - **Usuários**: todos os dados dos participantes
  - **Palpites**: todas as apostas organizadas por usuário e jogo
  - **Resultados**: todos os placares reais
  - **Estatísticas**: métricas por participante
  - **Configuração**: valores atuais do CFG
- Usa biblioteca SheetJS (carregada por demanda do CDN)
- Arquivo nomeado: `bolao-icn-YYYYMMDD-HHmmss.xlsx`

### Aba 8 — IA

- Painel para gerenciar os cards de análise IA
- Botão "📋 Copiar dados + prompt para IA": gera JSON completo dos dados + prompt instrucional para colar no Claude
- Textarea para colar a resposta JSON da IA
- Salva em `config/ai_insights` → aparece automaticamente na página de Estatísticas
- Preview dos cards atuais

### Aba 9 — Uso

- Tabela de **leituras do Firestore** por participante nos **últimos 7 dias**
- Colunas: usuário + 7 colunas de dias (mais antigo → hoje) + total
- Células com gradiente de cor dourado (quanto mais leituras, mais intenso)
- Linha de rodapé: total de leituras por dia
- Referência: plano Spark do Firebase = 50.000 leituras gratuitas/dia
- Dados lidos de `_usage_stats/{data}` no Firestore

---

## 16. PWA (Progressive Web App)

### Instalação no Android (Chrome)

1. Evento `beforeinstallprompt` é capturado e armazenado
2. Card de instalação aparece na tela de login (mobile browser apenas)
3. Botão "⬇️ Instalar agora" aciona `deferredPwaPrompt.prompt()`
4. Após instalação: `appinstalled` event → toast de sucesso

### Instalação no iOS (Safari)

1. Card com instruções manuais na tela de login
2. "Compartilhar (□↑) → Adicionar à Tela de Início"
3. Botão no footer (usuário logado) exibe toast com instruções

### Condições de Exibição do Botão de Instalação

| Situação | Botão aparece? |
|----------|---------------|
| Desktop/computador | ❌ Não |
| Mobile já usando como PWA standalone | ❌ Não |
| Android mobile no browser | ✅ Sim (quando `beforeinstallprompt` disponível) |
| iOS mobile no browser | ✅ Sim (instrução via toast) |

### Service Worker (`sw.js`)

- Estratégia: **Network-first para HTML**, **Cache-first para assets**
- Precache: `index.html`, `manifest.json`, ícones
- Detecta automaticamente se está em `/bolao2026/` ou `/`
- Suporte offline: carrega versão cacheada se sem internet
- Versão sincronizada com app: `v1.12.2`

### Manifest (`manifest.json`)

```json
{
  "name": "Bolão ICN Copa 2026",
  "short_name": "Bolão ICN",
  "display": "standalone",
  "theme_color": "#0A1628",
  "background_color": "#0A1628",
  "icons": [192, 512, 512-maskable]
}
```

---

## 17. Sistema de Cache e Atualizações em Tempo Real

### Cache em Memória (`_SC`)

```javascript
const _SC = {};
const _SC_TTL = {
  res: 20 * 60000,         // resultados: 20 min
  usr: 20 * 60000,         // usuários: 20 min
  pals: 20 * 60000,        // palpites: 20 min
  indecisao: 5 * 60000     // estatísticas: 5 min
};
```

Funções:
- `_scGet(key)` → retorna valor se não expirado, senão `null`
- `_scSet(key, value, ttl)` → armazena com prazo de expiração
- `_scDel(...keys)` → invalida entradas específicas

### Invalidação de Cache

| Evento | Cache invalidado |
|--------|-----------------|
| Admin salva resultado | `res`, `pals` |
| Usuário edita palpite | `pals` |
| Usuário muda apelido | `usr` |
| Botão "Atualizar" (↻) | `res`, `usr`, `pals` |
| Listener de versão dispara | `res`, `usr`, `pals` |

### Listener de Versão em Tempo Real

Mecanismo de notificação para todos os clientes conectados:

1. Admin insere resultado → `_bumpDataVersion()` incrementa `config/version.rev`
2. Todos os clientes têm `onSnapshot()` ativo em `config/version`
3. Ao detectar mudança: invalida cache + re-renderiza a página atual
4. Toast: "🔄 Dados atualizados (novo resultado)"

**Custo:** apenas **1 documento observado por usuário** — muito barato no Firestore.

---

## 18. Rastreamento de Leituras Firebase

### Objetivo

Monitorar quantas leituras do Firestore cada participante gera por dia, para controle de custos (limite gratuito do Spark: 50.000 reads/dia).

### Implementação (`_rTracker`)

```javascript
const _rTracker = {
  _pending: 0,
  _timer: null,

  add(n = 1) {
    this._pending += n;
    // agenda flush em 60s se não há timer
    if (!this._timer) this._timer = setTimeout(() => this._flush(), 60000);
  },

  async _flush() {
    // salva contador acumulado em _usage_stats/{data}
    await db_.collection('_usage_stats').doc(hoje).set(
      { [uid]: FieldValue.increment(n) }, { merge: true }
    );
  }
};

window.addEventListener('beforeunload', () => _rTracker._flush());
```

### Pontos de Instrumentação

| Função | Reads contados |
|--------|---------------|
| `_fetchRes()` | `snap.size` (nº de documentos) |
| `_fetchUsr()` | `snap.size` |
| `_fetchPals()` | `(snap.size + 1)` por usuário |
| `handleAuthState()` login | 1 |
| `loadCFG()` | 1 |

### Estrutura no Firestore

```
_usage_stats/
  2026-06-09/     ← data ISO (fuso SP)
    uid-user1: 145
    uid-user2: 32
    uid-admin: 280
```

---

## 19. Geração de Imagens para Compartilhamento

```
Botão 📸 → Canvas 2× → PNG blob → download / Share API
```

- **Resolução**: 2× para alta definição em celulares (HiDPI)
- **Conteúdo**: tabela de ranking renderizada como imagem
- **Variações**: Minha Posição, Top 10, Ranking Completo
- **Export**: `canvas.toBlob()` → link de download automático
- **Share**: usa `navigator.share()` se disponível, senão baixa o arquivo

---

## 20. Design Visual

### Paleta de Cores (Tema Escuro — padrão)

```css
--dark-blue:  #0A1628   /* fundo principal */
--mid-blue:   #1A2E4A   /* cards/containers */
--light-blue: #243857   /* hover states */
--gold:       #FFD700   /* destaque, acento principal */
--accent:     #1E90FF   /* azul secundário */
--green:      #00C851   /* sucesso, acertos */
--red:        #FF4444   /* erros */
--orange:     #FF8C00   /* avisos */
--text:       #FFFFFF   /* texto principal */
--text-muted: #8BA8C8   /* texto secundário */
--border:     #2D4870   /* bordas/divisores */
```

### Tema Claro

Toggle via botão 🌙/☀️. Adiciona classe `body.light-theme` e inverte as variáveis CSS. Transição suave de 0.2s.

### Tipografia

- Família: `Segoe UI, system-ui, sans-serif`
- Peso normal: 400; destaque: 600–800
- Tamanhos: corpo 0.9rem, secundário 0.75–0.82rem, títulos 1.1–1.4rem

### Layout

- **Max-width desktop**: 1000px (ultra: 1400px)
- **Mobile**: full-width com padding 12–16px
- Flexbox + CSS Grid para organização interna
- `scroll-behavior: smooth`

### Breakpoints

| Breakpoint | Comportamento |
|-----------|---------------|
| `< 821px` | Layout mobile: bottom nav, cards empilhados, paddings reduzidos |
| `821px – 1024px` | Transitório |
| `> 1024px` | Layout desktop: header nav, tabelas completas |

### Componentes UI

| Componente | Estilo |
|------------|--------|
| Cards | borda 1px `--border`, `border-radius: 16px`, `padding: 20–24px` |
| Botões | `padding: 10–14px 20px`, `border-radius: 10px`, hover dourado |
| Inputs | `border-radius: 10px`, `border: 1px solid var(--border)`, foco azul |
| Modais | overlay 65% escuro, `max-width: 420px`, animação fade-in |
| Toasts | `bottom: 80px`, duração 3–5s, tipos: success/error/info/warning |

---

## 21. Estrutura do Firestore

```
firestore/
├── usuarios/
│   └── {uid}                     # perfil do participante
│
├── palpites/
│   └── {uid}/
│       ├── (documento raiz)      # { campeao: 'Brasil' }
│       ├── jogos/
│       │   └── {gameId}          # { h: 2, a: 1 }
│       └── historico/
│           └── {autoId}          # log de cada edição
│
├── resultados/
│   └── {gameId}                  # placar real + lock status
│
├── config/
│   ├── geral                     # CFG global (pontuação, pix, etc.)
│   ├── version                   # { rev: number } para listener
│   ├── ai_insights               # cards da IA
│   └── bracket_thirds            # configuração do chaveamento
│
├── audit/
│   └── {autoId}                  # log de ações do admin (append-only)
│
└── _usage_stats/
    └── {YYYY-MM-DD}              # { uid: contagem_reads }
```

### Documento `palpites/{uid}/historico/{autoId}`

```json
{
  "gameId": "G1",
  "h_old": 1, "h_new": 2,
  "a_old": 0, "a_new": 1,
  "action": "update",
  "edit": true,
  "adminEdit": false,
  "by": "uid-do-autor",
  "byEmail": "email@exemplo.com",
  "at": "timestamp"
}
```

---

## 22. Regras de Segurança do Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() { return request.auth != null; }
    function isOwner(uid) { return isSignedIn() && request.auth.uid == uid; }
    function isAdmin() {
      return isSignedIn() &&
        get(/databases/.../usuarios/$(request.auth.uid)).data.role == 'admin';
    }

    // Usuários: leitura aberta (logados), criação restrita ao próprio,
    // edição sem escalar privilégios, deleção só admin
    match /usuarios/{uid} { ... }

    // Palpites: leitura aberta (logados), escrita só próprio ou admin
    match /palpites/{uid} { ... }
    match /palpites/{uid}/jogos/{gameId} { ... }

    // Histórico de edições: append-only (sem update, sem delete por usuários)
    match /palpites/{uid}/historico/{histId} { ... }

    // Resultados: leitura aberta, escrita só admin
    match /resultados/{gameId} { ... }

    // Config: leitura aberta, escrita só admin
    match /config/{doc} { ... }

    // Auditoria: leitura e escrita só admin, sem update/delete
    match /audit/{doc} { ... }

    // Uso/Reads: leitura só admin; escrita só próprio campo (UID como chave)
    match /_usage_stats/{date} {
      allow read: if isAdmin();
      allow create: if isSignedIn()
        && request.resource.data.keys().hasOnly([request.auth.uid]);
      allow update: if isSignedIn()
        && request.resource.data.diff(resource.data)
             .affectedKeys().hasOnly([request.auth.uid]);
    }
  }
}
```

> **Importante:** as regras do `firestore.rules` precisam ser publicadas manualmente no Console do Firebase (ou via `firebase deploy --only firestore:rules`) — o deploy do GitHub Actions só publica o Hosting.

---

## 23. Configuração Global (CFG)

Objeto `CFG` carregado de `config/geral` no login. Valores padrão:

```javascript
const CFG = {
  app_version:           'v1.12.2',
  nome_bolao:            'Bolão ICN Copa 2026',
  pts_exato:             10,
  pts_vencedor_saldo:    7,
  pts_apenas_vencedor:   5,
  pts_campeao:           50,
  valor_participacao:    50,         // R$
  chave_pix:             '128.712.527-18',
  campeao_locked:        false,      // true = revela palpites de campeão
  qrcode_whatsapp:       ''          // base64 da imagem QR
};
```

---

## 24. Estrutura de Arquivos

```
bolao2026/
├── index.html                  # App completo (~9.600 linhas, tudo inline)
├── manifest.json               # Configuração PWA
├── sw.js                       # Service Worker (~57 linhas)
├── firestore.rules             # Regras de segurança do Firestore
├── firebase.json               # Configuração de deploy Firebase
├── DOCUMENTACAO.md             # Este arquivo
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-512-maskable.png
│   └── apple-touch-icon.png
└── .github/
    └── workflows/
        ├── firebase-producao.yml   # Deploy automático na main
        └── firebase-preview.yml    # Deploy em canal preview nos outros branches
```

### Decisão Arquitetural: arquivo único

Todo o app está em um único `index.html` (HTML + CSS + JS inline), sem bundler, sem transpilador. Isso simplifica:
- Deploy: um único arquivo para fazer push
- Desenvolvimento: um único arquivo para editar
- Depuração: inspetor do browser vê o código diretamente

Tradeoff: o arquivo é grande (~9.600 linhas) e não há tree-shaking ou lazy loading real (exceto SheetJS e algumas libs externas).

---

## 25. Fluxos de Dados Principais

### Fluxo: Admin insere resultado

```
Admin digita placar → save() → resultados/{gameId} no Firestore
  → _bumpDataVersion() → config/version.rev++
  → onSnapshot() dispara em todos os clientes
  → _scDel('res', 'pals') → navigateTo(currentPage)
  → ranking recalculado do zero para todos
```

### Fluxo: Usuário faz palpite

```
Usuário digita placar → onblur → verificar se jogo está locked
  → se bloqueado: modal de aviso, não salva
  → se aberto: palpites/{uid}/jogos/{gameId} = {h, a}
              palpites/{uid}/historico/{autoId} = log da edição
              _scDel('pals')
              UI: borda verde "salvo"
```

### Fluxo: Carregamento do ranking

```
renderDashboard()
  → _fetchRes()  → se em cache: usa; senão lê resultados/ (N docs)
  → _fetchUsr()  → se em cache: usa; senão lê usuarios/ (N docs)
  → _fetchPals() → se em cache: usa; senão lê palpites/{uid}/jogos para cada usuário
  → para cada usuário × jogo com resultado: calcPontos()
  → agrega, ordena, renderiza tabela
  → armazena em cache com TTL 20min
```

### Fluxo: Rastreamento de leituras

```
_fetchRes/Usr/Pals → _rTracker.add(snap.size)
  → acumula em _rTracker._pending
  → a cada 60s: _flush() → _usage_stats/{hoje}[uid] += pending
  → beforeunload: flush final
```

---

## 26. Ideias e Melhorias Futuras

### Funcionalidades desejadas / roadmap

1. **Notificações push**: avisar quando um novo resultado for inserido, mesmo com app fechado (Firebase Cloud Messaging)

2. **Palpites em lote (fase eliminatória)**: formulário simplificado para apostar em toda a chave de uma vez antes do início da fase

3. **Modo espectador**: link público (sem login) para visualizar o ranking atual sem poder editar nada

4. **Histórico de posições**: gráfico mostrando a evolução de posição (não só pontos) de cada participante ao longo do torneio

5. **Automação de resultados**: integrar com uma API pública de resultados da Copa (ex.: football-data.org) para inserção automática de placares

6. **Palpite de artilheiro**: campo adicional para apostar no artilheiro da Copa com bônus de pontos

7. **Fase eliminatória — palpite de progressão**: além do placar, apostas em quem avança em cada fase (tipo "Monte seu chaveamento")

8. **Exportar palpites em PDF**: gerar cartela de palpites personalizada para cada participante

9. **Automação de regras Firestore no CI**: atualmente o deploy de regras é manual (a service account do CI não tem permissão de Firestore Rules Admin — basta conceder a role no IAM do GCP)

10. **Mais gráficos nas estatísticas**: heatmap de palpites, distribuição de placares mais apostados, "bolha" de desempenho por fase

11. **Alertas de apostas próximas do prazo**: toast/badge quando faltam menos de 24h para o jogo e o usuário ainda não apostou

12. **Suporte a múltiplos bolões**: mesma base de código gerenciando diferentes grupos (multi-tenant), diferenciados por subdomínio ou path

### Melhorias técnicas

- Dividir o `index.html` em módulos JS com bundler (Vite) sem perder a simplicidade de deploy
- Lazy loading de páginas menos usadas (chaveamento bilateral, exportar)
- Testes automatizados para `calcPontos()` e lógica de ranking
- Regras Firestore mais granulares (validar tipos dos campos nas regras)
- Usar Firestore Transactions para evitar race conditions na edição concorrente de palpites

---

*Documento gerado em Junho/2026. Versão do app documentada: **v1.12.2**.*
