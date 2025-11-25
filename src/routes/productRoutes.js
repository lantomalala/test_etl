import express from 'express';
import * as productService from '../services/productService.js';

const router = express.Router();

// Créer un produit
router.post('/', async (req, res) => {
    try { 
        const product = await productService.createProduct(req.body);
        res.json(product); 
    } catch(e) { 
        res.status(500).json({ error: e.message }); 
    }
});

// Récupérer tous les produits
router.get('/', async (req, res) => {
    try { 
        const products = await productService.getProducts();
        res.json(products); 
    } catch(e) { 
        res.status(500).json({ error: e.message }); 
    }
});

// Récupérer un produit par ID
router.get('/:id', async (req, res) => {
    try { 
        const product = await productService.getProductById(req.params.id);
        res.json(product); 
    } catch(e) { 
        res.status(500).json({ error: e.message }); 
    }
});

// Mettre à jour un produit
router.put('/:id', async (req, res) => {
    try { 
        const product = await productService.updateProduct(req.params.id, req.body);
        res.json(product); 
    } catch(e) { 
        res.status(500).json({ error: e.message }); 
    }
});

// Supprimer un produit
router.delete('/:id', async (req, res) => {
    try { 
        const product = await productService.deleteProduct(req.params.id);
        res.json({ message: 'Produit supprimé', product }); 
    } catch(e) { 
        res.status(500).json({ error: e.message }); 
    }
});

export default router;
