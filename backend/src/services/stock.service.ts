import { prisma } from "../config/prisma.js";

export async function stockIn(
  productId: string,
  quantity: number,
  reason: string,
  createdBy: string
) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    const updatedProduct = await tx.product.update({
      where: {
        id: productId,
      },
      data: {
        currentStock: {
          increment: quantity,
        },
      },
    });

    const movement = await tx.stockMovement.create({
      data: {
        productId,
        quantity,
        movementType: "IN",
        reason,
        createdBy,
      },
    });

    return {
      product: updatedProduct,
      movement,
    };
  });
}

export async function stockOut(
  productId: string,
  quantity: number,
  reason: string,
  createdBy: string
) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    if (product.currentStock < quantity) {
      throw new Error("INSUFFICIENT_STOCK");
    }

    const updatedProduct = await tx.product.update({
      where: {
        id: productId,
      },
      data: {
        currentStock: {
          decrement: quantity,
        },
      },
    });

    const movement = await tx.stockMovement.create({
      data: {
        productId,
        quantity,
        movementType: "OUT",
        reason,
        createdBy,
      },
    });

    return {
      product: updatedProduct,
      movement,
    };
  });
}

export async function getStockMovements(
  productId?: string
) {
  return prisma.stockMovement.findMany({
    where: productId
      ? {
          productId,
        }
      : undefined,

    orderBy: {
      createdAt: "desc",
    },

    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
        },
      },

      user: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });
}