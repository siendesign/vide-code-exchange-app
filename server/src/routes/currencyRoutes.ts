import { Router } from 'express';
import {
  getCurrencies,
  createCurrency,
  updateCurrency,
  getExchangeRates,
  updateExchangeRate,
} from '../controllers/currencyController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

router.get('/currencies', getCurrencies);
router.post('/currencies', authMiddleware, adminMiddleware, createCurrency);
router.put('/currencies/:id', authMiddleware, adminMiddleware, updateCurrency);

router.get('/exchange-rates', getExchangeRates);
router.post('/exchange-rates', authMiddleware, adminMiddleware, updateExchangeRate);

export default router;
