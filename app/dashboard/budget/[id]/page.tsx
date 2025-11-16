import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";

interface WalletAllocation {
  wallet: {
    id: string;
    name: string;
    type: string;
    currentBalance: number;
  };
  staticAllocation: number;
  dynamicAllocation: number;
  mealExpenses: number;
  otherTransactions: number;
  netChange: number;
}


export default async function BudgetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session) {
    redirect("/login");
  }

  // Get budget details
  const budget = await prisma.budget.findFirst({
    where: {
      id: id,
      userId: session.user.id,
    },
    include: {
      weeklyBudgets: {
        orderBy: {
          weekNumber: 'asc',
        },
      },
      allocations: {
        include: {
          wallet: true,
        },
      },
    },
  });

  if (!budget) {
    return (
      <div className="neo-yellow min-h-screen flex items-center justify-center">
        <Card className="w-96 neo-card-raised">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-700 font-black mb-4">Budget tidak ditemukan</p>
            <Link href="/dashboard/budget">
              <Button className="neo-orange text-white font-black neo-interactive">
                Kembali ke Budget
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get dynamic allocations directly from database
  const budgetStartDate = new Date(budget.year, budget.month - 1, 1);
  const budgetEndDate = new Date(budget.year, budget.month, 0); // Last day of month

  // Get all user's wallets
  const wallets = await prisma.wallet.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Calculate dynamic allocations based on transactions
  const walletAllocations = await Promise.all(
    wallets.map(async (wallet) => {
      // Get meal expenses from this wallet within budget period
      const mealExpenses = await prisma.expense.findMany({
        where: {
          userId: session.user.id,
          walletId: wallet.id,
          type: "MEAL",
          date: {
            gte: budgetStartDate,
            lte: budgetEndDate,
          },
        },
      });

      // Get other transactions from this wallet within budget period
      const otherTransactions = await prisma.transaction.findMany({
        where: {
          walletId: wallet.id,
          date: {
            gte: budgetStartDate,
            lte: budgetEndDate,
          },
        },
      });

      // Calculate total spent from this wallet
      const mealExpensesTotal = mealExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      const otherTransactionsTotal = otherTransactions.reduce((sum, transaction) => {
        if (transaction.type === "EXPENSE") {
          return sum + Number(transaction.amount);
        }
        return sum;
      }, 0);

      const totalSpent = mealExpensesTotal + otherTransactionsTotal;

      // Get static allocations (if any)
      const staticAllocation = await prisma.allocation.findFirst({
        where: {
          budgetId: budget.id,
          walletId: wallet.id,
        },
      });

      return {
        wallet: {
          id: wallet.id,
          name: wallet.name,
          type: wallet.type,
          currentBalance: Number(wallet.balance),
        },
        staticAllocation: staticAllocation ? Number(staticAllocation.amount) : 0,
        dynamicAllocation: totalSpent,
        mealExpenses: mealExpensesTotal,
        otherTransactions: otherTransactionsTotal,
        netChange: totalSpent - (staticAllocation ? Number(staticAllocation.amount) : 0)
      };
    })
  );

  // Calculate summary
  const totalStaticAllocations = walletAllocations.reduce((sum, allocation) => sum + allocation.staticAllocation, 0);
  const totalDynamicAllocations = walletAllocations.reduce((sum, allocation) => sum + allocation.dynamicAllocation, 0);
  const totalMealExpenses = walletAllocations.reduce((sum, allocation) => sum + allocation.mealExpenses, 0);

  const allocationsData = {
    budget: {
      id: budget.id,
      month: budget.month,
      year: budget.year,
      salary: Number(budget.salary),
      weeklyBudget: Number(budget.weeklyBudget),
    },
    walletAllocations,
    summary: {
      totalStaticAllocations,
      totalDynamicAllocations,
      totalMealExpenses,
      remainingSalary: Number(budget.salary) - totalDynamicAllocations,
      budgetUtilization: Number(budget.salary) > 0 ? (totalDynamicAllocations / Number(budget.salary)) * 100 : 0
    }
  };

  // Helper function to get week start and end dates
  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(d.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

  function getWeekEnd(date: Date): Date {
    const weekStart = getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd;
  }

  // Get all expenses for this budget period
  const allExpenses = await prisma.expense.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: budgetStartDate,
        lte: budgetEndDate,
      },
    },
  });

  // Calculate expenses per week
  const weeklyExpenses = await Promise.all(
    budget.weeklyBudgets.map(async (week) => {
      // Calculate week start and end based on week number
      const firstDayOfMonth = new Date(budget.year, budget.month - 1, 1);
      const weekStart = new Date(firstDayOfMonth);
      weekStart.setDate(firstDayOfMonth.getDate() + (week.weekNumber - 1) * 7);
      const weekStartDate = getWeekStart(weekStart);
      const weekEndDate = getWeekEnd(weekStartDate);

      // Get expenses for this specific week
      const weekExpenses = allExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= weekStartDate && expenseDate <= weekEndDate;
      });

      const weekSpent = weekExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      const weekPercentage = Number(week.plannedAmount) > 0 ? (weekSpent / Number(week.plannedAmount)) * 100 : 0;

      return {
        ...week,
        actualSpent: weekSpent,
        actualPercentage: weekPercentage,
      };
    })
  );

  // Calculate budget statistics from actual expenses
  const totalSpent = allExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const totalBudget = Number(budget.weeklyBudget);
  const remainingBudget = totalBudget - totalSpent;
  const budgetUsagePercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="neo-yellow min-h-screen">
      {/* Header */}
      <div className="neo-border-b-4 border-black bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/budget">
                <Button className="neo-button">
                  ← Kembali
                </Button>
              </Link>
              <div>
                <h1 className="neo-heading text-2xl sm:text-3xl flex items-center space-x-3">
                  <span>📊</span>
                  <span>Detail Budget</span>
                </h1>
                <p className="neo-text mt-1">
                  {new Date(budget.year, budget.month - 1).toLocaleDateString('id-ID', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Budget Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="neo-card-raised">
            <CardHeader className="pb-3 sm:pb-6 neo-blue border-b-4 border-black">
              <CardTitle className="text-sm neo-heading text-white">Total Budget</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 sm:pt-0">
              <p className="text-xl sm:text-2xl font-black text-black">
                Rp {totalBudget.toLocaleString('id-ID')}
              </p>
            </CardContent>
          </Card>

          <Card className="neo-card-raised">
            <CardHeader className="pb-3 sm:pb-6 neo-red border-b-4 border-black">
              <CardTitle className="text-sm neo-heading text-white">Terpakai</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 sm:pt-0">
              <p className="text-xl sm:text-2xl font-black text-red-600">
                Rp {totalSpent.toLocaleString('id-ID')}
              </p>
            </CardContent>
          </Card>

          <Card className="neo-card-raised">
            <CardHeader className="pb-3 sm:pb-6 neo-green border-b-4 border-black">
              <CardTitle className="text-sm neo-heading text-white">Sisa Budget</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 sm:pt-0">
              <p className={`text-xl sm:text-2xl font-black ${remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
                Rp {Math.abs(remainingBudget).toLocaleString('id-ID')}
                {remainingBudget < 0 && " (lebih)"}
              </p>
            </CardContent>
          </Card>

          <Card className="neo-card-raised">
            <CardHeader className="pb-3 sm:pb-6 neo-purple border-b-4 border-black">
              <CardTitle className="text-sm neo-heading text-white">Usage</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 sm:pt-0">
              <p className={`text-xl sm:text-2xl font-black ${
                budgetUsagePercentage > 100 ? 'text-red-600' :
                budgetUsagePercentage > 80 ? 'text-orange-600' : 'text-green-600'
              }`}>
                {budgetUsagePercentage.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6 sm:mb-8 neo-card-raised">
          <CardHeader className="pb-3 sm:pb-6 neo-orange border-b-4 border-black">
            <CardTitle className="text-base sm:text-lg neo-heading text-white">Progress Budget</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 sm:pt-0">
            <div className="w-full bg-yellow-100 border-4 border-black">
              <div
                className={`h-4 border-4 border-black transition-all duration-300 ${
                  budgetUsagePercentage > 100 ? 'bg-red-400' :
                  budgetUsagePercentage > 80 ? 'bg-orange-400' : 'bg-green-400'
                }`}
                style={{ width: `${Math.min(budgetUsagePercentage, 100)}%` }}
              />
            </div>
            <p className="text-sm font-black mt-2 text-center">
              {budgetUsagePercentage.toFixed(1)}% terpakai dari total budget
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Weekly Budgets */}
          <Card className="neo-card-raised">
            <CardHeader className="pb-3 sm:pb-6 neo-blue border-b-4 border-black">
              <CardTitle className="text-base sm:text-lg neo-heading text-white">📅 Budget Mingguan</CardTitle>
              <CardDescription className="text-sm neo-text">Detail budget per minggu</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 sm:pt-0">
              <div className="space-y-3">
                {weeklyExpenses.map((week) => {
                  return (
                    <div key={week.id} className="bg-white border-2 border-black shadow-[4px_4px_0px_black] p-4 neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-2px] hover:translate-x-[-2px]">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-black text-blue-600">Minggu {week.weekNumber}</h4>
                        <span className={`text-sm font-black ${
                          week.actualPercentage > 100 ? 'text-red-600' :
                          week.actualPercentage > 80 ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {week.actualPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="font-bold">Budget:</span>
                          <span className="font-black">Rp {Number(week.plannedAmount).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold">Terpakai:</span>
                          <span className="font-black text-red-600">Rp {week.actualSpent.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold">Sisa:</span>
                          <span className={`font-black ${week.actualSpent > Number(week.plannedAmount) ? 'text-red-600' : 'text-green-600'}`}>
                            Rp {Math.abs(Number(week.plannedAmount) - week.actualSpent).toLocaleString('id-ID')}
                            {week.actualSpent > Number(week.plannedAmount) && " (lebih)"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 w-full bg-yellow-100 border-2 border-black">
                        <div
                          className={`h-3 border-2 border-black transition-all duration-300 ${
                            week.actualPercentage > 100 ? 'bg-red-400' :
                            week.actualPercentage > 80 ? 'bg-orange-400' : 'bg-green-400'
                          }`}
                          style={{ width: `${Math.min(week.actualPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Wallet Allocations */}
          <Card className="neo-card-raised">
            <CardHeader className="pb-3 sm:pb-6 neo-green border-b-4 border-black">
              <CardTitle className="text-base sm:text-lg neo-heading text-white">💳 Alokasi Dompet</CardTitle>
              <CardDescription className="text-sm neo-text">Real-time budget usage dan alokasi</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 sm:pt-0">
              {allocationsData && allocationsData.walletAllocations.length > 0 ? (
                <div className="space-y-3">
                  {allocationsData.walletAllocations.map((allocation, index) => (
                    <div key={allocation.wallet.id} className="bg-white border-2 border-black shadow-[4px_4px_0px_black] p-4 neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-2px] hover:translate-x-[-2px]">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-black text-sm">{allocation.wallet.name}</h4>
                          <p className="text-xs font-bold capitalize">{allocation.wallet.type.toLowerCase()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-sm text-orange-600">
                            Rp {allocation.dynamicAllocation.toLocaleString('id-ID')}
                          </p>
                          <p className="text-xs font-bold">terpakai</p>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="font-bold">Makanan & Minuman:</span>
                          <span className="font-black text-red-600">
                            -Rp {allocation.mealExpenses.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold">Lainnya:</span>
                          <span className="font-black text-red-600">
                            -Rp {allocation.otherTransactions.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold">Alokasi budget:</span>
                          <span className={`font-black ${
                            allocation.staticAllocation > 0 ? 'text-blue-600' : 'text-gray-600'
                          }`}>
                            {allocation.staticAllocation > 0
                              ? `+Rp ${allocation.staticAllocation.toLocaleString('id-ID')}`
                              : 'Rp 0'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between pt-1 border-t-2 border-black">
                          <span className="font-black">Total saldo dompet:</span>
                          <span className="font-black text-green-600">
                            Rp {allocation.wallet.currentBalance.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="text-xs font-bold mt-1 italic">
                          *Termasuk alokasi budget + saldo awal
                        </div>
                      </div>

                      {allocation.netChange !== 0 && (
                        <div className="mt-2 pt-2 border-t-2 border-black">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold">Perubahan vs alokasi:</span>
                            <span className={`text-xs font-black ${
                              allocation.netChange > 0 ? 'text-red-600' :
                              allocation.netChange < 0 ? 'text-green-600' : 'text-gray-600'
                            }`}>
                              {allocation.netChange > 0 ? '+' : ''}
                              Rp {allocation.netChange.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Summary */}
                  <div className="pt-3 border-t-4 border-black">
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div className="text-center bg-white border-2 border-black shadow-[4px_4px_0px_black] p-4">
                        <p className="text-xs font-bold">Total Terpakai</p>
                        <p className="font-black text-sm text-red-600">
                          Rp {allocationsData.summary.totalDynamicAllocations.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="text-center bg-white border-2 border-black shadow-[4px_4px_0px_black] p-4">
                        <p className="text-xs font-bold">Sisa Gaji</p>
                        <p className={`font-black text-sm ${
                          allocationsData.summary.remainingSalary < 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          Rp {allocationsData.summary.remainingSalary.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold">Utilisasi Budget:</span>
                        <span className="text-xs font-black">
                          {allocationsData.summary.budgetUtilization.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-yellow-100 border-2 border-black">
                        <div
                          className={`h-3 border-2 border-black transition-all duration-300 ${
                            allocationsData.summary.budgetUtilization > 100 ? 'bg-red-400' :
                            allocationsData.summary.budgetUtilization > 80 ? 'bg-orange-400' : 'bg-green-400'
                          }`}
                          style={{ width: `${Math.min(allocationsData.summary.budgetUtilization, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-white border-2 border-black shadow-[4px_4px_0px_black]">
                  <p className="text-gray-700 text-sm font-black">Belum ada transaksi pada dompet</p>
                  <p className="text-gray-600 text-xs mt-1 font-bold">
                    Mulai mencatat pengeluaran untuk melihat alokasi dinamis
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}