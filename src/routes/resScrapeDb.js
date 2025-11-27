import express from 'express';
import * as productService from '../services/productService.js';
import axios from 'axios';

const router = express.Router();
function serializeBigInt(obj) {
    return JSON.parse(JSON.stringify(obj, (_, value) => (typeof value === 'bigint' ? value.toString() : value)));
}
let wait = ms => new Promise(resolve => setTimeout(resolve, ms));

// Route pour rescraper tous les produits avec URL
router.post('/all', async (req, res) => {
    try {
        // Récupérer tous les produits avec une URL
        const products = await productService.getProductsWithUrl();

        if (products.length === 0) {
            console.log('Aucun produit avec URL trouvé');
            return res.json({
                message: 'Aucun produit avec URL trouvé',
                results: {
                    success: 0,
                    failed: 0,
                    updated: 0
                }
            });
        }

        console.log(`Total de produits à rescraper: ${products.length}`);

        const results = {
            success: 0,
            failed: 0,
            updated: 0,
            details: []
        };

        // Traiter chaque produit
        for (let index = 0; index < products.length; index++) {
            const product = products[index];
            try {
                console.log(`[${index + 1}/${products.length}] Traitement du produit: ${product.itemId} - ${product.url}`);

                if (!product.url) {
                    console.log(`[${index + 1}/${products.length}] Produit ${product.itemId} ignoré: Pas d'URL`);
                    results.details.push({
                        productId: product.id.toString(),
                        itemId: product.itemId,
                        status: 'skipped',
                        reason: "Pas d'URL"
                    });
                    continue;
                }

                // Essayer de scraper l'URL
                const response = await axios.get(`http://taapit-scraping-api-etyf.onrender.com/api/ebay/product?path=${encodeURIComponent(product.url)}`, {
                    maxBodyLength: Infinity,
                    headers: {},
                    timeout: 30000 // 30 secondes de timeout
                });

                const productData = response.data;

                // Si le scraping réussit, le lien fonctionne encore
                const newPriceNet = parseFloat(productData.price?.net_price) || null;
                const newPriceBrut = parseFloat(productData.price?.brut_price) || null;
                const newCurrency = productData.price?.currency || null;

                // Vérifier si les prix ont changé
                const priceChanged = product.priceNet !== newPriceNet || product.priceBrut !== newPriceBrut || product.currency !== newCurrency;

                // Préparer les données de mise à jour
                const updateData = {
                    title: productData.title || product.title,
                    oemReference: productData.oemReference || product.oemReference,
                    priceNet: newPriceNet,
                    priceBrut: newPriceBrut,
                    currency: newCurrency,
                    images: productData.images || product.images,
                    seller: productData.seller || product.seller,
                    status: 'ACTIVE', // Le lien fonctionne, donc ACTIVE
                    updatedAt: new Date()
                };

                // Si le produit était ENDED et qu'on le rescrape avec succès, on le remet ACTIVE
                if (product.status === 'ENDED') {
                    updateData.endDate = null; // Réinitialiser endDate si on le remet ACTIVE
                    console.log(`[${index + 1}/${products.length}] Produit ${product.itemId} remis en ACTIVE (était ENDED)`);
                }

                // Mettre à jour le produit
                await productService.updateProduct(product.id, updateData);

                results.success++;

                if (priceChanged) {
                    results.updated++;
                    console.log(`[${index + 1}/${products.length}] Produit ${product.itemId} traité avec succès - Prix mis à jour`);
                    console.log(`  Ancien prix: ${product.priceNet} / ${product.priceBrut} ${product.currency}`);
                    console.log(`  Nouveau prix: ${newPriceNet} / ${newPriceBrut} ${newCurrency}`);
                } else {
                    console.log(`[${index + 1}/${products.length}] Produit ${product.itemId} traité avec succès - Pas de changement de prix`);
                }

                results.details.push({
                    productId: product.id.toString(),
                    itemId: product.itemId,
                    status: 'success',
                    priceChanged: priceChanged,
                    oldPrice: {net: product.priceNet, brut: product.priceBrut, currency: product.currency},
                    newPrice: {net: newPriceNet, brut: newPriceBrut, currency: newCurrency}
                });
            } catch (error) {
                // Si le scraping échoue, le lien ne fonctionne plus
                const errorReason = error.response?.status === 404 ? 'Lien introuvable (404)' : error.response?.status ? `Erreur HTTP ${error.response.status}` : error.message || 'Erreur inconnue';

                console.error(`[${index + 1}/${products.length}] Erreur pour le produit ${product.itemId}:`, errorReason);

                // Mettre le status à ENDED
                await productService.updateProductStatus(product.id, 'ENDED', new Date());

                console.log(`[${index + 1}/${products.length}] Produit ${product.itemId} mis à ENDED (ancien status: ${product.status})`);

                results.failed++;
                results.details.push({
                    productId: product.id.toString(),
                    itemId: product.itemId,
                    status: 'failed',
                    reason: errorReason,
                    oldStatus: product.status
                });
            }
            await wait(10000);
        }

        console.log(`Rescraping terminé: ${results.success} succès, ${results.failed} échecs, ${results.updated} prix mis à jour`);

        res.json({
            message: `Rescraping terminé: ${results.success} succès, ${results.failed} échecs, ${results.updated} prix mis à jour`,
            results: results
        });
    } catch (e) {
        console.error('Erreur lors du rescraping:', e);
        res.status(500).json({error: e.message});
    }
});

// Route pour rescraper un seul produit par itemId ou par URL
router.post('/one', async (req, res) => {
    try {
        const itemId = req.body.itemId || req.query.itemId;
        const url = req.body.url || req.query.url;

        // Si on a un itemId, récupérer le produit depuis la base de données
        let product = null;
        let urlToScrape = url;

        if (itemId) {
            console.log(`Recherche du produit avec itemId: ${itemId}`);
            product = await productService.getProductByItemId(itemId);

            if (!product) {
                return res.status(404).json({
                    error: 'Produit non trouvé',
                    itemId: itemId
                });
            }

            if (!product.url) {
                return res.status(400).json({
                    error: "Le produit n'a pas d'URL",
                    itemId: itemId
                });
            }

            urlToScrape = product.url;
            console.log(`Produit trouvé: ${product.itemId} - URL: ${urlToScrape}`);
        } else if (url) {
            console.log(`Rescraping avec URL fournie: ${url}`);
            // Si on a seulement une URL, on va scraper et chercher si le produit existe déjà
            urlToScrape = url;
        } else {
            return res.status(400).json({
                error: 'itemId ou url requis',
                message: 'Vous devez fournir soit un itemId soit une url dans le body ou les query params'
            });
        }

        // Essayer de scraper l'URL
        console.log(`Scraping de l'URL: ${urlToScrape}`);
        const response = await axios.get(`http://taapit-scraping-api-etyf.onrender.com/api/ebay/product?path=${encodeURIComponent(urlToScrape)}`, {
            maxBodyLength: Infinity,
            headers: {},
            timeout: 30000 // 30 secondes de timeout
        });

        const productData = response.data;

        // Si on n'avait pas de produit au départ mais qu'on a une URL, chercher par itemId du scraping
        if (!product && productData.itemId) {
            product = await productService.getProductByItemId(productData.itemId);
        }

        // Si le scraping réussit, le lien fonctionne encore
        const newPriceNet = parseFloat(productData.price?.net_price) || null;
        const newPriceBrut = parseFloat(productData.price?.brut_price) || null;
        const newCurrency = productData.price?.currency || null;

        // Si le produit existe dans la base de données, le mettre à jour
        if (product) {
            // Vérifier si les prix ont changé
            const priceChanged = product.priceNet !== newPriceNet || product.priceBrut !== newPriceBrut || product.currency !== newCurrency;

            // Préparer les données de mise à jour
            const updateData = {
                title: productData.title || product.title,
                oemReference: productData.oemReference || product.oemReference,
                priceNet: newPriceNet,
                priceBrut: newPriceBrut,
                currency: newCurrency,
                url: productData.url || product.url,
                images: productData.images || product.images,
                seller: productData.seller || product.seller,
                status: 'ACTIVE', // Le lien fonctionne, donc ACTIVE
                updatedAt: new Date()
            };

            // Si le produit était ENDED et qu'on le rescrape avec succès, on le remet ACTIVE
            if (product.status === 'ENDED') {
                updateData.endDate = null; // Réinitialiser endDate si on le remet ACTIVE
                console.log(`Produit ${product.itemId} remis en ACTIVE (était ENDED)`);
            }

            // Mettre à jour le produit
            const updatedProduct = await productService.updateProduct(product.id, updateData);

            if (priceChanged) {
                console.log(`Produit ${product.itemId} traité avec succès - Prix mis à jour`);
                console.log(`  Ancien prix: ${product.priceNet} / ${product.priceBrut} ${product.currency}`);
                console.log(`  Nouveau prix: ${newPriceNet} / ${newPriceBrut} ${newCurrency}`);
            } else {
                console.log(`Produit ${product.itemId} traité avec succès - Pas de changement de prix`);
            }

            return res.json({
                message: 'Produit rescrapé avec succès',
                product: serializeBigInt(updatedProduct),
                priceChanged: priceChanged,
                oldPrice: {net: product.priceNet, brut: product.priceBrut, currency: product.currency},
                newPrice: {net: newPriceNet, brut: newPriceBrut, currency: newCurrency}
            });
        } else {
            // Le produit n'existe pas encore, on peut le créer ou juste retourner les données scrapées
            console.log('Produit non trouvé dans la base de données, données scrapées retournées');
            return res.json({
                message: 'Produit scrapé mais non trouvé dans la base de données',
                scrapedData: productData,
                note: 'Utilisez la route POST /products/product pour créer le produit'
            });
        }
    } catch (error) {
        // Si le scraping échoue, le lien ne fonctionne plus
        const errorReason = error.response?.status === 404 ? 'Lien introuvable (404)' : error.response?.status ? `Erreur HTTP ${error.response.status}` : error.message || 'Erreur inconnue';

        console.error('Erreur lors du rescraping:', errorReason);

        // Si on avait un produit, mettre le status à ENDED
        const itemId = req.body.itemId || req.query.itemId;
        if (itemId) {
            try {
                const product = await productService.getProductByItemId(itemId);
                if (product) {
                    await productService.updateProductStatus(product.id, 'ENDED', new Date());
                    console.log(`Produit ${product.itemId} mis à ENDED (ancien status: ${product.status})`);
                }
            } catch (updateError) {
                console.error('Erreur lors de la mise à jour du status:', updateError);
            }
        }

        return res.status(500).json({
            error: 'Erreur lors du rescraping',
            reason: errorReason
        });
    }
});

export default router;
