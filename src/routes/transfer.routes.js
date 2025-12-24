import express from 'express';
import { requireAuth } from "../middleware/auth.js";
import {
  createTransfer,
  updateTransferStatus,
  getTransfers,
  cancelTransfer
} from '../controllers/transfer.controller.js';

const router = express.Router();

router.post('/', requireAuth, createTransfer);
router.patch('/:id/status', requireAuth, updateTransferStatus);
router.get('/', requireAuth, getTransfers);
router.patch("/:id/cancel", requireAuth, cancelTransfer);


export default router;
