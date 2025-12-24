import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  addStock,
  getStocks,
  getStocksByWarehouse,
} from "../controllers/stock.controller.js";
console.log("✅ stock.routes loaded");
const router = express.Router();

router.get("/", requireAuth, getStocks); // dashboard
router.get("/by-warehouse", requireAuth, getStocksByWarehouse);
router.post("/", requireAuth, addStock);

export default router;
