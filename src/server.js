import express from 'express';
import productRoutes from './routes/productRoutes.js';
import categorieRoutes from './routes/categorieRoutes.js';
import dotenv from 'dotenv';
dotenv.config();
let port = process.env.PORT || 1514;
const app = express();
app.use(express.json());

app.use('/products', productRoutes);
app.use('/categorie', categorieRoutes);


app.listen(port, () => console.log(`Server running on port link: http://localhost:${port}`));
