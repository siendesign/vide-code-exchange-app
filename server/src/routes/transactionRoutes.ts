import { Router } from 'express';
import {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransactionStatus,
  getWallets,
} from '../controllers/transactionController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

router.post('/transactions', authMiddleware, createTransaction);
router.get('/transactions', authMiddleware, getTransactions);
router.get('/transactions/:id', authMiddleware, getTransaction);
router.put('/transactions/:id/status', authMiddleware, adminMiddleware, updateTransactionStatus);

router.get('/wallets', authMiddleware, getWallets);

export default router;
