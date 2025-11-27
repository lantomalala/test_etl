# 📚 Documentation des Routes API

Base URL: `http://localhost:1514`

---

## 📦 Routes Produits (`/products`)

### 1. **POST `/products/product`** - Créer un produit en scrapant une URL

**Description** : Scrape une URL eBay et crée un nouveau produit dans la base de données.

**Méthode** : `POST`

**URL** : `/products/product`

**Paramètres** :
- `url` (body ou query) : URL eBay du produit à scraper

**Exemple de requête** :
```bash
POST /products/product
Body: { "url": "https://www.ebay.com/itm/123456789" }
# ou
POST /products/product?url=https://www.ebay.com/itm/123456789
```

**Réponse succès (200)** :
```json
{
  "id": "1",
  "itemId": "123456789",
  "title": "Titre du produit",
  "priceNet": 100.50,
  "priceBrut": 120.00,
  "currency": "EUR",
  "status": "ACTIVE",
  ...
}
```

**Réponse erreur (500)** :
```json
{
  "error": "Message d'erreur"
}
```

**Fonctionnalités** :
- Scrape les données du produit depuis l'API de scraping
- Crée un nouveau produit dans la base de données
- Mappe automatiquement les données scrapées vers le schéma Prisma

---

### 2. **GET `/products/all`** - Récupérer tous les produits

**Description** : Récupère la liste complète de tous les produits enregistrés dans la base de données.

**Méthode** : `GET`

**URL** : `/products/all`

**Paramètres** : Aucun

**Exemple de requête** :
```bash
GET /products/all
```

**Réponse succès (200)** :
```json
[
  {
    "id": "1",
    "itemId": "123456789",
    "title": "Produit 1",
    ...
  },
  {
    "id": "2",
    "itemId": "987654321",
    "title": "Produit 2",
    ...
  }
]
```

**Fonctionnalités** :
- Retourne tous les produits sans filtre
- Sérialise automatiquement les BigInt en string

---

### 3. **GET `/products/:search`** - Rechercher un produit

**Description** : Recherche un produit par ID, itemId ou titre (recherche partielle).

**Méthode** : `GET`

**URL** : `/products/:search`

**Paramètres** :
- `search` (paramètre d'URL) : ID numérique, itemId ou titre du produit

**Exemple de requête** :
```bash
GET /products/123456789        # Recherche par itemId
GET /products/1                # Recherche par ID
GET /products/voiture          # Recherche par titre (insensible à la casse)
```

**Réponse succès (200)** :
```json
{
  "id": "1",
  "itemId": "123456789",
  "title": "Titre du produit",
  ...
}
```

**Réponse erreur (404)** :
```json
{
  "error": "Produit non trouvé"
}
```

**Fonctionnalités** :
- Recherche intelligente : essaie d'abord par ID numérique, puis par itemId, puis par titre
- Recherche de titre insensible à la casse et partielle (contient)

---

### 4. **PUT `/products/:id`** - Mettre à jour un produit

**Description** : Met à jour les informations d'un produit existant par son ID.

**Méthode** : `PUT`

**URL** : `/products/:id`

**Paramètres** :
- `id` (paramètre d'URL) : ID du produit à mettre à jour
- Body : Objet JSON avec les champs à mettre à jour

**Exemple de requête** :
```bash
PUT /products/1
Body: {
  "title": "Nouveau titre",
  "priceNet": 150.00,
  "status": "ACTIVE"
}
```

**Réponse succès (200)** :
```json
{
  "id": "1",
  "title": "Nouveau titre",
  "priceNet": 150.00,
  ...
}
```

**Fonctionnalités** :
- Met à jour uniquement les champs fournis dans le body
- Retourne le produit mis à jour

---

### 5. **DELETE `/products/:search`** - Supprimer un produit

**Description** : Supprime un produit par ID ou itemId.

**Méthode** : `DELETE`

**URL** : `/products/:search`

**Paramètres** :
- `search` (paramètre d'URL) : ID numérique ou itemId du produit à supprimer

**Exemple de requête** :
```bash
DELETE /products/1              # Suppression par ID
DELETE /products/123456789      # Suppression par itemId
```

**Réponse succès (200)** :
```json
{
  "message": "Produit supprimé",
  "product": { ... }
}
```

**Réponse erreur (404)** :
```json
{
  "error": "Produit non trouvé"
}
```

**Fonctionnalités** :
- Supprime le produit de la base de données
- Essaie d'abord par ID numérique, puis par itemId

---

## 📁 Routes Catégorie (`/categorie`)

### 6. **POST `/categorie`** - Scraper une catégorie complète

**Description** : Scrape tous les produits d'une catégorie eBay et les ajoute à la base de données.

**Méthode** : `POST`

**URL** : `/categorie`

**Paramètres** :
- `categorie` (body ou query) : URL de la catégorie eBay à scraper

**Exemple de requête** :
```bash
POST /categorie
Body: { "categorie": "https://www.ebay.com/b/..." }
# ou
POST /categorie?categorie=https://www.ebay.com/b/...
```

**Réponse succès (200)** :
```json
{
  "total": 50,
  "results": [
    {
      "index": 1,
      "total": 50,
      "product_link": { ... },
      "status": "traité avec succès"
    },
    ...
  ]
}
```

**Fonctionnalités** :
- Récupère tous les liens de produits de la catégorie
- Scrape chaque produit un par un
- Attend 10 secondes entre chaque scraping (pour éviter la surcharge)
- Affiche des logs détaillés du progrès
- Crée automatiquement chaque produit dans la base de données

**Note** : Cette opération peut prendre beaucoup de temps selon le nombre de produits dans la catégorie.

---

## 🔄 Routes Rescrape (`/rescrape`)

### 7. **POST `/rescrape/all`** - Rescraper tous les produits

**Description** : Rescrape tous les produits qui ont une URL dans la base de données. Met à jour les prix si changés et change le status en ENDED si le lien ne fonctionne plus.

**Méthode** : `POST`

**URL** : `/rescrape/all`

**Paramètres** : Aucun

**Exemple de requête** :
```bash
POST /rescrape/all
```

**Réponse succès (200)** :
```json
{
  "message": "Rescraping terminé: 45 succès, 5 échecs, 12 prix mis à jour",
  "results": {
    "success": 45,
    "failed": 5,
    "updated": 12,
    "details": [
      {
        "productId": "1",
        "itemId": "123456789",
        "status": "success",
        "priceChanged": true,
        "oldPrice": { "net": 100, "brut": 120, "currency": "EUR" },
        "newPrice": { "net": 110, "brut": 132, "currency": "EUR" }
      },
      {
        "productId": "2",
        "itemId": "987654321",
        "status": "failed",
        "reason": "Lien introuvable (404)",
        "oldStatus": "ACTIVE"
      },
      ...
    ]
  }
}
```

**Fonctionnalités** :
- Récupère tous les produits avec une URL
- Pour chaque produit :
  - **Si le scraping réussit** :
    - Met à jour les prix si changés
    - Met le status à `ACTIVE` (ou le remet à `ACTIVE` s'il était `ENDED`)
    - Réinitialise `endDate` si le produit était `ENDED`
  - **Si le scraping échoue** :
    - Change le status en `ENDED`
    - Met à jour `endDate` avec la date actuelle
- Attend 10 secondes entre chaque scraping
- Affiche des logs détaillés du progrès
- Retourne un résumé complet avec les détails de chaque produit

**Note** : Cette opération peut prendre beaucoup de temps selon le nombre de produits.

---

### 8. **POST `/rescrape/one`** - Rescraper un seul produit

**Description** : Rescrape un seul produit soit par son itemId soit par une URL directe.

**Méthode** : `POST`

**URL** : `/rescrape/one`

**Paramètres** :
- `itemId` (body ou query) : itemId du produit à rescraper
- `url` (body ou query) : URL directe du produit à scraper

**Exemple de requête** :
```bash
# Par itemId
POST /rescrape/one
Body: { "itemId": "123456789" }
# ou
POST /rescrape/one?itemId=123456789

# Par URL
POST /rescrape/one
Body: { "url": "https://www.ebay.com/itm/123456789" }
# ou
POST /rescrape/one?url=https://www.ebay.com/itm/123456789
```

**Réponse succès (200)** :
```json
{
  "message": "Produit rescrapé avec succès",
  "product": {
    "id": "1",
    "itemId": "123456789",
    "title": "Titre du produit",
    "priceNet": 110.00,
    "priceBrut": 132.00,
    "currency": "EUR",
    "status": "ACTIVE",
    ...
  },
  "priceChanged": true,
  "oldPrice": { "net": 100, "brut": 120, "currency": "EUR" },
  "newPrice": { "net": 110, "brut": 132, "currency": "EUR" }
}
```

**Réponse si produit non trouvé dans la DB (200)** :
```json
{
  "message": "Produit scrapé mais non trouvé dans la base de données",
  "scrapedData": { ... },
  "note": "Utilisez la route POST /products/product pour créer le produit"
}
```

**Réponse erreur (404)** :
```json
{
  "error": "Produit non trouvé",
  "itemId": "123456789"
}
```

**Réponse erreur (400)** :
```json
{
  "error": "itemId ou url requis",
  "message": "Vous devez fournir soit un itemId soit une url dans le body ou les query params"
}
```

**Réponse erreur (500)** :
```json
{
  "error": "Erreur lors du rescraping",
  "reason": "Lien introuvable (404)"
}
```

**Fonctionnalités** :
- Recherche le produit par itemId si fourni
- Scrape l'URL (soit depuis la DB, soit directement fournie)
- Si le produit existe dans la DB :
  - Met à jour les prix si changés
  - Met le status à `ACTIVE` (ou le remet à `ACTIVE` s'il était `ENDED`)
  - Réinitialise `endDate` si le produit était `ENDED`
- Si le scraping échoue et que le produit existe :
  - Change le status en `ENDED`
  - Met à jour `endDate`
- Si le produit n'existe pas dans la DB, retourne les données scrapées

---

## 📊 Résumé des Routes

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/products/product` | Créer un produit en scrapant une URL |
| GET | `/products/all` | Récupérer tous les produits |
| GET | `/products/:search` | Rechercher un produit (ID/itemId/titre) |
| PUT | `/products/:id` | Mettre à jour un produit |
| DELETE | `/products/:search` | Supprimer un produit |
| POST | `/categorie` | Scraper une catégorie complète |
| POST | `/rescrape/all` | Rescraper tous les produits |
| POST | `/rescrape/one` | Rescraper un seul produit |

---

## 🔑 Concepts Importants

### Status des Produits
- **ACTIVE** : Le produit est actuellement en vente
- **ENDED** : Le produit n'est plus disponible (lien mort, vendu, retiré)

### Gestion des Prix
- **priceNet** : Prix net du produit
- **priceBrut** : Prix brut (avec taxes)
- **currency** : Devise (EUR, USD, etc.)

### Logs
Toutes les routes de scraping affichent des logs détaillés dans la console pour suivre le progrès :
- Progression `[index/total]`
- Statut de chaque produit
- Changements de prix
- Erreurs rencontrées

---

## ⚠️ Notes Importantes

1. **Délais entre requêtes** : Les routes de scraping attendent 10 secondes entre chaque requête pour éviter la surcharge de l'API.

2. **Timeout** : Les requêtes de scraping ont un timeout de 30 secondes.

3. **BigInt** : Les IDs sont automatiquement convertis en string dans les réponses JSON.

4. **Gestion d'erreurs** : Toutes les routes gèrent les erreurs et retournent des messages appropriés.

5. **Rescraping** : Les routes de rescraping mettent automatiquement à jour le status des produits selon si le lien fonctionne encore ou non.

