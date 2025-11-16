"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Wallet {
  id: string;
  name: string;
  type: string;
  balance: number;
}

interface CreateBudgetFormProps {
  userId: string;
  wallets: Wallet[];
  defaultMonth: number;
  defaultYear: number;
}

export default function CreateBudgetForm({
  userId,
  wallets,
  defaultMonth,
  defaultYear,
}: CreateBudgetFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    month: defaultMonth.toString(),
    year: defaultYear.toString(),
    salary: "",
    savingTarget: "",
    spendingTarget: "",
    weeklyBudget: "",
  });
  const [allocations, setAllocations] = useState<{ [key: string]: string }>({});
  const router = useRouter();

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
      // Create main budget
      const budgetResponse = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
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
        throw new Error(error.message || "Gagal membuat budget");
      }

      const budget = await budgetResponse.json();

      // Create weekly budgets
      const weeklyBudgetPromises = [];
      for (let week = 1; week <= 4; week++) {
        weeklyBudgetPromises.push(
          fetch("/api/weekly-budgets", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              budgetId: budget.id,
              weekNumber: week,
              plannedAmount: parseFloat(formData.weeklyBudget) || 0,
            }),
          })
        );
      }

      // Create allocations if any
      const allocationPromises = Object.entries(allocations)
        .filter(([_, amount]) => parseFloat(amount) > 0)
        .map(([walletId, amount]) =>
          fetch("/api/allocations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              budgetId: budget.id,
              walletId,
              amount: parseFloat(amount),
            }),
          })
        );

      await Promise.all([...weeklyBudgetPromises, ...allocationPromises]);

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
          <Label htmlFor="month">Bulan</Label>
          <select
            id="month"
            value={formData.month}
            onChange={(e) => handleInputChange("month", e.target.value)}
            className="w-full neo-select"
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
          <Label htmlFor="year">Tahun</Label>
          <Input
            id="year"
            type="number"
            min="2024"
            max="2030"
            value={formData.year}
            onChange={(e) => handleInputChange("year", e.target.value)}
            required
          />
        </div>
      </div>

      {/* Income and Targets */}
      <div className="space-y-6">
        <h3 className="neo-heading text-2xl">Penghasilan dan Target</h3>

        <div className="space-y-2">
          <Label htmlFor="salary">Gaji Bulanan</Label>
          <Input
            id="salary"
            type="number"
            placeholder="3500000"
            step="10000"
            min="0"
            value={formData.salary}
            onChange={(e) => handleInputChange("salary", e.target.value)}
            required
          />
          <p className="text-sm text-gray-500">
            Total penghasilan bulanan Anda
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="savingTarget">Target Nabung</Label>
            <Input
              id="savingTarget"
              type="number"
              placeholder="2000000"
              step="10000"
              min="0"
              value={formData.savingTarget}
              onChange={(e) => handleInputChange("savingTarget", e.target.value)}
              required
            />
            <p className="text-sm text-gray-500">
              Disarankan 20% dari gaji
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="spendingTarget">Target Pengeluaran</Label>
            <Input
              id="spendingTarget"
              type="number"
              placeholder="1500000"
              step="10000"
              min="0"
              value={formData.spendingTarget}
              onChange={(e) => handleInputChange("spendingTarget", e.target.value)}
              required
            />
            <p className="text-sm text-gray-500">
              Sisa setelah nabung
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="weeklyBudget">Budget Mingguan</Label>
          <Input
            id="weeklyBudget"
            type="number"
            placeholder="375000"
            step="10000"
            min="0"
            value={formData.weeklyBudget}
            onChange={(e) => handleInputChange("weeklyBudget", e.target.value)}
            required
          />
          <p className="text-sm text-gray-500">
            Budget per minggu (4 minggu)
          </p>
        </div>
      </div>

      {/* Wallet Allocations */}
      {wallets.length > 0 && (
        <div className="space-y-6">
          <h3 className="neo-heading text-2xl">Alokasi Dompet</h3>

          {/* Info Card */}
          <div className="bg-blue-100 border-2 border-black shadow-[4px_4px_0px_black] p-6 neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-1px] hover:translate-x-[-1px]">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-white border-2 border-black shadow-[2px_2px_0px_black] flex items-center justify-center">
                <span className="text-lg font-black">ℹ️</span>
              </div>
              <div>
                <p className="font-black text-blue-700">Informasi Alokasi</p>
                <p className="text-sm font-bold text-blue-600 mt-1">
                  Saldo dompet akan bertambah sesuai alokasi yang diisi
                </p>
              </div>
            </div>
            <p className="text-sm font-bold text-blue-600 mt-3">
              Total saldo dompet = saldo awal + alokasi budget
            </p>
          </div>

          {/* Wallet Allocation Cards */}
          <div className="space-y-4">
            {wallets.map((wallet) => {
              const allocationAmount = parseFloat(allocations[wallet.id] || "0");
              const totalBalance = wallet.balance + allocationAmount;

              return (
                <div key={wallet.id} className="bg-white border-2 border-black shadow-[4px_4px_0px_black] p-6 neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-1px] hover:translate-x-[-1px]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-green-100 border-2 border-black shadow-[2px_2px_0px_black] flex items-center justify-center">
                          <span className="text-xl font-black">💳</span>
                        </div>
                        <div>
                          <Label htmlFor={`wallet-${wallet.id}`} className="font-black text-lg">
                            {wallet.name}
                          </Label>
                          <p className="text-sm font-bold text-gray-600 capitalize">
                            ({wallet.type.toLowerCase()})
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-50 border-2 border-black p-4 mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-bold text-gray-700">Saldo Awal:</span>
                          <span className="font-black text-gray-900">
                            Rp {wallet.balance.toLocaleString('id-ID')}
                          </span>
                        </div>
                        {allocationAmount > 0 && (
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-green-600">Alokasi:</span>
                            <span className="font-black text-green-600">
                              +Rp {allocationAmount.toLocaleString('id-ID')}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t-2 border-black">
                          <span className="text-sm font-bold text-blue-600">Total Saldo:</span>
                          <span className="font-black text-blue-600">
                            Rp {totalBalance.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      <Input
                        id={`wallet-${wallet.id}`}
                        type="number"
                        placeholder="0"
                        step="10000"
                        min="0"
                        value={allocations[wallet.id] || ""}
                        onChange={(e) => handleAllocationChange(wallet.id, e.target.value)}
                        className="neo-input"
                      />
                      <p className="text-xs font-bold text-gray-600 mt-2">
                        Masukkan jumlah alokasi untuk dompet ini
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Allocation Summary */}
          <div className="bg-yellow-100 border-2 border-black shadow-[4px_4px_0px_black] p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-black text-yellow-800">Total Alokasi:</span>
              <span className="text-2xl font-black text-yellow-900">
                Rp {getTotalAllocations().toLocaleString('id-ID')}
              </span>
            </div>

            {parseFloat(formData.spendingTarget) > 0 && (
              <div className="bg-white border-2 border-black p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-gray-700">Target Pengeluaran:</span>
                  <span className="font-black text-gray-900">
                    Rp {parseFloat(formData.spendingTarget).toLocaleString('id-ID')}
                  </span>
                </div>
                {getTotalAllocations() > parseFloat(formData.spendingTarget) && (
                  <div className="bg-red-100 border-2 border-black p-3 mt-2">
                    <p className="font-black text-red-700 text-center">
                      ⚠️ Total alokasi melebihi target pengeluaran!
                    </p>
                  </div>
                )}
                {getTotalAllocations() < parseFloat(formData.spendingTarget) && (
                  <div className="bg-green-100 border-2 border-black p-3 mt-2">
                    <p className="font-black text-green-700 text-center">
                      Sisa target: Rp {(parseFloat(formData.spendingTarget) - getTotalAllocations()).toLocaleString('id-ID')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex space-x-4">
        <Button
          type="submit"
          disabled={isLoading || !formData.salary}
          className="flex-1 neo-orange text-white font-black text-lg py-4 px-8 neo-interactive"
        >
          {isLoading ? "Menyimpan..." : "Buat Budget"}
        </Button>
        <Button
          type="button"
          onClick={() => router.back()}
          disabled={isLoading}
          className="neo-gray font-black text-lg py-4 px-8 neo-interactive"
        >
          Batal
        </Button>
      </div>
    </form>
  );
}