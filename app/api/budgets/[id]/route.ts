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

    // Get budget with all related data
    const budget = await prisma.budget.findFirst({
      where: {
        id: id,
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
      return NextResponse.json(
        { error: "Budget tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(budget);
  } catch (error) {
    console.error("Error fetching budget:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data budget" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { month, year, salary, savingTarget, spendingTarget, weeklyBudget } = body;

    // Validate required fields
    if (!month || !year || !salary || !savingTarget || !spendingTarget || !weeklyBudget) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // Verify budget belongs to user
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!existingBudget) {
      return NextResponse.json(
        { error: "Budget tidak ditemukan" },
        { status: 404 }
      );
    }

    // Update the budget
    const updatedBudget = await prisma.budget.update({
      where: {
        id: id,
      },
      data: {
        month: parseInt(month),
        year: parseInt(year),
        salary: parseFloat(salary),
        savingTarget: parseFloat(savingTarget),
        spendingTarget: parseFloat(spendingTarget),
        weeklyBudget: parseFloat(weeklyBudget),
      },
    });

    return NextResponse.json(updatedBudget);
  } catch (error) {
    console.error("Error updating budget:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate budget" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify budget belongs to user and get all related data
    const budget = await prisma.budget.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        allocations: {
          include: {
            wallet: true,
          },
        },
        weeklyBudgets: true,
      },
    });

    if (!budget) {
      return NextResponse.json(
        { error: "Budget tidak ditemukan" },
        { status: 404 }
      );
    }

    // Delete everything in a transaction to maintain data consistency
    await prisma.$transaction(async (tx) => {
      // First, return allocation amounts from wallets (reverse the allocation logic)
      for (const allocation of budget.allocations) {
        await tx.wallet.update({
          where: {
            id: allocation.walletId,
          },
          data: {
            balance: {
              decrement: Number(allocation.amount),
            },
          },
        });
      }

      // Delete allocations
      await tx.allocation.deleteMany({
        where: {
          budgetId: id,
        },
      });

      // Delete weekly budgets
      await tx.weeklyBudget.deleteMany({
        where: {
          budgetId: id,
        },
      });

      // Finally delete the budget
      await tx.budget.delete({
        where: {
          id: id,
        },
      });
    });

    return NextResponse.json({
      message: "Budget berhasil dihapus. Saldo dompet telah dikembalikan."
    });
  } catch (error) {
    console.error("Error deleting budget:", error);
    return NextResponse.json(
      { error: "Gagal menghapus budget" },
      { status: 500 }
    );
  }
}