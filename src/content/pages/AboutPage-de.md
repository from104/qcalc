# App-Informationen

Diese App wurde mit vue+quasar+tauri erstellt.

Kontakt: Seo Kihyun <from104@gmail.com>,

Copyright © 2022 Seo Kihyun. MIT-Lizenz.

## Änderungsprotokoll

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei festgehalten.

Das Format basiert auf [Keep a Changelog] und dieses Projekt folgt der [Semantischen Versionierung].

## [0.13.0] 2026-08-09

### Geändert

- **Desktop-App von Electron auf Tauri 2 umgestellt**: eine leichtere und schnellere Desktop-App. Sie wird unter Linux als deb, rpm, AppImage, Flatpak und Snap sowie unter Windows als NSIS-Installer ausgeliefert; die automatische Aktualisierung funktioniert auf der neuen Grundlage vollständig.
- **Verlaufsmigration**: Exportieren Sie Ihren Berechnungsverlauf aus der bisherigen (Electron-)Version und importieren Sie ihn im Erststart-Bildschirm der neuen Version.
- **Größeres Standardfenster**: Standard- und Mindestfenstergröße wurden auf 480×756 vergrößert.

### Hinzugefügt

- **Vorlesen der Ergebnisse durch den Screenreader (Linux)**: Sobald eine Berechnung abgeschlossen ist, wird das Ergebnis vom Screenreader (Orca) vorgelesen.
- **Ansage von Formelfehlern**: Formelfehler werden nach Typ klassifiziert und über den Screenreader angesagt.
- **Rückgängig machen beim Löschen von Einträgen**: Das Löschen eines Verlaufseintrags lässt sich über eine Snackbar rückgängig machen.
- **Verbesserte Tastaturbedienbarkeit**: Überlauf-Tab-Menü, Formelfeld und Speicher-Umschalter sind vollständig mit der Tastatur bedienbar.
- **Themes mit höherem Kontrast**: Die Theme-Farben wurden auf WCAG-AA-Kontrast angehoben.
- **Neue Sprachen (10 insgesamt)**: Portugiesisch und Russisch hinzugefügt (inkl. 0.12.1).

### Behoben

- Gebietsschemagerechte Zahlendarstellung und -einfügung, einheitliche Winkeleinheit (Grad) für die trigonometrischen Funktionen des Formelrechners sowie viele weitere Korrekturen bei Barrierefreiheit und Übersetzung.

Informationen zu früheren Versionen finden Sie [hier](https://github.com/from104/qcalc/blob/main/CHANGELOG.md).
