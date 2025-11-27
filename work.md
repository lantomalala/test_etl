# 📝 Briefing – Test Web Scraper (POC “Vie d’une Annonce Occasion”)

**Durée : 1 semaine**

## 🎯 Objectif de la semaine

Développer une preuve de concept (POC) capable de suivre les annonces d’un seul vendeur sur une marketplace (ex. eBay) afin de :

-   identifier les annonces actives,
-   détecter celles vendues / retirées / clôturées,
-   connaître depuis quand chaque annonce est en ligne,
-   préparer le calcul de la durée de vie / rotation de chaque pièce.

**À la fin de la semaine :**
“Voilà les annonces en cours de ce vendeur, voilà celles qui sont terminées, avec leurs prix et leurs OEM.”

---

## 1. Périmètre du test

### Plateforme & vendeur

-   **Plateforme :** eBay (ou autre marketplace)
-   **Vendeur :** une seule boutique ciblée

### Type de produits

-   Pièces uniquement **d’occasion**
-   **1 annonce = 1 pièce unique**

---

## 2. Données à collecter

Pour chaque annonce :

-   `item_id` : identifiant unique
-   `title` : titre
-   `oem_reference` : référence OEM (si détectable)
-   `price` : prix
-   `currency` : devise
-   `url` : lien direct
-   `seller` : identifiant vendeur
-   `listing_start_date` : date de mise en ligne ou première détection
-   `status` : `ACTIVE` / `ENDED`
-   `end_date` : date de fin _(nullable)_
-   `closed_reason` _(optionnel)_

---

## 3. Plan de travail – semaine 1

### Étape 1 — Collecte brute _(Jours 1–2)_

1. Configurer API / scraping.
2. Récupérer toutes les annonces **ACTIVES**.
3. Stocker un premier dataset brut (JSON/CSV).
4. Enregistrer les premiers champs collectés.

### Étape 2 — Base & suivi d’état _(Jours 2–4)_

5. Créer une **base SQL** avec la table `listings`.
6. Développer un script qui :

    - insère les nouvelles annonces,
    - met à jour le prix si changement,
    - ne modifie pas les annonces **ENDED**.

**Détection de ENDED :**

-   si une annonce active disparaît → `status = ENDED` + `end_date`

### Étape 3 — Dashboard & documentation _(Jours 4–5)_

7. Créer un mini-dashboard :

    - Vue 1 : annonces **ACTIVES**
    - Vue 2 : annonces **ENDED**
    - Vue 3 : KPIs simples

8. Export CSV/Excel.
9. Rédiger la documentation : installation, lancement, accès au dashboard, ajout vendeur.

---

## 4. Livrables attendus (fin de semaine)

-   Script fonctionnel
-   Base SQL remplie
-   Dashboard
-   Export CSV/Excel
-   Documentation claire

---

## 5. Critères d’évaluation

-   Compréhension métier
-   Affichage clair des annonces actives / terminées
-   Structure prête pour calcul de rotation
-   Code propre et réexécutable
-   Documentation exploitable par un autre développeur
