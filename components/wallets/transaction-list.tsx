"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: string;
  amount: number;
  note: string | null;
  date: Date;
  type: string;
  wallet: {
    id: string;
    name: string;
    type: string;
  };
}

interface Allocation {
  id: string;
  amount: number;
  createdAt: Date;
  budget: {
    id: string;
    month: number;
    year: number;
  };
}

interface TransactionListProps {
  transactions: Transaction[];
  allocations: Allocation[];
  walletName: string;
}

export default function TransactionList({ transactions, allocations, walletName }: TransactionListProps) {
  const [activeTab, setActiveTab] = useState<'expenses' | 'allocations'>('expenses');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Combine transactions and allocations for a complete view
  const allTransactions = [
    ...transactions.map(t => ({
      id: t.id,
      type: 'expense' as const,
      amount: t.amount,
      note: t.note,
      date: t.date,
      description: t.note || 'Pengeluaran',
      badge: 'expense'
    })),
    ...allocations.map(a => ({
      id: a.id,
      type: 'allocation' as const,
      amount: a.amount,
      note: `Alokasi Budget ${a.budget.month}/${a.budget.year}`,
      date: a.createdAt,
      description: `Dialokasikan dari budget bulanan`,
      badge: 'allocation'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredTransactions = allTransactions.filter(t =>
    activeTab === 'expenses' ? t.type === 'expense' : t.type === 'allocation'
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'expense':
        return 'neo-badge bg-red-100 text-red-700 border-red-600';
      case 'allocation':
        return 'neo-badge bg-green-100 text-green-700 border-green-600';
      default:
        return 'neo-badge bg-gray-100 text-gray-700 border-gray-600';
    }
  };

  const getBadgeText = (type: string) => {
    switch (type) {
      case 'expense':
        return 'Pengeluaran';
      case 'allocation':
        return 'Alokasi';
      default:
        return type;
    }
  };

  // Calculate net flow
  const totalAllocations = allocations.reduce((sum, a) => sum + a.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netFlow = totalAllocations - totalExpenses;

  if (error) {
    return (
      <Card className="neo-card-raised">
        <CardContent className="pt-6 text-center">
          <p className="text-red-600 font-black">Gagal memuat data transaksi</p>
          <Button onClick={() => setError(null)} className="neo-button mt-2" size="sm">
            Coba Lagi
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white border-b-4 border-black">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`py-3 px-4 border-b-4 font-black text-sm neo-interactive ${
              activeTab === 'expenses'
                ? 'border-orange-600 bg-orange-100 text-orange-700'
                : 'border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            Pengeluaran ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('allocations')}
            className={`py-3 px-4 border-b-4 font-black text-sm neo-interactive ${
              activeTab === 'allocations'
                ? 'border-green-600 bg-green-100 text-green-700'
                : 'border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            Alokasi ({allocations.length})
          </button>
        </nav>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length > 0 ? (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="neo-card-raised neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-2px] hover:translate-x-[-2px]">
              <CardContent className="pt-4">
                <div className="flex justify-between items-start space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getBadgeColor(transaction.badge)}>
                        {getBadgeText(transaction.badge)}
                      </Badge>
                      <h4 className="font-black text-gray-900">
                        {transaction.description}
                      </h4>
                    </div>
                    <p className="text-sm font-bold">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-black ${
                      transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {transaction.type === 'expense' ? '-' : '+'}
                      Rp {transaction.amount.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="neo-card-raised">
          <CardContent className="text-center py-12">
            <div className="text-4xl mb-4">
              {activeTab === 'expenses' ? '📝' : '💰'}
            </div>
            <h3 className="text-lg font-black mb-2">
              Belum ada {activeTab === 'expenses' ? 'pengeluaran' : 'alokasi'}
            </h3>
            <p className="font-bold mb-6">
              {activeTab === 'expenses'
                ? 'Belum ada transaksi pengeluaran untuk dompet ini'
                : 'Belum ada alokasi budget untuk dompet ini'
              }
            </p>
            <Button
              onClick={() => window.history.back()}
              className="neo-button"
            >
              Kembali
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <Card className="neo-card-raised">
        <CardHeader className="pb-3 sm:pb-6 neo-blue border-b-4 border-black">
          <CardTitle className="text-sm neo-heading text-white">📊 Ringkasan</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 sm:pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_black] p-4">
              <p className="text-xs font-bold">Total Pengeluaran</p>
              <p className="text-lg sm:text-xl font-black text-red-600">
                -Rp {totalExpenses.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_black] p-4">
              <p className="text-xs font-bold">Total Alokasi</p>
              <p className="text-lg sm:text-xl font-black text-green-600">
                +Rp {totalAllocations.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_black] p-4">
              <p className="text-xs font-bold">Net Flow</p>
              <p className={`text-lg sm:text-xl font-black ${
                netFlow >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                Rp {netFlow.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}