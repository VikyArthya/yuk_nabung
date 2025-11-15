import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import TransactionList from "@/components/wallets/transaction-list";

export default async function WalletTransactionsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session) {
    redirect("/login");
  }

  // Get wallet details
  const wallet = await prisma.wallet.findFirst({
    where: {
      id: id,
      userId: session.user.id,
    },
  });

  if (!wallet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
        <Card className="w-96 border-orange-100">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500 mb-4">Dompet tidak ditemukan</p>
            <Link href="/dashboard/wallets">
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0">
                Kembali
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get transactions for this wallet
  const transactions = await prisma.expense.findMany({
    where: {
      walletId: id,
      userId: session.user.id,
    },
    include: {
      wallet: true,
    },
    orderBy: {
      date: 'desc'
    },
  });

  // Get budget allocations that involve this wallet
  const allocations = await prisma.allocation.findMany({
    where: {
      walletId: id,
      budget: {
        userId: session.user.id,
      },
    },
    include: {
      budget: true,
    },
    orderBy: {
      createdAt: 'desc'
    },
  });

  return (
    <div className="bg-gradient-to-br from-orange-50 via-yellow-50 to-white min-h-screen">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-orange-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/wallets">
                <Button variant="outline" size="sm" className="border-orange-500 text-orange-500 hover:bg-orange-50">← Kembali</Button>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center space-x-3">
                  <span className="text-orange-500">📊</span>
                  <span>Riwayat Transaksi</span>
                </h1>
                <p className="text-gray-600 mt-1">
                  {wallet.name} ({wallet.type.toLowerCase()})
                </p>
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Wallet Info Card */}
        <Card className="mb-6 sm:mb-8 border-orange-100">
          <CardHeader className="pb-3 sm:pb-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-t-lg">
            <CardTitle className="text-base sm:text-lg text-orange-700">💳 Info Dompet</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-orange-600">
              Saldo dan informasi dompet
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 sm:pt-0">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{wallet.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{wallet.type.toLowerCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Saldo Saat Ini</p>
                <p className="text-xl font-bold text-orange-600">
                  Rp {Number(wallet.balance).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <TransactionList
          transactions={transactions}
          allocations={allocations}
          walletName={wallet.name}
        />
      </main>
    </div>
  );
}