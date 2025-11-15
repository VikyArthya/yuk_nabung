import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wallets = await prisma.wallet.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(wallets);
  } catch (error) {
    console.error("Error fetching wallets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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
    const { name, type, balance = 0 } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    if (!['BANK', 'EWALLET', 'CASH'].includes(type)) {
      return NextResponse.json(
        { error: "Invalid wallet type" },
        { status: 400 }
      );
    }

    const wallet = await prisma.wallet.create({
      data: {
        userId: session.user.id,
        name,
        type,
        balance: parseFloat(balance.toString()),
      },
    });

    // Create initial transaction if balance > 0
    if (parseFloat(balance.toString()) > 0) {
      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'INCOME',
          amount: parseFloat(balance.toString()),
          note: 'Saldo awal',
          date: new Date(),
        },
      });
    }

    return NextResponse.json(wallet, { status: 201 });
  } catch (error) {
    console.error("Error creating wallet:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}