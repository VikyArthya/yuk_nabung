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

// Helper functions untuk week calculation (sama seperti di budget detail)
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

  // Get current week's record (using same approach as budget detail page)

  const weekStart = getWeekStart(today);
  const weekEnd = getWeekEnd(today);

  // Get all expenses for current user (same approach as budget detail)
  const allExpenses = await prisma.expense.findMany({
    where: {
      userId: userId
    }
  });

  // Filter expenses for this week (exact same logic as budget detail page)
  const weeklyExpenses = allExpenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= weekStart && expenseDate <= weekEnd;
  });

  
  // Calculate weekly summary (same approach as budget detail page)
  const totalWeeklyExpenses = weeklyExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const weeklyBudgetAmount = existingBudget ? Number(existingBudget.weeklyBudget) : 0;
  const weeklyLeftover = weeklyBudgetAmount - totalWeeklyExpenses;
  const daysIntoWeek = today.getDay() === 0 ? 7 : today.getDay(); // Sunday = 7, Monday = 1, etc.
  const dailyAverage = totalWeeklyExpenses > 0 ? Math.round(totalWeeklyExpenses / daysIntoWeek) : 0;

  const weeklyRecord = await prisma.weeklyRecord.findUnique({
    where: {
      userId_weekStart: {
        userId: userId,
        weekStart: weekStart
      }
    }
  });

  
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
      transferredToSavings: weeklyRecord?.transferredToSavings || false,
      weeklyBudget: weeklyBudgetAmount
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
      <div className="bg-yellow-200 min-h-screen">
        {/* Header */}
        <div className="neo-border-b-4 border-black bg-white">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h1 className="neo-heading text-3xl sm:text-5xl flex items-center space-x-4">
                  <span className="text-4xl sm:text-5xl">🍽️</span>
                  <span>Dashboard Keuangan</span>
                </h1>
                <p className="neo-text text-lg mt-2">Halo, {dashboardData.user.name}! 👋</p>
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
            <Card className="neo-card-raised">
              <CardHeader className="pb-6 sm:pb-8 neo-yellow border-b-4 border-black">
                <div className="space-y-4">
                  <div className="text-6xl">🎯</div>
                  <div>
                    <h2 className="neo-heading text-xl sm:text-2xl">
                      Selamat Datang di YukNabung!
                    </h2>
                    <p className="neo-text mt-2">
                      Mulai perjalanan tracking pengeluaran harian Anda hari ini
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 sm:pt-0">
                <div className="space-y-6">
                  {/* Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_black] p-6 text-center neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-2px] hover:translate-x-[-2px]">
                        <div className="text-3xl mb-3">💰</div>
                        <h3 className="font-black mb-2">
                          Budget Harian Dinamis
                        </h3>
                        <p className="neo-text text-sm">
                          Daily budget akan otomatis dihitung dari weekly budget yang Anda buat
                        </p>
                    </div>

                    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_black] p-6 text-center neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-2px] hover:translate-x-[-2px]">
                      <div className="text-3xl mb-3">📊</div>
                      <h3 className="font-black mb-2">
                        Tracking Real-time
                      </h3>
                      <p className="neo-text text-sm">
                        Pantau pengeluaran dan sisa budget secara real-time
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-black shadow-[4px_4px_0px_black] p-6 text-center neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-2px] hover:translate-x-[-2px]">
                      <div className="text-3xl mb-3">🚀</div>
                      <h3 className="font-black mb-2">
                        Siap Memulai!
                      </h3>
                      <p className="neo-text text-sm">
                        Buat budget bulanan untuk mulai tracking
                      </p>
                    </div>

                  {/* CTA Button */}
                  <div className="space-y-4">
                    <Link href="/dashboard/budget/create">
                      <Button className="w-full neo-orange text-white text-lg py-3 px-6">
                        📋 Buat Budget Pertama
                      </Button>
                    </Link>
                    <p className="neo-text text-sm">
                      Atau buat dompet terlebih di{' '}
                      <Link href="/dashboard/wallets" className="text-orange-600 hover:underline">
                        menu dompet
                      </Link>
                    </p>
                  </div>

                  {/* Tips */}
                  <div className="bg-white border-2 border-black shadow-[4px_4px_0px_black] neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-2px] hover:translate-x-[-2px]">
                    <div className="p-4 border-b-4 border-black">
                      <h4 className="font-black">💡 Tips Memulai</h4>
                    </div>
                    <div className="p-4 pt-0">
                      <ul className="neo-text text-sm space-y-2 text-left font-bold">
                        <li>• Buat budget bulanan dengan gaji dan target pengeluaran</li>
                        <li>• Daily budget otomatis dihitung: weekly budget ÷ 7 hari</li>
                        <li>• Catat setiap pengeluaran harian untuk tracking</li>
                        <li>• Lihat sisa budget dan tabungan yang terkumpul</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="neo-yellow min-h-screen">
      {/* Dashboard Header */}
      <div className="neo-border-b-4 border-black bg-white">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="neo-heading text-3xl sm:text-5xl flex items-center space-x-4">
                <span className="text-4xl sm:text-5xl">🍽️</span>
                <span>Dashboard Keuangan</span>
              </h1>
              <p className="neo-text text-lg mt-2">Halo, {dashboardData.user.name}! 👋</p>
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
          <Card className="md:col-span-1 neo-card-raised">
            <CardHeader className="pb-3 sm:pb-6 neo-yellow">
              <CardTitle className="text-base sm:text-lg neo-heading text-black">💰 Budget Harian</CardTitle>
              <CardDescription className="text-xs sm:text-sm neo-text">
                {new Date().toLocaleDateString('id-ID')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 sm:pt-0">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-bold">Total Budget:</span>
                  <span className="font-black text-xs sm:text-sm">Rp {dashboardData.user.dailyBudget.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-bold">Sisa Budget:</span>
                  <span className={`font-black text-xs sm:text-sm ${
                    (dashboardData.daily?.remaining || 0) < 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    Rp {Math.abs(dashboardData.daily?.remaining || 0).toLocaleString('id-ID')}
                    {(dashboardData.daily?.remaining || 0) < 0 && " (lebih)"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-bold">Sudah Dipakai:</span>
                  <span className="font-black text-xs sm:text-sm text-red-600">
                    Rp {(dashboardData.daily?.spent || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Summary Card */}
          <Card className="md:col-span-1 neo-card-raised">
            <CardHeader className="pb-3 sm:pb-6 neo-blue">
              <CardTitle className="text-base sm:text-lg neo-heading text-white">📅 Info Mingguan</CardTitle>
              <CardDescription className="text-xs sm:text-sm neo-text text-white">
                {dashboardData.weekly ?
                  `${new Date(dashboardData.weekly.weekStart).toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric', year: 'numeric' })} - ${new Date(dashboardData.weekly.weekEnd).toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric', year: 'numeric' })}`
                  : "Data mingguan tidak tersedia"}
              </CardDescription>
              </CardHeader>
            <CardContent className="pt-0 sm:pt-0">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-bold text-gray-900">Total Pengeluaran:</span>
                  <span className="font-black text-xs sm:text-sm text-gray-900">
                    Rp {(dashboardData.weekly?.totalExpenses || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                {(dashboardData.weekly?.weeklyBudget && dashboardData.weekly.weeklyBudget > 0) && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-bold text-gray-900">Budget Mingguan:</span>
                    <span className="font-black text-xs sm:text-sm text-gray-900">
                      Rp {(dashboardData.weekly?.weeklyBudget || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-bold text-gray-900">Rata-rata/hari:</span>
                  <span className="font-black text-xs sm:text-sm text-gray-900">
                    Rp {(dashboardData.weekly?.dailyAverage || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-bold text-gray-900">Sisa Mingguan:</span>
                  <span className="font-black text-xs sm:text-sm text-gray-900">
                    Rp {(dashboardData.weekly?.weeklyLeftover || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                {(dashboardData.weekly?.totalExpenses || 0) === 0 && (
                  <div className="text-xs text-gray-900 mt-2 text-center">
                    Belum ada pengeluaran minggu ini
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Total Savings Card */}
          <Card className="md:col-span-1 neo-card-raised">
            <CardHeader className="pb-3 sm:pb-6 neo-green">
              <CardTitle className="text-base sm:text-lg neo-heading text-white">💳 Total Tabungan</CardTitle>
              <CardDescription className="text-xs sm:text-sm neo-text text-white">
                Akumulasi dari sisa budget
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 sm:pt-0">
              <div className="text-xl sm:text-2xl font-black text-black break-all">
                Rp {dashboardData.user.savingsBalance.toLocaleString('id-ID')}
              </div>
              <p className="text-xs sm:text-sm neo-text mt-1">
                {dashboardData.weekly?.transferredToSavings ? "Sudah ditransfer minggu ini" : "Menunggu transfer mingguan"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Expense Input Form */}
          <ExpenseInputForm />

          {/* Daily Expenses List */}
          <DailyExpensesList
            expenses={dashboardData.daily?.expenses?.map(expense => ({
              ...expense,
              date: expense.date.toISOString()
            })) || []}
            budgetRemaining={dashboardData.daily?.remaining || 0}
            dailyBudget={dashboardData.daily?.budget || 0}
            totalExpense={dashboardData.daily?.spent || 0}
          />
        </div>
      </main>
    </div>
  );
}