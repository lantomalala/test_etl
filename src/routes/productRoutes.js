import express from 'express';
import * as productService from '../services/productService.js';
import axios from 'axios';

const router = express.Router();
function serializeBigInt(obj) {
    return JSON.parse(JSON.stringify(obj, (_, value) => (typeof value === 'bigint' ? value.toString() : value)));
}

// Créer un produit
router.post('/product', async (req, res) => {
    try {
        const urlToScrape = req.body.url || req.query.url; // ou une URL fixe
        const response = await axios.get(`http://taapit-scraping-api-etyf.onrender.com/api/ebay/product?path=${encodeURIComponent(urlToScrape)}`, {
            maxBodyLength: Infinity,
            headers: {}
        });

        const productData = response.data;

        // Mapper le JSON reçu vers les champs Prisma
        const productToCreate = {
            itemId: productData.itemId,
            title: productData.title,
            oemReference: productData.oemReference,
            priceNet: parseFloat(productData.price?.net_price) || null,
            priceBrut: parseFloat(productData.price?.brut_price) || null,
            currency: productData.price?.currency || null,
            url: productData.url,
            images: productData.images || [],
            seller: productData.seller || null,
            listingStartDate: productData.listingStartDate ? new Date(productData.listingStartDate) : null,
            status: productData.status || 'ACTIVE'
        };

        const product = await productService.createProduct(productToCreate);

        // utilisation
        res.json(serializeBigInt(product));
    } catch (e) {
        console.error(e);
        res.status(500).json({error: e.message});
    }
});

// Récupérer tous les produits
router.get('/all', async (req, res) => {
    try {
        const products = await productService.getProducts();
        res.json(serializeBigInt(products));
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

// GET /product/:search
router.get('/:search', async (req, res) => {
    try {
        const search = req.params.search;
        let product;
        // Search element in the databases
        if (!isNaN(search)) product = await productService.getProductById(BigInt(search));
        if (!product) product = await productService.getProductByItemId(search);
        if (!product) product = await productService.getProductByTitle(search);
        if (!product) return res.status(404).json({error: 'Produit non trouvé'});

        res.json(serializeBigInt(product));
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

// Mettre à jour un produit
router.put('/:id', async (req, res) => {
    try {
        const product = await productService.updateProduct(req.params.id, req.body);
        res.json(serializeBigInt(product));
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

// Supprimer un produit
router.delete('/:search', async (req, res) => {
    try {
        const search = req.params.search;
        let deletedProduct;

        // Si c'est un nombre => on suppose que c'est l'id (BigInt)
        if (!isNaN(search)) deletedProduct = await productService.deleteProductById(BigInt(search));
        // Si pas trouvé ou pas un nombre => on tente itemId
        if (!deletedProduct) deletedProduct = await productService.deleteProductByItemId(search);
        if (!deletedProduct) return res.status(404).json({error: 'Produit non trouvé'});
        res.json({message: 'Produit supprimé', product: deletedProduct});
    } catch (e) {
        res.status(500).json({error: e.message});
    }
});

export default router;
