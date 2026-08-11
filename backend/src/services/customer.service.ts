import { prisma } from "../config/prisma.js";

interface GetCustomersOptions {
  page: number;
  limit: number;
  search?: string;
  status?: "LEAD" | "ACTIVE" | "INACTIVE";
  customerType?: "RETAIL" | "WHOLESALE" | "DISTRIBUTOR";
}

export async function createCustomer(
  data: {
    name: string;
    mobile: string;
    email?: string;
    businessName?: string;
    gstNumber?: string;
    customerType: "RETAIL" | "WHOLESALE" | "DISTRIBUTOR";
    address?: string;
    status?: "LEAD" | "ACTIVE" | "INACTIVE";
    followUpDate?: Date;
    notes?: string;
  }
) {
  return prisma.customer.create({
    data,
  });
}

export async function getCustomers(
  options: GetCustomersOptions
) {
  const {
    page,
    limit,
    search,
    status,
    customerType,
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
              mobile: {
                contains: search,
              },
            },
            {
              businessName: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),

    ...(status ? { status } : {}),
    ...(customerType ? { customerType } : {}),
  };

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.customer.count({
      where,
    }),
  ]);

  return {
    customers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getCustomerById(
  id: string
) {
  return prisma.customer.findUnique({
    where: {
      id,
    },
    include: {
      followups: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      },
    },
  });
}

export async function updateCustomer(
  id: string,
  data: {
    name?: string;
    mobile?: string;
    email?: string;
    businessName?: string;
    gstNumber?: string;
    customerType?: "RETAIL" | "WHOLESALE" | "DISTRIBUTOR";
    address?: string;
    status?: "LEAD" | "ACTIVE" | "INACTIVE";
    followUpDate?: Date;
    notes?: string;
  }
) {
  return prisma.customer.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteCustomer(
  id: string
) {
  return prisma.customer.delete({
    where: {
      id,
    },
  });
}

export async function addFollowup(
  customerId: string,
  createdBy: string,
  data: {
    note: string;
    followUpDate?: Date;
  }
) {
  return prisma.customerFollowup.create({
    data: {
      customerId,
      createdBy,
      note: data.note,
      followUpDate: data.followUpDate,
    },
  });
}