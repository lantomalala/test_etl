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


export async function getProductByItemId(itemId) {
  return prisma.product.findUnique({ where: { itemId } });
}

export async function getProductByTitle(title) {
  return prisma.product.findFirst({
    where: { title: { contains: title, mode: 'insensitive' } }
  });
}

export async function deleteProductById(id) {
    return prisma.product.delete({ where: { id } });
  }
  
  export async function deleteProductByItemId(itemId) {
    return prisma.product.delete({ where: { itemId } });
  }
  
// Si tu veux aussi créer un produit


// Optionnel : upsert pour créer ou mettre à jour selon itemId
export async function upsertProduct(data) {
  return prisma.product.upsert({
    where: { itemId: data.itemId },
    update: {
      title: data.title,
      oemReference: data.oemReference,
      priceNet: data.priceNet,
      priceBrut: data.priceBrut,
      currency: data.currency,
      url: data.url,
      images: data.images,
      seller: data.seller,
      listingStartDate: data.listingStartDate,
      status: data.status || "ACTIVE"
    },
    create: data
  });
}

// Récupérer tous les produits avec une URL
export async function getProductsWithUrl() {
  return prisma.product.findMany({
    where: {
      url: { not: null }
    }
  });
}

// Mettre à jour le status et endDate d'un produit
export async function updateProductStatus(id, status, endDate = null) {
  return prisma.product.update({
    where: { id: BigInt(id) },
    data: {
      status,
      endDate: endDate ? new Date(endDate) : null,
      updatedAt: new Date()
    }
  });
}