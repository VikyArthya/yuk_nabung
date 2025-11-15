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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat data budget...</p>
        </div>
      </div>
    );
  }

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-orange-200 shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">← Kembali</Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                <span className="text-orange-500">📊</span> Kelola Budget
              </h1>
            </div>
            <div className="space-x-4">
              <Link href="/dashboard/budget/create">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0">Buat Budget</Button>
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Current Month Status */}
        <Card className="mb-8 border-orange-100">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-t-lg">
            <CardTitle className="text-orange-700">📅 Status Budget {monthNames[currentMonth - 1]} {currentYear}</CardTitle>
            <CardDescription className="text-orange-600">
              Overview budget bulan ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentMonthBudget ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">
                    Rp {currentMonthBudget.salary.toLocaleString('id-ID')}
                  </div>
                  <p className="text-sm text-gray-500">Gaji</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600">
                    Rp {currentMonthBudget.savingTarget.toLocaleString('id-ID')}
                  </div>
                  <p className="text-sm text-gray-500">Target Nabung</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-600">
                    Rp {currentMonthBudget.spendingTarget.toLocaleString('id-ID')}
                  </div>
                  <p className="text-sm text-gray-500">Target Pengeluaran</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-500 mb-4">Belum ada budget untuk bulan ini</p>
                <Link href="/dashboard/budget/create">
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0">Buat Budget {monthNames[currentMonth - 1]}</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget List */}
        <Card className="border-orange-100">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-t-lg">
            <CardTitle className="text-orange-700">📋 Daftar Budget {currentYear}</CardTitle>
            <CardDescription className="text-orange-600">
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
                    <div key={budget.id} className="border border-orange-200 rounded-lg p-4 hover:bg-orange-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-lg text-orange-700">
                            {monthNames[budget.month - 1]} {budget.year}
                          </h3>
                          <div className="text-sm text-gray-500 mt-1">
                            Gaji: Rp {budget.salary.toLocaleString('id-ID')} •
                            Target Nabung: Rp {budget.savingTarget.toLocaleString('id-ID')}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link href={`/dashboard/budget/${budget.id}/edit`}>
                            <Button variant="outline" size="sm" className="border-blue-500 text-blue-500 hover:bg-blue-50">
                              ✏️ Edit
                            </Button>
                          </Link>
                          <Link href={`/dashboard/budget/${budget.id}`}>
                            <Button variant="outline" size="sm" className="border-orange-500 text-orange-500 hover:bg-orange-50">Detail</Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBudget(budget.id)}
                            disabled={deletingId === budget.id}
                            className="border-red-500 text-red-500 hover:bg-red-50"
                          >
                            {deletingId === budget.id ? (
                              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></span>
                            ) : (
                              "🗑️ Hapus"
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress Pengeluaran:</span>
                            <span className="font-medium text-orange-600">{spendingProgress.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-orange-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                spendingProgress > 100 ? 'bg-red-500' :
                                spendingProgress > 80 ? 'bg-orange-400' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(spendingProgress, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Terpakai: </span>
                          <span className="font-medium text-orange-600">
                            Rp {totalSpent.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Target: </span>
                          <span className="font-medium">
                            Rp {budget.spendingTarget.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{budget.weeklyBudgets.length} minggu aktif</span>
                        <span>{budget.allocations.length} alokasi dompet</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 text-orange-500">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Belum ada budget
                </h3>
                <p className="text-gray-500 mb-6">
                  Mulai dengan membuat budget untuk bulan ini
                </p>
                <Link href="/dashboard/budget/create">
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0">Buat Budget Pertama</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="mt-8 border-orange-100">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-t-lg">
            <CardTitle className="text-orange-700">💡 Tips Budget</CardTitle>
            <CardDescription className="text-orange-600">
              Beberapa tips untuk mengelola budget dengan efektif
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                <h4 className="font-medium mb-2 text-orange-700">💰 50/30/20 Rule</h4>
                <p className="text-sm text-gray-600">
                  Alokasikan 50% untuk kebutuhan, 30% untuk keinginan, dan 20% untuk tabungan
                </p>
              </div>
              <div className="p-4 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                <h4 className="font-medium mb-2 text-orange-700">📈 Track Pengeluaran</h4>
                <p className="text-sm text-gray-600">
                  Catat setiap pengeluaran untuk memantau budget tetap on track
                </p>
              </div>
              <div className="p-4 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                <h4 className="font-medium mb-2 text-orange-700">🎯 Set Realistic Goals</h4>
                <p className="text-sm text-gray-600">
                  Buat target yang realistis sesuai dengan penghasilan dan gaya hidup
                </p>
              </div>
              <div className="p-4 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                <h4 className="font-medium mb-2 text-orange-700">🔄 Review Rutin</h4>
                <p className="text-sm text-gray-600">
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