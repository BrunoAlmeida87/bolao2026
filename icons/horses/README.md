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
- **Proporção:** **quadrada** (a imagem é recortada num círculo).
- **Tamanho recomendado:** **128×128 px** (pode usar 96×96 ou 256×256). Acima de
  256×256 só aumenta o peso sem ganho visível.
- **Peso:** idealmente **< 50 KB** por arquivo (PNG otimizado).
- **Enquadramento:** deixe o cavalo **centralizado** e com uma pequena margem,
  porque a imagem é recortada num círculo (cantos ficam de fora).

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
