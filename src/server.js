import express from 'express';
import productRoutes from './routes/productRoutes.js';
import categorieRoutes from './routes/categorieRoutes.js';
import resScrapeRoutes from './routes/resScrapeDb.js';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import yaml from 'js-yaml';

dotenv.config();
let port = process.env.PORT || 1514;
const app = express();
app.use(express.json());

// Configuration Swagger
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const swaggerPath = join(__dirname, '../swagger.yaml');
const swaggerFile = readFileSync(swaggerPath, 'utf8');
const swaggerDocument = yaml.load(swaggerFile);

// Route pour la documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API ETL - Documentation Swagger'
}));

// Route pour obtenir le JSON Swagger
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

app.use('/products', productRoutes);
app.use('/categorie', categorieRoutes);
app.use('/rescrape', resScrapeRoutes);


app.listen(port, () => {
  console.log(`Server running on port link: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api-docs`);
});
