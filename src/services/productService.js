import prisma from '../db/client.js';

// Créer un produit
export const createProduct = async (data) => {
    return await prisma.product.create({ data });
};

// Récupérer tous les produits
export const getProducts = async () => {
    return await prisma.product.findMany();
};

// Récupérer un produit par ID
export const getProductById = async (id) => {
    return await prisma.product.findUnique({ where: { id: BigInt(id) } });
};

// Mettre à jour un produit
export const updateProduct = async (id, data) => {
    return await prisma.product.update({ where: { id: BigInt(id) }, data });
};

// Supprimer un produit
export const deleteProduct = async (id) => {
    return await prisma.product.delete({ where: { id: BigInt(id) } });
};
