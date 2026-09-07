# Informations sur l'application

Cette application a été créée en utilisant vue+quasar+tauri.

Contact : Seo Kihyun <from104@gmail.com>,

Copyright © 2022 Seo Kihyun. Licence MIT.

## Journal des modifications

Tous les changements notables de ce projet sont enregistrés dans ce fichier.

Le format est basé sur [Keep a Changelog] et ce projet suit le [Versionnage sémantique].

## [0.13.2] 2026-09-08

### Modifié

- Les cinq calculatrices affichées en onglets même sur écran étroit (plus de menu `▾`)

### Corrigé

- Correction du chevauchement de la barre d'état et de la barre de navigation avec le clavier et l'écran [Historique] sous Android 15
- Correction de la taille minimale de fenêtre différente lorsque l'écran ne pouvait pas être lu (bureau)
- Correction de la fenêtre apparaissant brièvement à un endroit aléatoire avant de rejoindre sa position enregistrée sous Windows

## [0.13.1] 2026-08-18

### Modifié

- Nom de paquet unifié en QCalc (désinstallez d'abord l'ancienne entrée « Q Calc » sur Windows)

### Ajouté

- APK Android livrée à chaque version

### Corrigé

- Paquet Snap démarrage corrigé ([#117](https://github.com/from104/qcalc/issues/117))
- Notifications de mise à jour visibles depuis la 0.12.x (Windows, AppImage)
- Désinstallation de l'ancienne application sous Windows
- AppImage ne quitte plus immédiatement au démarrage sur Wayland (Linux)
- Résultat ne se surligne plus quand le contenu tient
- Mise à l'échelle du texte appliquée à la taille de la fenêtre (Linux)
- Libellés du clavier ne débordent plus
- Permission audio du Flatpak supprimée

### Problèmes connus

- Les lecteurs d'écran ne voient pas l'interface dans le Flatpak — limitation du bac à sable. Utilisez .deb, .rpm ou AppImage ([#113](https://github.com/from104/qcalc/issues/113))
- Lecture du presse-papiers peut échouer sur Linux

## [0.13.0] 2026-08-09

### Modifié

- Application de bureau migrée d'Electron vers Tauri 2
- Mise à jour automatique entièrement activée sur Tauri
- Migration de l'historique et onboarding ajoutés
- Wayland natif par défaut ([tauri#13749](https://github.com/tauri-apps/tauri/issues/13749) / [tauri#3117](https://github.com/tauri-apps/tauri/issues/3117))
- Taille de fenêtre par défaut agrandie (352×604 → 480×756)

### Ajouté

- 2 nouvelles langues (portugais, russe) pour 10 au total
- Annonce des résultats par lecteur d'écran sur Linux
- Annonces des erreurs de formule
- Annulation de la suppression d'enregistrement
- Accessibilité au clavier pour les onglets, le champ de formule et le bouton mémoire
- Couleurs de thème contraste WCAG AA

### Corrigé

- Support du lecteur d'écran amélioré
- Formatage des nombres par langue
- Degrés de calculatrice de formule, classificateur d'erreur et substitution d'espace réservé
- Historique d'enregistrement respecte le nombre maximum après restauration
- Application de bureau qui se bloquait au démarrage
- Dimensionnement de fenêtre Tauri/Linux, rendu texte, icônes, Flatpak et améliorations d'empaquetage Snap
- Ouverture des pages d'aide portugaise et russe
- Labels de langue coréenne corrigés

### Problèmes connus

- Paquet Snap ne démarre pas ([#117](https://github.com/from104/qcalc/issues/117))
- Les lecteurs d'écran ne voient pas l'interface dans le Flatpak — limitation du bac à sable. Utilisez .deb, .rpm ou AppImage ([#113](https://github.com/from104/qcalc/issues/113))
- Vérification du lecteur d'écran Linux incomplète (audio, survol, presse-papiers, CSP)

Pour des informations sur les versions précédentes, veuillez consulter [ici](https://github.com/from104/qcalc/blob/main/CHANGELOG.md).
