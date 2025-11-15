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

    // Get today's expenses for the user
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expenses = await prisma.expense.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pengeluaran" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, note, walletId } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Nominal harus diisi dan lebih dari 0" },
        { status: 400 }
      );
    }

    if (!walletId) {
      return NextResponse.json(
        { error: "Dompet wajib dipilih" },
        { status: 400 }
      );
    }

    // Parse amount early for validation
    const expenseAmount = parseFloat(amount);

    // Validate wallet (required)
    const wallet = await prisma.wallet.findFirst({
      where: {
        id: walletId,
        userId: session.user.id,
      },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: "Dompet tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if wallet has sufficient balance
    if (Number(wallet.balance) < expenseAmount) {
      return NextResponse.json(
        {
          error: "Saldo dompet tidak mencukupi",
          details: `Saldo Rp ${Number(wallet.balance).toLocaleString('id-ID')}, butuh Rp ${expenseAmount.toLocaleString('id-ID')}`
        },
        { status: 400 }
      );
    }

    // Get user's current daily record
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dailyRecord = await prisma.dailyRecord.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today
        }
      }
    });

    // If no daily record exists for today, create one
    if (!dailyRecord) {
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

      dailyRecord = await prisma.dailyRecord.create({
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

      const weeklyBudgetAmount = currentBudget ? Number(currentBudget.weeklyBudget) : 0;
      const calculatedDailyBudget = weeklyBudgetAmount > 0 ? Math.round(weeklyBudgetAmount / 7) : 0;

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

    // Check if expense exceeds remaining daily budget
    if (expenseAmount > Number(dailyRecord.dailyBudgetRemaining)) {
      // Allow over budget but will calculate different leftover
      console.log("Over budget warning for user:", session.user.id);
    }

    // Create the expense
    const expense = await prisma.expense.create({
      data: {
        userId: session.user.id,
        walletId: walletId,
        amount: expenseAmount,
        note: note || null,
        date: new Date(),
        type: "MEAL"
      },
      include: {
        wallet: true
      }
    });

    // Update wallet balance (required)
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          decrement: expenseAmount
        }
      }
    });

    // Update daily record
    const newTotalExpense = Number(dailyRecord.totalExpense) + expenseAmount;
    const newDailyBudgetRemaining = Number(dailyRecord.dailyBudget) - newTotalExpense;
    const newLeftover = newDailyBudgetRemaining > 0 ? newDailyBudgetRemaining : 0;

    await prisma.dailyRecord.update({
      where: { id: dailyRecord.id },
      data: {
        totalExpense: newTotalExpense,
        dailyBudgetRemaining: newDailyBudgetRemaining,
        leftover: newLeftover
      }
    });

    return NextResponse.json({
      expense,
      dailyRecord: {
        dailyBudgetRemaining: newDailyBudgetRemaining,
        totalExpense: newTotalExpense,
        leftover: newLeftover,
        isOverBudget: expenseAmount > Number(dailyRecord.dailyBudgetRemaining)
      },
      wallet: {
        id: wallet.id,
        name: wallet.name,
        type: wallet.type,
        previousBalance: Number(wallet.balance),
        newBalance: Number(wallet.balance) - expenseAmount
      }
    });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Gagal mencatat pengeluaran" },
      { status: 500 }
    );
  }
}