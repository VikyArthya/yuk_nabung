import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        dailyBudget: true,
        savingsBalance: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get today's daily record
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyRecord = await prisma.dailyRecord.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today
        }
      }
    });

    // If no daily record exists, create one
    let todayRecord = dailyRecord;
    if (!dailyRecord) {
      todayRecord = await prisma.dailyRecord.create({
        data: {
          userId: session.user.id,
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
        userId: session.user.id,
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
          userId: session.user.id,
          weekStart: weekStart
        }
      }
    });

    // Get this week's expenses
    const weeklyExpenses = await prisma.expense.findMany({
      where: {
        userId: session.user.id,
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

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        dailyBudget: Number(user.dailyBudget),
        savingsBalance: Number(user.savingsBalance)
      },
      daily: {
        budget: Number(user.dailyBudget),
        remaining: Number(todayRecord.dailyBudgetRemaining),
        spent: Number(todayRecord.totalExpense),
        leftover: Number(todayRecord.leftover),
        isOverBudget: Number(todayRecord.dailyBudgetRemaining) < 0,
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
        weeklyLeftover: weeklyLeftover,
        daysIntoWeek: getDaysIntoWeek(today),
        transferredToSavings: weeklyRecord?.transferredToSavings || false
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data dashboard" },
      { status: 500 }
    );
  }
}

// Helper functions
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

function getDaysIntoWeek(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 7 : day; // Sunday = 7, Monday = 1, etc.
}