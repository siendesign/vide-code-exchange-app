import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getCurrencies = async (req: Request, res: Response) => {
  try {
    const currencies = await prisma.currency.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    res.json(currencies);
  } catch (error) {
    console.error('Get currencies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCurrency = async (req: Request, res: Response) => {
  try {
    const { code, name, symbol } = req.body;

    if (!code || !name || !symbol) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const currency = await prisma.currency.create({
      data: { code, name, symbol },
    });

    res.status(201).json(currency);
  } catch (error) {
    console.error('Create currency error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCurrency = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, symbol, isActive } = req.body;

    const currency = await prisma.currency.update({
      where: { id },
      data: { name, symbol, isActive },
    });

    res.json(currency);
  } catch (error) {
    console.error('Update currency error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getExchangeRates = async (req: Request, res: Response) => {
  try {
    const rates = await prisma.exchangeRate.findMany({
      include: {
        baseCurrency: true,
        targetCurrency: true,
      },
    });

    res.json(rates);
  } catch (error) {
    console.error('Get exchange rates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateExchangeRate = async (req: Request, res: Response) => {
  try {
    const { baseCurrencyId, targetCurrencyId, rate } = req.body;

    if (!baseCurrencyId || !targetCurrencyId || !rate) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const exchangeRate = await prisma.exchangeRate.upsert({
      where: {
        baseCurrencyId_targetCurrencyId: {
          baseCurrencyId,
          targetCurrencyId,
        },
      },
      update: { rate },
      create: { baseCurrencyId, targetCurrencyId, rate },
    });

    res.json(exchangeRate);
  } catch (error) {
    console.error('Update exchange rate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
