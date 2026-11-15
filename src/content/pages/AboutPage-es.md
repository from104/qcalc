# Información de la aplicación

Esta aplicación fue creada usando vue+quasar+tauri.

Contacto: Seo Kihyun <from104@gmail.com>,

Copyright © 2022 Seo Kihyun. Licencia MIT.

## Registro de Cambios

Todos los cambios notables de este proyecto se registran en este archivo.

El formato se basa en [Keep a Changelog] y este proyecto sigue [Versionado Semántico].

## [0.13.7] 2026-11-16

### Cambiado

- Las funciones del modo Shift de la fila q·w·e (sin/cos/tan, ÷2/÷3/÷5, -5/-10/-100, NAND/NOR/XNOR) ahora usan Shift+q/w/e; q solo cierra la aplicación
- En Windows, pegar ahora lee directamente el portapapeles del sistema en lugar de pasar por la comprobación de permisos del portapapeles del WebView

### Corregido

- Corregido: pegar desde el portapapeles no hacía nada en Linux
- Corregido: al salir con q, el teclado numérico quedaba atascado en modo Shift en el siguiente inicio
- Corregido: faltaba una etiqueta en coreano en el conversor de divisas
- Corregido: los lectores de pantalla leían sin nombre el botón de tamaño de fuente del historial
- Corregido: los lectores de pantalla leían sin nombre el botón de menú ⋮ de cada entrada del historial
- Corregido: una instalación nueva mostraba «Algunas configuraciones guardadas se han restablecido debido a una actualización de la aplicación.» en el primer inicio
- Corregido: en el conversor de bases, al pegar en el campo principal el número se leía en la base de destino (255 pasaba a ser 597)
- Corregido: si el motor de fórmulas fallaba una vez al cargar, la calculadora de fórmulas quedaba inutilizable hasta reiniciar la aplicación
- Corregido: el mensaje de error al no poder cargar el motor de fórmulas terminaba con texto en inglés sin traducir
- Corregido: en Linux, Ctrl+C mostraba «Copiado» pero dejaba el portapapeles vacío

## [0.13.6] 2026-10-03

### Añadido

- Pantalla de inicio mientras se abre la aplicación

### Cambiado

- Inicio de la aplicación más rápido
- Transiciones de botones, pestañas y pantallas más rápidas y fluidas
- La calculadora, el [Historial] y otras pantallas crecen y se reducen con suavidad, junto con su cabecera, al cambiar entre diseño estrecho y ancho
- Respuesta más rápida a [=] con un historial de cálculo largo
- Mejor rendimiento de pantalla en Linux con gráficos NVIDIA
- Animaciones reducidas automáticamente en dispositivos de gama baja

### Corregido

- Corregido el destello blanco al iniciar la aplicación
- Corregido que la aplicación se quedara a veces en la pantalla de inicio
- Corregido el margen derecho ausente en [Historial]
- Corregido el cierre de la app al pulsar [=] en el AppImage y el Snap de Linux

## [0.13.5] 2026-09-17

### Corregido

- Corregido el AppImage que no se iniciaba dentro de entornos aislados como Firejail

## [0.13.4] 2026-09-17

### Corregido

- Corregido el icono del AppImage que las herramientas de integración de escritorio no reconocían

## [0.13.3] 2026-09-10

### Corregido

- Corregidos los botones de la barra de título que no respondían en Linux desde 0.13.2
- Corregida la ventana que crecía un poco en cada inicio en Linux hasta alcanzar el tamaño máximo
- Corregido el tamaño mínimo y máximo de ventana que no se aplicaba al área de contenido en Linux (y no se aplicaba en absoluto desde 0.13.2)

## [0.13.2] 2026-09-08

### Cambiado

- Las cinco calculadoras mostradas como pestañas también en pantallas estrechas (sin menú `▾`)

### Corregido

- Corregido el solapamiento de la barra de estado y la barra de navegación con el teclado y la pantalla [Historial] en Android 15
- Corregido el tamaño mínimo de ventana distinto cuando no se podía leer el monitor (escritorio)
- Corregida la ventana que aparecía brevemente en una posición aleatoria antes de ir a la guardada en Windows

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
