# 📚 Documentation Swagger/OpenAPI

Ce projet inclut une documentation OpenAPI complète accessible via Swagger UI.

## 🚀 Accès à la documentation

Une fois le serveur démarré, accédez à la documentation Swagger à l'adresse suivante :

```
http://localhost:1514/api-docs
```

## 📋 Fichiers de documentation

- **`swagger.yaml`** : Fichier OpenAPI 3.0.3 contenant toute la spécification de l'API
- **`/swagger.json`** : Endpoint JSON de la spécification (accessible à `http://localhost:1514/swagger.json`)

## 🔧 Configuration

La configuration Swagger est intégrée dans `src/server.js` et utilise :
- `swagger-ui-express` : Interface utilisateur Swagger
- `js-yaml` : Parser YAML pour charger la spécification

## 📖 Utilisation

1. **Démarrer le serveur** :
   ```bash
   npm start
   # ou
   npm run dev
   ```

2. **Ouvrir votre navigateur** et accéder à :
   ```
   http://localhost:1514/api-docs
   ```

3. **Tester les endpoints** directement depuis l'interface Swagger :
   - Cliquez sur un endpoint pour voir les détails
   - Cliquez sur "Try it out" pour tester l'endpoint
   - Remplissez les paramètres requis
   - Cliquez sur "Execute" pour envoyer la requête

## 📝 Routes documentées

### Produits (`/products`)
- `POST /products/product` - Créer un produit en scrapant une URL
- `GET /products/all` - Récupérer tous les produits
- `GET /products/{search}` - Rechercher un produit
- `PUT /products/{id}` - Mettre à jour un produit
- `DELETE /products/{search}` - Supprimer un produit

### Catégorie (`/categorie`)
- `POST /categorie` - Scraper une catégorie complète

### Rescrape (`/rescrape`)
- `POST /rescrape/all` - Rescraper tous les produits
- `POST /rescrape/one` - Rescraper un seul produit

## 🔄 Mise à jour de la documentation

Pour mettre à jour la documentation :

1. Modifiez le fichier `swagger.yaml`
2. Redémarrez le serveur
3. La documentation sera automatiquement mise à jour

## 📦 Dépendances

Les dépendances suivantes sont nécessaires :
- `swagger-ui-express` : Interface Swagger UI
- `js-yaml` : Parser YAML

Elles sont déjà installées dans le projet.

## 🌐 Format OpenAPI

La documentation suit le standard OpenAPI 3.0.3 et inclut :
- Descriptions détaillées de chaque endpoint
- Schémas de requête et de réponse
- Exemples de données
- Codes de statut HTTP
- Paramètres et body de requête

