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
      <div className="min-h-screen flex items-center justify-center neo-yellow">
        <Card className="w-96 neo-card-raised">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-700 font-black mb-4">Dompet tidak ditemukan</p>
            <Link href="/dashboard/wallets">
              <Button className="neo-orange text-white neo-interactive">
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
    <div className="neo-yellow min-h-screen">
      {/* Header */}
      <div className="neo-border-b-4 border-black bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/wallets">
                <Button className="neo-button">← Kembali</Button>
              </Link>
              <div>
                <h1 className="neo-heading text-2xl sm:text-3xl flex items-center space-x-3">
                  <span>📊</span>
                  <span>Riwayat Transaksi</span>
                </h1>
                <p className="neo-text mt-1">
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
        <Card className="mb-6 sm:mb-8 neo-card-raised">
          <CardHeader className="pb-3 sm:pb-6 neo-purple border-b-4 border-black">
            <CardTitle className="text-base sm:text-lg neo-heading text-white">💳 Info Dompet</CardTitle>
            <CardDescription className="text-xs sm:text-sm neo-text">
              Saldo dan informasi dompet
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 sm:pt-0">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black">{wallet.name}</h3>
                <p className="text-sm font-bold capitalize">{wallet.type.toLowerCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">Saldo Saat Ini</p>
                <p className="text-xl sm:text-2xl font-black text-orange-600">
                  Rp {Number(wallet.balance).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <TransactionList
          transactions={transactions.map(t => ({
            ...t,
            amount: Number(t.amount),
            wallet: t.wallet ? {
              id: t.wallet.id,
              name: t.wallet.name,
              type: t.wallet.type
            } : {
              id: '',
              name: 'Unknown',
              type: 'UNKNOWN'
            }
          }))}
          allocations={allocations.map(a => ({
            ...a,
            amount: Number(a.amount),
            budget: {
              id: a.budget.id,
              month: a.budget.month,
              year: a.budget.year
            }
          }))}
          walletName={wallet.name}
        />
      </main>
    </div>
  );
}