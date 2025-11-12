import { Router } from 'express';
import {
  getCurrencies,
  createCurrency,
  updateCurrency,
  getExchangeRates,
  updateExchangeRate,
} from '../controllers/currencyController';

const router = Router();

router.get('/currencies', getCurrencies);
router.post('/currencies', createCurrency);
router.put('/currencies/:id', updateCurrency);

router.get('/exchange-rates', getExchangeRates);
router.post('/exchange-rates', updateExchangeRate);

export default router;
