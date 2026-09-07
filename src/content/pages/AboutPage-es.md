# Información de la aplicación

Esta aplicación fue creada usando vue+quasar+tauri.

Contacto: Seo Kihyun <from104@gmail.com>,

Copyright © 2022 Seo Kihyun. Licencia MIT.

## Registro de Cambios

Todos los cambios notables de este proyecto se registran en este archivo.

El formato se basa en [Keep a Changelog] y este proyecto sigue [Versionado Semántico].

## [0.13.1] 2026-08-18

### Cambiado

- Nombre del paquete unificado como QCalc (en Windows, retire primero la entrada anterior)

### Añadido

- APK de Android en cada versión

### Corregido

- Paquete Snap iniciado correctamente (#117)
- Notificaciones de actualización visibles desde versiones 0.12.x (Windows, AppImage)
- Instalador de Windows elimina restos de compilación de Electron
- AppImage en Wayland ya no sale inmediatamente (Linux)
- Campo de resultado sin resalte incorrecto cuando el contenido cabe
- Escala de texto aplicada al tamaño de ventana (Linux)
- Etiquetas del teclado sin desbordamiento de botones
- Requisito de permiso de audio de Flatpak eliminado

### Problemas conocidos

- Los lectores de pantalla no ven la interfaz en la compilación Flatpak — limitación de sandbox de upstream. Use `.deb`, `.rpm` o AppImage (#113)
- La lectura del portapapeles puede fallar en Linux, así que pegar en la calculadora puede no funcionar

## [0.13.0] 2026-08-09

### Cambiado

- Producción de escritorio cambiada de Electron a Tauri 2
- Actualización automática activada completamente en Tauri
- Migración del historial e incorporación de nuevos usuarios agregadas
- Wayland nativo predeterminado (tauri#13749 / tauri#3117)
- Tamaño de ventana predeterminado aumentado (352×604 → 480×756)

### Añadido

- 2 nuevos idiomas (portugués, ruso) para 10 total
- Anuncio de resultados con lector de pantalla en Linux
- Anuncios de errores de fórmula
- Deshacer eliminación de registros
- Accesibilidad por teclado para pestañas, campo de fórmula y conmutador de memoria
- Colores de tema con contraste WCAG AA

### Corregido

- Soporte mejorado para lectores de pantalla
- Formato de número por idioma
- Grados de calculadora de fórmula, clasificador de errores y sustitución de marcador de posición
- Historial de registros respeta el recuento máximo después de la restauración
- Aplicación de escritorio se congela en el inicio
- Mejoras de Tauri/Linux en tamaño de ventana, representación de texto, iconos, Flatpak y empaquetado de Snap
- Páginas de ayuda en portugués y ruso ahora se abren
- Etiquetas de idioma coreano corregidas

### Problemas conocidos

- El paquete Snap no inicia (#117)
- Los lectores de pantalla no ven la interfaz en la compilación Flatpak — limitación de sandbox de upstream. Use `.deb`, `.rpm` o AppImage (#113)
- Verificación incompleta del lector de pantalla en Linux (audible, hover, portapapeles, CSP)

Para información sobre versiones anteriores, por favor consulte [aquí](https://github.com/from104/qcalc/blob/main/CHANGELOG.md).
