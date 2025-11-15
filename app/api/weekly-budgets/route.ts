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
    const { budgetId, weekNumber, plannedAmount } = body;

    // Validate required fields
    if (!budgetId || !weekNumber || !plannedAmount) {
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

    // Check if weekly budget already exists for this budget and week
    const existingWeeklyBudget = await prisma.weeklyBudget.findFirst({
      where: {
        budgetId,
        weekNumber: parseInt(weekNumber),
      },
    });

    if (existingWeeklyBudget) {
      return NextResponse.json(
        { error: "Budget minggu ini sudah ada" },
        { status: 400 }
      );
    }

    // Create the weekly budget
    const weeklyBudget = await prisma.weeklyBudget.create({
      data: {
        budgetId,
        weekNumber: parseInt(weekNumber),
        plannedAmount: parseFloat(plannedAmount),
        spentAmount: 0,
        remainingAmount: parseFloat(plannedAmount),
      },
    });

    return NextResponse.json(weeklyBudget);
  } catch (error) {
    console.error("Error creating weekly budget:", error);
    return NextResponse.json(
      { error: "Gagal membuat budget mingguan" },
      { status: 500 }
    );
  }
}