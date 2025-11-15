import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ExpenseInputForm } from "@/components/expenses/expense-input-form";
import { DailyExpensesList } from "@/components/expenses/daily-expenses-list";

async function getDashboardData(userId: string) {
  const { prisma } = await import("@/lib/prisma");

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      dailyBudget: true,
      savingsBalance: true
    }
  });

  if (!user) {
    return null;
  }

  // Get today's daily record
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let dailyRecord = await prisma.dailyRecord.findUnique({
    where: {
      userId_date: {
        userId: userId,
        date: today
      }
    }
  });

  // If no daily record exists, create one
  if (!dailyRecord) {
    dailyRecord = await prisma.dailyRecord.create({
      data: {
        userId: userId,
        date: today,
        dailyBudget: user.dailyBudget,
        dailyBudgetRemaining: user.dailyBudget,
        totalExpense: 0,
        leftover: 0
      }
    });
  }

  // Get today's expenses
  const todayExpenses = await prisma.expense.findMany({
    where: {
      userId: userId,
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    },
    include: {
      wallet: true
    },
    orderBy: {
      date: 'desc'
    }
  });

  // Get current week's record
  const weekStart = getWeekStart(today);
  const weekEnd = getWeekEnd(today);

  const weeklyRecord = await prisma.weeklyRecord.findUnique({
    where: {
      userId_weekStart: {
        userId: userId,
        weekStart: weekStart
      }
    }
  });

  // Get this week's expenses
  const weeklyExpenses = await prisma.expense.findMany({
    where: {
      userId: userId,
      date: {
        gte: weekStart,
        lte: weekEnd
      }
    }
  });

  // Calculate weekly summary
  const totalWeeklyExpenses = weeklyExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const weeklyLeftover = weeklyRecord ? Number(weeklyRecord.weeklyLeftover) : 0;
  const dailyAverage = totalWeeklyExpenses > 0 ? totalWeeklyExpenses / getDaysIntoWeek(today) : 0;

  return {
    user: {
      name: user.name,
      email: user.email,
      dailyBudget: Number(user.dailyBudget),
      savingsBalance: Number(user.savingsBalance)
    },
    daily: {
      budget: Number(user.dailyBudget),
      remaining: Number(dailyRecord.dailyBudgetRemaining),
      spent: Number(dailyRecord.totalExpense),
      leftover: Number(dailyRecord.leftover),
      isOverBudget: Number(dailyRecord.dailyBudgetRemaining) < 0,
      expenses: todayExpenses.map(expense => ({
        id: expense.id,
        amount: Number(expense.amount),
        note: expense.note,
        date: expense.date.toISOString(),
        type: expense.type,
        wallet: expense.wallet ? {
          id: expense.wallet.id,
          name: expense.wallet.name,
          type: expense.wallet.type
        } : null
      }))
    },
    weekly: {
      totalExpenses: totalWeeklyExpenses,
      dailyAverage: Math.round(dailyAverage),
      weeklyLeftover: weeklyLeftover,
      daysIntoWeek: getDaysIntoWeek(today),
      transferredToSavings: weeklyRecord?.transferredToSavings || false
    }
  };
}

// Helper functions
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
}

function getDaysIntoWeek(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 7 : day; // Sunday = 7, Monday = 1, etc.
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Get dashboard data
  const dashboardData = await getDashboardData(session.user.id);

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Gagal memuat data dashboard</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 via-yellow-50 to-white min-h-screen">
      {/* Dashboard Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-orange-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <span className="text-orange-500">🍽️</span>
                <span>Dashboard Makan</span>
              </h1>
              <p className="text-gray-600 mt-1">Halo, {dashboardData.user.name}! 👋</p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <SignOutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Daily Budget Card */}
          <Card className="md:col-span-1 hover:shadow-lg transition-shadow border-orange-100">
            <CardHeader className="pb-3 sm:pb-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-t-lg">
              <CardTitle className="text-base sm:text-lg text-orange-700">💰 Budget Harian</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-orange-600">
                {new Date().toLocaleDateString('id-ID')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 sm:pt-0">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Total Budget:</span>
                  <span className="font-medium text-xs sm:text-sm">Rp {dashboardData.user.dailyBudget.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Sisa Budget:</span>
                  <span className={`font-medium text-xs sm:text-sm ${
                    dashboardData.daily.remaining < 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    Rp {Math.abs(dashboardData.daily.remaining).toLocaleString('id-ID')}
                    {dashboardData.daily.remaining < 0 && " (lebih)"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Sudah Dipakai:</span>
                  <span className="font-medium text-xs sm:text-sm text-red-600">
                    Rp {dashboardData.daily.spent.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Summary Card */}
          <Card className="md:col-span-1 hover:shadow-lg transition-shadow border-orange-100">
            <CardHeader className="pb-3 sm:pb-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-t-lg">
              <CardTitle className="text-base sm:text-lg text-orange-700">📅 Ringkasan Mingguan</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-orange-600">
                Hari ke-{dashboardData.weekly.daysIntoWeek} minggu ini
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 sm:pt-0">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Total Pengeluaran:</span>
                  <span className="font-medium text-xs sm:text-sm text-red-600">
                    Rp {dashboardData.weekly.totalExpenses.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Rata-rata/hari:</span>
                  <span className="font-medium text-xs sm:text-sm">
                    Rp {dashboardData.weekly.dailyAverage.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Sisa Mingguan:</span>
                  <span className="font-medium text-xs sm:text-sm text-green-600">
                    Rp {dashboardData.weekly.weeklyLeftover.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Savings Card */}
          <Card className="md:col-span-1 hover:shadow-lg transition-shadow border-orange-100">
            <CardHeader className="pb-3 sm:pb-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-t-lg">
              <CardTitle className="text-base sm:text-lg text-orange-700">💳 Total Tabungan</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-orange-600">
                Akumulasi dari sisa budget
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold text-green-600 break-all">
                Rp {dashboardData.user.savingsBalance.toLocaleString('id-ID')}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {dashboardData.weekly.transferredToSavings ? "Sudah ditransfer minggu ini" : "Menunggu transfer mingguan"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Expense Input Form */}
          <ExpenseInputForm />

          {/* Daily Expenses List */}
          <DailyExpensesList
            expenses={dashboardData.daily.expenses}
            budgetRemaining={dashboardData.daily.remaining}
            dailyBudget={dashboardData.daily.budget}
            totalExpense={dashboardData.daily.spent}
          />
        </div>
      </main>
    </div>
  );
}