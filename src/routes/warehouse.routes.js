import express from 'express';
import { requireAuth } from "../middleware/auth.js";
import {
  createWarehouse,
  getWarehouses
} from '../controllers/warehouse.controller.js';

const router = express.Router();

router.post('/', requireAuth, createWarehouse);
router.get('/', requireAuth, getWarehouses);

export default router;
