import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { fromCurrencyId, toCurrencyId, fromAmount, userId } = req.body;

    if (!fromCurrencyId || !toCurrencyId || !fromAmount) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Get exchange rate
    const exchangeRate = await prisma.exchangeRate.findUnique({
      where: {
        baseCurrencyId_targetCurrencyId: {
          baseCurrencyId: fromCurrencyId,
          targetCurrencyId: toCurrencyId,
        },
      },
    });

    if (!exchangeRate) {
      return res.status(400).json({ error: 'Exchange rate not found' });
    }

    // Calculate amounts
    const fromAmountDecimal = new Decimal(fromAmount);
    const toAmount = fromAmountDecimal.mul(exchangeRate.rate);
    const fee = fromAmountDecimal.mul(0.01); // 1% fee

    // Create transaction (userId is optional now)
    const transaction = await prisma.transaction.create({
      data: {
        userId: userId || null,
        fromCurrencyId,
        toCurrencyId,
        fromAmount: fromAmountDecimal,
        toAmount,
        exchangeRate: exchangeRate.rate,
        fee,
        status: 'PENDING',
      },
      include: {
        fromCurrency: true,
        toCurrency: true,
      },
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        fromCurrency: true,
        toCurrency: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        fromCurrency: true,
        toCurrency: true,
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTransactionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: { status },
      include: {
        fromCurrency: true,
        toCurrency: true,
      },
    });

    res.json(transaction);
  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getWallets = async (req: Request, res: Response) => {
  try {
    const wallets = await prisma.wallet.findMany({
      include: {
        currency: true,
      },
    });

    res.json(wallets);
  } catch (error) {
    console.error('Get wallets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
