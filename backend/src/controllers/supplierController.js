import prisma from "../config/prisma.js";

// GET ALL SUPPLIERS
export const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            purchases: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: suppliers,
    });
  } catch (error) {
    console.error("getSuppliers error:", error);
    next(error);
  }
};

// GET SUPPLIER BY ID
export const getSupplierById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplier ID.",
      });
    }

    const supplier = await prisma.supplier.findUnique({
      where: {
        id,
      },
      include: {
        purchases: {
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
        },
        _count: {
          select: {
            purchases: true,
          },
        },
      },
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found.",
      });
    }

    res.json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    console.error("getSupplierById error:", error);
    next(error);
  }
};

// CREATE SUPPLIER
export const createSupplier = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Supplier name is required.",
      });
    }

    const supplier = await prisma.supplier.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Supplier created successfully.",
      data: supplier,
    });
  } catch (error) {
    console.error("createSupplier error:", error);
    next(error);
  }
};

// UPDATE SUPPLIER
export const updateSupplier = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplier ID.",
      });
    }

    const { name, email, phone, address } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Supplier name is required.",
      });
    }

    const existingSupplier = await prisma.supplier.findUnique({
      where: {
        id,
      },
    });

    if (!existingSupplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found.",
      });
    }

    const supplier = await prisma.supplier.update({
      where: {
        id,
      },
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
      },
    });

    res.json({
      success: true,
      message: "Supplier updated successfully.",
      data: supplier,
    });
  } catch (error) {
    console.error("updateSupplier error:", error);
    next(error);
  }
};

// DELETE SUPPLIER
export const deleteSupplier = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplier ID.",
      });
    }

    const supplier = await prisma.supplier.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            purchases: true,
          },
        },
      },
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found.",
      });
    }

    // Don't allow deletion if supplier has purchase orders
    if (supplier._count.purchases > 0) {
      return res.status(400).json({
        success: false,
        message:
          "This supplier cannot be deleted because purchase orders are linked to it.",
      });
    }

    await prisma.supplier.delete({
      where: {
        id,
      },
    });

    res.json({
      success: true,
      message: "Supplier deleted successfully.",
    });
  } catch (error) {
    console.error("deleteSupplier error:", error);
    next(error);
  }
};