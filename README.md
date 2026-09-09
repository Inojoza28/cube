<div align="center">
<img src="imgs/cube.png" alt="Cubo mágico 3D" width="140" />

# Cubo Timer

Timer minimalista para treinar solves de cubo mágico 3×3.

<p>
<img src="https://img.shields.io/badge/HTML5-e34f26?style=flat-square&logo=html5&logoColor=white" alt="HTML5">
    <img src="https://img.shields.io/badge/CSS3-1572b6?style=flat-square&logo=css3&logoColor=white" alt="CSS3">
    <img src="https://img.shields.io/badge/JavaScript-f7df1e?style=flat-square&logo=javascript&logoColor=111827" alt="JavaScript">
    <img src="https://img.shields.io/badge/Three.js-111827?style=flat-square&logo=threedotjs&logoColor=white" alt="Three.js">
  </p>
</div>

## ✨ Recursos

- ⏱️ Timer WCA para solves 3×3;

- 🔀 Geração e cópia de scrambles;

- 🧊 Visualização 3D interativa do cubo;

- ▶️ Modo sequência e passo a passo;

- 📊 Histórico de tempos, melhor tempo e média de 5;

- 🎯 Recorde pessoal e objetivo de tempo;

- 🎨 Temas Light, Black e Blue;

- 💾 Dados salvos localmente no navegador.

## 🚀 Como usar

Abra [`index.html`](index.html) no navegador.

Não há instalação, dependências locais ou etapa de build. O projeto utiliza apenas **HTML, CSS e JavaScript**, com algumas bibliotecas carregadas por CDN.

## 🎮 Controles

| Ação | Como fazer |
| --- | --- |
| Preparar o timer | Segure `Espaço` |
| Iniciar a solve | Solte `Espaço` |
| Girar o cubo | Arraste sobre o cubo 3D |
| Copiar o scramble | Clique no ícone de copiar |
| Fechar configurações | Clique em fechar ou pressione `Esc` |

## 🗂️ Estrutura

```
.
├── index.html
├── imgs/
│   └── cube.png
└── assets/
    ├── css/
    │   ├── app.css
    │   ├── settings.css
    │   ├── resolution-mode.css
    │   ├── cube-return.css
    │   └── pr-confirm.css
    └── js/
        ├── app.js
        ├── core/
        ├── config/
        ├── models/
        ├── views/
        ├── controllers/
        └── services/
```

A aplicação segue uma organização inspirada em **MVC**:

- **Models:** regras de negócio, validação e persistência;

- **Views:** interface, controles e cena 3D;

- **Controllers:** eventos e coordenação dos fluxos;

- **Services:** geração de scrambles.

## 💾 Dados locais

Os tempos e as configurações ficam no `localStorage` do navegador. A aplicação não possui backend e não exige conta.

| Chave | Conteúdo |
| --- | --- |
| `cubo-embaralhado-times-v1` | Histórico de tempos |
| `cubo-embaralhado-settings-v1` | Tema, PR, objetivo e modo resolução |

## 🧪 Verificação rápida

- [ ] Alternar entre os três temas;

- [ ] Iniciar, finalizar e salvar uma solve;

- [ ] Gerar, copiar e aplicar um scramble;

- [ ] Testar sequência automática e passo a passo;

- [ ] Girar o cubo livremente;

- [ ] Conferir histórico, PR e objetivo em diferentes tamanhos de tela.

## 🤝 Contribuição

Sugestões e melhorias são bem-vindas. Abra uma *issue* ou envie um Pull Request descrevendo sua alteração.

<div align="center">
<sub>Treine com foco. Melhore a cada solve.</sub>
</div>
