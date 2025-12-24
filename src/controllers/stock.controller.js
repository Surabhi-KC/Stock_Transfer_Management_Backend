import prisma from "../utils/prisma.js";
console.log("✅ stock.controller loaded");

/* ---------------- ADD STOCK ---------------- */
export const addStock = async (req, res) => {
  console.log("🧑 userId:", req.userId);
  console.log("📦 body:", req.body);

  try {
    const { warehouseId, productName, quantity } = req.body;

    if (!warehouseId || !productName || !quantity) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const stock = await prisma.stock.upsert({
      where: {
        userId_warehouseId_productName: {
          userId: req.userId,
          warehouseId: Number(warehouseId),
          productName,
        },
      },
      update: {
        quantity: { increment: Number(quantity) },
      },
      create: {
        userId: req.userId,
        warehouseId: Number(warehouseId),
        productName,
        quantity: Number(quantity),
      },
    });

    res.status(201).json(stock);
  } catch (err) {
    console.error("❌ Add stock error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ---------------- GET ALL STOCKS (DASHBOARD) ---------------- */
export const getStocks = async (req, res) => {
  try {
    const stocks = await prisma.stock.findMany({
      where: { userId: req.userId },
      include: { warehouse: true },
    });

    res.json(stocks);
  } catch (err) {
    console.error("❌ Get stocks error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ---------------- GET STOCKS BY WAREHOUSE ---------------- */
export const getStocksByWarehouse = async (req, res) => {
  try {
    const { warehouseId } = req.query;

    if (!warehouseId) {
      return res.status(400).json({ error: "warehouseId required" });
    }

    const stocks = await prisma.stock.findMany({
      where: {
        userId: req.userId,
        warehouseId: Number(warehouseId),
      },
    });

    res.json(stocks);
  } catch (err) {
    console.error("❌ Get stocks by warehouse error:", err);
    res.status(500).json({ error: err.message });
  }
};
