import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { Decimal } from '@prisma/client/runtime/library';

export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { fromCurrencyId, toCurrencyId, fromAmount } = req.body;

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

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
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

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const isAdmin = req.user!.role === 'ADMIN';

    const transactions = await prisma.transaction.findMany({
      where: isAdmin ? {} : { userId },
      include: {
        fromCurrency: true,
        toCurrency: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const isAdmin = req.user!.role === 'ADMIN';

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        fromCurrency: true,
        toCurrency: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (!isAdmin && transaction.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTransactionStatus = async (req: AuthRequest, res: Response) => {
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

export const getWallets = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const wallets = await prisma.wallet.findMany({
      where: { userId },
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
