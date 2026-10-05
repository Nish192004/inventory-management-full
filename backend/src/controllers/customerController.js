import prisma from "../config/prisma.js";

export const getCustomers = async (
  req,
  res,
  next
) => {
  try {
    const search = String(
      req.query.search || ""
    ).trim();

    const customers =
      await prisma.customer.findMany({
        where: search
          ? {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  email: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  phone: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {},

        include: {
          _count: {
            select: {
              sales: true,
            },
          },
        },

        orderBy: {
          name: "asc",
        },
      });

    res.json({
      success: true,
      data: customers,
      customers,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (
  req,
  res,
  next
) => {
  try {
    const customer =
      await prisma.customer.findUnique({
        where: {
          id: Number(
            req.params.id
          ),
        },

        include: {
          sales: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message:
          "Customer not found.",
      });
    }

    res.json({
      success: true,
      data: customer,
      customer,
    });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (
  req,
  res,
  next
) => {
  try {
    const {
      name,
      email,
      phone,
      address,
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Customer name is required.",
      });
    }

    const customer =
      await prisma.customer.create({
        data: {
          name: String(name).trim(),
          email:
            email
              ? String(email).trim()
              : null,
          phone:
            phone
              ? String(phone).trim()
              : null,
          address:
            address
              ? String(address).trim()
              : null,
        },
      });

    res.status(201).json({
      success: true,
      message:
        "Customer created successfully.",
      data: customer,
      customer,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (
  req,
  res,
  next
) => {
  try {
    const customer =
      await prisma.customer.update({
        where: {
          id: Number(
            req.params.id
          ),
        },

        data: {
          ...(req.body.name !== undefined
            ? {
                name: String(
                  req.body.name
                ).trim(),
              }
            : {}),

          ...(req.body.email !== undefined
            ? {
                email:
                  req.body.email
                    ? String(
                        req.body.email
                      ).trim()
                    : null,
              }
            : {}),

          ...(req.body.phone !== undefined
            ? {
                phone:
                  req.body.phone
                    ? String(
                        req.body.phone
                      ).trim()
                    : null,
              }
            : {}),

          ...(req.body.address !== undefined
            ? {
                address:
                  req.body.address
                    ? String(
                        req.body.address
                      ).trim()
                    : null,
              }
            : {}),
        },
      });

    res.json({
      success: true,
      message:
        "Customer updated successfully.",
      data: customer,
      customer,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (
  req,
  res,
  next
) => {
  try {
    const customer =
      await prisma.customer.findUnique({
        where: {
          id: Number(
            req.params.id
          ),
        },

        include: {
          _count: {
            select: {
              sales: true,
            },
          },
        },
      });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message:
          "Customer not found.",
      });
    }

    if (
      customer._count.sales > 0
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Customer cannot be deleted because it has sales records.",
      });
    }

    await prisma.customer.delete({
      where: {
        id: customer.id,
      },
    });

    res.json({
      success: true,
      message:
        "Customer deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};