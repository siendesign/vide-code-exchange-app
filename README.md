# Crypto Exchange Application

A full-stack cryptocurrency exchange application built with Next.js, Express, Prisma, and PostgreSQL, featuring real-time updates via WebSockets.

## Features

### User Features
- User registration and authentication
- Exchange cryptocurrencies in real-time
- View transaction history
- Real-time transaction status updates
- View wallet balances

### Admin Features
- Add and manage cryptocurrencies
- Update exchange rates
- Monitor all transactions
- Update transaction statuses
- View system statistics

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Socket.IO Client** - Real-time updates

### Backend
- **Express** - Node.js web framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Socket.IO** - WebSocket server for real-time updates

## Project Structure

```
.
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   │   ├── page.tsx           # Landing page
│   │   │   ├── login/             # Login page
│   │   │   ├── register/          # Registration page
│   │   │   ├── dashboard/         # User dashboard
│   │   │   └── admin/             # Admin dashboard
│   │   ├── components/
│   │   │   └── ui/        # shadcn/ui components
│   │   └── lib/           # Utilities and API client
│   └── package.json
│
└── server/                # Express backend
    ├── src/
    │   ├── controllers/   # Route controllers
    │   ├── routes/        # API routes
    │   ├── middleware/    # Auth middleware
    │   ├── utils/         # Utilities
    │   ├── index.ts       # Main API server
    │   └── webhook.ts     # WebSocket server
    ├── prisma/
    │   └── schema.prisma  # Database schema
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd vide-code-exchange-app
```

2. **Set up the server**
```bash
cd server
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials and JWT secret

# Generate Prisma client and run migrations
npm run prisma:generate
npm run prisma:migrate
```

3. **Set up the client**
```bash
cd ../client
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local if needed (default values should work for local development)
```

### Running the Application

You'll need to run three services:

1. **PostgreSQL Database**
Make sure your PostgreSQL server is running and accessible with the credentials in `server/.env`

2. **Backend API Server**
```bash
cd server
npm run dev
# Runs on http://localhost:5000
```

3. **Webhook Server (WebSockets)**
```bash
cd server
npm run dev:webhook
# Runs on http://localhost:5001
```

4. **Frontend Application**
```bash
cd client
npm run dev
# Runs on http://localhost:3000
```

### Setting Up Initial Data

1. **Create an admin user** - Register a user through the UI, then update the database:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-admin@email.com';
```

2. **Add currencies** - Login as admin and use the admin dashboard to add currencies like:
   - BTC (Bitcoin)
   - ETH (Ethereum)
   - USDT (Tether)
   - etc.

3. **Set exchange rates** - Use the admin dashboard to set exchange rates between currencies

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)

### Currencies
- `GET /api/currencies` - Get all active currencies
- `POST /api/currencies` - Add new currency (admin only)
- `PUT /api/currencies/:id` - Update currency (admin only)

### Exchange Rates
- `GET /api/exchange-rates` - Get all exchange rates
- `POST /api/exchange-rates` - Update exchange rate (admin only)

### Transactions
- `POST /api/transactions` - Create new transaction (requires auth)
- `GET /api/transactions` - Get user's transactions (requires auth)
- `GET /api/transactions/:id` - Get specific transaction (requires auth)
- `PUT /api/transactions/:id/status` - Update transaction status (admin only)

### Wallets
- `GET /api/wallets` - Get user's wallets (requires auth)

## WebSocket Events

### Client → Server
- `join-user-room` - Join room for user-specific updates
- `join-admin-room` - Join room for admin updates

### Server → Client
- `transaction-updated` - Transaction status changed
- `exchange-rate-updated` - Exchange rate updated

## Webhook Endpoints

- `POST /webhook/transaction-update` - Update transaction status
- `POST /webhook/exchange-rate-update` - Update exchange rate

## Database Schema

### User
- id, email, password, name, role (USER/ADMIN)

### Currency
- id, code, name, symbol, isActive

### Wallet
- id, userId, currencyId, balance, address

### Transaction
- id, userId, fromCurrencyId, toCurrencyId, fromAmount, toAmount, exchangeRate, fee, status

### ExchangeRate
- id, baseCurrencyId, targetCurrencyId, rate

## Development

### Building for Production

**Server:**
```bash
cd server
npm run build
npm start
```

**Client:**
```bash
cd client
npm run build
npm start
```

### Database Management

**View database with Prisma Studio:**
```bash
cd server
npm run prisma:studio
```

**Create new migration:**
```bash
cd server
npm run prisma:migrate
```

## Environment Variables

### Server (.env)
```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/crypto_exchange?schema=public"
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
WEBHOOK_PORT=5001
CLIENT_URL=http://localhost:3000
```

### Client (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WEBHOOK_URL=http://localhost:5001
```

## Security Notes

- Change the JWT_SECRET in production to a strong, random value
- Use HTTPS in production
- Set up proper CORS configuration for production
- Never commit .env files to version control
- Use environment-specific database credentials

## Future Enhancements

- Implement actual wallet integration with blockchain
- Add real-time cryptocurrency price feeds
- Implement KYC/AML verification
- Add 2FA authentication
- Implement withdrawal and deposit functionality
- Add comprehensive transaction fees
- Implement rate limiting
- Add email notifications
- Create detailed analytics dashboard
- Add multi-language support

## License

MIT License

## Support

For issues and questions, please open an issue in the repository.
