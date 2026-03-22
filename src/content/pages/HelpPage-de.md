# QCalc - Ein Mehrzweck-Taschenrechner für Produktivität und Barrierefreiheit

Hochpräzise Berechnungen, Einheiten-/Währungs-/Zahlensystemumrechnung und Formelauswertung in einer App. Ein Mehrzweck-Taschenrechner mit einheitlicher Bedienung auf Desktop und Mobilgeräten.

## Hauptfunktionen der App

- **5 professionelle Rechner**: Standardrechner, Einheitenumrechner, Währungsumrechner, Programmiererrechner und Formelrechner decken alle Berechnungsanforderungen ab
- **Hochpräzise Rechenengine**: Unterstützt genaue Berechnungen bis zu 64 Stellen mit erweiterten mathematischen Funktionen wie Trigonometrie, Fakultät und Potenzen
- **Zahlensysteme & Bit-Operationen**: Konvertiert zwischen Binär/Oktal/Dezimal/Hexadezimal und unterstützt professionelle Bit-Operationen (AND, OR, XOR, NOT) für Programmierer
- **Intelligente Benutzererfahrung**: Bietet eine personalisierte Umgebung mit Einheiten-/Währungsfavoriten, verschiedenen Farbthemen sowie Notizen und Export/Import des Berechnungsverlaufs
- **Plattformübergreifende Unterstützung**: Bietet ein einheitliches Erlebnis auf Windows, Linux-Desktop und Android-Mobilgeräten mit Unterstützung für automatische Updates
- **Barrierefreies Design**: Kontinuierlich verbessert für einfachen Zugang aller Benutzer mit Tastenkombinationen, haptischem Feedback und adaptiven Layouts
- **Einstellungsverwaltung**: Exportieren oder importieren Sie alle Einstellungen in eine Datei, um dieselben Einstellungen in verschiedenen Umgebungen beizubehalten

## Anleitung zu den Hauptfunktionen

### Verwendung der 5 Rechner

#### Standardrechner

- **Zugriff**: Ctrl+1 oder oberen Tab auswählen
- **Grundrechenarten**: Zahlen 0-9, +, -, \*, / Tasten eingeben
- **Erweiterte Funktionen**: Trigonometrische Funktionen (q, w, e), Quadrat (u), Quadratwurzel (i), Konstanten (z: π, x: φ, c: e)
- **Speicherfunktionen**: Ctrl+Enter (MS), Ctrl+Backspace (MR), Ctrl+Delete (MC)
- **Bearbeitungsmodus**: Space oder Enter (wenn leer) zum Starten, Esc zum Löschen und Beenden
- **Verlaufsnavigation**: Im Bearbeitungsmodus mit ↑/↓ Pfeiltasten vorherige Ausdrücke durchsuchen, bei Bearbeitung automatisch zurückgesetzt
- **Ausdruck laden**: Rechtsklick auf Formelprotokoll → „In Formelfeld laden" zur Wiederverwendung
- **Prozentrechnung**: 'Zahl, /, Zahl, %(k)' berechnet den Prozentsatz
- **Prozent anwenden**: 'Zahl, \*, Zahl, %(k)' wendet den Prozentsatz an

#### Einheitenumrechner

- **Zugriff**: Ctrl+2 oder oberen Tab auswählen
- **Umrechnungskategorien**: Über 15 Kategorien einschließlich Länge, Fläche, Volumen, Gewicht, Winkel usw.
- **Favoriten**: Häufig verwendete Einheiten als Favoriten für schnellen Zugriff festlegen
- **Einheiten tauschen**: '\' Taste zum Tauschen von Ausgangs-/Zieleinheit verwenden
- **Schnellumrechnung**: ×10/×100/×1000 (a/s/d), ÷10/÷100/÷1000 (z/x/c)
- **Einheitensymbol**: Anzeige des Einheitensymbols mit Alt+\ Taste ein-/ausblenden

#### Währungsumrechner

- **Zugriff**: Ctrl+3 oder oberen Tab auswählen
- **340 Währungen**: Fiat, Kryptowährungen und Edelmetalle — kein API-Schlüssel erforderlich
- **Aktuelle Wechselkurse**: Echtzeit-Kurse (bei Offline-Nutzung wird ein integrierter Snapshot verwendet)
- **Favoriten**: Häufig verwendete Währungen als Favoriten für schnellen Zugriff festlegen
- **Schnellberechnung**: +5/+10/+100 (f/g/h), -5/-10/-100 (q/w/e)
- **Währungen tauschen**: '\' Taste zum Tauschen von Ausgangs-/Zielwährung verwenden
- **Währungssymbol**: Anzeige des Währungssymbols mit Alt+\ Taste ein-/ausblenden

#### Programmiererrechner

- **Zugriff**: Ctrl+4 oder oberen Tab auswählen
- **Unterstützte Zahlensysteme**: Umrechnung zwischen Binär, Oktal, Dezimal und Hexadezimal
- **Hexadezimale Eingabe**: A-F mit z, x, c, a, s, d Tasten eingeben
- **Zahlensysteme tauschen**: '\' Taste zum Tauschen von Ausgangs-/Zielsystem verwenden
- **Zahlensystemsymbol**: Anzeige des Einheitensymbols mit Alt+\ Taste ein-/ausblenden
- **Symbolposition**: Position des Einheitensymbols (vorne/hinten) mit Alt+Ctrl+\ Taste umschalten

#### Formelrechner

- **Zugriff**: Ctrl+5 oder oberen Tab auswählen
- **Ausdruckseingabe**: Mathematische Ausdrücke direkt mit mathjs-Syntax eingeben
- **Unterstützte Operationen**: Alle mathematischen Funktionen von mathjs einschließlich Arithmetik, Potenzen, Trigonometrie, Logarithmen
- **Aktueller Wertverweis**: @ Symbol verwenden, um den aktuellen Berechnungswert in Ausdrücke einzubeziehen
- **Speicherfunktionen**: Ctrl+Enter (MS), Ctrl+Backspace (MR), Ctrl+Delete (MC)
- **Bearbeitungsmodus**: Space oder Enter (wenn leer) zum Starten, Esc zum Löschen und Beenden
- **Verlaufsnavigation**: Im Bearbeitungsmodus mit ↑/↓ Pfeiltasten vorherige Ausdrücke durchsuchen, bei Bearbeitung automatisch zurückgesetzt
- **Ausdruck laden**: Rechtsklick auf Formelprotokoll → „In Formelfeld laden" zur Wiederverwendung

### Verwendung der Produktivitätsfunktionen

#### Berechnungsverlauf verwalten

- **Zugriff**: F4 Taste oder Seitenmenü
- **Scrollen**: 50px mit ↑/↓ Tasten, 400px mit Page Up/Down
- **Suchen/Löschen**: Suchen mit Ctrl+F, Verlauf löschen mit Ctrl+D
- **Export/Import**: Berechnungsverlauf als CSV-Datei über die Schaltflächen in der Kopfzeile exportieren oder importieren
- **Schriftgrößensteuerung**: Schriftgröße in 3 Stufen mit den Schaltflächen unten links anpassen.
- **Notizen hinzufügen**: Notizen zu einzelnen Einträgen hinzufügen
- **Nach links wischen (Mobil)**: Notizen hinzufügen/bearbeiten
- **Nach rechts wischen (Mobil)**: Einträge löschen

#### Einstellungsverwaltung

- **Zugriff**: F3 Taste oder Seitenmenü
- **Zurücksetzen**: Alle Einstellungen auf Standardwerte zurücksetzen
- **Export/Import**: Aktuelle Einstellungen als JSON-Datei speichern oder laden, um dieselben Einstellungen in verschiedenen Umgebungen zu verwenden

#### Zahlenanzeigeeinstellungen

- **Zahlenformat pro Rechner anwenden**: Mit Alt+n Taste umschalten
- **Trennzeichen ein-/ausblenden**: Mit , Taste umschalten
- **Gruppierungseinheit festlegen**: Zwischen 3/4 Stellen mit Alt+, Taste wechseln
- **Dezimalstellen**: Mit [, ] Tasten anpassen (unbegrenzt~16 Stellen)

#### Tastenkombinationen verwenden

- **Shift-Modus**: Mit ' Taste aktivieren, um erweiterte Funktionen aufzurufen
- **Tab-Navigation**: Zwischen Tabs mit Ctrl+Tab (→), Ctrl+Shift+Tab (←) wechseln
- **Bildschirmwechsel**: F1 (Hilfe), F2 (Info), F3 (Einstellungen), F4 (Verlauf), F5 (Tipps)

#### Kopieren & Einfügen

- **Hauptfeld kopieren**: Ctrl+C, Ctrl+Insert
- **Unterfeld kopieren**: Shift+Ctrl+C, Alt+Ctrl+Insert
- **In Hauptfeld einfügen**: Ctrl+V, Shift+Insert
- **In Unterfeld einfügen**: Shift+Ctrl+V, Alt+Shift+Insert
- **Menü öffnen**: Auf das Feld klicken und das Menü zum Kopieren/Einfügen verwenden

### **Tipps für Experten-Werkzeuge**

#### Mathematische Funktionen

- **N-te Potenz/N-te Wurzel**: Berechnung mit r/t Tasten
- **Trigonometrische Funktionen**: q/w/e Tasten im Shift-Modus
- **Ganzzahl-/Dezimalteil extrahieren**: Berechnung mit v/b Tasten
- **Fakultät**: Berechnung mit h Taste

#### Speicher verwenden

- **Speicher ablegen & abrufen**: Nach der Berechnung ablegen (MS) und abrufen (MR)
- **Speicherrechnung**: Werte mit M+, M-, M×, M÷ Funktionen akkumulieren
- **Speicher löschen**: Speicher mit MC löschen
- **Speicherstatus**: Auf das Speichersymbol im Hauptfeld klicken

#### Bit-Operationen verwenden

- **Bit-Operationen**: AND (j), OR (k), XOR (l), NOT (h), Shift-Operationen (r/t/u/i)
- **Logische Erweiterung**: NAND/NOR/XNOR-Operationen mit q/w/e Tasten verwenden
- **Shift-Operationen**: Bit-Positionen um 1 Bit/4 Bits verschieben
- **Bit-Größe festlegen**: Bit-Operationen entsprechend der eingestellten Größe

### **Benutzererfahrung optimieren**

#### Bildschirmlayout

- **Themensystem**: Wählen Sie aus verschiedenen Farbthemen über den Dunkel-/Hell-Modus hinaus (Änderung in F3 Einstellungen)
- **Immer im Vordergrund**: Immer-im-Vordergrund mit Alt+t Taste umschalten
- **Fenstergröße ändern**: Seitenpanel passt sich automatisch an die Fenstergröße an
- **Panel zurücksetzen**: Panel-Zurücksetzung beim Start mit Alt+i Taste umschalten
- **Dunkelmodus (de)aktivieren**: Dunkelmodus mit Alt+d Taste umschalten
- **Zahlenformat pro Rechner anwenden**: Zahlenformat pro Rechner mit Alt+n Taste umschalten

#### Mobile Unterstützung

- **Wischen**: Rechnermodi durch Wischen nach links oder rechts wechseln
- **Haptischen Modus (de)aktivieren**: Haptischen Modus mit Alt+p Taste umschalten
- **Tablet-Querformat**: Seitenpanel passt sich automatisch im Tablet-Querformat an

## Tastenkombinationen (S: Shift, C: Control, A: Alt)

### Standardrechner und allgemeine Funktionen

| Tastenkombination | Funktion                           |
| ----------------- | ---------------------------------- |
| 0-9.              | Zahlen und Dezimalzeichen eingeben |
| +, -, \*, /       | Grundrechenarten                   |
| Enter, =          | Ergebnis berechnen                 |
| Backspace         | Ein Zeichen löschen                |
| Delete            | Rechner zurücksetzen               |
| u                 | Quadrat (x²)                       |
| i                 | Quadratwurzel (√x)                 |
| j                 | Vorzeichen wechseln (±)            |
| k, %              | Prozent (%)                        |
| l                 | Kehrwert (1/x)                     |
| '                 | Shift-Modus aktivieren             |

### Erweiterte mathematische Funktionen (Shift-Modus)

| Tastenkombination | Funktion                     |
| ----------------- | ---------------------------- |
| r                 | Potenz (xⁿ)                  |
| t                 | Wurzel (ⁿ√x)                 |
| f                 | Zehnerpotenz (10ⁿ)           |
| g                 | Modulo (x%y)                 |
| h                 | Fakultät (x!)                |
| q,w,e             | Trig. (sin, cos, tan)        |
| a,s,d             | Konstanten (Pi/2, ln10, ln2) |
| z,x,c             | Konstanten (Pi, phi, e)      |
| v                 | Ganzzahlanteil               |
| b                 | Dezimalanteil                |

### Speicheroperationen

| Tastenkombination | Funktion                     |
| ----------------- | ---------------------------- |
| C-Delete          | Speicher löschen (MC)        |
| C-Backspace       | Speicher abrufen (MR)        |
| C-Enter, C-=      | Speicher ablegen (MS)        |
| C-+, C-Numpad +   | Speicher addieren (M+)       |
| C--, C-Numpad -   | Speicher subtrahieren (M-)   |
| C-_, C-Numpad _   | Speicher multiplizieren (M×) |
| C-/, C-Numpad /   | Speicher dividieren (M÷)     |

### Einheiten-/Währungsumrechnungsmodus (Shift-Modus)

| Tastenkombination | Funktion                              |
| ----------------- | ------------------------------------- |
| f,g,h             | ×2/×3/×5 oder +5/+10/+100             |
| q,w,e             | ÷2/÷3/÷5 oder -5/-10/-100             |
| a,s,d             | ×10/×100/×1000                        |
| z,x,c             | ÷10/÷100/÷1000                        |
| \                 | Quelle und Ziel tauschen              |
| A-\               | Einheiten-/Währungsanzeige umschalten |

### Zahlensystem-Umrechnungsmodus

| Tastenkombination | Funktion                                   |
| ----------------- | ------------------------------------------ |
| r,t               | 1-Bit-Verschiebung (x<<1, x>>1)            |
| u,i               | Links-/Rechtsverschiebung (x<<y, x>>y)     |
| f,g               | 4-Bit-Verschiebung (x<<4, x>>4)            |
| h                 | NOT-Operation                              |
| j,k,l             | Bit-Operationen (AND, OR, XOR)             |
| q,w,e             | NAND, NOR, XNOR                            |
| z,x,c             | Hex-Eingabe (A, B, C)                      |
| a,s,d             | Hex-Eingabe (D, E, F)                      |
| \                 | Quelle und Ziel tauschen                   |
| A-\               | Zahlensystemanzeige umschalten             |
| AC-\              | Zahlensystemposition umschalten (vor/nach) |

### Formelrechner (Bearbeitungsmodus)

| Tastenkombination | Funktion                                              |
| ----------------- | ----------------------------------------------------- |
| Space             | Bearbeitungsmodus starten                             |
| Enter             | Ausdruck auswerten (oder Bearbeitungsmodus wenn leer) |
| Escape            | Ausdruck löschen und Bearbeitungsmodus beenden        |
| ↑/↓               | Ausdrucksverlauf durchsuchen                          |
| =                 | Ausdruck auswerten                                    |

### Bildschirmnavigation und UI-Steuerung

| Tastenkombination | Funktion                       |
| ----------------- | ------------------------------ |
| F1                | Hilfe                          |
| F2                | Info                           |
| F3                | Einstellungen                  |
| F4                | Verlauf                        |
| F5                | Tipps                          |
| C-[12345]         | Rechner-Tabs wechseln          |
| C-Tab, →          | Zum rechten Tab wechseln       |
| CS-Tab, ←         | Zum linken Tab wechseln        |
| Escape            | Aktuellen Bildschirm schließen |

### UI-Einstellungen

| Tastenkombination | Funktion                                    |
| ----------------- | ------------------------------------------- |
| A-t               | Immer im Vordergrund umschalten             |
| A-i               | Panel-Initialisierung beim Start umschalten |
| A-d               | Dunkelmodus umschalten                      |
| A-p               | Haptischen Modus umschalten                 |
| A-n               | Zahlenformat pro Rechner umschalten         |
| ;                 | Zusätzliche Tastenfunktionen umschalten     |
| ,                 | Zahlengruppierung umschalten                |
| A-,               | Gruppierungseinheit ändern (3/4)            |
| [, ]              | Dezimalstellen anpassen (∞~16)              |
| q                 | Anwendung beenden                           |

### Zwischenablage-Operationen

| Tastenkombination | Funktion                    |
| ----------------- | --------------------------- |
| C-c, C-Insert     | Hauptfeld-Ergebnis kopieren |
| SC-c, AC-Insert   | Unterfeld-Ergebnis kopieren |
| C-v, S-Insert     | In Hauptfeld einfügen       |
| SC-v, AS-Insert   | In Unterfeld einfügen       |

### Verlaufsnavigation

| Tastenkombination | Funktion                   |
| ----------------- | -------------------------- |
| ↑/↓               | 50px hoch/runter scrollen  |
| PageUp/PageDown   | 400px hoch/runter scrollen |
| Home/End          | Zum Anfang/Ende scrollen   |
| C-f               | Verlauf durchsuchen        |
| C-[               | Schriftgröße verkleinern   |
| C-]               | Schriftgröße vergrößern    |
