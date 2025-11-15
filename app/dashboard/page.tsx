import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Get user's current month budget
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
  const currentYear = currentDate.getFullYear();

  const budget = await prisma.budget.findUnique({
    where: {
      userId_month_year: {
        userId: session.user.id,
        month: currentMonth,
        year: currentYear,
      },
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

  const wallets = await prisma.wallet.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const recentTransactions = await prisma.transaction.findMany({
    where: {
      wallet: {
        userId: session.user.id,
      },
    },
    include: {
      wallet: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              💰 Dashboard - {session.user.name}
            </h1>
            <div className="space-x-4">
              <Link href="/dashboard/budget">
                <Button>Atur Budget</Button>
              </Link>
              <Link href="/dashboard/wallets">
                <Button variant="outline">Kelola Dompet</Button>
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Budget Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Budget Bulanan</CardTitle>
              <CardDescription>
                {currentMonth}/{currentYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {budget ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Gaji:</span>
                    <span className="font-medium">Rp {Number(budget.salary).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Nabung:</span>
                    <span className="font-medium text-green-600">
                      Rp {Number(budget.savingTarget).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Pengeluaran:</span>
                    <span className="font-medium text-red-600">
                      Rp {Number(budget.spendingTarget).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-500 mb-4">Belum ada budget untuk bulan ini</p>
                  <Link href="/dashboard/budget/create">
                    <Button size="sm">Buat Budget</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total Wallet Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Saldo</CardTitle>
              <CardDescription>Semua dompet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                Rp {wallets.reduce((total, wallet) => total + Number(wallet.balance), 0).toLocaleString('id-ID')}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {wallets.length} dompet
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Aksi Cepat</CardTitle>
              <CardDescription>Menu cepat</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/transactions/add">
                <Button className="w-full" size="sm">Tambah Transaksi</Button>
              </Link>
              <Link href="/dashboard/wallets/transfer">
                <Button variant="outline" className="w-full" size="sm">Transfer Dompet</Button>
              </Link>
              <Link href="/dashboard/reports">
                <Button variant="outline" className="w-full" size="sm">Lihat Laporan</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Wallets List */}
          <Card>
            <CardHeader>
              <CardTitle>Dompet Saya</CardTitle>
              <CardDescription>Daftar semua dompet Anda</CardDescription>
            </CardHeader>
            <CardContent>
              {wallets.length > 0 ? (
                <div className="space-y-3">
                  {wallets.map((wallet) => (
                    <div key={wallet.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{wallet.name}</h4>
                        <p className="text-sm text-gray-500 capitalize">{wallet.type.toLowerCase()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Rp {Number(wallet.balance).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-500 mb-4">Belum ada dompet</p>
                  <Link href="/dashboard/wallets/create">
                    <Button size="sm">Tambah Dompet</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Transaksi Terakhir</CardTitle>
              <CardDescription>5 transaksi terbaru</CardDescription>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{transaction.note || 'Transaksi'}</h4>
                        <p className="text-sm text-gray-500">
                          {transaction.wallet.name} • {new Date(transaction.date).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.type === 'INCOME' ? 'text-green-600' :
                          transaction.type === 'EXPENSE' ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {transaction.type === 'INCOME' ? '+' :
                           transaction.type === 'EXPENSE' ? '-' : '→'}
                          Rp {Number(transaction.amount).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-500">Belum ada transaksi</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Weekly Budget Progress (if budget exists) */}
        {budget && budget.weeklyBudgets.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Progress Budget Mingguan</CardTitle>
              <CardDescription>Progress pengeluaran per minggu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {budget.weeklyBudgets.map((week) => {
                  const percentage = Number(week.plannedAmount) > 0
                    ? (Number(week.spentAmount) / Number(week.plannedAmount)) * 100
                    : 0;

                  return (
                    <div key={week.id} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Minggu {week.weekNumber}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Dijalankan:</span>
                          <span>Rp {Number(week.spentAmount).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Plan:</span>
                          <span>Rp {Number(week.plannedAmount).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              percentage > 100 ? 'bg-red-500' :
                              percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          {percentage.toFixed(1)}% terpakai
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}