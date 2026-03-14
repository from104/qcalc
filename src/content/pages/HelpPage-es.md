# QCalc - Una Calculadora Multipropósito para Productividad y Accesibilidad

Cálculos de alta precisión, conversión de unidades/divisas/bases numéricas y evaluación de fórmulas en una sola aplicación. Una calculadora multipropósito con una experiencia consistente en escritorio y móvil.

## Características Principales de la Aplicación

- **5 Calculadoras Profesionales**: Calculadora estándar, conversor de unidades, conversor de divisas, calculadora para programadores y calculadora de fórmulas cubren todas sus necesidades de cálculo
- **Motor de Cálculo de Alta Precisión**: Soporta cálculos precisos de hasta 64 dígitos con funciones matemáticas avanzadas como trigonometría, factorial y potencias
- **Bases Numéricas y Operaciones de Bits**: Convierte entre binario/octal/decimal/hexadecimal y soporta operaciones de bits profesionales (AND, OR, XOR, NOT) para programadores
- **Experiencia de Usuario Inteligente**: Proporciona un entorno personalizado con favoritos de unidades/divisas, varios temas de colores, y notas del historial de cálculos con exportación/importación
- **Soporte Multiplataforma**: Ofrece una experiencia consistente en Windows, escritorio Linux y móvil Android con soporte de actualización automática
- **Diseño Centrado en la Accesibilidad**: Mejora continua para fácil acceso por todos los usuarios con atajos de teclado, retroalimentación háptica y diseños adaptativos
- **Gestión de Configuración**: Exporte o importe todas las configuraciones a un archivo para mantener la misma configuración en diferentes entornos

## Guía de Características Principales

### Cómo Usar las 5 Calculadoras

#### Calculadora Estándar

- **Cómo Acceder**: Ctrl+1 o seleccione la pestaña superior
- **Operaciones Básicas**: Introduzca números 0-9, +, -, \*, / teclas
- **Funciones Avanzadas**: Funciones trigonométricas (q, w, e), cuadrado (u), raíz cuadrada (i), constantes (z: π, x: φ, c: e)
- **Funciones de Memoria**: Ctrl+Enter (MS), Ctrl+Backspace (MR), Ctrl+Delete (MC)
- **Cálculo de Porcentaje**: 'número, /, número, %(k)' calcula el porcentaje
- **Aplicar Porcentaje**: 'número, \*, número, %(k)' aplica el porcentaje

#### Conversor de Unidades

- **Cómo Acceder**: Ctrl+2 o seleccione la pestaña superior
- **Categorías de Conversión**: Más de 15 categorías incluyendo longitud, área, volumen, peso, ángulo, etc.
- **Favoritos**: Establezca las unidades de uso frecuente como favoritos para acceso rápido
- **Intercambiar Unidades**: Use la tecla '\' para intercambiar unidades de origen/destino
- **Conversión Rápida**: ×10/×100/×1000 (a/s/d), ÷10/÷100/÷1000 (z/x/c)
- **Símbolo de Unidad**: Alternar la visualización/ocultación del símbolo de unidad con la tecla Alt+\

#### Conversor de Divisas

- **Cómo Acceder**: Ctrl+3 o seleccione la pestaña superior
- **Últimos Tipos de Cambio**: Refleja información de tipos de cambio en tiempo real
- **Favoritos**: Establezca las divisas de uso frecuente como favoritos para acceso rápido
- **Cálculo Rápido**: +5/+10/+100 (f/g/h), -5/-10/-100 (q/w/e)
- **Intercambiar Divisas**: Use la tecla '\' para intercambiar divisas de origen/destino
- **Símbolo de Divisa**: Alternar la visualización/ocultación del símbolo de divisa con la tecla Alt+\

#### Calculadora para Programadores

- **Cómo Acceder**: Ctrl+4 o seleccione la pestaña superior
- **Bases Soportadas**: Convierte entre binario, octal, decimal y hexadecimal
- **Entrada Hexadecimal**: Introduzca A-F usando las teclas z, x, c, a, s, d
- **Intercambiar Bases**: Use la tecla '\' para intercambiar bases de origen/destino
- **Símbolo de Base**: Alternar la visualización/ocultación del símbolo de unidad con la tecla Alt+\
- **Posición del Símbolo**: Alternar la posición del símbolo de unidad (delante/detrás) con la tecla Alt+Ctrl+\

#### Calculadora de Fórmulas

- **Cómo Acceder**: Ctrl+5 o seleccione la pestaña superior
- **Entrada de Expresiones**: Introduzca expresiones matemáticas directamente usando la sintaxis de mathjs
- **Operaciones Soportadas**: Todas las funciones matemáticas de mathjs incluyendo aritmética, potencias, trigonometría, logaritmos
- **Referencia al Valor Actual**: Use el símbolo @ para incluir el valor calculado actual en las expresiones
- **Funciones de Memoria**: Ctrl+Enter (MS), Ctrl+Backspace (MR), Ctrl+Delete (MC)

### Cómo Usar las Funciones de Productividad

#### Gestión del Historial de Cálculos

- **Cómo Acceder**: Tecla F4 o menú lateral
- **Desplazamiento**: Mueva 50px con las teclas ↑/↓, 400px con Page Up/Down
- **Buscar/Eliminar**: Buscar con Ctrl+F, eliminar historial con Ctrl+D
- **Exportar/Importar**: Exporte o importe el historial de cálculos como archivo CSV a través de los botones en el encabezado
- **Control de Tamaño de Fuente**: Ajuste el tamaño de fuente en 3 niveles con los botones en la esquina inferior izquierda.
- **Añadir Notas**: Añada notas a registros individuales
- **Deslizar a la Izquierda (Móvil)**: Añadir/editar notas
- **Deslizar a la Derecha (Móvil)**: Eliminar registros

#### Gestión de Configuración

- **Cómo Acceder**: Tecla F3 o menú lateral
- **Restablecer**: Restablezca todas las configuraciones a sus valores predeterminados
- **Exportar/Importar**: Guarde o cargue la configuración actual como archivo JSON para usar la misma configuración en diferentes entornos

#### Configuración de Visualización de Números

- **Aplicar Formato de Números Por Calculadora**: Alternar con la tecla Alt+n
- **Mostrar/Ocultar Separador**: Alternar con la tecla ,
- **Establecer Unidad de Agrupación**: Cambiar entre 3/4 dígitos con la tecla Alt+,
- **Lugares Decimales**: Ajustar con las teclas [, ] (ilimitado~16 dígitos)

#### Uso de Atajos de Teclado

- **Modo Shift**: Activar con la tecla ' para acceder a funciones avanzadas
- **Navegación de Pestañas**: Moverse entre pestañas con Ctrl+Tab (→), Ctrl+Shift+Tab (←)
- **Cambio de Pantalla**: F1 (Ayuda), F2 (Información), F3 (Configuración), F4 (Historial), F5 (Consejos)

#### Copiar y Pegar

- **Copiar Panel Principal**: Ctrl+C, Ctrl+Insert
- **Copiar Panel Secundario**: Shift+Ctrl+C, Alt+Ctrl+Insert
- **Pegar en Panel Principal**: Ctrl+V, Shift+Insert
- **Pegar en Panel Secundario**: Shift+Ctrl+V, Alt+Shift+Insert
- **Abrir Menú**: Haga clic en el panel y use el menú para copiar/pegar

### **Consejos para Herramientas Avanzadas**

#### Funciones Matemáticas

- **Potencia N/Raíz N**: Calcular con las teclas r/t
- **Funciones Trigonométricas**: Teclas q/w/e en modo shift
- **Extraer Parte Entera/Decimal**: Calcular con las teclas v/b
- **Factorial**: Calcular con la tecla h

#### Uso de Memoria

- **Almacenar y Recuperar Memoria**: Almacenar (MS) y recuperar (MR) después del cálculo
- **Cálculo con Memoria**: Acumular valores con las funciones M+, M-, M×, M÷
- **Borrar Memoria**: Borrar memoria con MC
- **Estado de Memoria**: Haga clic en el icono de memoria en el panel principal

#### Uso de Operaciones de Bits

- **Operaciones de Bits**: AND (j), OR (k), XOR (l), NOT (h), operaciones de desplazamiento (r/t/u/i)
- **Extensión Lógica**: Use las operaciones NAND/NOR/XNOR con las teclas q/w/e
- **Operaciones de Desplazamiento**: Mover posiciones de bits en 1 bit/4 bits
- **Establecer Tamaño de Bits**: Operaciones de bits según el tamaño establecido

### **Optimización de la Experiencia de Usuario**

#### Disposición de Pantalla

- **Sistema de Temas**: Elija entre varios temas de colores más allá del modo oscuro/claro (cambiar en F3 Configuración)
- **Siempre Visible**: Alternar siempre visible con la tecla Alt+t
- **Redimensionar Ventana**: El panel lateral se ajusta automáticamente según el tamaño de la ventana
- **Restablecer Panel**: Alternar el restablecimiento del panel al inicio con la tecla Alt+i
- **(Des)activar Modo Oscuro**: Cambiar el modo oscuro con la tecla Alt+d
- **Aplicar Formato de Números Por Calculadora**: Alternar formato de números por calculadora con la tecla Alt+n

#### Soporte Móvil

- **Deslizar**: Cambiar modos de calculadora deslizando hacia la izquierda o derecha
- **(Des)activar Modo Háptico**: Alternar el modo háptico con la tecla Alt+p
- **Modo Horizontal en Tablet**: El panel lateral se ajusta automáticamente en modo horizontal de tablet

## Teclas de Atajo (S: Shift, C: Control, A: Alt)

### Calculadora Básica y Funciones Comunes

| Atajo       | Función                            |
| ----------- | ---------------------------------- |
| 0-9.        | Introducir números y punto decimal |
| +, -, \*, / | Aritmética básica                  |
| Enter, =    | Calcular resultado                 |
| Backspace   | Eliminar un carácter               |
| Delete      | Restablecer calculadora            |
| u           | Cuadrado (x²)                      |
| i           | Raíz cuadrada (√x)                 |
| j           | Cambiar signo (±)                  |
| k, %        | Porcentaje (%)                     |
| l           | Recíproco (1/x)                    |
| '           | Activar modo shift                 |

### Funciones Matemáticas Avanzadas (Modo Shift)

| Atajo | Función                      |
| ----- | ---------------------------- |
| r     | Potencia (xⁿ)                |
| t     | Raíz (ⁿ√x)                   |
| f     | Potencia de 10 (10ⁿ)         |
| g     | Módulo (x%y)                 |
| h     | Factorial (x!)               |
| q,w,e | Trig (sin, cos, tan)         |
| a,s,d | Constantes (Pi/2, ln10, ln2) |
| z,x,c | Constantes (Pi, phi, e)      |
| v     | Parte entera                 |
| b     | Parte fraccionaria           |

### Operaciones de Memoria

| Atajo           | Función                  |
| --------------- | ------------------------ |
| C-Delete        | Borrar memoria (MC)      |
| C-Backspace     | Recuperar memoria (MR)   |
| C-Enter, C-=    | Almacenar memoria (MS)   |
| C-+, C-Numpad + | Sumar a memoria (M+)     |
| C--, C-Numpad - | Restar de memoria (M-)   |
| C-_, C-Numpad _ | Multiplicar memoria (M×) |
| C-/, C-Numpad / | Dividir memoria (M÷)     |

### Modo de Conversión de Unidades/Divisas (Modo Shift)

| Atajo | Función                              |
| ----- | ------------------------------------ |
| f,g,h | ×2/×3/×5 o +5/+10/+100               |
| q,w,e | ÷2/÷3/÷5 o -5/-10/-100               |
| a,s,d | ×10/×100/×1000                       |
| z,x,c | ÷10/÷100/÷1000                       |
| \     | Intercambiar origen y destino        |
| A-\   | Alternar visualización unidad/divisa |

### Modo Conversor de Bases Numéricas

| Atajo | Función                               |
| ----- | ------------------------------------- |
| r,t   | Desplazamiento de 1 bit (x<<1, x>>1)  |
| u,i   | Desplazamiento izq./der. (x<<y, x>>y) |
| f,g   | Desplazamiento de 4 bits (x<<4, x>>4) |
| h     | Operación NOT                         |
| j,k,l | Operaciones de bits (AND, OR, XOR)    |
| q,w,e | NAND, NOR, XNOR                       |
| z,x,c | Entrada hexadecimal (A, B, C)         |
| a,s,d | Entrada hexadecimal (D, E, F)         |
| \     | Intercambiar origen y destino         |
| A-\   | Alternar visualización de base        |
| AC-\  | Alternar posición de base (pre/post)  |

### Navegación de Pantalla y Control de Interfaz

| Atajo     | Función                         |
| --------- | ------------------------------- |
| F1        | Ayuda                           |
| F2        | Acerca de                       |
| F3        | Configuración                   |
| F4        | Historial                       |
| F5        | Consejos                        |
| C-[12345] | Cambiar pestañas de calculadora |
| C-Tab, →  | Mover a pestaña derecha         |
| CS-Tab, ← | Mover a pestaña izquierda       |
| Escape    | Cerrar pantalla actual          |

### Configuración de Interfaz

| Atajo | Función                                     |
| ----- | ------------------------------------------- |
| A-t   | Alternar siempre visible                    |
| A-i   | Alternar iniciar panel al inicio            |
| A-d   | Alternar modo oscuro                        |
| A-p   | Alternar modo háptico                       |
| A-n   | Alternar formato de números por calculadora |
| ;     | Alternar funciones de botones adicionales   |
| ,     | Alternar agrupación de números              |
| A-,   | Cambiar unidad de agrupación (3/4)          |
| [, ]  | Ajustar lugares decimales (∞~16)            |
| q     | Salir de la aplicación                      |

### Operaciones del Portapapeles

| Atajo           | Función                               |
| --------------- | ------------------------------------- |
| C-c, C-Insert   | Copiar resultado del panel principal  |
| SC-c, AC-Insert | Copiar resultado del panel secundario |
| C-v, S-Insert   | Pegar en panel principal              |
| SC-v, AS-Insert | Pegar en panel secundario             |

### Navegación del Historial

| Atajo           | Función                      |
| --------------- | ---------------------------- |
| ↑/↓             | Desplazar 50px arriba/abajo  |
| PageUp/PageDown | Desplazar 400px arriba/abajo |
| Home/End        | Desplazar al inicio/final    |
| C-f             | Buscar en historial          |
| C-[             | Reducir tamaño de fuente     |
| C-]             | Aumentar tamaño de fuente    |
