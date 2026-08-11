import { prisma } from "../config/prisma.js";

interface GetProductsOptions {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  lowStock?: boolean;
}

export async function createProduct(data: {
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock?: number;
  minimumStock?: number;
  warehouseLocation?: string;
}) {
  return prisma.product.create({
    data: {
      name: data.name,
      sku: data.sku,
      category: data.category,
      unitPrice: data.unitPrice,
      currentStock: data.currentStock ?? 0,
      minimumStock: data.minimumStock ?? 0,
      warehouseLocation: data.warehouseLocation,
    },
  });
}

export async function getProducts(
  options: GetProductsOptions
) {
  const {
    page,
    limit,
    search,
    category,
    lowStock,
  } = options;

  const skip = (page - 1) * limit;

  const where = {
    ...(search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              sku: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),

    ...(category
      ? {
          category: {
            equals: category,
            mode: "insensitive" as const,
          },
        }
      : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.product.count({
      where,
    }),
  ]);

  const filteredProducts = lowStock
    ? products.filter(
        (product) =>
          product.currentStock <= product.minimumStock
      )
    : products;

  return {
    products: filteredProducts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getProductById(
  id: string
) {
  return prisma.product.findUnique({
    where: {
      id,
    },
  });
}

export async function updateProduct(
  id: string,
  data: {
    name?: string;
    sku?: string;
    category?: string;
    unitPrice?: number;
    currentStock?: number;
    minimumStock?: number;
    warehouseLocation?: string;
  }
) {
  return prisma.product.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteProduct(
  id: string
) {
  return prisma.product.delete({
    where: {
      id,
    },
  });
}