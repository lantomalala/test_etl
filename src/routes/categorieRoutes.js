import express from 'express';
import * as productService from '../services/productService.js';
import axios from 'axios';

const router = express.Router();

const pushOne = async url => {
    try {
        let response = await axios.get(`http://taapit-scraping-api-etyf.onrender.com/api/ebay/product?path=${encodeURIComponent(url)}`, {
            maxBodyLength: Infinity,
            headers: {}
        });

        let productData = response.data;

        let productToCreate = {
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

        let product = await productService.createProduct(productToCreate);
        console.log('push done pour: ' + product.itemId);
    } catch (e) {
        console.error('Erreur pushOne:', e.message);
    }
};

router.post('/', async (req, res) => {
    try {
        let urlToScrape = req.body.categorie || req.query.categorie;

        if (!urlToScrape) return res.status(400).json({error: 'categorie manquante'});

        let response = await axios.get(`http://taapit-scraping-api-etyf.onrender.com/api/ebay/categorie?path=${encodeURIComponent(urlToScrape)}`, {
            maxBodyLength: Infinity,
            headers: {}
        });

        let data = response.data;

        let wait = ms => new Promise(resolve => setTimeout(resolve, ms));

        console.log(`Total de produits à traiter: ${data.product_links.length}`);
        
        let results = [];
        
        for (let index = 0; index < data.product_links.length; index++) {
            let product_link = data.product_links[index];
            console.log(`[${index + 1}/${data.product_links.length}] Traitement du produit:`, product_link);
            
            let result = {
                index: index + 1,
                total: data.product_links.length,
                product_link: product_link,
                status: 'en cours'
            };
            results.push(result);
            
            await pushOne(product_link.link);
            result.status = 'traité avec succès';
            console.log(`[${index + 1}/${data.product_links.length}] Produit traité avec succès`);
            
            await wait(10000);
        }

        res.json({
            total: data.product_links.length,
            results: results
        });
    } catch (e) {
        console.error('Erreur route:', e.message);
        res.status(500).json({error: e.message});
    }
});

export default router;
