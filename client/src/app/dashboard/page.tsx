'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { ArrowRight, Wallet, RefreshCw } from 'lucide-react';

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
}

interface Transaction {
  id: string;
  fromAmount: string;
  toAmount: string;
  status: string;
  createdAt: string;
  fromCurrency: Currency;
  toCurrency: Currency;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [currenciesData, transactionsData] = await Promise.all([
        apiClient.getCurrencies(),
        apiClient.getTransactions(),
      ]);

      setCurrencies(currenciesData);
      setTransactions(transactionsData);

      // Connect to WebSocket
      const socket = connectSocket('default-user');
      socket.on('transaction-updated', (transaction: Transaction) => {
        setTransactions((prev) => {
          const index = prev.findIndex((t) => t.id === transaction.id);
          if (index >= 0) {
            const newTransactions = [...prev];
            newTransactions[index] = transaction;
            return newTransactions;
          }
          return [transaction, ...prev];
        });
      });

      socket.on('exchange-rate-updated', () => {
        // Refresh exchange rates
        apiClient.getCurrencies().then(setCurrencies);
      });
    } catch (err: any) {
      console.error('Failed to load data:', err);
    }

    return () => {
      disconnectSocket();
    };
  };

  const handleExchange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const transaction = await apiClient.createTransaction({
        fromCurrencyId: fromCurrency,
        toCurrencyId: toCurrency,
        fromAmount: parseFloat(amount),
      });

      setTransactions([transaction, ...transactions]);
      setAmount('');
      setFromCurrency('');
      setToCurrency('');
    } catch (err: any) {
      setError(err.message || 'Exchange failed');
    } finally {
      setLoading(false);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'PROCESSING':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'FAILED':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-blue-600">CryptoXchange</div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Exchange Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Exchange Crypto
              </CardTitle>
              <CardDescription>
                Convert one cryptocurrency to another instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleExchange} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-md">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="fromCurrency">From</Label>
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.id} value={currency.id}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.00000001"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toCurrency">To</Label>
                  <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.id} value={currency.id}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Processing...' : 'Exchange Now'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Wallets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Your Wallets
              </CardTitle>
              <CardDescription>View your cryptocurrency balances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Wallet integration coming soon
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Your recent exchanges</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No transactions yet
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {transaction.fromAmount} {transaction.fromCurrency.code} → {transaction.toAmount} {transaction.toCurrency.code}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
