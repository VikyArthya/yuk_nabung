"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Expense {
  id: string;
  amount: number;
  note: string | null;
  date: string;
  type: string;
  wallet: {
    id: string;
    name: string;
    type: string;
  } | null;
}

interface DailyExpensesListProps {
  expenses: Expense[];
  budgetRemaining: number;
  dailyBudget: number;
  totalExpense: number;
}

export function DailyExpensesList({
  expenses,
  budgetRemaining,
  dailyBudget,
  totalExpense
}: DailyExpensesListProps) {
  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverBudget = budgetRemaining < 0;
  const remainingPercentage = ((budgetRemaining + totalExpense) / dailyBudget) * 100;

  return (
    <Card className="border-orange-100">
      <CardHeader className="pb-3 sm:pb-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-t-lg">
        <CardTitle className="text-base sm:text-lg text-orange-700">📊 Pengeluaran Hari Ini</CardTitle>
        <CardDescription className="text-xs sm:text-sm text-orange-600">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 sm:pt-0">
        {/* Budget Summary */}
        <div className="mb-4 p-4 border border-orange-200 rounded-lg bg-orange-50">
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs text-gray-600">Budget Harian</p>
              <p className="font-semibold text-orange-700">{formatCurrency(dailyBudget)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Sudah Dipakai</p>
              <p className="font-semibold text-red-600">{formatCurrency(totalExpense)}</p>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-gray-600">Sisa Budget</p>
              <p className={`font-semibold text-sm ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(Math.abs(budgetRemaining))}
                {isOverBudget && " (lebih)"}
              </p>
            </div>
            <div className="w-full bg-orange-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isOverBudget ? 'bg-red-500' :
                  remainingPercentage < 20 ? 'bg-orange-400' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(Math.max(remainingPercentage, 0), 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Expenses List */}
        {expenses.length > 0 ? (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Detail Pengeluaran:</h4>
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex justify-between items-center p-3 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {expense.note || 'Pengeluaran makan'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatTime(expense.date)}
                    {expense.wallet && (
                      <span className="ml-2">
                        • {expense.wallet.name} ({expense.wallet.type.toLowerCase()})
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-right ml-2">
                  <p className="font-medium text-sm text-red-600">
                    -{formatCurrency(expense.amount)}
                  </p>
                </div>
              </div>
            ))}

            <div className="pt-2 border-t border-orange-200">
              <div className="flex justify-between items-center">
                <p className="font-medium text-sm text-gray-700">Total:</p>
                <p className="font-semibold text-sm text-red-600">
                  -{formatCurrency(totalExpense)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 text-sm">Belum ada pengeluaran hari ini</p>
            <p className="text-gray-400 text-xs mt-1">Ayo catat pengeluaran makan pertama Anda!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}