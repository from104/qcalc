# QCalc - Uma Calculadora Multifuncional para Produtividade e Acessibilidade

Cálculos de alta precisão, conversão de unidades/moedas/bases numéricas e avaliação de fórmulas em um só app. Uma calculadora multifuncional com experiência consistente em desktop e dispositivos móveis.

## Principais Recursos do App

- **5 Calculadoras Profissionais**: Calculadora padrão, conversor de unidades, conversor de moedas, calculadora para programadores e calculadora de fórmulas atendem todas as suas necessidades de cálculo
- **Motor de Cálculo de Alta Precisão**: Suporta cálculos precisos de até 64 dígitos com funções matemáticas avançadas como trigonometria, fatorial e potências
- **Bases Numéricas e Operações de Bits**: Converte entre binário/octal/decimal/hexadecimal e suporta operações profissionais de bits (AND, OR, XOR, NOT) para programadores
- **Experiência de Usuário Inteligente**: Oferece ambiente personalizado com favoritos de unidades/moedas, vários temas de cores, e notas no histórico de cálculos com exportação/importação
- **Suporte Multiplataforma**: Oferece experiência consistente no Windows, desktop Linux e Android móvel com suporte a atualização automática
- **Design Focado em Acessibilidade**: Continuamente aprimorado para fácil acesso por todos os usuários com atalhos de teclado, feedback háptico e layouts adaptativos
- **Gerenciamento de Configurações**: Exporte ou importe todas as configurações para um arquivo para manter as mesmas configurações em diferentes ambientes

## Guia dos Principais Recursos

### Como Usar as 5 Calculadoras

#### Calculadora Padrão

- **Como Acessar**: Ctrl+1 ou selecione a aba superior
- **Operações Básicas**: Insira números 0-9, teclas +, -, \*, /
- **Funções Avançadas**: Funções trigonométricas (q, w, e), quadrado (u), raiz quadrada (i), constantes (z: π, x: φ, c: e)
- **Funções de Memória**: Ctrl+Enter (MS), Ctrl+Backspace (MR), Ctrl+Delete (MC)
- **Cálculo de Porcentagem**: 'número, /, número, %(k)' calcula porcentagem
- **Aplicar Porcentagem**: 'número, \*, número, %(k)' aplica porcentagem

#### Conversor de Unidades

- **Como Acessar**: Ctrl+2 ou selecione a aba superior
- **Categorias de Conversão**: Mais de 15 categorias incluindo comprimento, área, volume, peso, ângulo, etc.
- **Favoritos**: Defina unidades usadas frequentemente como favoritos para acesso rápido
- **Trocar Unidades**: Use a tecla '\' para trocar unidades de origem/destino
- **Conversão Rápida**: ×10/×100/×1000 (a/s/d), ÷10/÷100/÷1000 (z/x/c)
- **Símbolo da Unidade**: Alternar exibição/ocultação do símbolo da unidade com a tecla Alt+\

#### Conversor de Moedas

- **Como Acessar**: Ctrl+3 ou selecione a aba superior
- **340 Moedas**: Fiduciárias, criptomoedas e metais preciosos — sem necessidade de chave de API
- **Taxas de Câmbio Atualizadas**: Taxas em tempo real (snapshot integrado usado quando offline)
- **Favoritos**: Defina moedas usadas frequentemente como favoritos para acesso rápido
- **Cálculo Rápido**: +5/+10/+100 (f/g/h), -5/-10/-100 (q/w/e)
- **Trocar Moedas**: Use a tecla '\' para trocar moedas de origem/destino
- **Símbolo da Moeda**: Alternar exibição/ocultação do símbolo da moeda com a tecla Alt+\

#### Calculadora para Programadores

- **Como Acessar**: Ctrl+4 ou selecione a aba superior
- **Bases Suportadas**: Converta entre binário, octal, decimal e hexadecimal
- **Entrada Hexadecimal**: Insira A-F usando as teclas z, x, c, a, s, d
- **Trocar Bases**: Use a tecla '\' para trocar bases de origem/destino
- **Símbolo da Base**: Alternar exibição/ocultação do símbolo da base com a tecla Alt+\
- **Posição do Símbolo**: Alternar posição do símbolo (frente/trás) com a tecla Alt+Ctrl+\

#### Calculadora de Fórmulas

- **Como Acessar**: Ctrl+5 ou selecione a aba superior
- **Entrada de Expressão**: Insira expressões matemáticas diretamente usando sintaxe mathjs
- **Operações Suportadas**: Todas as funções matemáticas do mathjs incluindo aritmética, potências, trigonometria, logaritmos
- **Referência ao Valor Atual**: Use o símbolo @ para incluir o valor calculado atual nas expressões
- **Funções de Memória**: Ctrl+Enter (MS), Ctrl+Backspace (MR), Ctrl+Delete (MC)
- **Modo de Edição**: Pressione Espaço ou Enter (quando vazio) para entrar, Esc para limpar e sair
- **Navegação no Histórico**: Use as teclas ↑/↓ no modo de edição para navegar por expressões anteriores, reinicia automaticamente ao editar
- **Carregar Expressão**: Clique com o botão direito em um registro de fórmula → "Carregar no campo de fórmula" para reutilizar expressões

### Como Usar os Recursos de Produtividade

#### Gerenciamento do Histórico de Cálculos

- **Como Acessar**: Tecla F4 ou menu lateral
- **Rolagem**: Mover 50px com teclas ↑/↓, 400px com Page Up/Down
- **Pesquisar/Excluir**: Pesquisar com Ctrl+F, excluir histórico com Ctrl+D
- **Exportar/Importar**: Exportar ou importar histórico de cálculos como arquivo CSV através dos botões no cabeçalho
- **Controle do Tamanho da Fonte**: Ajuste o tamanho da fonte em 3 níveis com os botões no canto inferior esquerdo.
- **Adicionar Notas**: Adicione notas a registros individuais
- **Deslizar para Esquerda (Celular)**: Adicionar/editar notas
- **Deslizar para Direita (Celular)**: Excluir registros

#### Gerenciamento de Configurações

- **Como Acessar**: Tecla F3 ou menu lateral
- **Redefinir**: Redefinir todas as configurações para os valores padrão
- **Exportar/Importar**: Salvar ou carregar configurações atuais como arquivo JSON para usar as mesmas configurações em diferentes ambientes

#### Configurações de Exibição Numérica

- **Aplicar Formato Numérico por Calculadora**: Alternar com a tecla Alt+n
- **Mostrar/Ocultar Separador**: Alternar com a tecla ,
- **Definir Unidade de Agrupamento**: Alternar entre 3/4 dígitos com a tecla Alt+,
- **Casas Decimais**: Ajustar com as teclas [, ] (ilimitado~16 dígitos)

#### Usando Atalhos

- **Modo Shift**: Ativar com a tecla ' para acessar funções avançadas
- **Navegação por Abas**: Mover entre abas com Ctrl+Tab (→), Ctrl+Shift+Tab (←)
- **Troca de Tela**: F1 (Ajuda), F2 (Sobre), F3 (Configurações), F4 (Histórico), F5 (Dicas)

#### Copiar e Colar

- **Copiar Painel Principal**: Ctrl+C, Ctrl+Insert
- **Copiar Painel Secundário**: Shift+Ctrl+C, Alt+Ctrl+Insert
- **Colar no Painel Principal**: Ctrl+V, Shift+Insert
- **Colar no Painel Secundário**: Shift+Ctrl+V, Alt+Shift+Insert
- **Abrir Menu**: Clique no painel e use o menu para copiar/colar

### **Dicas para Ferramentas Avançadas**

#### Funções Matemáticas

- **Enésima Potência/Enésima Raiz**: Calcular com as teclas r/t
- **Funções Trigonométricas**: Teclas q/w/e no modo shift
- **Extrair Parte Inteira/Decimal**: Calcular com as teclas v/b
- **Fatorial**: Calcular com a tecla h

#### Usando a Memória

- **Armazenar e Recuperar Memória**: Armazenar (MS) e recuperar (MR) após o cálculo
- **Cálculo com Memória**: Acumular valores com funções M+, M-, M×, M÷
- **Limpar Memória**: Limpar memória com MC
- **Status da Memória**: Clique no ícone de memória no painel principal

#### Usando Operações de Bits

- **Operações de Bits**: AND (j), OR (k), XOR (l), NOT (h), operações de deslocamento (r/t/u/i)
- **Extensão Lógica**: Use operações NAND/NOR/XNOR com as teclas q/w/e
- **Operações de Deslocamento**: Mover posições de bits em 1 bit/4 bits
- **Definir Tamanho de Bits**: Operações de bits de acordo com o tamanho definido

### **Otimizando a Experiência do Usuário**

#### Layout da Tela

- **Sistema de Temas**: Escolha entre vários temas de cores além do modo escuro/claro (alterar em Configurações F3)
- **Sempre no Topo**: Alternar sempre no topo com a tecla Alt+t
- **Redimensionar Janela**: O painel lateral se ajusta automaticamente com base no tamanho da janela
- **Redefinir Painel**: Alternar redefinição do painel na inicialização com a tecla Alt+i
- **(Des)ativar Modo Escuro**: Alternar modo escuro com a tecla Alt+d
- **Aplicar Formato Numérico por Calculadora**: Alternar formato numérico por calculadora com a tecla Alt+n

#### Suporte Móvel

- **Deslizar**: Alternar modos de calculadora deslizando para esquerda ou direita
- **(Des)ativar Modo Háptico**: Alternar modo háptico com a tecla Alt+p
- **Modo Paisagem em Tablet**: O painel lateral se ajusta automaticamente no modo paisagem do tablet

## Teclas de Atalho (S: Shift, C: Control, A: Alt)

### Calculadora Básica e Funções Comuns

| Atalho      | Função                    |
| ----------- | ------------------------- |
| 0-9.        | Inserir números e decimal |
| +, -, \*, / | Aritmética básica         |
| Enter, =    | Calcular resultado        |
| Backspace   | Apagar um caractere       |
| Delete      | Redefinir calculadora     |
| u           | Quadrado (x²)             |
| i           | Raiz quadrada (√x)        |
| j           | Trocar sinal (±)          |
| k, %        | Porcentagem (%)           |
| l           | Recíproco (1/x)           |
| '           | Ativar modo shift         |

### Funções Matemáticas Avançadas (Modo Shift)

| Atalho | Função                       |
| ------ | ---------------------------- |
| r      | Potência (xⁿ)                |
| t      | Raiz (ⁿ√x)                   |
| f      | Potência de 10 (10ⁿ)         |
| g      | Módulo (x%y)                 |
| h      | Fatorial (x!)                |
| q,w,e  | Trig (sin, cos, tan)         |
| a,s,d  | Constantes (Pi/2, ln10, ln2) |
| z,x,c  | Constantes (Pi, phi, e)      |
| v      | Parte inteira                |
| b      | Parte fracionária            |

### Operações de Memória

| Atalho          | Função                   |
| --------------- | ------------------------ |
| C-Delete        | Limpar memória (MC)      |
| C-Backspace     | Recuperar memória (MR)   |
| C-Enter, C-=    | Armazenar memória (MS)   |
| C-+, C-Numpad + | Adicionar à memória (M+) |
| C--, C-Numpad - | Subtrair da memória (M-) |
| C-_, C-Numpad _ | Multiplicar memória (M×) |
| C-/, C-Numpad / | Dividir memória (M÷)     |

### Modo de Conversão de Unidades/Moedas (Modo Shift)

| Atalho | Função                             |
| ------ | ---------------------------------- |
| f,g,h  | ×2/×3/×5 ou +5/+10/+100            |
| q,w,e  | ÷2/÷3/÷5 ou -5/-10/-100            |
| a,s,d  | ×10/×100/×1000                     |
| z,x,c  | ÷10/÷100/÷1000                     |
| \      | Trocar origem e destino            |
| A-\    | Alternar exibição de unidade/moeda |

### Modo Conversor de Bases

| Atalho | Função                              |
| ------ | ----------------------------------- |
| r,t    | Deslocamento de 1 bit (x<<1, x>>1)  |
| u,i    | Deslocamento esq./dir. (x<<y, x>>y) |
| f,g    | Deslocamento de 4 bits (x<<4, x>>4) |
| h      | Operação NOT                        |
| j,k,l  | Operações de bits (AND, OR, XOR)    |
| q,w,e  | NAND, NOR, XNOR                     |
| z,x,c  | Entrada hexadecimal (A, B, C)       |
| a,s,d  | Entrada hexadecimal (D, E, F)       |
| \      | Trocar origem e destino             |
| A-\    | Alternar exibição de base           |
| AC-\   | Alternar posição da base (pré/pós)  |

### Calculadora de Fórmulas (Modo de Edição)

| Atalho | Função                                         |
| ------ | ---------------------------------------------- |
| Espaço | Entrar no modo de edição                       |
| Enter  | Avaliar (ou entrar no modo de edição se vazio) |
| Escape | Limpar expressão e sair do modo de edição      |
| ↑/↓    | Navegar pelo histórico de expressões           |
| =      | Avaliar expressão                              |

### Navegação de Tela e Controle da Interface

| Atalho    | Função                       |
| --------- | ---------------------------- |
| F1        | Ajuda                        |
| F2        | Sobre                        |
| F3        | Configurações                |
| F4        | Histórico                    |
| F5        | Dicas                        |
| C-[12345] | Alternar abas da calculadora |
| C-Tab, →  | Mover para aba à direita     |
| CS-Tab, ← | Mover para aba à esquerda    |
| Escape    | Fechar tela atual            |

### Configurações da Interface

| Atalho | Função                                       |
| ------ | -------------------------------------------- |
| A-t    | Alternar sempre no topo                      |
| A-i    | Alternar inicializar painel na inicialização |
| A-d    | Alternar modo escuro                         |
| A-p    | Alternar modo háptico                        |
| A-n    | Alternar formato numérico por calculadora    |
| ;      | Alternar funções extras dos botões           |
| ,      | Alternar agrupamento numérico                |
| A-,    | Alterar unidade de agrupamento (3/4)         |
| [, ]   | Ajustar casas decimais (∞~16)                |
| q      | Sair do aplicativo                           |

### Operações da Área de Transferência

| Atalho          | Função                                |
| --------------- | ------------------------------------- |
| C-c, C-Insert   | Copiar resultado do painel principal  |
| SC-c, AC-Insert | Copiar resultado do painel secundário |
| C-v, S-Insert   | Colar no painel principal             |
| SC-v, AS-Insert | Colar no painel secundário            |

### Navegação no Histórico

| Atalho          | Função                      |
| --------------- | --------------------------- |
| ↑/↓             | Rolar 50px para cima/baixo  |
| PageUp/PageDown | Rolar 400px para cima/baixo |
| Home/End        | Rolar para o topo/final     |
| C-f             | Pesquisar histórico         |
| C-[             | Diminuir tamanho da fonte   |
| C-]             | Aumentar tamanho da fonte   |
