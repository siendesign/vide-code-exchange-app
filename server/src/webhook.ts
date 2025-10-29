import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from 'http';
import { prisma } from './utils/prisma';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.WEBHOOK_PORT || 5001;

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  process.env.CLIENT_URL || 'http://localhost:3000'
].filter(Boolean);

// Configure Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// CORS Configuration for Express
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-user-room', (userId: string) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('join-admin-room', () => {
    socket.join('admin');
    console.log('Admin joined admin room');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Webhook endpoint for transaction updates
app.post('/webhook/transaction-update', async (req, res) => {
  try {
    const { transactionId, status } = req.body;

    if (!transactionId || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update transaction status
    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status },
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

    // Emit to specific user
    io.to(`user-${transaction.userId}`).emit('transaction-updated', transaction);

    // Emit to admin room
    io.to('admin').emit('transaction-updated', transaction);

    res.json({ success: true, transaction });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Webhook endpoint for exchange rate updates
app.post('/webhook/exchange-rate-update', async (req, res) => {
  try {
    const { baseCurrencyId, targetCurrencyId, rate } = req.body;

    if (!baseCurrencyId || !targetCurrencyId || !rate) {
      return res.status(400).json({ error: 'Missing required fields' });
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
      include: {
        baseCurrency: true,
        targetCurrency: true,
      },
    });

    // Broadcast to all connected clients
    io.emit('exchange-rate-updated', exchangeRate);

    res.json({ success: true, exchangeRate });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

server.listen(PORT, () => {
  console.log(`Webhook server is running on port ${PORT}`);
});

export { io };
