# Información de la aplicación

Esta aplicación fue creada usando vue+quasar+tauri.

Contacto: Seo Kihyun <from104@gmail.com>,

Copyright © 2022 Seo Kihyun. Licencia MIT.

## Registro de Cambios

Todos los cambios notables de este proyecto se registran en este archivo.

El formato se basa en [Keep a Changelog] y este proyecto sigue [Versionado Semántico].

## [0.13.0] 2026-08-09

### Cambiado

- **La aplicación de escritorio pasa de Electron a Tauri 2**: una aplicación de escritorio más ligera y rápida. Se distribuye como deb, rpm, AppImage, Flatpak y Snap en Linux y como instalador NSIS en Windows, con la actualización automática plenamente funcional sobre la nueva base.
- **Migración del historial**: Exporte su historial de cálculos desde la versión anterior (Electron) e impórtelo en la pantalla de primer inicio de la nueva versión.
- **Ventana predeterminada más grande**: El tamaño de ventana predeterminado y mínimo aumentó a 480×756.

### Añadido

- **Lectura de resultados con lector de pantalla (Linux)**: Cuando se completa un cálculo, el lector de pantalla (Orca) lee el resultado en voz alta.
- **Anuncio de errores de fórmula**: Los errores de fórmula se clasifican por tipo y se anuncian mediante el lector de pantalla.
- **Deshacer la eliminación de registros**: La eliminación de un registro del historial puede deshacerse desde una barra de notificaciones.
- **Accesibilidad por teclado mejorada**: El menú de pestañas desbordadas, el campo de fórmula y el conmutador de memoria son totalmente operables con el teclado.
- **Temas de mayor contraste**: Los colores de los temas se elevaron al contraste WCAG AA.
- **Nuevos idiomas (10 en total)**: Se añadieron portugués y ruso (incl. 0.12.1).

### Corregido

- Visualización y pegado de números según la configuración regional, unificación en grados de las funciones trigonométricas de la calculadora de fórmulas y muchas otras correcciones de accesibilidad y traducción.

Para información sobre versiones anteriores, por favor consulte [aquí](https://github.com/from104/qcalc/blob/main/CHANGELOG.md).
