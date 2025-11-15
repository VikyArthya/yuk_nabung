import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ExpenseInputForm } from "@/components/expenses/expense-input-form";
import { DailyExpensesList } from "@/components/expenses/daily-expenses-list";

async function getDashboardData(userId: string) {
  // Check if user has any budget first
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const existingBudget = await prisma.budget.findFirst({
    where: {
      userId: userId,
      year: currentYear,
    },
    select: {
      id: true,
      month: true,
      weeklyBudget: true,
    },
  });

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      savingsBalance: true
    }
  });

  if (!user) {
    return null;
  }

  // If no budget exists, return user data with hasBudget: false
  if (!existingBudget) {
    return {
      user: {
        name: user.name,
        email: user.email,
        dailyBudget: 0,
        savingsBalance: Number(user.savingsBalance)
      },
      hasBudget: false,
      currentBudget: null
    };
  }

  // Calculate daily budget from the most recent budget
  const calculatedDailyBudget = Math.round(Number(existingBudget.weeklyBudget) / 7);

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
        dailyBudget: calculatedDailyBudget,
        dailyBudgetRemaining: calculatedDailyBudget,
        totalExpense: 0,
        leftover: 0
      }
    });
  } else {
    // Update existing daily record if needed
    if (Number(dailyRecord.dailyBudget) !== calculatedDailyBudget) {
      dailyRecord = await prisma.dailyRecord.update({
        where: { id: dailyRecord.id },
        data: {
          dailyBudget: calculatedDailyBudget,
          dailyBudgetRemaining: calculatedDailyBudget - Number(dailyRecord.totalExpense),
          leftover: Math.max(0, calculatedDailyBudget - Number(dailyRecord.totalExpense))
        }
      });
    }
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
  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
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

  function getDaysIntoWeek(date: Date): number {
    const day = date.getDay();
    return day === 0 ? 7 : day; // Sunday = 7, Monday = 1, etc.
  }

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

  // Get this week's expenses (simple approach: get all and filter in code)
  const allExpenses = await prisma.expense.findMany({
    where: {
      userId: userId
    }
  });

  // Filter expenses for this week
  const weeklyExpenses = allExpenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= weekStart && expenseDate <= weekEnd;
  });

  
  // Calculate weekly summary
  const totalWeeklyExpenses = weeklyExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const daysIntoWeek = getDaysIntoWeek(today);
  const weeklyBudgetAmount = existingBudget ? Number(existingBudget.weeklyBudget) : 0;
  const weeklyLeftover = weeklyBudgetAmount - totalWeeklyExpenses;
  const dailyAverage = totalWeeklyExpenses > 0 ? totalWeeklyExpenses / daysIntoWeek : 0;

  // Get current month budget details for saving calculation
  const currentBudgetDetails = await prisma.budget.findFirst({
    where: {
      userId: userId,
      month: currentMonth,
      year: currentYear,
    },
    select: {
      salary: true,
      savingTarget: true,
      spendingTarget: true,
      weeklyBudget: true,
    },
  });

  // Calculate total savings balance (saving target + spending target - total expenses)
  const totalTargetSavings = currentBudgetDetails ?
    Number(currentBudgetDetails.savingTarget) + Number(currentBudgetDetails.spendingTarget) : 0;

  const monthlyExpenses = await prisma.expense.findMany({
    where: {
      userId: userId,
      date: {
        gte: new Date(currentYear, currentMonth - 1, 1),
        lt: new Date(currentYear, currentMonth, 1)
      }
    }
  });
  const totalMonthlyExpenses = monthlyExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const actualSavings = totalTargetSavings - totalMonthlyExpenses;

  return {
    user: {
      name: user.name,
      email: user.email,
      dailyBudget: calculatedDailyBudget,
      savingsBalance: actualSavings > 0 ? actualSavings : 0
    },
    hasBudget: true,
    currentBudget: existingBudget,
    daily: {
      budget: calculatedDailyBudget,
      remaining: Number(dailyRecord.dailyBudgetRemaining),
      spent: Number(dailyRecord.totalExpense),
      leftover: Number(dailyRecord.leftover),
      isOverBudget: Number(dailyRecord.dailyBudgetRemaining) < 0,
      expenses: todayExpenses.map(expense => ({
        id: expense.id,
        amount: Number(expense.amount),
        note: expense.note,
        date: expense.date,
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
      weeklyLeftover: weeklyLeftover > 0 ? weeklyLeftover : 0,
      daysIntoWeek: daysIntoWeek,
      weekStart: weekStart,
      weekEnd: weekEnd,
      transferredToSavings: weeklyRecord?.transferredToSavings || false
    }
  };
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

  // If user has no budget, show welcome screen
  if (!dashboardData.hasBudget) {
    return (
      <div className="bg-gradient-to-br from-orange-50 via-yellow-50 to-white min-h-screen">
        {/* Header */}
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
        <main className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            {/* Welcome Card */}
            <Card className="border-orange-100">
              <CardHeader className="pb-6 sm:pb-8">
                <div className="space-y-4">
                  <div className="text-6xl">🎯</div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Selamat Datang di Nabung App!
                    </h2>
                    <p className="text-gray-600 mt-2">
                      Mulai perjalanan tracking pengeluaran makan Anda hari ini
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 sm:pt-0">
                <div className="space-y-6">
                  {/* Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-6 text-center">
                        <div className="text-3xl mb-3">💰</div>
                        <h3 className="font-semibold text-blue-900 mb-2">
                          Budget Harian Dinamis
                        </h3>
                        <p className="text-sm text-blue-700">
                          Daily budget akan otomatis dihitung dari weekly budget yang Anda buat
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-6 text-center">
                        <div className="text-3xl mb-3">📊</div>
                        <h3 className="font-semibold text-green-900 mb-2">
                          Tracking Real-time
                        </h3>
                        <p className="text-sm text-green-700">
                          Pantau pengeluaran dan sisa budget secara real-time
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl mb-3">🚀</div>
                      <h3 className="font-semibold text-yellow-900 mb-2">
                        Siap Memulai!
                      </h3>
                      <p className="text-sm text-yellow-700">
                        Buat budget bulanan untuk mulai tracking
                      </p>
                    </CardContent>
                  </Card>

                  {/* CTA Button */}
                  <div className="space-y-4">
                    <Link href="/dashboard/budget/create">
                      <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 text-lg py-3 px-6">
                        📋 Buat Budget Pertama
                      </Button>
                    </Link>
                    <p className="text-sm text-gray-500">
                      Atau buat dompet terlebih di{' '}
                      <Link href="/dashboard/wallets" className="text-orange-600 hover:underline">
                        menu dompet
                      </Link>
                    </p>
                  </div>

                  {/* Tips */}
                  <Card className="bg-gray-50 border-gray-200">
                    <CardHeader className="pb-4">
                      <h4 className="font-semibold text-gray-800">💡 Tips Memulai</h4>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="text-sm text-gray-600 space-y-2 text-left">
                        <li>• Buat budget bulanan dengan gaji dan target pengeluaran</li>
                        <li>• Daily budget otomatis dihitung: weekly budget ÷ 7 hari</li>
                        <li>• Catat setiap pengeluaran makan untuk tracking</li>
                        <li>• Lihat sisa budget dan tabungan yang terkumpul</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
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
                {new Date(dashboardData.weekly.weekStart).toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric', year: 'numeric' })} - {new Date(dashboardData.weekly.weekEnd).toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric', year: 'numeric' })}
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