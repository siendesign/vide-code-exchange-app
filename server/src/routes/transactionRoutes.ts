import { Router } from 'express';
import {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransactionStatus,
  getWallets,
} from '../controllers/transactionController';

const router = Router();

router.post('/transactions', createTransaction);
router.get('/transactions', getTransactions);
router.get('/transactions/:id', getTransaction);
router.put('/transactions/:id/status', updateTransactionStatus);

router.get('/wallets', getWallets);

export default router;
