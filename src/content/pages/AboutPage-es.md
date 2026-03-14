# Información de la aplicación

Esta aplicación fue creada usando vue+quasar+electron.

Contacto: Seo Kihyun <from104@gmail.com>,

Copyright © 2022 Seo Kihyun. Licencia MIT.

## Registro de Cambios

Todos los cambios notables de este proyecto se registran en este archivo.

El formato se basa en [Keep a Changelog] y este proyecto sigue [Versionado Semántico].

## [0.11.6] 2025-12-27

### Añadido

- **Función de Formato de Números Por Calculadora**: Se añadió la capacidad de usar configuraciones de formato de números independientes (agrupación de números, unidad de agrupación, lugares decimales) para cada calculadora (básica, unidades, divisas, bases numéricas). Alternar con la tecla de atajo Alt+n.

### Cambiado

### Corregido

- **Cálculo Dinámico de Altura de Botones de Calculadora Mejorado**: Se optimizó la lógica de cálculo de altura de botones usando `requestAnimationFrame` y `nextTick` en lugar de `setTimeout` para mayor precisión y rendimiento.
- **Inicialización del Campo de Resultado Optimizada**: Se eliminó la lógica redundante de intercambio de estado durante el montaje del componente y se mejoró la detección de desbordamiento de texto para ejecutarse inmediatamente después del renderizado.
- **Optimización del Diseño Inicial Según Tipo de Calculadora**: Se refinaron las configuraciones iniciales de altura de botones para diferentes tipos de calculadora (Básica, Unidades, Divisas, Bases numéricas) para reducir los cambios de diseño.
- **Error de Transición de Subpágina en Diseño Amplio Corregido**: Se corrigió un problema donde el efecto de transición para subpáginas (sección derecha) en el diseño amplio no funcionaba correctamente.
- **Detección de Desbordamiento de Texto en Campo de Resultado Mejorada**: Se revisó y reescribió completamente la lógica de detección de desbordamiento de texto en los campos de resultado. Se implementó un sistema de seguimiento preciso y continuo usando ResizeObserver y watch, asegurando el resaltado de color y la visualización de información emergente precisos cuando el texto se desborda.
- **Problema de Registro Duplicado de Atajos de Teclado Corregido**: Se corrigió un problema donde los atajos de navegación de pestañas (Ctrl+Tab, ArrowRight, etc.) se ejecutaban dos veces. Se resolvió asegurando que useMainLayout solo se llame desde MainLayout, previniendo registros duplicados de enlaces de teclas desde múltiples componentes de diseño.
- **Error de Conversión de Base del Valor de Memoria Corregido**: Se añadió manejo seguro de errores para los errores de conversión de base que ocurrían durante la inicialización o cuando se pasaban valores inválidos.

Para información sobre versiones anteriores, por favor consulte [aquí](https://github.com/from104/qcalc/blob/main/CHANGELOG.md).
