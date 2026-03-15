# Informations sur l'application

Cette application a été créée en utilisant vue+quasar+electron.

Contact : Seo Kihyun <from104@gmail.com>,

Copyright © 2022 Seo Kihyun. Licence MIT.

## Journal des modifications

Tous les changements notables de ce projet sont enregistrés dans ce fichier.

Le format est basé sur [Keep a Changelog] et ce projet suit le [Versionnage sémantique].

## [0.12.0] 2026-03-14

### Ajouté

- **Calculatrice de formules (5e calculatrice)** : Saisissez et évaluez directement des expressions mathématiques — prend en charge l'arithmétique, les parenthèses, les fonctions (`sin`, `cos`, `sqrt`, `log`, `ln`, `abs`, `round`, `nthRoot`, etc.) et les constantes (`pi`, `e`, `phi`) via la syntaxe [mathjs](https://mathjs.org/).
  - Appuyez sur Espace pour ouvrir l'éditeur de formules en ligne pour modifier directement les expressions.
  - Utilisez `@` pour référencer la valeur actuelle et `$` pour la valeur mémoire stockée.
  - Support mémoire complet (MC, MR, MS, M+, M−, M×, M÷) disponible via les boutons de fonction Shift.
  - Les résultats évalués sont enregistrés dans l'historique des calculs avec l'expression complète affichée.
  - Le menu d'aide intégré liste toutes les fonctions, constantes et espaces réservés disponibles.
- **5 nouvelles langues (8 au total)** : Le chinois (simplifié), l'hindi, l'allemand, l'espagnol et le français rejoignent le coréen, l'anglais et le japonais existants. Chaque écran est traduit — menus, paramètres, noms d'unités, noms de devises, pages d'aide, pages à propos, astuces et messages d'erreur.
- **Empaquetage Flatpak** : Installez QCalc depuis Flatpak pour un support plus large des bureaux Linux.

### Modifié

- **Changement de langue plus fluide** : Si une traduction est manquante, l'application revient désormais automatiquement à l'anglais au lieu d'afficher les chemins de clés bruts.

Pour des informations sur les versions précédentes, veuillez consulter [ici](https://github.com/from104/qcalc/blob/main/CHANGELOG.md).
