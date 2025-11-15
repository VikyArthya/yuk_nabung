import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import EditBudgetForm from "@/components/budget/edit-budget-form";

interface Wallet {
  id: string;
  name: string;
  type: string;
  balance: number;
}

export default async function EditBudgetPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const budgetId = id as string;

  if (!session) {
    redirect("/login");
  }

  // Get budget details
  const budget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
        <Card className="w-96 border-orange-100">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500 mb-4">Budget tidak ditemukan</p>
            <Link href="/dashboard/budget">
              <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 px-4 py-2 rounded-md">
                Kembali
              </button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get user's wallets
  const wallets = await prisma.wallet.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Prepare allocations data for the form
  const allocations: { [key: string]: string } = {};
  budget.allocations.forEach((allocation) => {
    allocations[allocation.walletId] = Number(allocation.amount).toString();
  });

  // Convert Decimal values to plain numbers for Client Component
  const budgetForClient = {
    ...budget,
    salary: Number(budget.salary),
    savingTarget: Number(budget.savingTarget),
    spendingTarget: Number(budget.spendingTarget),
    weeklyBudget: Number(budget.weeklyBudget),
    weeklyBudgets: budget.weeklyBudgets.map(week => ({
      ...week,
      plannedAmount: Number(week.plannedAmount),
      spentAmount: Number(week.spentAmount),
      remainingAmount: Number(week.remainingAmount),
      movedToCold: Number(week.movedToCold || 0),
    })),
    allocations: budget.allocations.map(allocation => ({
      ...allocation,
      amount: Number(allocation.amount),
    })),
  };

  // Convert wallet balances to plain numbers for Client Component
  const walletsForClient = wallets.map(wallet => ({
    ...wallet,
    balance: Number(wallet.balance),
  }));

  return (
    <div className="bg-gradient-to-br from-orange-50 via-yellow-50 to-white min-h-screen">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-orange-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/budget">
                <button className="border border-orange-500 text-orange-500 hover:bg-orange-50 px-3 py-1 rounded-md text-sm">
                  ← Kembali
                </button>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center space-x-3">
                  <span className="text-orange-500">✏️</span>
                  <span>Edit Budget</span>
                </h1>
                <p className="text-gray-600 mt-1">
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
      <main className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <Card className="border-orange-100">
          <CardHeader className="pb-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-t-lg">
            <CardTitle className="text-xl sm:text-2xl text-orange-700">
              ✏️ Edit Budget Bulanan
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-orange-600">
              Perbarui informasi budget dan alokasi dompet
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <EditBudgetForm
              budget={budgetForClient}
              wallets={walletsForClient}
              initialAllocations={allocations}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}