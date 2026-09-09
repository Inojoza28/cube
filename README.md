# Cubo Timer

Aplicação estática de timer 3×3 e visualização de scrambles. Abra `index.html` no navegador ou sirva a pasta por HTTP. Não há etapa de build. Tailwind, fontes, Three.js e o gerador de scrambles são carregados por CDN.

## Organização MVC

```text
index.html                       Estrutura HTML das views
assets/
  css/
    app.css                      Layout, componentes e estados existentes
    settings.css                 Temas, configurações e card de PR
    resolution-mode.css          Modo resolução e ajuste à altura da tela
  js/
    app.js                       Inicialização dos controllers
    core/namespace.js            Namespace Cubo, sem dependências
    config/                      Tailwind e restauração inicial do tema
    models/                      Validação, regras de domínio e persistência
    views/                       DOM, formatação, controles e cena Three.js
    controllers/                 Eventos e coordenação dos fluxos
    services/scramble-service.js  Worker, geração e fallback de scrambles
imgs/                            Imagens e ícones da aplicação
```

Os models não acessam o DOM. As views não acessam o localStorage. Os controllers coordenam as ações entre essas camadas, mantendo os estados transitórios de preparação, contagem e reprodução. A cena 3D está isolada em `cube-scene-view.js`; regras de movimentos ficam em `cube-model.js`.

Scripts clássicos são carregados em ordem explícita no HTML, usando somente o namespace `Cubo`. Essa escolha mantém a abertura direta por `file://`, sem exigir um servidor para módulos JavaScript. O tema é restaurado no `<head>` antes da primeira renderização; os controllers são inicializados após o HTML.

## Dados locais

- `cubo-embaralhado-times-v1`: histórico de tempos em milissegundos.
- `cubo-embaralhado-settings-v1`: tema, modo resolução (`resolutionMode`), PR atual e objetivo em milissegundos.

As chaves e os formatos existentes foram preservados. O PR é definido pelo usuário e não é substituído automaticamente após uma solve. O aviso de novo PR compara os tempos na precisão exibida pelo timer.

O modo resolução vem desativado e afeta apenas a aba Timer. Oculta o cabeçalho, mantém as abas e posiciona a mesma ação de Configurações no canto da janela. A composição ocupa a altura disponível, com rolagem interna de conteúdo quando necessária em telas pequenas. Os estados de preparação, contagem e resultado mantêm sua apresentação original. A aba Cubo usa o layout normal mesmo com a preferência ativada.

## Verificação manual

1. Troque entre Light, Black e Blue e recarregue a página.
2. Configure PR e objetivo, experimente entradas inválidas e apague os dois valores para ocultar o card.
3. Edite o objetivo pelo ícone do card e feche o modal com Escape; o foco retorna à ação de origem.
4. Segure Espaço até o verde, solte, finalize e salve ou reinicie. Verifique que somente tempos melhores que o PR geram o aviso.
5. Aplique um scramble no cubo e confira sequência automática, velocidade, pausa, continuação, passo a passo e rotação.
6. Confira o card e as configurações em celular e desktop.

Nenhum arquivo de teste é necessário para executar a aplicação.
