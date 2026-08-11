import { prisma } from "../config/prisma.js";

export async function generateChallanNumber(): Promise<string> {
  const lastChallan = await prisma.challan.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      challanNumber: true,
    },
  });

  if (!lastChallan) {
    return "CH-000001";
  }

  const lastNumber = Number(
    lastChallan.challanNumber.replace("CH-", "")
  );

  const nextNumber = lastNumber + 1;

  return `CH-${String(nextNumber).padStart(6, "0")}`;
}


export async function createChallan(
  customerId: string,
  items: {
    productId: string;
    quantity: number;
  }[],
  createdBy: string
) {
  const customer = await prisma.customer.findUnique({
    where: {
      id: customerId,
    },
  });

  if (!customer) {
    throw new Error("CUSTOMER_NOT_FOUND");
  }

  const productIds = items.map((item) => item.productId);

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
  });

  if (products.length !== productIds.length) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  const challanNumber = await generateChallanNumber();

  const productMap = new Map(
    products.map((product) => [product.id, product])
  );

  const totalQuantity = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const challan = await prisma.challan.create({
    data: {
      challanNumber,
      customerId,
      totalQuantity,
      createdBy,

      items: {
        create: items.map((item) => {
          const product = productMap.get(item.productId)!;

          return {
            productId: product.id,

            // Snapshot
            productName: product.name,
            productSku: product.sku,
            unitPrice: product.unitPrice,

            quantity: item.quantity,
          };
        }),
      },
    },

    include: {
      customer: true,
      items: true,
    },
  });

  

  return challan;
}

export async function getChallans() {
  return prisma.challan.findMany({
    orderBy: {
      createdAt: "desc",
    },

    include: {
      customer: {
        select: {
          id: true,
          name: true,
          businessName: true,
          mobile: true,
        },
      },

      items: true,

      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

export async function getChallanById(id: string) {
  const challan = await prisma.challan.findUnique({
    where: {
      id,
    },

    include: {
      customer: true,
      items: true,

      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!challan) {
    throw new Error("CHALLAN_NOT_FOUND");
  }

  return challan;
}

export async function confirmChallan(
  challanId: string,
  userId: string
) {
  return prisma.$transaction(async (tx) => {
    // 1. Find challan
    const challan = await tx.challan.findUnique({
      where: {
        id: challanId,
      },
      include: {
        items: true,
      },
    });

    if (!challan) {
      throw new Error("CHALLAN_NOT_FOUND");
    }

    // 2. Check status
    if (challan.status !== "DRAFT") {
      throw new Error("CHALLAN_NOT_DRAFT");
    }

    // 3. Check every product
    for (const item of challan.items) {
      const product = await tx.product.findUnique({
        where: {
          id: item.productId,
        },
      });

      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      if (product.currentStock < item.quantity) {
        throw new Error(
          `INSUFFICIENT_STOCK:${product.name}:${product.currentStock}:${item.quantity}`
        );
      }
    }

    // 4. Reduce stock + create movement
    for (const item of challan.items) {
      const product = await tx.product.update({
        where: {
          id: item.productId,
        },
        data: {
          currentStock: {
            decrement: item.quantity,
          },
        },
      });

      // Extra safety: stock must never become negative
      if (product.currentStock < 0) {
        throw new Error("NEGATIVE_STOCK");
      }

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          movementType: "OUT",
          reason: `Sales Challan ${challan.challanNumber}`,
          createdBy: userId,
        },
      });
    }

    // 5. Confirm challan
    const confirmedChallan = await tx.challan.update({
      where: {
        id: challanId,
      },
      data: {
        status: "CONFIRMED",
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return confirmedChallan;
  });
}

export async function cancelChallan(challanId: string) {
  const challan = await prisma.challan.findUnique({
    where: {
      id: challanId,
    },
  });

  if (!challan) {
    throw new Error("CHALLAN_NOT_FOUND");
  }

  if (challan.status !== "DRAFT") {
    throw new Error("CHALLAN_CANNOT_BE_CANCELLED");
  }

  return prisma.challan.update({
    where: {
      id: challanId,
    },
    data: {
      status: "CANCELLED",
    },
    include: {
      customer: true,
      items: true,
    },
  });
}