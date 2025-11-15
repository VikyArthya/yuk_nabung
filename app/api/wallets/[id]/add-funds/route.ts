import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify wallet belongs to user
    const wallet = await prisma.wallet.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 404 }
      );
    }

    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Update wallet balance
    const updatedWallet = await prisma.wallet.update({
      where: {
        id: id,
      },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    // Create a transaction record (optional - for tracking additions)
    // Note: This would require a transaction model if you want to track fund additions

    return NextResponse.json({
      success: true,
      message: "Funds added successfully",
      newBalance: Number(updatedWallet.balance),
      amountAdded: amount,
    });

  } catch (error) {
    console.error("Error adding funds:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}