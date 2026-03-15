# App-Informationen

Diese App wurde mit vue+quasar+electron erstellt.

Kontakt: Seo Kihyun <from104@gmail.com>,

Copyright © 2022 Seo Kihyun. MIT-Lizenz.

## Änderungsprotokoll

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei festgehalten.

Das Format basiert auf [Keep a Changelog] und dieses Projekt folgt der [Semantischen Versionierung].

## [0.12.0] 2026-03-14

### Hinzugefügt

- **Formelrechner (5. Rechner)**: Mathematische Ausdrücke direkt eingeben und auswerten — unterstützt Arithmetik, Klammern, Funktionen (`sin`, `cos`, `sqrt`, `log`, `ln`, `abs`, `round`, `nthRoot` usw.) und Konstanten (`pi`, `e`, `phi`) über [mathjs](https://mathjs.org/)-Syntax.
  - Drücken Sie die Leertaste, um den Inline-Formeleditor zur direkten Ausdrucksbearbeitung zu öffnen.
  - Verwenden Sie `@`, um auf den aktuellen Wert zu verweisen, und `$` für den gespeicherten Speicherwert.
  - Volle Speicherunterstützung (MC, MR, MS, M+, M−, M×, M÷) über Shift-Funktionstasten verfügbar.
  - Ausgewertete Ergebnisse werden mit dem vollständigen Ausdruck im Berechnungsverlauf gespeichert.
  - Das integrierte Hilfemenü listet alle verfügbaren Funktionen, Konstanten und Platzhalter auf.
- **5 neue Sprachen (8 insgesamt)**: Chinesisch (vereinfacht), Hindi, Deutsch, Spanisch und Französisch ergänzen die bestehenden Sprachen Koreanisch, Englisch und Japanisch. Jeder Bildschirm ist übersetzt — Menüs, Einstellungen, Einheitsnamen, Währungsnamen, Hilfeseiten, Info-Seiten, Tipps und Fehlermeldungen.
- **Flatpak-Paketierung**: Installieren Sie QCalc über Flatpak für breitere Linux-Desktop-Unterstützung.

### Geändert

- **Reibungsloserer Sprachwechsel**: Wenn eine Übersetzung fehlt, fällt die App jetzt automatisch auf Englisch zurück, anstatt rohe Schlüsselpfade anzuzeigen.

Informationen zu früheren Versionen finden Sie [hier](https://github.com/from104/qcalc/blob/main/CHANGELOG.md).
