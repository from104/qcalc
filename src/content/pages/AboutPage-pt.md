# Informações do App

Este app foi criado usando vue+quasar+electron.

Contato: Seo Kihyun <from104@gmail.com>,

Copyright © 2022 Seo Kihyun. Licença MIT.

## Registro de Alterações

Todas as alterações notáveis deste projeto são registradas neste arquivo.

O formato é baseado no [Keep a Changelog] e este projeto segue o [Versionamento Semântico].

## [0.12.0] 2026-03-22

### Adicionado

- **Calculadora de Fórmulas (5ª Calculadora)**: Digite e avalie expressões matemáticas diretamente — suporta aritmética, parênteses, funções (`sin`, `cos`, `sqrt`, `log`, `ln`, `abs`, `round`, `nthRoot`, etc.) e constantes (`pi`, `e`, `phi`) via sintaxe [mathjs](https://mathjs.org/).
  - Pressione Espaço para abrir o editor de fórmulas inline para edição direta de expressões.
  - Use `@` para referenciar o valor atual, `$` para o valor armazenado na memória.
  - Suporte completo à memória (MC, MR, MS, M+, M−, M×, M÷) disponível através dos botões de função shift.
  - Os resultados avaliados são salvos no histórico de cálculos com a expressão completa exibida.
  - Menu de ajuda integrado lista todas as funções, constantes e marcadores disponíveis.
- **5 Novos Idiomas (8 no total)**: Chinês (Simplificado), Hindi, Alemão, Espanhol e Francês se juntam aos existentes Coreano, Inglês e Japonês. Todas as telas são traduzidas — menus, configurações, nomes de unidades, nomes de moedas, páginas de ajuda, páginas sobre, dicas e mensagens de erro.
- **Empacotamento Flatpak**: Instale o QCalc pelo Flatpak para suporte mais amplo em desktops Linux.
- **Migração para API Pública Gratuita de Câmbio**: Mudança do FreeCurrencyAPI (requer chave de API) para APIs públicas gratuitas (Frankfurter + fawazahmed0). Suporta 340 moedas (fiduciárias, metais preciosos, criptomoedas) sem necessidade de chave de API. Snapshots de taxas em tempo de compilação permitem conversão de moedas mesmo na primeira execução sem rede.

### Alterado

- **Troca de Idioma Mais Suave**: Se uma tradução estiver ausente, o app agora volta automaticamente para o inglês em vez de mostrar caminhos de chave brutos.
- **Cobertura de Moedas Expandida**: De 170 para 340 moedas — adicionadas principais criptomoedas (ETH, SOL, XRP, etc.), metais preciosos (Paládio, Platina) e moedas históricas. Suporte completo a i18n para todos os 8 idiomas.

Para informações sobre versões anteriores, por favor consulte [aqui](https://github.com/from104/qcalc/blob/main/CHANGELOG.md).
