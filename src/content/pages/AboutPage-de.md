# App-Informationen

Diese App wurde mit vue+quasar+tauri erstellt.

Kontakt: Seo Kihyun <from104@gmail.com>,

Copyright © 2022 Seo Kihyun. MIT-Lizenz.

## Änderungsprotokoll

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei festgehalten.

Das Format basiert auf [Keep a Changelog] und dieses Projekt folgt der [Semantischen Versionierung].

## [0.13.1] 2026-08-18

### Geändert

- Paketname auf QCalc vereinheitlicht (Windows: alten Eintrag „Q Calc” vorher deinstallieren)

### Hinzugefügt

- Android-APK bei jeder Veröffentlichung veröffentlicht

### Behoben

- Snap-Paket-Start behoben ([#117](https://github.com/from104/qcalc/issues/117))
- Update-Benachrichtigungen von 0.12.x-Builds sichtbar (Windows, AppImage)
- Windows-Installer bereinigt alte Electron-Dateien
- AppImage beendet sich auf Wayland nicht mehr sofort (Linux)
- Ergebnisfeld falsch hervorgehoben behoben
- Desktop-Textskalierung auf Fenstergröße angewendet (Linux)
- Tastenbeschriftungen überlasten nicht mehr Tasten
- Flatpak-Audioberechtigung nicht erforderlich

### Bekannte Probleme

- Screenreader können Oberfläche im Flatpak-Build nicht sehen — Upstream-Sandbox-Einschränkung. Verwenden Sie `.deb`, `.rpm` oder AppImage ([#113](https://github.com/from104/qcalc/issues/113))
- Clipboard lesen kann unter Linux fehlschlagen

## [0.13.0] 2026-08-09

### Geändert

- Desktop-Produktion von Electron auf Tauri 2 umgestellt
- Automatische Updates auf Tauri aktiviert
- Verlaufsmigration und Onboarding hinzugefügt
- Natives Wayland als Standard ([tauri#13749](https://github.com/tauri-apps/tauri/issues/13749) / [tauri#3117](https://github.com/tauri-apps/tauri/issues/3117))
- Standardfenstergröße vergrößert (352×604 → 480×756)

### Hinzugefügt

- 2 neue Sprachen (Portugiesisch, Russisch) insgesamt 10
- Screenreader-Ankündigung von Ergebnissen unter Linux
- Formelfehlermeldungen
- Rückgängigmachen beim Löschen von Datensätzen
- Tastaturzugriff für Tabs, Formelfeld und Speichertoggle
- WCAG-AA-Kontrastthemenfarben

### Behoben

- Screenreader-Unterstützung verbessert
- Zahlendarstellung nach Sprache
- Formelrechner Grad, Fehlerklassifizierung und Platzhalter-Ersetzung
- Datensatzverlauf beachtet maximale Anzahl nach Wiederherstellung
- Desktop-App hängt beim Start
- Tauri/Linux Fenstergröße, Textrendering, Symbole, Flatpak- und Snap-Paketierung verbessert
- Portugiesische und russische Hilfeseiten öffnen sich jetzt
- Koreanische Sprachetiketten korrigiert

### Bekannte Probleme

- Snap-Paket startet nicht ([#117](https://github.com/from104/qcalc/issues/117))
- Screenreader können Oberfläche im Flatpak-Build nicht sehen — Upstream-Sandbox-Einschränkung. Verwenden Sie `.deb`, `.rpm` oder AppImage ([#113](https://github.com/from104/qcalc/issues/113))
- Linux-Screenreader-Validierung unvollständig (Sprache, hover, Clipboard, CSP)
