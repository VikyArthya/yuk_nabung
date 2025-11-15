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

    // Get user's wallets
    const wallets = await prisma.wallet.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        type: true,
        balance: true,
      }
    });

    return NextResponse.json(wallets);
  } catch (error) {
    console.error("Error fetching user wallets:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data dompet" },
      { status: 500 }
    );
  }
}