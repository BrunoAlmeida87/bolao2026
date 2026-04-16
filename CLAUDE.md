# Bolão Copa 2026 - Setup para Claude

## Projeto
**SPA única** em Firebase Firestore. Arquivo principal: `index.html` (~2600 linhas).

## Stack
- Frontend: Vanilla JS + CSS (sem frameworks)
- Backend: Firebase Auth + Firestore
- Data: XLSX export via SheetJS

## Git
- **Repo**: `BrunoAlmeida87/bolao2026`
- **Branch dev**: `claude/tender-shannon-0zZ6v`
- **Token**: variável de ambiente do usuário (vide .env local)

---

## Dados

### GRUPOS_DATA
12 grupos (A–L), 48 seleções (sorteio dez/2024).
```js
{
  A: { teams: ['México','África do Sul',...], games: [{id:'A1', h:'México', a:'...', date:'Jun 11'}, ...] },
  ...
}
```

### ELIM_DATA
```js
{
  r32: { games: [{id:'O1'–'O16'}] },      // Round of 32
  r16: { games: [{id:'Q1'–'Q8'}] },      // Oitavas
  quartas: { games: [{id:'S1'–'S4'}] },  // Quartas
  semi: { games: [{id:'SF1'–'SF2'}] },   // Semis
  final: { games: [{id:'T1', 'F1'}] }    // 3º lugar + Final
}
```

### COUNTRY_FLAGS
Mapa `seleção → 🇪🇲`. 48 seleções.

### GAME_TIMES
Horários em Brasília (UTC-3) para cada game ID.

---

## Funções-chave

| Função | O quê |
|--------|-------|
| `computeRanking(users, res, pals)` | Retorna ranking com `pontos, exatos, venc_saldo, apenas_venc, jogos` |
| `updateEliminationTeams()` | Grupos → R32 (automático) |
| `updateQuarterfinals()` | R32 → R16 |
| `updateQuartas()` | R16 → Quartas |
| `updateSemifinals()` | Quartas → Semis |
| `updateFinal()` | Semis → Final + 3º lugar |

---

## Firestore

| Coleção | Doc | Função |
|---------|-----|--------|
| `usuarios` | `uid` | nome, apelido, email, role, ativo |
| `palpites` | `uid` → subcol `jogos` | gameId: {h, a} |
| `resultados` | gameId | h_real, a_real, locked, h_team, a_team |
| `config` | `geral` | pts_exato, pts_vencedor_saldo, ... |

---

## Config (saveCFGAdmin)
```js
{
  nome_bolao, pts_exato, pts_vencedor_saldo, pts_apenas_vencedor,
  pts_bonus_classificacao, pts_campeao, pts_artilheiro
}
```

---

## Bugs Recentes Corrigidos (PR #2)
- ✅ `saveCFGAdmin()`: removida leitura de `#cfg-pts-res` inexistente
- ✅ `exportRankingCSV()`: substituído `u.resultados_certos` por `u.venc_saldo, u.apenas_venc`
- ✅ `ADMIN_EMAIL = null`: código morto removido
- ✅ Cascata eliminatórias: nova `updateQuartas()`, `updateSemifinals()` corrigida

---

## Quick Commands

```bash
# Setup git
git remote set-url origin "https://TOKEN@github.com/BrunoAlmeida87/bolao2026.git"

# Push
git push -u origin claude/tender-shannon-0zZ6v

# Branch atual
git branch --show-current
```

---

## Próximas Ideias
- Palpites Campeão/Artilheiro com bônus
- Dark mode
- Notificações de jogos próximos
