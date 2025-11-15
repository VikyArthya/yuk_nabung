import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get budget details
    const budget = await prisma.budget.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      select: {
        id: true,
        month: true,
        year: true,
        spendingTarget: true,
      },
    });

    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    // Get all expenses for this budget's month
    const startDate = new Date(budget.year, budget.month - 1, 1);
    const endDate = new Date(budget.year, budget.month, 1);

    const expenses = await prisma.expense.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        amount: true,
        date: true,
      },
    });

    // Calculate total spent
    const totalSpent = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const spendingProgress = budget.spendingTarget > 0
      ? (totalSpent / Number(budget.spendingTarget)) * 100
      : 0;

    return NextResponse.json({
      totalSpent,
      spendingTarget: Number(budget.spendingTarget),
      spendingProgress,
      expensesCount: expenses.length,
    });
  } catch (error) {
    console.error("Error fetching budget expenses:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pengeluaran budget" },
      { status: 500 }
    );
  }
}