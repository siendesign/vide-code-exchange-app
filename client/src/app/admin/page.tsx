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
import { LogOut, Plus, TrendingUp, Users, Activity } from 'lucide-react';

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
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddCurrency, setShowAddCurrency] = useState(false);
  const [showUpdateRate, setShowUpdateRate] = useState(false);
  const [loading, setLoading] = useState(false);

  // Currency form
  const [currencyCode, setCurrencyCode] = useState('');
  const [currencyName, setCurrencyName] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('');

  // Exchange rate form
  const [baseCurrency, setBaseCurrency] = useState('');
  const [targetCurrency, setTargetCurrency] = useState('');
  const [rate, setRate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, currenciesData, transactionsData] = await Promise.all([
        apiClient.getProfile(),
        apiClient.getCurrencies(),
        apiClient.getTransactions(),
      ]);

      if (profileData.role !== 'ADMIN') {
        router.push('/dashboard');
        return;
      }

      setUser(profileData);
      setCurrencies(currenciesData);
      setTransactions(transactionsData);

      // Connect to WebSocket
      const socket = connectSocket(profileData.id, true);
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
        apiClient.getCurrencies().then(setCurrencies);
      });
    } catch (err: any) {
      if (err.message.includes('token')) {
        router.push('/login');
      }
    }

    return () => {
      disconnectSocket();
    };
  };

  const handleAddCurrency = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const currency = await apiClient.createCurrency({
        code: currencyCode,
        name: currencyName,
        symbol: currencySymbol,
      });

      setCurrencies([...currencies, currency]);
      setCurrencyCode('');
      setCurrencyName('');
      setCurrencySymbol('');
      setShowAddCurrency(false);
    } catch (err) {
      alert('Failed to add currency');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.updateExchangeRate({
        baseCurrencyId: baseCurrency,
        targetCurrencyId: targetCurrency,
        rate: parseFloat(rate),
      });

      setBaseCurrency('');
      setTargetCurrency('');
      setRate('');
      setShowUpdateRate(false);
      alert('Exchange rate updated successfully');
    } catch (err) {
      alert('Failed to update exchange rate');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (transactionId: string, status: string) => {
    try {
      await apiClient.updateTransactionStatus(transactionId, status);
      setTransactions(
        transactions.map((t) =>
          t.id === transactionId ? { ...t, status } : t
        )
      );
    } catch (err) {
      alert('Failed to update transaction status');
    }
  };

  const handleLogout = () => {
    apiClient.setToken(null);
    disconnectSocket();
    router.push('/');
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
            <div>
              <div className="text-2xl font-bold text-blue-600">CryptoXchange Admin</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{user?.email}</div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Currencies</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currencies.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {transactions.filter((t) => t.status === 'PENDING').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Currency Management */}
          <Card>
            <CardHeader>
              <CardTitle>Currency Management</CardTitle>
              <CardDescription>Add and manage cryptocurrencies</CardDescription>
            </CardHeader>
            <CardContent>
              {!showAddCurrency ? (
                <div>
                  <Button onClick={() => setShowAddCurrency(true)} className="mb-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Currency
                  </Button>
                  <div className="space-y-2">
                    {currencies.map((currency) => (
                      <div key={currency.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{currency.code}</div>
                          <div className="text-sm text-gray-500">{currency.name}</div>
                        </div>
                        <div className="text-lg">{currency.symbol}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAddCurrency} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Currency Code</Label>
                    <Input
                      placeholder="BTC"
                      value={currencyCode}
                      onChange={(e) => setCurrencyCode(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency Name</Label>
                    <Input
                      placeholder="Bitcoin"
                      value={currencyName}
                      onChange={(e) => setCurrencyName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Symbol</Label>
                    <Input
                      placeholder="₿"
                      value={currencySymbol}
                      onChange={(e) => setCurrencySymbol(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      Add Currency
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddCurrency(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Exchange Rate Management */}
          <Card>
            <CardHeader>
              <CardTitle>Exchange Rate Management</CardTitle>
              <CardDescription>Update exchange rates</CardDescription>
            </CardHeader>
            <CardContent>
              {!showUpdateRate ? (
                <Button onClick={() => setShowUpdateRate(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Update Exchange Rate
                </Button>
              ) : (
                <form onSubmit={handleUpdateRate} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Base Currency</Label>
                    <Select value={baseCurrency} onValueChange={setBaseCurrency}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.id} value={currency.id}>
                            {currency.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Target Currency</Label>
                    <Select value={targetCurrency} onValueChange={setTargetCurrency}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.id} value={currency.id}>
                            {currency.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Rate</Label>
                    <Input
                      type="number"
                      step="0.00000001"
                      placeholder="1.5"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      Update Rate
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowUpdateRate(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Transaction Management */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Management</CardTitle>
            <CardDescription>Monitor and manage all transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No transactions yet</div>
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
                        User: {transaction.user.email} | {new Date(transaction.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                      {transaction.status === 'PENDING' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(transaction.id, 'PROCESSING')}
                          >
                            Process
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(transaction.id, 'COMPLETED')}
                          >
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateStatus(transaction.id, 'FAILED')}
                          >
                            Fail
                          </Button>
                        </div>
                      )}
                    </div>
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
