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
    const wallet = await prisma.wallet.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    return NextResponse.json(wallet);
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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

    const body = await request.json();
    const { name, type } = body;

    // Validate input
    if (!name || !type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
    }

    const { id } = await params;

    // Check if wallet exists and belongs to user
    const existingWallet = await prisma.wallet.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!existingWallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    const updatedWallet = await prisma.wallet.update({
      where: { id: id },
      data: {
        name,
        type: type.toUpperCase(),
      },
    });

    return NextResponse.json(updatedWallet);
  } catch (error) {
    console.error("Error updating wallet:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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

    // Check if wallet exists and belongs to user
    const existingWallet = await prisma.wallet.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!existingWallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Check if wallet has any allocations
    const hasAllocations = await prisma.allocation.findFirst({
      where: {
        walletId: id,
      },
    });

    if (hasAllocations) {
      return NextResponse.json(
        { error: "Cannot delete wallet with existing allocations" },
        { status: 400 }
      );
    }

    // Delete the wallet
    await prisma.wallet.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Wallet deleted successfully" });
  } catch (error) {
    console.error("Error deleting wallet:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}