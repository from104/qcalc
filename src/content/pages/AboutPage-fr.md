# Informations sur l'application

Cette application a été créée en utilisant vue+quasar+electron.

Contact : Seo Kihyun <from104@gmail.com>,

Copyright © 2022 Seo Kihyun. Licence MIT.

## Journal des modifications

Tous les changements notables de ce projet sont enregistrés dans ce fichier.

Le format est basé sur [Keep a Changelog] et ce projet suit le [Versionnage sémantique].

## [0.11.6] 2025-12-27

### Ajouté

- **Fonctionnalité de format numérique par calculatrice** : Ajout de la possibilité d'utiliser des paramètres de format numérique indépendants (groupement des nombres, unité de groupement, décimales) pour chaque calculatrice (standard, unités, devises, bases). Basculer avec le raccourci clavier Alt+n.

### Modifié

### Corrigé

- **Calcul dynamique de la hauteur des boutons amélioré** : Optimisation de la logique de calcul de la hauteur des boutons en utilisant `requestAnimationFrame` et `nextTick` au lieu de `setTimeout` pour une meilleure précision et performance.
- **Initialisation du champ de résultat optimisée** : Suppression de la logique d'échange d'état redondante lors du montage du composant et amélioration de la détection de débordement de texte pour s'exécuter immédiatement après le rendu.
- **Optimisation de la disposition initiale par type de calculatrice** : Affinement des paramètres initiaux de hauteur des boutons pour les différents types de calculatrices (Standard, Unités, Devises, Bases) afin de réduire les décalages de disposition.
- **Correction du bug de transition des sous-pages en disposition large** : Correction d'un problème où l'effet de transition des sous-pages (section droite) en disposition large ne fonctionnait pas correctement.
- **Détection du débordement de texte dans le champ de résultat améliorée** : Révision complète et réécriture de la logique de détection de débordement de texte dans les champs de résultat. Mise en place d'un système de suivi précis et continu utilisant ResizeObserver et watch, garantissant une mise en surbrillance des couleurs et un affichage des infobulles précis lorsque le texte déborde.
- **Correction du problème d'enregistrement en double des raccourcis clavier** : Correction d'un problème où les raccourcis de navigation par onglets (Ctrl+Tab, ArrowRight, etc.) étaient exécutés deux fois. Résolu en s'assurant que useMainLayout n'est appelé que depuis MainLayout, empêchant les enregistrements en double des liaisons de touches provenant de plusieurs composants de disposition.
- **Correction de l'erreur de conversion de base de la valeur mémoire** : Ajout d'une gestion sécurisée des erreurs pour les erreurs de conversion de base qui se produisaient lors de l'initialisation ou lorsque des valeurs invalides étaient transmises.

Pour des informations sur les versions précédentes, veuillez consulter [ici](https://github.com/from104/qcalc/blob/main/CHANGELOG.md).
