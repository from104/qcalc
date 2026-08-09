# Informations sur l'application

Cette application a été créée en utilisant vue+quasar+tauri.

Contact : Seo Kihyun <from104@gmail.com>,

Copyright © 2022 Seo Kihyun. Licence MIT.

## Journal des modifications

Tous les changements notables de ce projet sont enregistrés dans ce fichier.

Le format est basé sur [Keep a Changelog] et ce projet suit le [Versionnage sémantique].

## [0.13.0] 2026-08-09

### Modifié

- **Application de bureau migrée d'Electron vers Tauri 2** : une application de bureau plus légère et plus rapide. Elle est distribuée sous forme de deb, rpm, AppImage, Flatpak et Snap sous Linux et d'installateur NSIS sous Windows, la mise à jour automatique fonctionnant pleinement sur cette nouvelle base.
- **Migration de l'historique** : Exportez votre historique de calculs depuis la version précédente (Electron) et importez-le sur l'écran de premier lancement de la nouvelle version.
- **Fenêtre par défaut plus grande** : La taille de fenêtre par défaut et minimale passe à 480×756.

### Ajouté

- **Annonce des résultats par le lecteur d'écran (Linux)** : Lorsqu'un calcul est validé, le résultat est lu à voix haute par le lecteur d'écran (Orca).
- **Annonce des erreurs de formule** : Les erreurs de formule sont classées par type et annoncées via le lecteur d'écran.
- **Annulation de la suppression d'un enregistrement** : La suppression d'un enregistrement de l'historique peut être annulée depuis une barre de notification.
- **Accessibilité au clavier améliorée** : Le menu des onglets débordants, le champ de formule et le bouton mémoire sont entièrement utilisables au clavier.
- **Thèmes plus contrastés** : Les couleurs des thèmes ont été relevées au contraste WCAG AA.
- **Nouvelles langues (10 au total)** : Ajout du portugais et du russe (0.12.1 inclus).

### Corrigé

- Affichage et collage des nombres selon les paramètres régionaux, unification en degrés des fonctions trigonométriques de la calculatrice de formules et de nombreuses autres corrections d'accessibilité et de traduction.

Pour des informations sur les versions précédentes, veuillez consulter [ici](https://github.com/from104/qcalc/blob/main/CHANGELOG.md).
