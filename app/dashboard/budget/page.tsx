import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function BudgetPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Get current date
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Get user's budgets for the current year
  const budgets = await prisma.budget.findMany({
    where: {
      userId: session.user.id,
      year: currentYear,
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
    orderBy: {
      month: 'desc',
    },
  });

  const currentMonthBudget = budgets.find(b => b.month === currentMonth);
  const userWallets = await prisma.wallet.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline">← Kembali</Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                📊 Kelola Budget
              </h1>
            </div>
            <div className="space-x-4">
              <Link href="/dashboard/budget/create">
                <Button>Buat Budget</Button>
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Current Month Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Status Budget {monthNames[currentMonth - 1]} {currentYear}</CardTitle>
            <CardDescription>
              Overview budget bulan ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentMonthBudget ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    Rp {Number(currentMonthBudget.salary).toLocaleString('id-ID')}
                  </div>
                  <p className="text-sm text-gray-500">Gaji</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    Rp {Number(currentMonthBudget.savingTarget).toLocaleString('id-ID')}
                  </div>
                  <p className="text-sm text-gray-500">Target Nabung</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    Rp {Number(currentMonthBudget.spendingTarget).toLocaleString('id-ID')}
                  </div>
                  <p className="text-sm text-gray-500">Target Pengeluaran</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-500 mb-4">Belum ada budget untuk bulan ini</p>
                <Link href="/dashboard/budget/create">
                  <Button>Buat Budget {monthNames[currentMonth - 1]}</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Budget {currentYear}</CardTitle>
            <CardDescription>
              Semua budget yang telah dibuat tahun ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            {budgets.length > 0 ? (
              <div className="space-y-4">
                {budgets.map((budget) => {
                  const totalSpent = budget.weeklyBudgets.reduce(
                    (total, week) => total + Number(week.spentAmount),
                    0
                  );
                  const spendingProgress = Number(budget.spendingTarget) > 0
                    ? (totalSpent / Number(budget.spendingTarget)) * 100
                    : 0;

                  return (
                    <div key={budget.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-lg">
                            {monthNames[budget.month - 1]} {budget.year}
                          </h3>
                          <div className="text-sm text-gray-500 mt-1">
                            Gaji: Rp {Number(budget.salary).toLocaleString('id-ID')} •
                            Target Nabung: Rp {Number(budget.savingTarget).toLocaleString('id-ID')}
                          </div>
                        </div>
                        <Link href={`/dashboard/budget/${budget.id}`}>
                          <Button variant="outline" size="sm">Detail</Button>
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress Pengeluaran:</span>
                            <span>{spendingProgress.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                spendingProgress > 100 ? 'bg-red-500' :
                                spendingProgress > 80 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(spendingProgress, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Terpakai: </span>
                          <span className="font-medium">
                            Rp {totalSpent.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Target: </span>
                          <span className="font-medium">
                            Rp {Number(budget.spendingTarget).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{budget.weeklyBudgets.length} minggu aktif</span>
                        <span>{budget.allocations.length} alokasi dompet</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Belum ada budget
                </h3>
                <p className="text-gray-500 mb-6">
                  Mulai dengan membuat budget untuk bulan ini
                </p>
                <Link href="/dashboard/budget/create">
                  <Button>Buat Budget Pertama</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Tips Budget</CardTitle>
            <CardDescription>
              Beberapa tips untuk mengelola budget dengan efektif
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">💰 50/30/20 Rule</h4>
                <p className="text-sm text-gray-600">
                  Alokasikan 50% untuk kebutuhan, 30% untuk keinginan, dan 20% untuk tabungan
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">📈 Track Pengeluaran</h4>
                <p className="text-sm text-gray-600">
                  Catat setiap pengeluaran untuk memantau budget tetap on track
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">🎯 Set Realistic Goals</h4>
                <p className="text-sm text-gray-600">
                  Buat target yang realistis sesuai dengan penghasilan dan gaya hidup
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">🔄 Review Rutin</h4>
                <p className="text-sm text-gray-600">
                  Review budget mingguan untuk melakukan penyesuaian jika diperlukan
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}