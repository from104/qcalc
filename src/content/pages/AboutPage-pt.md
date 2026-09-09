# Informações do App

Este app foi criado usando vue+quasar+tauri.

Contato: Seo Kihyun <from104@gmail.com>,

Copyright © 2022 Seo Kihyun. Licença MIT.

## Registro de Alterações

Todas as alterações notáveis deste projeto são registradas neste arquivo.

O formato é baseado no [Keep a Changelog] e este projeto segue o [Versionamento Semântico].

## [0.13.3] 2026-09-10

### Corrigido

- Corrigidos os botões da barra de título que não respondiam no Linux desde a 0.13.2
- Corrigida a janela que crescia um pouco a cada início no Linux até atingir o tamanho máximo
- Corrigido o tamanho mínimo e máximo da janela que não se aplicava à área de conteúdo no Linux (e não se aplicava de todo desde a 0.13.2)

## [0.13.2] 2026-09-08

### Alterado

- As cinco calculadoras exibidas como abas também em telas estreitas (sem o menu `▾`)

### Corrigido

- Corrigida a sobreposição da barra de status e da barra de navegação sobre o teclado e a tela [Histórico] no Android 15
- Corrigido o tamanho mínimo da janela diferente quando o monitor não podia ser lido (desktop)
- Corrigida a janela que aparecia brevemente em um local aleatório antes de ir para a posição salva no Windows

## [0.13.1] 2026-08-18

### Alterado

- Nomenclatura do pacote unificada em QCalc (no Windows, remova a entrada antiga "Q Calc" primeiro)

### Adicionado

- APK do Android lançado com cada versão

### Corrigido

- Inicialização do pacote Snap corrigida ([#117](https://github.com/from104/qcalc/issues/117))
- Notificações de atualização das versões 0.12.x agora visíveis (Windows, AppImage)
- Instalador do Windows remove resquícios da compilação anterior
- AppImage no Wayland não sai mais imediatamente (Linux)
- Campo de resultado não destaca incorretamente quando conteúdo cabe
- Escala de texto da área de trabalho aplicada ao tamanho da janela (Linux)
- Rótulos do teclado não transbordam mais os botões
- Requisito de permissão de áudio do Flatpak removido

### Problemas conhecidos

- Leitores de tela não conseguem acessar a interface na versão Flatpak — limitação da sandbox do projeto. Use `.deb`, `.rpm` ou AppImage ([#113](https://github.com/from104/qcalc/issues/113))
- Leitura da área de transferência pode falhar no Linux, então colar na calculadora pode não funcionar

## [0.13.0] 2026-08-09

### Alterado

- Produção de desktop migrada de Electron para Tauri 2
- Atualização automática totalmente ativada no Tauri
- Migração de histórico e integração adicionadas
- Wayland nativo é padrão ([tauri#13749](https://github.com/tauri-apps/tauri/issues/13749) / [tauri#3117](https://github.com/tauri-apps/tauri/issues/3117))
- Tamanho padrão da janela aumentado (352×604 → 480×756)

### Adicionado

- 2 novos idiomas (Português, Russo) totalizando 10
- Anúncio de resultados do leitor de tela no Linux
- Anúncio de erros de fórmula
- Desfazer exclusão de registros
- Acessibilidade de teclado para abas, campo de fórmula e alternância de memória
- Cores de tema com contraste WCAG AA

### Corrigido

- Suporte de leitor de tela melhorado
- Formatação de números por idioma
- Graus da calculadora de fórmulas, classificador de erro e substituição de marcador
- Histórico de registros respeita contagem máxima após restauração
- App de desktop não trava na inicialização
- Melhorias no dimensionamento da janela Tauri/Linux, renderização de texto, ícones, Flatpak e empacotamento Snap
- Páginas de ajuda em Português e Russo agora abrem
- Rótulos de idioma coreano corrigidos

### Problemas conhecidos

- Pacote Snap não inicia ([#117](https://github.com/from104/qcalc/issues/117))
- Leitores de tela não conseguem acessar a interface na versão Flatpak — limitação da sandbox do projeto. Use `.deb`, `.rpm` ou AppImage ([#113](https://github.com/from104/qcalc/issues/113))
- Verificação de leitor de tela Linux incompleta (áudio, hover, área de transferência, CSP)

Para informações sobre versões anteriores, por favor consulte [aqui](https://github.com/from104/qcalc/blob/main/CHANGELOG.md).
