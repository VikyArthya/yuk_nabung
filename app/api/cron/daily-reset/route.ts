import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Verify this is a cron job request (you might want to add authentication)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all users
    const users = await prisma.user.findMany({
      include: {
        dailyRecords: {
          where: {
            date: yesterday
          }
        }
      }
    });

    for (const user of users) {
      const yesterdayRecord = user.dailyRecords[0];

      if (yesterdayRecord) {
        // Calculate leftover from yesterday
        const leftover = yesterdayRecord.leftover;

        if (leftover > 0) {
          // Add leftover to weekly record
          const weekStart = getWeekStart(yesterday);
          const weekEnd = getWeekEnd(yesterday);

          let weeklyRecord = await prisma.weeklyRecord.findUnique({
            where: {
              userId_weekStart: {
                userId: user.id,
                weekStart: weekStart
              }
            }
          });

          if (!weeklyRecord) {
            weeklyRecord = await prisma.weeklyRecord.create({
              data: {
                userId: user.id,
                weekStart: weekStart,
                weekEnd: weekEnd,
                totalExpenses: 0,
                weeklyLeftover: 0,
                transferredToSavings: false
              }
            });
          }

          // Update weekly record with yesterday's leftover
          await prisma.weeklyRecord.update({
            where: { id: weeklyRecord.id },
            data: {
              weeklyLeftover: Number(weeklyRecord.weeklyLeftover) + Number(leftover),
              totalExpenses: Number(weeklyRecord.totalExpenses) + Number(yesterdayRecord.totalExpense)
            }
          });
        }
      }

      // Get current month budget to calculate daily budget
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const currentBudget = await prisma.budget.findFirst({
        where: {
          userId: user.id,
          month: currentMonth,
          year: currentYear,
        },
        select: {
          weeklyBudget: true,
        },
      });

      // Calculate daily budget from weekly budget
      const weeklyBudgetAmount = currentBudget ? Number(currentBudget.weeklyBudget) : 0;
      const calculatedDailyBudget = weeklyBudgetAmount > 0 ? Math.round(weeklyBudgetAmount / 7) : 0;

      // Create today's daily record
      await prisma.dailyRecord.create({
        data: {
          userId: user.id,
          date: today,
          dailyBudget: calculatedDailyBudget,
          dailyBudgetRemaining: calculatedDailyBudget,
          totalExpense: 0,
          leftover: 0
        }
      });
    }

    return NextResponse.json({
      message: "Daily reset completed successfully",
      processedUsers: users.length
    });
  } catch (error) {
    console.error("Error in daily reset:", error);
    return NextResponse.json(
      { error: "Gagal melakukan reset harian" },
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