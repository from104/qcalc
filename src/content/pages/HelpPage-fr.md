# QCalc - Une calculatrice polyvalente pour la productivité et l'accessibilité

Calculs de haute précision, conversion d'unités/devises/bases numériques et évaluation de formules dans une seule application. Une calculatrice polyvalente offrant une expérience cohérente sur ordinateur et mobile.

## Fonctionnalités principales de l'application

- **5 calculatrices professionnelles** : Calculatrice standard, convertisseur d'unités, convertisseur de devises, calculatrice programmeur et calculatrice de formules répondent à tous vos besoins de calcul
- **Moteur de calcul haute précision** : Prend en charge des calculs précis jusqu'à 64 chiffres avec des fonctions mathématiques avancées comme la trigonométrie, la factorielle et les puissances
- **Bases numériques et opérations sur les bits** : Convertit entre binaire/octal/décimal/hexadécimal et prend en charge les opérations professionnelles sur les bits (AND, OR, XOR, NOT) pour les programmeurs
- **Expérience utilisateur intelligente** : Offre un environnement personnalisé avec des favoris d'unités/devises, divers thèmes de couleurs, et des notes d'historique de calcul avec export/import
- **Support multiplateforme** : Offre une expérience cohérente sur Windows, Linux (ordinateur) et Android (mobile) avec prise en charge des mises à jour automatiques
- **Conception axée sur l'accessibilité** : Continuellement améliorée pour un accès facile par tous les utilisateurs avec des raccourcis clavier, un retour haptique et des dispositions adaptatives
- **Gestion des paramètres** : Exportez ou importez tous les paramètres dans un fichier pour maintenir les mêmes réglages dans différents environnements

## Guide des fonctionnalités principales

### Comment utiliser les 5 calculatrices

#### Calculatrice standard

- **Comment y accéder** : Ctrl+1 ou sélectionner l'onglet supérieur
- **Opérations de base** : Entrez les chiffres 0-9, +, -, \*, / touches
- **Fonctions avancées** : Fonctions trigonométriques (q, w, e), carré (u), racine carrée (i), constantes (z : π, x : φ, c : e)
- **Fonctions mémoire** : Ctrl+Enter (MS), Ctrl+Backspace (MR), Ctrl+Delete (MC)
- **Mode édition** : Appuyez sur Space ou Enter (si vide) pour entrer, Esc pour effacer et quitter
- **Navigation dans l'historique** : Utilisez les touches ↑/↓ en mode édition pour parcourir les expressions précédentes, réinitialisation automatique lors de l'édition
- **Charger une expression** : Clic droit sur un enregistrement de formule → « Charger dans le champ de formule » pour réutiliser
- **Calcul de pourcentage** : 'nombre, /, nombre, %(k)' calcule le pourcentage
- **Appliquer un pourcentage** : 'nombre, \*, nombre, %(k)' applique le pourcentage

#### Convertisseur d'unités

- **Comment y accéder** : Ctrl+2 ou sélectionner l'onglet supérieur
- **Catégories de conversion** : Plus de 15 catégories incluant longueur, surface, volume, poids, angle, etc.
- **Favoris** : Définissez les unités fréquemment utilisées comme favoris pour un accès rapide
- **Échanger les unités** : Utilisez la touche '\' pour échanger les unités source/cible
- **Conversion rapide** : ×10/×100/×1000 (a/s/d), ÷10/÷100/÷1000 (z/x/c)
- **Symbole d'unité** : Basculer l'affichage/masquage du symbole d'unité avec la touche Alt+\

#### Convertisseur de devises

- **Comment y accéder** : Ctrl+3 ou sélectionner l'onglet supérieur
- **340 devises** : Fiduciaires, cryptomonnaies et métaux précieux — aucune clé API requise
- **Derniers taux de change** : Taux en temps réel (snapshot intégré utilisé hors ligne)
- **Favoris** : Définissez les devises fréquemment utilisées comme favoris pour un accès rapide
- **Calcul rapide** : +5/+10/+100 (f/g/h), -5/-10/-100 (q/w/e)
- **Échanger les devises** : Utilisez la touche '\' pour échanger les devises source/cible
- **Symbole de devise** : Basculer l'affichage/masquage du symbole de devise avec la touche Alt+\

#### Calculatrice programmeur

- **Comment y accéder** : Ctrl+4 ou sélectionner l'onglet supérieur
- **Bases prises en charge** : Convertir entre binaire, octal, décimal et hexadécimal
- **Saisie hexadécimale** : Entrez A-F en utilisant les touches z, x, c, a, s, d
- **Échanger les bases** : Utilisez la touche '\' pour échanger les bases source/cible
- **Symbole de base** : Basculer l'affichage/masquage du symbole d'unité avec la touche Alt+\
- **Position du symbole** : Basculer la position du symbole d'unité (avant/arrière) avec la touche Alt+Ctrl+\

#### Calculatrice de formules

- **Comment y accéder** : Ctrl+5 ou sélectionner l'onglet supérieur
- **Saisie d'expressions** : Entrez des expressions mathématiques directement en utilisant la syntaxe mathjs
- **Opérations prises en charge** : Toutes les fonctions mathématiques mathjs incluant l'arithmétique, les puissances, la trigonométrie, les logarithmes
- **Référence à la valeur actuelle** : Utilisez le symbole @ pour inclure la valeur calculée actuelle dans les expressions
- **Fonctions mémoire** : Ctrl+Enter (MS), Ctrl+Backspace (MR), Ctrl+Delete (MC)
- **Mode édition** : Appuyez sur Space ou Enter (si vide) pour entrer, Esc pour effacer et quitter
- **Navigation dans l'historique** : Utilisez les touches ↑/↓ en mode édition pour parcourir les expressions précédentes, réinitialisation automatique lors de l'édition
- **Charger une expression** : Clic droit sur un enregistrement de formule → « Charger dans le champ de formule » pour réutiliser

### Comment utiliser les fonctionnalités de productivité

#### Gestion de l'historique des calculs

- **Comment y accéder** : Touche F4 ou menu latéral
- **Défilement** : Déplacement de 50px avec les touches ↑/↓, 400px avec Page Haut/Bas
- **Recherche/Suppression** : Recherche avec Ctrl+F, suppression de l'historique avec Ctrl+D
- **Export/Import** : Exportez ou importez l'historique des calculs sous forme de fichier CSV via les boutons dans l'en-tête
- **Contrôle de la taille de police** : Ajustez la taille de la police en 3 étapes avec les boutons dans le coin inférieur gauche.
- **Ajouter des notes** : Ajoutez des notes aux enregistrements individuels
- **Glissement vers la gauche (Mobile)** : Ajouter/modifier des notes
- **Glissement vers la droite (Mobile)** : Supprimer des enregistrements

#### Gestion des paramètres

- **Comment y accéder** : Touche F3 ou menu latéral
- **Réinitialiser** : Réinitialiser tous les paramètres à leurs valeurs par défaut
- **Export/Import** : Enregistrez ou chargez les paramètres actuels sous forme de fichier JSON pour utiliser les mêmes réglages dans différents environnements

#### Paramètres d'affichage des nombres

- **Appliquer le format numérique par calculatrice** : Basculer avec la touche Alt+n
- **Afficher/Masquer le séparateur** : Basculer avec la touche ,
- **Définir l'unité de groupement** : Changer entre 3/4 chiffres avec la touche Alt+,
- **Décimales** : Ajuster avec les touches [, ] (illimité~16 chiffres)

#### Utiliser les raccourcis

- **Mode Shift** : Activer avec la touche ' pour accéder aux fonctions avancées
- **Navigation par onglets** : Se déplacer entre les onglets avec Ctrl+Tab (→), Ctrl+Shift+Tab (←)
- **Changement d'écran** : F1 (Aide), F2 (Info), F3 (Paramètres), F4 (Historique), F5 (Astuces)

#### Copier et coller

- **Copier le panneau principal** : Ctrl+C, Ctrl+Insert
- **Copier le panneau secondaire** : Shift+Ctrl+C, Alt+Ctrl+Insert
- **Coller dans le panneau principal** : Ctrl+V, Shift+Insert
- **Coller dans le panneau secondaire** : Shift+Ctrl+V, Alt+Shift+Insert
- **Ouvrir le menu** : Cliquez sur le panneau et utilisez le menu pour copier/coller

### **Astuces pour les outils avancés**

#### Fonctions mathématiques

- **Puissance N-ième/Racine N-ième** : Calculer avec les touches r/t
- **Fonctions trigonométriques** : Touches q/w/e en mode shift
- **Extraire la partie entière/décimale** : Calculer avec les touches v/b
- **Factorielle** : Calculer avec la touche h

#### Utiliser la mémoire

- **Stocker et rappeler la mémoire** : Stocker (MS) et rappeler (MR) après le calcul
- **Calcul mémoire** : Accumuler des valeurs avec les fonctions M+, M-, M×, M÷
- **Effacer la mémoire** : Effacer la mémoire avec MC
- **État de la mémoire** : Cliquez sur l'icône mémoire du panneau principal

#### Utiliser les opérations sur les bits

- **Opérations sur les bits** : AND (j), OR (k), XOR (l), NOT (h), opérations de décalage (r/t/u/i)
- **Extension logique** : Utilisez les opérations NAND/NOR/XNOR avec les touches q/w/e
- **Opérations de décalage** : Déplacer les positions de bits de 1 bit/4 bits
- **Définir la taille des bits** : Opérations sur les bits selon la taille définie

### **Optimiser l'expérience utilisateur**

#### Disposition de l'écran

- **Système de thèmes** : Choisissez parmi divers thèmes de couleurs au-delà du mode sombre/clair (modifier dans les Paramètres F3)
- **Toujours au premier plan** : Basculer le mode toujours au premier plan avec la touche Alt+t
- **Redimensionner la fenêtre** : Le panneau latéral s'ajuste automatiquement en fonction de la taille de la fenêtre
- **Réinitialiser le panneau** : Basculer la réinitialisation du panneau au démarrage avec la touche Alt+i
- **(Dés)activer le mode sombre** : Basculer le mode sombre avec la touche Alt+d
- **Appliquer le format numérique par calculatrice** : Basculer le format numérique par calculatrice avec la touche Alt+n

#### Support mobile

- **Glissement** : Changer de mode de calculatrice en glissant vers la gauche ou la droite
- **(Dés)activer le mode haptique** : Basculer le mode haptique avec la touche Alt+p
- **Mode paysage tablette** : Le panneau latéral s'ajuste automatiquement en mode paysage sur tablette

## Raccourcis clavier (S : Shift, C : Control, A : Alt)

### Calculatrice de base et fonctions communes

| Raccourci   | Fonction                           |
| ----------- | ---------------------------------- |
| 0-9.        | Saisir des chiffres et la décimale |
| +, -, \*, / | Arithmétique de base               |
| Enter, =    | Calculer le résultat               |
| Backspace   | Supprimer un caractère             |
| Delete      | Réinitialiser la calculatrice      |
| u           | Carré (x²)                         |
| i           | Racine carrée (√x)                 |
| j           | Changer le signe (±)               |
| k, %        | Pourcentage (%)                    |
| l           | Inverse (1/x)                      |
| '           | Activer le mode shift              |

### Fonctions mathématiques avancées (Mode Shift)

| Raccourci | Fonction                     |
| --------- | ---------------------------- |
| r         | Puissance (xⁿ)               |
| t         | Racine (ⁿ√x)                 |
| f         | Puissance de 10 (10ⁿ)        |
| g         | Modulo (x%y)                 |
| h         | Factorielle (x!)             |
| q,w,e     | Trigo (sin, cos, tan)        |
| a,s,d     | Constantes (Pi/2, ln10, ln2) |
| z,x,c     | Constantes (Pi, phi, e)      |
| v         | Partie entière               |
| b         | Partie décimale              |

### Opérations mémoire

| Raccourci       | Fonction                    |
| --------------- | --------------------------- |
| C-Delete        | Effacer la mémoire (MC)     |
| C-Backspace     | Rappeler la mémoire (MR)    |
| C-Enter, C-=    | Stocker en mémoire (MS)     |
| C-+, C-Numpad + | Ajout mémoire (M+)          |
| C--, C-Numpad - | Soustraction mémoire (M-)   |
| C-_, C-Numpad _ | Multiplication mémoire (M×) |
| C-/, C-Numpad / | Division mémoire (M÷)       |

### Mode de conversion d'unités/devises (Mode Shift)

| Raccourci | Fonction                          |
| --------- | --------------------------------- |
| f,g,h     | ×2/×3/×5 ou +5/+10/+100           |
| q,w,e     | ÷2/÷3/÷5 ou -5/-10/-100           |
| a,s,d     | ×10/×100/×1000                    |
| z,x,c     | ÷10/÷100/÷1000                    |
| \         | Échanger source et cible          |
| A-\       | Basculer l'affichage unité/devise |

### Mode convertisseur de bases

| Raccourci | Fonction                                   |
| --------- | ------------------------------------------ |
| r,t       | Décalage de 1 bit (x<<1, x>>1)             |
| u,i       | Décalage gauche/droite (x<<y, x>>y)        |
| f,g       | Décalage de 4 bits (x<<4, x>>4)            |
| h         | Opération NOT                              |
| j,k,l     | Opérations sur les bits (AND, OR, XOR)     |
| q,w,e     | NAND, NOR, XNOR                            |
| z,x,c     | Saisie hexadécimale (A, B, C)              |
| a,s,d     | Saisie hexadécimale (D, E, F)              |
| \         | Échanger source et cible                   |
| A-\       | Basculer l'affichage de la base            |
| AC-\      | Basculer la position de la base (pré/post) |

### Calculatrice de formules (Mode édition)

| Raccourci | Fonction                                        |
| --------- | ----------------------------------------------- |
| Space     | Entrer en mode édition                          |
| Enter     | Évaluer l'expression (ou mode édition si vide)  |
| Escape    | Effacer l'expression et quitter le mode édition |
| ↑/↓       | Parcourir l'historique des expressions          |
| =         | Évaluer l'expression                            |

### Navigation d'écran et contrôle de l'interface

| Raccourci | Fonction                         |
| --------- | -------------------------------- |
| F1        | Aide                             |
| F2        | À propos                         |
| F3        | Paramètres                       |
| F4        | Historique                       |
| F5        | Astuces                          |
| C-[12345] | Changer d'onglet de calculatrice |
| C-Tab, →  | Aller à l'onglet de droite       |
| CS-Tab, ← | Aller à l'onglet de gauche       |
| Escape    | Fermer l'écran actuel            |

### Paramètres de l'interface

| Raccourci | Fonction                                           |
| --------- | -------------------------------------------------- |
| A-t       | Basculer toujours au premier plan                  |
| A-i       | Basculer l'initialisation du panneau au démarrage  |
| A-d       | Basculer le mode sombre                            |
| A-p       | Basculer le mode haptique                          |
| A-n       | Basculer le format numérique par calculatrice      |
| ;         | Basculer les fonctions des boutons supplémentaires |
| ,         | Basculer le groupement des nombres                 |
| A-,       | Changer l'unité de groupement (3/4)                |
| [, ]      | Ajuster les décimales (∞~16)                       |
| q         | Quitter l'application                              |

### Opérations du presse-papiers

| Raccourci       | Fonction                                 |
| --------------- | ---------------------------------------- |
| C-c, C-Insert   | Copier le résultat du panneau principal  |
| SC-c, AC-Insert | Copier le résultat du panneau secondaire |
| C-v, S-Insert   | Coller dans le panneau principal         |
| SC-v, AS-Insert | Coller dans le panneau secondaire        |

### Navigation dans l'historique

| Raccourci       | Fonction                         |
| --------------- | -------------------------------- |
| ↑/↓             | Défiler de 50px haut/bas         |
| PageUp/PageDown | Défiler de 400px haut/bas        |
| Home/End        | Défiler au début/à la fin        |
| C-f             | Rechercher dans l'historique     |
| C-[             | Diminuer la taille de la police  |
| C-]             | Augmenter la taille de la police |
