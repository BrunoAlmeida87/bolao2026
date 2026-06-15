# Cavalos do "GP do Bolão" (modo Cavalos do Palco)

Coloque aqui as imagens dos cavalos usadas na corrida de cavalos animada
(aba oculta **🎬 GP do Bolão → 🐴 Cavalos**, só admin).

## Como nomear
- `horse1.png`, `horse2.png`, `horse3.png`, … até no máximo `horse16.png`.
- Pode adicionar quantas quiser (1 a 16). O app tenta `horse1`…`horse16` e usa
  todas as que existirem. Não precisa numerar sem buraco — mas o ideal é em
  sequência (1, 2, 3, …).

## Especificação das imagens
- **Formato:** PNG com **fundo transparente**.
- **Fundo transparente é obrigatório** (a imagem é recortada num círculo).
- **Enquadramento:** cavalo **centralizado** em cada quadro, com uma pequena
  margem (os cantos ficam de fora do círculo).
- **Peso:** idealmente **< 80 KB** por arquivo (PNG otimizado).

Você pode usar **dois tipos** de imagem (o app detecta sozinho pela proporção):

### a) Estática (mais simples)
- Imagem **quadrada**, ex.: **128×128 px** (96–256 ok).

### b) Animada — sprite sheet de galope (recomendado: 6 quadros)
- Uma **tira horizontal** com **6 poses** do cavalo, lado a lado.
- Cada quadro **quadrado** (ex.: 128×128) → imagem final **768×128 px**.
- Todos os quadros do **mesmo cavalo**, mesmo tamanho/posição, só mudando as
  pernas (ciclo de galope). Espaçamento uniforme, sem moldura entre quadros.
- O app detecta automaticamente: largura ≈ 6× a altura → anima os 6 quadros;
  largura ≈ altura → trata como estática.

## Como funciona
- Cada participante recebe **sempre o mesmo cavalo** (sorteio fixo pelo id).
- Se **nenhuma** imagem existir nesta pasta, o app usa o emoji 🐎 (fallback).
- Depois de adicionar/trocar imagens, **recarregue** o app (e, se o visual não
  atualizar, feche e reabra o PWA — o service worker assume na próxima abertura).

## Exemplo de estrutura
```
icons/horses/horse1.png
icons/horses/horse2.png
icons/horses/horse3.png
```
