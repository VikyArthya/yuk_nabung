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

    // Parse amount early for validation
    const expenseAmount = parseFloat(amount);

    // Validate wallet if provided
    let wallet = null;
    if (walletId) {
      wallet = await prisma.wallet.findFirst({
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
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { dailyBudget: true }
      });

      if (!user) {
        return NextResponse.json(
          { error: "User tidak ditemukan" },
          { status: 404 }
        );
      }

      dailyRecord = await prisma.dailyRecord.create({
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

    // Check if expense exceeds remaining daily budget
    if (expenseAmount > Number(dailyRecord.dailyBudgetRemaining)) {
      // Allow over budget but will calculate different leftover
      console.log("Over budget warning for user:", session.user.id);
    }

    // Create the expense
    const expense = await prisma.expense.create({
      data: {
        userId: session.user.id,
        walletId: walletId || null,
        amount: expenseAmount,
        note: note || null,
        date: new Date(),
        type: "MEAL"
      },
      include: {
        wallet: true
      }
    });

    // Update wallet balance if wallet is selected
    if (wallet) {
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: expenseAmount
          }
        }
      });
    }

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
      wallet: wallet ? {
        id: wallet.id,
        name: wallet.name,
        type: wallet.type,
        previousBalance: Number(wallet.balance),
        newBalance: Number(wallet.balance) - expenseAmount
      } : null
    });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Gagal mencatat pengeluaran" },
      { status: 500 }
    );
  }
}