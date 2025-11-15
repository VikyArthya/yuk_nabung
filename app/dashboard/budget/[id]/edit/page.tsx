"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignOutButton } from "@/components/auth/sign-out-button";
import CreateBudgetForm from "@/components/budget/create-budget-form";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Wallet {
  id: string;
  name: string;
  type: string;
  balance: number;
}

export default async function EditBudgetPage() {
  const session = await getServerSession(authOptions);
  const params = useParams();
  const budgetId = params.id as string;

  if (!session) {
    redirect("/login");
  }

  // Get budget details
  const budget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
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
  });

  if (!budget) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
        <Card className="w-96 border-orange-100">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500 mb-4">Budget tidak ditemukan</p>
            <Button
              onClick={() => window.history.back()}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0"
            >
              Kembali
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get user's wallets
  const wallets = await prisma.wallet.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Prepare allocations data for the form
  const allocations: { [key: string]: string } = {};
  budget.allocations.forEach((allocation) => {
    allocations[allocation.walletId] = Number(allocation.amount).toString();
  });

  return (
    <div className="bg-gradient-to-br from-orange-50 via-yellow-50 to-white min-h-screen">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-orange-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="border-orange-500 text-orange-500 hover:bg-orange-50"
                onClick={() => window.history.back()}
              >
                ← Kembali
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center space-x-3">
                  <span className="text-orange-500">✏️</span>
                  <span>Edit Budget</span>
                </h1>
                <p className="text-gray-600 mt-1">
                  {new Date(budget.year, budget.month - 1).toLocaleDateString('id-ID', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <Card className="border-orange-100">
          <CardHeader className="pb-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-t-lg">
            <CardTitle className="text-xl sm:text-2xl text-orange-700">
              ✏️ Edit Budget Bulanan
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-orange-600">
              Perbarui informasi budget dan alokasi dompet
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <EditBudgetFormWrapper
              budget={budget}
              wallets={wallets}
              initialAllocations={allocations}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// Client component wrapper for the form
function EditBudgetFormWrapper({
  budget,
  wallets,
  initialAllocations
}: {
  budget: any;
  wallets: Wallet[];
  initialAllocations: { [key: string]: string };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    month: budget.month.toString(),
    year: budget.year.toString(),
    salary: Number(budget.salary).toString(),
    savingTarget: Number(budget.savingTarget).toString(),
    spendingTarget: Number(budget.spendingTarget).toString(),
    weeklyBudget: Number(budget.weeklyBudget).toString(),
  });
  const [allocations, setAllocations] = useState(initialAllocations);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });

    // Auto-calculate saving target when salary changes
    if (field === 'salary' && value) {
      const salary = parseFloat(value) || 0;
      const recommendedSaving = salary * 0.2; // 20% of salary
      const recommendedSpending = salary * 0.8; // 80% of salary

      setFormData(prev => ({
        ...prev,
        savingTarget: recommendedSaving.toString(),
        spendingTarget: recommendedSpending.toString(),
        weeklyBudget: (recommendedSpending / 4).toString(),
      }));
    }
  };

  const handleAllocationChange = (walletId: string, amount: string) => {
    setAllocations({ ...allocations, [walletId]: amount });
  };

  const getTotalAllocations = () => {
    return Object.values(allocations).reduce(
      (total, amount) => total + (parseFloat(amount) || 0),
      0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update main budget
      const budgetResponse = await fetch(`/api/budgets/${budget.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          month: parseInt(formData.month),
          year: parseInt(formData.year),
          salary: parseFloat(formData.salary) || 0,
          savingTarget: parseFloat(formData.savingTarget) || 0,
          spendingTarget: parseFloat(formData.spendingTarget) || 0,
          weeklyBudget: parseFloat(formData.weeklyBudget) || 0,
        }),
      });

      if (!budgetResponse.ok) {
        const error = await budgetResponse.json();
        throw new Error(error.error || "Gagal mengupdate budget");
      }

      // Handle allocations - first remove old ones that are not in the new allocations
      // and add new ones, but handle wallet balance updates carefully
      const existingAllocations = budget.allocations as any[];

      // Find allocations to remove
      const toRemove = existingAllocations.filter(
        (alloc) => !allocations[alloc.walletId] || parseFloat(allocations[alloc.walletId] || "0") === 0
      );

      // Find allocations to add or update
      const toAddOrUpdate = Object.entries(allocations)
        .filter(([_, amount]) => parseFloat(amount) > 0)
        .map(([walletId, amount]) => ({ walletId, amount: parseFloat(amount) }));

      // Remove allocations that are no longer needed (return money to wallets)
      for (const allocation of toRemove) {
        await fetch("/api/allocations", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            allocationId: allocation.id,
          }),
        });
      }

      // Add new allocations
      for (const { walletId, amount } of toAddOrUpdate) {
        const existing = existingAllocations.find((alloc) => alloc.walletId === walletId);

        if (!existing) {
          // Create new allocation
          await fetch("/api/allocations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              budgetId: budget.id,
              walletId,
              amount,
            }),
          });
        } else if (Number(existing.amount) !== amount) {
          // Update allocation by deleting old and creating new
          await fetch("/api/allocations", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              allocationId: existing.id,
            }),
          });

          await fetch("/api/allocations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              budgetId: budget.id,
              walletId,
              amount,
            }),
          });
        }
      }

      router.push("/dashboard/budget");
      router.refresh();
    } catch (error) {
      alert("Terjadi kesalahan: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Budget Period */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Bulan</label>
          <select
            value={formData.month}
            onChange={(e) => handleInputChange("month", e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          >
            {monthNames.map((name, index) => (
              <option key={index + 1} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Tahun</label>
          <input
            type="number"
            min="2024"
            max="2030"
            value={formData.year}
            onChange={(e) => handleInputChange("year", e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
      </div>

      {/* Income and Targets */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Penghasilan dan Target</h3>

        <div className="space-y-2">
          <label className="text-sm font-medium">Gaji Bulanan</label>
          <input
            type="number"
            placeholder="3500000"
            step="10000"
            min="0"
            value={formData.salary}
            onChange={(e) => handleInputChange("salary", e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
          <p className="text-sm text-gray-500">
            Total penghasilan bulanan Anda
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Nabung</label>
            <input
              type="number"
              placeholder="2000000"
              step="10000"
              min="0"
              value={formData.savingTarget}
              onChange={(e) => handleInputChange("savingTarget", e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
            <p className="text-sm text-gray-500">
              Disarankan 20% dari gaji
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Target Pengeluaran</label>
            <input
              type="number"
              placeholder="1500000"
              step="10000"
              min="0"
              value={formData.spendingTarget}
              onChange={(e) => handleInputChange("spendingTarget", e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
            <p className="text-sm text-gray-500">
              Sisa setelah nabung
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Budget Mingguan</label>
          <input
            type="number"
            placeholder="375000"
            step="10000"
            min="0"
            value={formData.weeklyBudget}
            onChange={(e) => handleInputChange("weeklyBudget", e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
          <p className="text-sm text-gray-500">
            Budget per minggu (4 minggu)
          </p>
        </div>
      </div>

      {/* Wallet Allocations */}
      {wallets.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Alokasi Dompet</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              💰 <strong>Info:</strong> Saldo dompet akan diperbarui sesuai alokasi yang diisi di sini.
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Perubahan alokasi akan menambah/mengurangi saldo dompet
            </p>
          </div>

          <div className="space-y-3">
            {wallets.map((wallet) => {
              const allocationAmount = parseFloat(allocations[wallet.id] || "0");
              const currentBalance = Number(wallet.balance);
              const totalBalance = currentBalance + allocationAmount;

              return (
                <div key={wallet.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <label className="font-medium">
                      {wallet.name}
                      <span className="text-sm text-gray-500 ml-2 capitalize">
                        ({wallet.type.toLowerCase()})
                      </span>
                    </label>
                    <div className="text-xs text-gray-500 mt-1">
                      Saldo saat ini: Rp {currentBalance.toLocaleString('id-ID')}
                      {allocationAmount > 0 && (
                        <span className="text-green-600 ml-2">
                          → Total: Rp {totalBalance.toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      placeholder="0"
                      step="10000"
                      min="0"
                      value={allocations[wallet.id] || ""}
                      onChange={(e) => handleAllocationChange(wallet.id, e.target.value)}
                      className="w-full p-2 border rounded-md mt-2"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-lg font-medium">
              <span>Total Alokasi:</span>
              <span>Rp {getTotalAllocations().toLocaleString('id-ID')}</span>
            </div>
            {parseFloat(formData.spendingTarget) > 0 && (
              <div className="text-sm text-gray-600 mt-1">
                Target Pengeluaran: Rp {parseFloat(formData.spendingTarget).toLocaleString('id-ID')}
                {getTotalAllocations() > parseFloat(formData.spendingTarget) && (
                  <span className="text-red-500 block mt-1">
                    ⚠️ Total alokasi melebihi target pengeluaran
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex space-x-3">
        <Button
          type="submit"
          disabled={isLoading || !formData.salary}
          className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0"
        >
          {isLoading ? "Menyimpan..." : "Update Budget"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
          className="border-orange-500 text-orange-500 hover:bg-orange-50"
        >
          Batal
        </Button>
      </div>
    </form>
  );
}