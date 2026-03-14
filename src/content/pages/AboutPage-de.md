# App-Informationen

Diese App wurde mit vue+quasar+electron erstellt.

Kontakt: Seo Kihyun <from104@gmail.com>,

Copyright © 2022 Seo Kihyun. MIT-Lizenz.

## Änderungsprotokoll

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei festgehalten.

Das Format basiert auf [Keep a Changelog] und dieses Projekt folgt der [Semantischen Versionierung].

## [0.11.6] 2025-12-27

### Hinzugefügt

- **Zahlenformat pro Rechner**: Möglichkeit hinzugefügt, unabhängige Zahlenformateinstellungen (Zahlengruppierung, Gruppierungseinheit, Dezimalstellen) für jeden Rechner (Standard, Einheiten, Währung, Zahlensystem) zu verwenden. Umschaltbar mit Alt+n Tastenkombination.

### Geändert

### Behoben

- **Dynamische Höhenberechnung der Rechner-Tasten verbessert**: Die Logik zur Berechnung der Tastenhöhe wurde durch Verwendung von `requestAnimationFrame` und `nextTick` anstelle von `setTimeout` für bessere Genauigkeit und Leistung optimiert.
- **Ergebnisfeld-Initialisierung optimiert**: Redundante Zustandstausch-Logik beim Komponenten-Mount wurde entfernt und die Textüberlauf-Erkennung so verbessert, dass sie sofort nach dem Rendern ausgeführt wird.
- **Rechnertypspezifische Layout-Optimierung**: Anfängliche Tastenhöhen-Einstellungen für verschiedene Rechnertypen (Standard, Einheiten, Währung, Zahlensystem) verfeinert, um Layout-Verschiebungen zu reduzieren.
- **Seitenwechsel-Fehler im breiten Layout behoben**: Ein Problem wurde behoben, bei dem der Übergangseffekt für Unterseiten (rechter Bereich) im breiten Layout nicht korrekt funktionierte.
- **Textüberlauf-Erkennung im Ergebnisfeld verbessert**: Die Logik zur Erkennung von Textüberläufen in Ergebnisfeldern wurde vollständig überprüft und neu geschrieben. Ein präzises und kontinuierliches Tracking-System mit ResizeObserver und watch wurde implementiert, das eine genaue Farbhervorhebung und Tooltip-Anzeige bei Textüberlauf gewährleistet.
- **Doppelte Registrierung von Tastenkombinationen behoben**: Ein Problem wurde behoben, bei dem Tab-Navigations-Tastenkombinationen (Ctrl+Tab, ArrowRight usw.) zweimal ausgeführt wurden. Gelöst durch Sicherstellung, dass useMainLayout nur von MainLayout aufgerufen wird, um doppelte Tastenbindungsregistrierungen durch mehrere Layout-Komponenten zu vermeiden.
- **Speicherwert-Zahlensystemkonvertierungsfehler behoben**: Sichere Fehlerbehandlung für Zahlensystemkonvertierungsfehler hinzugefügt, die während der Initialisierung oder bei ungültigen Werten auftraten.

Informationen zu früheren Versionen finden Sie [hier](https://github.com/from104/qcalc/blob/main/CHANGELOG.md).
