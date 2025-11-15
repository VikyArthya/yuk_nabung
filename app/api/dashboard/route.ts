import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data and current budget
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        savingsBalance: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get current month budget to calculate daily budget
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const currentBudget = await prisma.budget.findFirst({
      where: {
        userId: session.user.id,
        month: currentMonth,
        year: currentYear,
      },
      select: {
        weeklyBudget: true,
      },
    });

    // Calculate daily budget from weekly budget
    const weeklyBudgetAmount = currentBudget ? Number(currentBudget.weeklyBudget) : 0;
    const calculatedDailyBudget = weeklyBudgetAmount > 0 ? Math.round(weeklyBudgetAmount / 7) : 0;

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
          dailyBudget: calculatedDailyBudget,
          dailyBudgetRemaining: calculatedDailyBudget,
          totalExpense: 0,
          leftover: 0
        }
      });
    } else {
      // Update existing daily record with calculated daily budget if needed
      if (Number(dailyRecord.dailyBudget) !== calculatedDailyBudget) {
        todayRecord = await prisma.dailyRecord.update({
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

    // Get this week's expenses (simple approach: get all expenses and filter in code)
    const allExpenses = await prisma.expense.findMany({
      where: {
        userId: session.user.id
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
    const weeklyBudgetAmount = currentBudget ? Number(currentBudget.weeklyBudget) : 0;
    const weeklyLeftover = weeklyBudgetAmount - totalWeeklyExpenses;
    const dailyAverage = totalWeeklyExpenses > 0 ? totalWeeklyExpenses / daysIntoWeek : 0;

    // Get current month budget details for saving calculation
    const currentBudgetDetails = await prisma.budget.findFirst({
      where: {
        userId: session.user.id,
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
        userId: session.user.id,
        date: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lt: new Date(currentYear, currentMonth, 1)
        }
      }
    });
    const totalMonthlyExpenses = monthlyExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const actualSavings = totalTargetSavings - totalMonthlyExpenses;

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        dailyBudget: calculatedDailyBudget,
        savingsBalance: actualSavings > 0 ? actualSavings : 0
      },
      daily: {
        budget: calculatedDailyBudget,
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
        weeklyLeftover: weeklyLeftover > 0 ? weeklyLeftover : 0,
        daysIntoWeek: daysIntoWeek,
        weekStart: weekStart,
        weekEnd: weekEnd,
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

function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
}

function getDaysIntoWeek(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 7 : day; // Sunday = 7, Monday = 1, etc.
}