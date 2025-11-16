"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";

interface Wallet {
  id: string;
  name: string;
  type: string;
  balance: number;
}

interface Allocation {
  id: string;
  amount: number;
  wallet: Wallet;
}

interface WeeklyBudget {
  id: string;
  weekNumber: number;
  plannedAmount: number;
  spentAmount: number;
  remainingAmount: number;
}

interface Budget {
  id: string;
  month: number;
  year: number;
  salary: number;
  savingTarget: number;
  spendingTarget: number;
  weeklyBudgets: WeeklyBudget[];
  allocations: Allocation[];
}

interface BudgetExpenses {
  [budgetId: string]: {
    totalSpent: number;
    spendingProgress: number;
    expensesCount: number;
  };
}

export default function BudgetPage() {
  const router = useRouter();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [currentMonthBudget, setCurrentMonthBudget] = useState<Budget | null>(null);
  const [budgetExpenses, setBudgetExpenses] = useState<BudgetExpenses>({});
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgetExpenses = async (budgetId: string) => {
    try {
      const response = await fetch(`/api/budgets/${budgetId}/expenses`);
      if (response.ok) {
        const data = await response.json();
        setBudgetExpenses(prev => ({
          ...prev,
          [budgetId]: {
            totalSpent: data.totalSpent,
            spendingProgress: data.spendingProgress,
            expensesCount: data.expensesCount,
          }
        }));
      }
    } catch (error) {
      console.error("Error fetching budget expenses:", error);
    }
  };

  const fetchBudgets = async () => {
    try {
      const response = await fetch("/api/budgets");
      if (response.ok) {
        const data = await response.json();
        setBudgets(data);

        // Set current month budget
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        const current = data.find((b: Budget) =>
          b.month === currentMonth && b.year === currentYear
        );
        setCurrentMonthBudget(current || null);

        // Fetch expenses for all budgets
        for (const budget of data) {
          fetchBudgetExpenses(budget.id);
        }
      }
    } catch (error) {
      console.error("Error fetching budgets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus budget ini? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }

    setDeletingId(budgetId);
    try {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchBudgets(); // Refresh the data
      } else {
        const error = await response.json();
        alert("Gagal menghapus budget: " + (error.error || "Terjadi kesalahan"));
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menghapus budget");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen neo-yellow flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-black mx-auto mb-4"></div>
          <p className="neo-text">Memuat data budget...</p>
        </div>
      </div>
    );
  }

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  return (
    <div className="min-h-screen neo-yellow">
      {/* Header */}
      <header className="bg-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline">← Kembali</Button>
              </Link>
              <h1 className="neo-heading text-2xl">
                <span>📊</span> Kelola Budget
              </h1>
            </div>
            <div className="space-x-4">
              <Link href="/dashboard/budget/create">
                <Button className="neo-orange text-white">Buat Budget</Button>
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Current Month Status */}
        <Card className="mb-8 neo-card-raised">
          <CardHeader className="neo-blue border-b-4 border-black">
            <CardTitle className="neo-heading text-white">📅 Status Budget {monthNames[currentMonth - 1]} {currentYear}</CardTitle>
            <CardDescription className="neo-text">
              Overview budget bulan ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentMonthBudget ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 neo-green text-white neo-border neo-shadow">
                  <div className="text-2xl font-black">
                    Rp {currentMonthBudget.salary.toLocaleString('id-ID')}
                  </div>
                  <p className="text-sm font-medium">Gaji</p>
                </div>
                <div className="text-center p-4 neo-orange text-white neo-border neo-shadow">
                  <div className="text-2xl font-black">
                    Rp {currentMonthBudget.savingTarget.toLocaleString('id-ID')}
                  </div>
                  <p className="text-sm font-medium">Target Nabung</p>
                </div>
                <div className="text-center p-4 neo-red text-white neo-border neo-shadow">
                  <div className="text-2xl font-black">
                    Rp {currentMonthBudget.spendingTarget.toLocaleString('id-ID')}
                  </div>
                  <p className="text-sm font-medium">Target Pengeluaran</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="neo-text mb-4">Belum ada budget untuk bulan ini</p>
                <Link href="/dashboard/budget/create">
                  <Button className="neo-orange text-white">Buat Budget {monthNames[currentMonth - 1]}</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget List */}
        <Card className="neo-card-raised">
          <CardHeader className="neo-purple border-b-4 border-black">
            <CardTitle className="neo-heading text-white">📋 Daftar Budget {currentYear}</CardTitle>
            <CardDescription className="neo-text">
              Semua budget yang telah dibuat tahun ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            {budgets.length > 0 ? (
              <div className="space-y-4">
                {budgets.map((budget) => {
                  // Get spending progress from expenses data
                  const expensesData = budgetExpenses[budget.id];
                  const totalSpent = expensesData?.totalSpent || 0;
                  const spendingProgress = expensesData?.spendingProgress || 0;

                  return (
                    <div key={budget.id} className="bg-white border-2 border-black shadow-[4px_4px_0px_black] p-4 neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-2px] hover:translate-x-[-2px]">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-black text-lg">
                            {monthNames[budget.month - 1]} {budget.year}
                          </h3>
                          <div className="neo-text text-sm mt-1">
                            Gaji: Rp {budget.salary.toLocaleString('id-ID')} •
                            Target Nabung: Rp {budget.savingTarget.toLocaleString('id-ID')}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link href={`/dashboard/budget/${budget.id}/edit`}>
                            <Button variant="outline" size="sm">
                              ✏️ Edit
                            </Button>
                          </Link>
                          <Link href={`/dashboard/budget/${budget.id}`}>
                            <Button variant="outline" size="sm">
                              Detail
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBudget(budget.id)}
                            disabled={deletingId === budget.id}
                          >
                            {deletingId === budget.id ? (
                              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></span>
                            ) : (
                              "🗑️ Hapus"
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-bold">Progress Pengeluaran:</span>
                            <span className="font-black">{spendingProgress.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-yellow-100 border-2 border-black h-4">
                            <div
                              className={`h-4 border-r-2 border-black transition-all duration-300 ${
                                spendingProgress > 100 ? 'neo-red' :
                                spendingProgress > 80 ? 'neo-orange' : 'neo-green'
                              }`}
                              style={{ width: `${Math.min(spendingProgress, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="font-bold">Terpakai: </span>
                          <span className="font-black">
                            Rp {totalSpent.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="font-bold">Target: </span>
                          <span className="font-black">
                            Rp {budget.spendingTarget.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm neo-text">
                        <span className="font-bold">{budget.weeklyBudgets.length} minggu aktif</span>
                        <span className="font-bold">{budget.allocations.length} alokasi dompet</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="neo-subheading mb-2">
                  Belum ada budget
                </h3>
                <p className="neo-text mb-6">
                  Mulai dengan membuat budget untuk bulan ini
                </p>
                <Link href="/dashboard/budget/create">
                  <Button className="neo-orange text-white">Buat Budget Pertama</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="mt-8 neo-card-raised">
          <CardHeader className="neo-green border-b-4 border-black">
            <CardTitle className="neo-heading text-white">💡 Tips Budget</CardTitle>
            <CardDescription className="neo-text">
              Beberapa tips untuk mengelola budget dengan efektif
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-100 border-2 border-black shadow-[4px_4px_0px_black] neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-2px] hover:translate-x-[-2px]">
                <h4 className="font-black mb-2">💰 50/30/20 Rule</h4>
                <p className="neo-text text-sm">
                  Alokasikan 50% untuk kebutuhan, 30% untuk keinginan, dan 20% untuk tabungan
                </p>
              </div>
              <div className="p-4 bg-orange-100 border-2 border-black shadow-[4px_4px_0px_black] neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-2px] hover:translate-x-[-2px]">
                <h4 className="font-black mb-2">📈 Track Pengeluaran</h4>
                <p className="neo-text text-sm">
                  Catat setiap pengeluaran untuk memantau budget tetap on track
                </p>
              </div>
              <div className="p-4 bg-pink-100 border-2 border-black shadow-[4px_4px_0px_black] neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-2px] hover:translate-x-[-2px]">
                <h4 className="font-black mb-2">🎯 Set Realistic Goals</h4>
                <p className="neo-text text-sm">
                  Buat target yang realistis sesuai dengan penghasilan dan gaya hidup
                </p>
              </div>
              <div className="p-4 bg-green-100 border-2 border-black shadow-[4px_4px_0px_black] neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-2px] hover:translate-x-[-2px]">
                <h4 className="font-black mb-2">🔄 Review Rutin</h4>
                <p className="neo-text text-sm">
                  Review budget mingguan untuk melakukan penyesuaian jika diperlukan
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}