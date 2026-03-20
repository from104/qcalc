# Información de la aplicación

Esta aplicación fue creada usando vue+quasar+electron.

Contacto: Seo Kihyun <from104@gmail.com>,

Copyright © 2022 Seo Kihyun. Licencia MIT.

## Registro de Cambios

Todos los cambios notables de este proyecto se registran en este archivo.

El formato se basa en [Keep a Changelog] y este proyecto sigue [Versionado Semántico].

## [0.12.0] 2026-03-14

### Añadido

- **Calculadora de Fórmulas (5.ª calculadora)**: Escriba y evalúe expresiones matemáticas directamente — soporta aritmética, paréntesis, funciones (`sin`, `cos`, `sqrt`, `log`, `ln`, `abs`, `round`, `nthRoot`, etc.) y constantes (`pi`, `e`, `phi`) mediante sintaxis de [mathjs](https://mathjs.org/).
  - Presione Espacio para abrir el editor de fórmulas en línea para editar expresiones directamente.
  - Use `@` para referenciar el valor actual y `$` para el valor almacenado en memoria.
  - Soporte completo de memoria (MC, MR, MS, M+, M−, M×, M÷) disponible a través de los botones de función con Shift.
  - Los resultados evaluados se guardan en el historial de cálculos con la expresión completa mostrada.
  - El menú de ayuda integrado lista todas las funciones, constantes y marcadores de posición disponibles.
- **5 nuevos idiomas (8 en total)**: Chino (simplificado), hindi, alemán, español y francés se unen a los existentes coreano, inglés y japonés. Todas las pantallas están traducidas — menús, configuraciones, nombres de unidades, nombres de monedas, páginas de ayuda, páginas de información, consejos y mensajes de error.
- **Empaquetado Flatpak**: Instale QCalc desde Flatpak para un soporte más amplio en escritorios Linux.
- **Migración a APIs de divisas públicas gratuitas**: Cambio de FreeCurrencyAPI (requiere clave API) a APIs públicas gratuitas (Frankfurter + fawazahmed0). Soporte para 340 divisas (fiat, metales preciosos, criptomonedas) sin clave API. Las instantáneas de tipos de cambio en tiempo de compilación permiten la conversión de divisas incluso en el primer inicio sin conexión.

### Cambiado

- **Cambio de idioma más fluido**: Si falta una traducción, la aplicación ahora recurre automáticamente al inglés en lugar de mostrar las rutas de claves sin procesar.
- **Cobertura de divisas ampliada**: De 170 a 340 divisas — se añadieron criptomonedas principales (ETH, SOL, XRP, etc.), metales preciosos (paladio, platino) y divisas históricas. Soporte i18n completo para los 8 idiomas.

Para información sobre versiones anteriores, por favor consulte [aquí](https://github.com/from104/qcalc/blob/main/CHANGELOG.md).
