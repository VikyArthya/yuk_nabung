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

    const budgets = await prisma.budget.findMany({
      where: {
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(budgets);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data budget" },
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
    const { month, year, salary, savingTarget, spendingTarget, weeklyBudget } = body;

    // Validate required fields
    if (!month || !year || !salary || !savingTarget || !spendingTarget || !weeklyBudget) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    // Check if budget already exists for this month and year
    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId: session.user.id,
        month: parseInt(month),
        year: parseInt(year),
      },
    });

    if (existingBudget) {
      return NextResponse.json(
        { error: "Budget untuk bulan ini sudah ada" },
        { status: 400 }
      );
    }

    // Create the budget
    const budget = await prisma.budget.create({
      data: {
        userId: session.user.id,
        month: parseInt(month),
        year: parseInt(year),
        salary: parseFloat(salary),
        savingTarget: parseFloat(savingTarget),
        spendingTarget: parseFloat(spendingTarget),
        weeklyBudget: parseFloat(weeklyBudget),
      },
    });

    return NextResponse.json(budget);
  } catch (error) {
    console.error("Error creating budget:", error);
    return NextResponse.json(
      { error: "Gagal membuat budget" },
      { status: 500 }
    );
  }
}