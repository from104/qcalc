# Informations sur l'application

Cette application a été créée en utilisant vue+quasar+tauri.

Contact : Seo Kihyun <from104@gmail.com>,

Copyright © 2022 Seo Kihyun. Licence MIT.

## Journal des modifications

Tous les changements notables de ce projet sont enregistrés dans ce fichier.

Le format est basé sur [Keep a Changelog] et ce projet suit le [Versionnage sémantique].

## [0.13.1] 2026-08-18

### Modifié

- **Nom de paquet unifié en QCalc** : si vous avez installé la 0.13.0 sous Windows, désinstallez d'abord l'ancienne entrée « Q Calc » — la nouvelle version ne reconnaît pas cette installation.

### Ajouté

- **APK Android à chaque version** : elle est désormais compilée, signée et jointe automatiquement.

### Corrigé

- **Le paquet Snap démarre** : le Snap de la 0.13.0 lançait le mauvais programme et l'application ne s'ouvrait jamais.
- **Les mises à jour parviennent de nouveau à la 0.12.x (Windows, AppImage)** : ces installations échouaient à chaque vérification et n'apprenaient jamais l'existence d'une version plus récente.
- **L'installation sous Windows supprime l'ancienne application** : installer par-dessus la 0.12.x laissait ses fichiers et son entrée dans Applications et fonctionnalités.
- **L'AppImage ne se ferme plus juste après son démarrage sous Wayland (Linux)**.
- **Tailles sous Linux** : la fenêtre suit la mise à l'échelle du texte du bureau au lieu de tout agrandir, et les libellés du clavier restent dans leurs boutons.

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
- **Nouvelles langues (10 au total)** : Ajout du portugais et du russe.

### Corrigé

- Affichage et collage des nombres selon les paramètres régionaux, unification en degrés des fonctions trigonométriques de la calculatrice de formules et de nombreuses autres corrections d'accessibilité et de traduction.

Pour des informations sur les versions précédentes, veuillez consulter [ici](https://github.com/from104/qcalc/blob/main/CHANGELOG.md).
