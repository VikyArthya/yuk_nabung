import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { budgetId, walletId, amount } = body;

    // Validate required fields
    if (!budgetId || !walletId || !amount) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // Verify that the budget belongs to the user
    const budget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId: session.user.id,
      },
    });

    if (!budget) {
      return NextResponse.json(
        { error: "Budget tidak ditemukan" },
        { status: 404 }
      );
    }

    // Verify that the wallet belongs to the user
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

    // Check if allocation already exists for this budget and wallet
    const existingAllocation = await prisma.allocation.findFirst({
      where: {
        budgetId,
        walletId,
      },
    });

    if (existingAllocation) {
      return NextResponse.json(
        { error: "Alokasi untuk dompet ini sudah ada" },
        { status: 400 }
      );
    }

    // Create the allocation and update wallet balance
    const allocationAmount = parseFloat(amount);

    const [allocation] = await prisma.$transaction([
      // Create the allocation
      prisma.allocation.create({
        data: {
          budgetId,
          walletId,
          amount: allocationAmount,
        },
      }),
      // Update wallet balance (add allocation amount)
      prisma.wallet.update({
        where: {
          id: walletId,
        },
        data: {
          balance: {
            increment: allocationAmount,
          },
        },
      }),
    ]);

    return NextResponse.json({
      ...allocation,
      message: "Alokasi berhasil dibuat dan saldo dompet ditambahkan"
    });
  } catch (error) {
    console.error("Error creating allocation:", error);
    return NextResponse.json(
      { error: "Gagal membuat alokasi" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { allocationId } = body;

    if (!allocationId) {
      return NextResponse.json(
        { error: "Allocation ID harus diisi" },
        { status: 400 }
      );
    }

    // Get the allocation to be deleted
    const allocation = await prisma.allocation.findFirst({
      where: {
        id: allocationId,
        budget: {
          userId: session.user.id,
        },
      },
      include: {
        wallet: true,
      },
    });

    if (!allocation) {
      return NextResponse.json(
        { error: "Alokasi tidak ditemukan" },
        { status: 404 }
      );
    }

    // Delete allocation and update wallet balance
    await prisma.$transaction([
      // Delete the allocation
      prisma.allocation.delete({
        where: {
          id: allocationId,
        },
      }),
      // Update wallet balance (subtract allocation amount)
      prisma.wallet.update({
        where: {
          id: allocation.walletId,
        },
        data: {
          balance: {
            decrement: Number(allocation.amount),
          },
        },
      }),
    ]);

    return NextResponse.json({
      message: "Alokasi berhasil dihapus dan saldo dompet dikurangi"
    });
  } catch (error) {
    console.error("Error deleting allocation:", error);
    return NextResponse.json(
      { error: "Gagal menghapus alokasi" },
      { status: 500 }
    );
  }
}