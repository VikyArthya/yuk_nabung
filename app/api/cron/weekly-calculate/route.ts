import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Verify this is a cron job request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    const weekStart = getWeekStart(today);
    const weekEnd = getWeekEnd(today);

    // Get all weekly records that haven't been transferred to savings
    const weeklyRecords = await prisma.weeklyRecord.findMany({
      where: {
        weekStart: weekStart,
        transferredToSavings: false
      },
      include: {
        user: true
      }
    });

    for (const weeklyRecord of weeklyRecords) {
      if (Number(weeklyRecord.weeklyLeftover) > 0) {
        // Transfer weekly leftover to user's savings balance
        await prisma.user.update({
          where: { id: weeklyRecord.userId },
          data: {
            savingsBalance: {
              increment: weeklyRecord.weeklyLeftover
            }
          }
        });

        console.log(`Transferred Rp${weeklyRecord.weeklyLeftover} to savings for user ${weeklyRecord.userId}`);
      }

      // Mark this weekly record as transferred
      await prisma.weeklyRecord.update({
        where: { id: weeklyRecord.id },
        data: {
          transferredToSavings: true
        }
      });
    }

    return NextResponse.json({
      message: "Weekly calculation completed successfully",
      processedRecords: weeklyRecords.length,
      totalTransferred: weeklyRecords.reduce((sum, record) => sum + Number(record.weeklyLeftover), 0)
    });
  } catch (error) {
    console.error("Error in weekly calculation:", error);
    return NextResponse.json(
      { error: "Gagal melakukan kalkulasi mingguan" },
      { status: 500 }
    );
  }
}

// Helper functions to get week start and end
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
}