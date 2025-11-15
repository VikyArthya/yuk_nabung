import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // For now, we'll skip auth check and use a simple user lookup
    // In production, you should implement proper authentication
    // This is a temporary fix for testing
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify budget belongs to user
    const budget = await prisma.budget.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!budget) {
      return NextResponse.json(
        { error: "Budget tidak ditemukan" },
        { status: 404 }
      );
    }

    // Get budget date range
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

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Error fetching budget allocations:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data alokasi budget" },
      { status: 500 }
    );
  }
}