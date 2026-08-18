# Informações do App

Este app foi criado usando vue+quasar+tauri.

Contato: Seo Kihyun <from104@gmail.com>,

Copyright © 2022 Seo Kihyun. Licença MIT.

## Registro de Alterações

Todas as alterações notáveis deste projeto são registradas neste arquivo.

O formato é baseado no [Keep a Changelog] e este projeto segue o [Versionamento Semântico].

## [0.13.1] 2026-08-18

### Alterado

- **Nome do pacote unificado como QCalc**: se você instalou a 0.13.0 no Windows, desinstale antes a entrada antiga "Q Calc" — a nova versão não reconhece aquela instalação.

### Adicionado

- **APK do Android em todas as versões**: agora ele é compilado, assinado e anexado automaticamente.

### Corrigido

- **O pacote Snap abre**: o Snap da 0.13.0 executava o programa errado e o app nunca abria.
- **As atualizações voltam a chegar à 0.12.x (Windows, AppImage)**: essas instalações falhavam em toda verificação e nunca ficavam sabendo que havia uma versão mais nova.
- **Instalar no Windows remove o app antigo**: instalar por cima da 0.12.x deixava os arquivos dele e a entrada em Aplicativos e recursos.
- **A AppImage não fecha mais logo ao iniciar no Wayland (Linux)**.
- **Tamanhos no Linux**: a janela passa a seguir a escala de texto da área de trabalho em vez de ampliar tudo, e os rótulos do teclado ficam dentro dos botões.

## [0.13.0] 2026-08-09

### Alterado

- **App de desktop migrado do Electron para o Tauri 2**: um app de desktop mais leve e rápido. É distribuído como deb, rpm, AppImage, Flatpak e Snap no Linux e como instalador NSIS no Windows, com atualização automática totalmente funcional na nova base.
- **Migração do Histórico**: Exporte seu histórico de cálculos da versão anterior (Electron) e importe-o na tela de primeira execução da nova versão.
- **Janela Padrão Maior**: O tamanho padrão e mínimo da janela aumentou para 480×756.

### Adicionado

- **Leitura dos Resultados pelo Leitor de Tela (Linux)**: Quando um cálculo é concluído, o resultado é lido em voz alta pelo leitor de tela (Orca).
- **Anúncio de Erros de Fórmula**: Os erros de fórmula são classificados por tipo e anunciados pelo leitor de tela.
- **Desfazer Exclusão de Registro**: A exclusão de um registro do histórico pode ser desfeita por uma snackbar.
- **Acessibilidade por Teclado Aprimorada**: O menu de abas excedentes, o campo de fórmula e o alternador de memória são totalmente operáveis pelo teclado.
- **Temas com Maior Contraste**: As cores dos temas foram elevadas ao contraste WCAG AA.
- **Novos Idiomas (10 no total)**: Adicionados Português e Russo.

### Corrigido

- Exibição e colagem de números conforme o local, unificação em graus das funções trigonométricas da calculadora de fórmulas e muitas outras correções de acessibilidade e tradução.

Para informações sobre versões anteriores, por favor consulte [aqui](https://github.com/from104/qcalc/blob/main/CHANGELOG.md).
