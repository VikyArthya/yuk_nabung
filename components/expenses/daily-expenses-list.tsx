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
    <Card className="neo-card-raised">
      <CardHeader className="pb-3 sm:pb-6 neo-blue border-b-4 border-black">
        <CardTitle className="text-base sm:text-lg neo-heading text-white">📊 Pengeluaran Hari Ini</CardTitle>
        <CardDescription className="text-xs sm:text-sm neo-text">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 sm:pt-0">
        {/* Budget Summary */}
        <div className="mb-4 bg-white border-2 border-black shadow-[4px_4px_0px_black] p-4">
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs font-bold">Budget Harian</p>
              <p className="font-black text-orange-600">{formatCurrency(dailyBudget)}</p>
            </div>
            <div>
              <p className="text-xs font-bold">Sudah Dipakai</p>
              <p className="font-black text-red-600">{formatCurrency(totalExpense)}</p>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs font-bold">Sisa Budget</p>
              <p className={`font-black text-sm ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(Math.abs(budgetRemaining))}
                {isOverBudget && " (lebih)"}
              </p>
            </div>
            <div className="w-full bg-yellow-100 border-2 border-black">
              <div
                className={`h-3 border-2 border-black transition-all duration-300 ${
                  isOverBudget ? 'bg-red-400' :
                  remainingPercentage < 20 ? 'bg-orange-400' : 'bg-green-400'
                }`}
                style={{ width: `${Math.min(Math.max(remainingPercentage, 0), 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Expenses List */}
        {expenses.length > 0 ? (
          <div className="space-y-2">
            <h4 className="font-black text-sm mb-2">Detail Pengeluaran:</h4>
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex justify-between items-center p-3 bg-white border-2 border-black shadow-[2px_2px_0px_black] neo-interactive hover:shadow-[4px_4px_0px_black]"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm truncate">
                    {expense.note || 'Pengeluaran harian'}
                  </p>
                  <p className="text-xs font-bold">
                    {formatTime(expense.date)}
                    {expense.wallet && (
                      <span className="ml-2">
                        • {expense.wallet.name} ({expense.wallet.type.toLowerCase()})
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-right ml-2">
                  <p className="font-black text-sm text-red-600">
                    -{formatCurrency(expense.amount)}
                  </p>
                </div>
              </div>
            ))}

            <div className="pt-4 border-t-4 border-black">
              <div className="flex justify-between items-center">
                <p className="font-black text-sm">Total:</p>
                <p className="font-black text-sm text-red-600">
                  -{formatCurrency(totalExpense)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 bg-white border-2 border-black shadow-[4px_4px_0px_black]">
            <p className="text-gray-700 text-sm font-black">Belum ada pengeluaran hari ini</p>
            <p className="text-gray-600 text-xs mt-1 font-bold">Ayo catat pengeluaran harian pertama Anda!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}