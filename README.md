# Test ETL - API de Gestion de Produits eBay

## 📋 Description

Ce projet est une API REST Node.js/Express qui permet de scraper, stocker et gérer des produits eBay. Il utilise une API externe de scraping pour extraire les données des produits depuis eBay, puis les enregistre dans une base de données PostgreSQL via Prisma ORM.

### Fonctionnalités principales

- 🔍 **Scraping de produits individuels** : Extraction des données d'un produit eBay via son URL
- 📦 **Scraping de catégories** : Extraction de tous les produits d'une catégorie eBay avec traitement en lot
- 💾 **Stockage en base de données** : Sauvegarde des produits dans PostgreSQL avec Prisma
- 🔄 **Gestion CRUD complète** : Création, lecture, mise à jour et suppression de produits
- 🔎 **Recherche flexible** : Recherche par ID, itemId ou titre

## 🛠️ Technologies utilisées

- **Node.js** (ES Modules)
- **Express.js** v5.1.0
- **Prisma** v6.19.0 (ORM)
- **PostgreSQL** (base de données)
- **Axios** v1.13.2 (requêtes HTTP)
- **dotenv** v17.2.3 (gestion des variables d'environnement)

## 📦 Installation

### Prérequis

- Node.js (version 14 ou supérieure)
- PostgreSQL (base de données locale ou distante)
- npm ou yarn

### Étapes d'installation

1. **Cloner le projet** (si applicable) ou naviguer vers le répertoire du projet
   ```bash
   cd test_etl
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**

   Créer un fichier `.env` à la racine du projet :
   ```env
   PORT=1514
   DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
   ```

   > **Note** : Si vous utilisez le schéma Prisma existant, la `DATABASE_URL` est déjà définie dans `schema.prisma`. Vous pouvez également la surcharger via le fichier `.env`.

4. **Configurer la base de données**

   Générer le client Prisma :
   ```bash
   npx prisma generate
   ```

   Appliquer les migrations (si nécessaire) :
   ```bash
   npx prisma migrate dev
   ```

## 🚀 Démarrage

### Mode développement (avec watch)

```bash
npm run dev
```

ou

```bash
npm start
```

### Mode production

```bash
npm run buld
```

Le serveur démarre sur le port défini dans `PORT` (par défaut : `1514`) et sera accessible à l'adresse :
```
http://localhost:1514
```

## 📁 Structure du projet

```
test_etl/
├── src/
│   ├── db/
│   │   └── client.js              # Client Prisma
│   ├── routes/
│   │   ├── productRoutes.js       # Routes pour les produits
│   │   └── categorieRoutes.js     # Routes pour les catégories
│   ├── services/
│   │   └── productService.js      # Services métier pour les produits
│   └── server.js                  # Point d'entrée de l'application
├── prisma/
│   ├── migrations/                # Migrations de base de données
│   └── schema.prisma              # Schéma Prisma
├── package.json
├── .env                           # Variables d'environnement (à créer)
└── README.md
```

## 🗄️ Modèle de données

### Modèle Product

Le modèle `Product` contient les champs suivants :

| Champ | Type | Description |
|-------|------|-------------|
| `id` | BigInt | Identifiant unique auto-incrémenté |
| `itemId` | String | Identifiant unique du produit eBay |
| `title` | String? | Titre du produit |
| `oemReference` | String? | Référence OEM |
| `priceNet` | Float? | Prix net |
| `priceBrut` | Float? | Prix brut |
| `currency` | String? | Devise (max 8 caractères) |
| `url` | String? | URL du produit sur eBay |
| `images` | String[] | Tableau des URLs des images |
| `seller` | Json? | Informations du vendeur (JSON) |
| `listingStartDate` | DateTime? | Date de début de l'annonce |
| `status` | String | Statut du produit (défaut: "ACTIVE") |
| `endDate` | DateTime? | Date de fin de l'annonce |
| `closedReason` | String? | Raison de la fermeture |
| `createdAt` | DateTime | Date de création |
| `updatedAt` | DateTime | Date de mise à jour |

## 🔌 API Endpoints

### Routes Produits (`/products`)

#### 1. Créer un produit (scraping)

**POST** `/products/product`

Scrape un produit eBay et l'enregistre en base de données.

**Paramètres** :
- Body ou Query : `url` (string) - URL du produit eBay à scraper

**Exemple de requête** :
```bash
POST http://localhost:1514/products/product
Content-Type: application/json

{
  "url": "https://www.ebay.com/itm/..."
}
```

ou via query parameter :
```bash
POST http://localhost:1514/products/product?url=https://www.ebay.com/itm/...
```

**Réponse réussie (200)** :
```json
{
  "id": "123456789",
  "itemId": "314123456789",
  "title": "Product Title",
  "priceNet": 29.99,
  "priceBrut": 35.99,
  "currency": "USD",
  "url": "https://www.ebay.com/itm/...",
  "images": ["https://..."],
  "status": "ACTIVE",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

#### 2. Récupérer tous les produits

**GET** `/products/all`

Retourne la liste de tous les produits enregistrés.

**Exemple de requête** :
```bash
GET http://localhost:1514/products/all
```

**Réponse réussie (200)** :
```json
[
  {
    "id": "123456789",
    "itemId": "314123456789",
    "title": "Product 1",
    ...
  },
  {
    "id": "123456790",
    "itemId": "314123456790",
    "title": "Product 2",
    ...
  }
]
```

---

#### 3. Récupérer un produit par ID, itemId ou titre

**GET** `/products/:search`

Recherche un produit par :
- ID (si c'est un nombre)
- itemId
- Titre (recherche partielle, insensible à la casse)

**Paramètres** :
- `:search` - ID, itemId ou terme de recherche dans le titre

**Exemple de requête** :
```bash
# Par ID
GET http://localhost:1514/products/123456789

# Par itemId
GET http://localhost:1514/products/314123456789

# Par titre (recherche partielle)
GET http://localhost:1514/products/iphone
```

**Réponse réussie (200)** :
```json
{
  "id": "123456789",
  "itemId": "314123456789",
  "title": "iPhone 13 Pro",
  ...
}
```

**Réponse si non trouvé (404)** :
```json
{
  "error": "Produit non trouvé"
}
```

---

#### 4. Mettre à jour un produit

**PUT** `/products/:id`

Met à jour les informations d'un produit existant.

**Paramètres** :
- `:id` - ID du produit (BigInt)

**Body** : Objet JSON avec les champs à mettre à jour

**Exemple de requête** :
```bash
PUT http://localhost:1514/products/123456789
Content-Type: application/json

{
  "title": "Nouveau titre",
  "priceNet": 39.99,
  "status": "INACTIVE"
}
```

**Réponse réussie (200)** :
```json
{
  "id": "123456789",
  "title": "Nouveau titre",
  "priceNet": 39.99,
  "status": "INACTIVE",
  ...
}
```

---

#### 5. Supprimer un produit

**DELETE** `/products/:search`

Supprime un produit par ID ou itemId.

**Paramètres** :
- `:search` - ID (si c'est un nombre) ou itemId

**Exemple de requête** :
```bash
# Par ID
DELETE http://localhost:1514/products/123456789

# Par itemId
DELETE http://localhost:1514/products/314123456789
```

**Réponse réussie (200)** :
```json
{
  "message": "Produit supprimé",
  "product": {
    "id": "123456789",
    "itemId": "314123456789",
    ...
  }
}
```

**Réponse si non trouvé (404)** :
```json
{
  "error": "Produit non trouvé"
}
```

---

### Routes Catégories (`/categorie`)

#### 1. Scraper une catégorie complète

**POST** `/categorie`

Scrape tous les produits d'une catégorie eBay et les enregistre en base de données. Le traitement s'effectue en lot avec un délai de 10 secondes entre chaque produit pour éviter la surcharge de l'API externe.

**Paramètres** :
- Body ou Query : `categorie` (string) - URL de la catégorie eBay à scraper

**Exemple de requête** :
```bash
POST http://localhost:1514/categorie
Content-Type: application/json

{
  "categorie": "https://www.ebay.com/b/Category/..."
}
```

**Réponse réussie (200)** :
```json
[
  {
    "link": "https://www.ebay.com/itm/...",
    ...
  },
  ...
]
```

> **Note** : Cette opération peut prendre du temps selon le nombre de produits dans la catégorie. Chaque produit est traité avec un délai de 10 secondes.

---

## 🔧 Services

### productService.js

Le service `productService` expose les fonctions suivantes :

- `createProduct(data)` : Crée un nouveau produit
- `getProducts()` : Récupère tous les produits
- `getProductById(id)` : Récupère un produit par ID
- `getProductByItemId(itemId)` : Récupère un produit par itemId
- `getProductByTitle(title)` : Recherche un produit par titre
- `updateProduct(id, data)` : Met à jour un produit
- `deleteProductById(id)` : Supprime un produit par ID
- `deleteProductByItemId(itemId)` : Supprime un produit par itemId
- `upsertProduct(data)` : Crée ou met à jour un produit selon l'itemId

## 🔗 API Externe

Le projet utilise une API externe de scraping hébergée sur Render :

- **URL de base** : `http://taapit-scraping-api-etyf.onrender.com/api/ebay`
- **Endpoint produit** : `/product?path={url}`
- **Endpoint catégorie** : `/categorie?path={url}`

Cette API externe est responsable du scraping des données depuis eBay.

## ⚠️ Notes importantes

### Gestion des BigInt

Les IDs sont stockés en `BigInt` dans PostgreSQL. Une fonction `serializeBigInt` est utilisée dans les routes pour convertir les BigInt en chaînes de caractères lors de la sérialisation JSON, car JavaScript ne supporte pas nativement les BigInt dans JSON.

### Délais dans le scraping de catégories

Le scraping de catégories inclut un délai de **10 secondes** entre chaque produit pour éviter de surcharger l'API externe. Pour une catégorie avec 100 produits, le traitement complet prendra environ 16-17 minutes.

### Variables d'environnement

Assurez-vous de configurer correctement le fichier `.env` avec :
- `PORT` : Port du serveur (optionnel, défaut: 1514)
- `DATABASE_URL` : URL de connexion PostgreSQL (si vous souhaitez surcharger celle du schema.prisma)

## 📝 Scripts disponibles

- `npm start` ou `npm run dev` : Démarre le serveur en mode watch (redémarrage automatique)
- `npm run buld` : Démarre le serveur en mode production

> **Note** : Il y a une faute de frappe dans le script `buld` (devrait être `build`), mais cela n'affecte pas le fonctionnement.

## 🐛 Gestion des erreurs

Toutes les routes incluent une gestion d'erreurs avec :
- Codes de statut HTTP appropriés (400, 404, 500)
- Messages d'erreur descriptifs en JSON
- Logs des erreurs dans la console

## 👤 Auteur

**Justin Lantomalala**

## 📄 Licence

ISC

---

## 🔄 Exemple de workflow complet

1. **Créer un produit individuel** :
   ```bash
   curl -X POST http://localhost:1514/products/product \
     -H "Content-Type: application/json" \
     -d '{"url": "https://www.ebay.com/itm/..."}'
   ```

2. **Récupérer tous les produits** :
   ```bash
   curl http://localhost:1514/products/all
   ```

3. **Rechercher un produit** :
   ```bash
   curl http://localhost:1514/products/iphone
   ```

4. **Mettre à jour un produit** :
   ```bash
   curl -X PUT http://localhost:1514/products/123456789 \
     -H "Content-Type: application/json" \
     -d '{"priceNet": 49.99}'
   ```

5. **Supprimer un produit** :
   ```bash
   curl -X DELETE http://localhost:1514/products/123456789
   ```

6. **Scraper une catégorie complète** :
   ```bash
   curl -X POST http://localhost:1514/categorie \
     -H "Content-Type: application/json" \
     -d '{"categorie": "https://www.ebay.com/b/Category/..."}'
   ```

