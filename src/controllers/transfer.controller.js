import prisma from '../utils/prisma.js';

export const createTransfer = async (req, res) => {
  try {
    const {
      fromWarehouseId,
      toWarehouseId,
      productName,
      quantity,
    } = req.body;

    if (!fromWarehouseId || !toWarehouseId || !productName || !quantity) {
      return res.status(400).json({ error: "Missing fields" });
    }

    if (fromWarehouseId === toWarehouseId) {
      return res.status(400).json({ error: "Source and destination cannot be same" });
    }

    // CHECK SOURCE STOCK
    const sourceStock = await prisma.stock.findUnique({
    where: {
      userId_warehouseId_productName: {
          userId: req.userId,
          warehouseId: Number(fromWarehouseId),
          productName,
        },
      },
    });

    if (!sourceStock) {
      return res.status(400).json({
        error: "Product does not exist in source warehouse",
      });
    }

    if (sourceStock.quantity < quantity) {
      return res.status(400).json({
        error: "Insufficient stock in source warehouse",
      });
    }

    const transfer = await prisma.stockTransfer.create({
      data: {
        userId: req.userId,
        fromWarehouseId: Number(fromWarehouseId),
        toWarehouseId: Number(toWarehouseId),
        productName,
        quantity: Number(quantity),
        status: "PENDING",
        history: {
          create: {
            status: "PENDING",
          },
        },
      },
    });


    res.status(201).json(transfer);
  } catch (err) {
    console.error("Create transfer error:", err);
    res.status(500).json({ error: "Failed to create transfer" });
  }
};


export const updateTransferStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== "COMPLETED") {
      return res.status(400).json({ error: "Invalid status update" });
    }

    await prisma.$transaction(async (tx) => {
      const transfer = await tx.stockTransfer.findFirst({
        where: {
           id: Number(id),
           userId: req.userId,
           status: "PENDING",
          },
    });


      if (!transfer || transfer.status !== "PENDING") {
        throw new Error("Invalid transfer");
      }

      const sourceStock = await tx.stock.findUnique({
        where: {
          userId_warehouseId_productName: {
            userId: req.userId,
            warehouseId: transfer.fromWarehouseId,
            productName: transfer.productName,
          },
        },
      });


      if (!sourceStock || sourceStock.quantity < transfer.quantity) {
        throw new Error("Insufficient stock at completion time");
      }

      // 🔻 Deduct from source
      await tx.stock.update({
        where: {
          userId_warehouseId_productName: {
            userId: req.userId,
            warehouseId: transfer.fromWarehouseId,
            productName: transfer.productName,
          },
        },
        data: {
          quantity: {
            decrement: transfer.quantity,
          },
        },
      });

      // 🔺 Add to destination
      await tx.stock.upsert({
        where: {
          userId_warehouseId_productName: {
            userId: req.userId,
            warehouseId: transfer.toWarehouseId,
            productName: transfer.productName,
          },
        },
        update: {
          quantity: {
            increment: transfer.quantity,
          },
        },
        create: {
          userId: req.userId,
          warehouseId: transfer.toWarehouseId,
          productName: transfer.productName,
          quantity: transfer.quantity,
        },
      });

      await tx.stockTransfer.update({
        where: { id: Number(id),
          userId: req.userId,
         },
        data: { status: "COMPLETED" },
      });
    });

    await tx.transferHistory.create({
      data: {
        transferId: transfer.id,
        status: "COMPLETED",
      },
    });


    res.json({ message: "Transfer completed successfully" });
  } catch (err) {
    console.error("Complete transfer error:", err.message);
    res.status(400).json({ error: err.message });
  }
};


export const getTransfers = async (req, res) => {
  const transfers = await prisma.stockTransfer.findMany({
      where: { userId: req.userId },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        history: {
          orderBy: { timestamp: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });


  res.json(transfers);
};

export const getTransferHistory = async (req, res) => {
  const history = await prisma.transferHistory.findMany({
    where: {
      transfer: {
        userId: req.userId,
      },
    },
    orderBy: { timestamp: "desc" },
  });

  res.json(history);
};

export const cancelTransfer = async (req, res) => {
  try {
    const { id } = req.params;

    const transfer = await prisma.stockTransfer.findFirst({
      where: {
        id: Number(id),
        userId: req.userId,
        status: "PENDING",
      },
    });

    if (!transfer) {
      return res.status(400).json({
        error: "Only pending transfers can be cancelled",
      });
    }

    await prisma.$transaction(async (tx) => {
      const transfer = await tx.stockTransfer.update({
        where: {
          id: Number(id),
          userId: req.userId,
          status: "PENDING",
        },
        data: {
          status: "CANCELLED",
        },
      });
    
      await tx.transferHistory.create({
        data: {
          transferId: transfer.id,
          status: "CANCELLED",
        },
      });
    });

    res.json({ message: "Transfer cancelled successfully" });
  } catch (err) {
    console.error("Cancel transfer error:", err);
    res.status(500).json({ error: err.message });
  }
};
