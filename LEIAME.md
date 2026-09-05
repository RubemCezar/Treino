# Treino — como publicar no GitHub Pages

Os arquivos desta pasta funcionam juntos. Mantenha todos no mesmo lugar.

- `index.html` — o app inteiro
- `sw.js` — faz funcionar sem internet
- `manifest.webmanifest` — nome e ícone quando fixado na tela inicial
- `icon-192.png`, `icon-512.png`, `icon-maskable.png` — ícones

## Publicar (uma vez só)

1. Crie um repositório novo no GitHub, por exemplo `treino`. Pode ser público.
2. Em **Add file → Upload files**, arraste todos os arquivos desta pasta e confirme.
3. Vá em **Settings → Pages**. Em *Source*, escolha `Deploy from a branch`, branch `main`, pasta `/ (root)`. Salve.
4. Em um ou dois minutos o endereço aparece nessa mesma tela: `https://SEU-USUARIO.github.io/treino/`.

## Instalar no celular

1. Abra esse endereço no celular.
2. Android/Chrome: menu **⋮ → Adicionar à tela inicial**.
   iPhone/Safari: botão de compartilhar → **Adicionar à Tela de Início**.
3. Abra pelo ícone. A partir daí funciona sem internet.

## Atualizar o app depois

Suba o `index.html` novo por cima (Upload files no mesmo repositório). Ao abrir o app com internet, a versão nova entra sozinha. **Os treinos registrados continuam**, porque ficam guardados pelo endereço do site, não pelo arquivo.

Se mudar o `sw.js`, troque também a linha `const V = "treino-v1"` para `"treino-v2"`, senão o navegador continua servindo a versão antiga.

## Importante

O endereço é público, mas os seus dados não: eles nunca saem do seu aparelho. Quem abrir o link vê um app vazio.

Como não há servidor guardando nada, o backup é seu: no app, aba **Histórico → Copiar backup**, e guarde o texto em algum lugar seu.
