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
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Penghasilan dan Target</h3>

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
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Alokasi Dompet</h3>
          <p className="text-sm text-gray-500">
            Alokasikan dana ke setiap dompet (opsional)
          </p>

          <div className="space-y-3">
            {wallets.map((wallet) => (
              <div key={wallet.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <Label htmlFor={`wallet-${wallet.id}`} className="font-medium">
                    {wallet.name}
                    <span className="text-sm text-gray-500 ml-2 capitalize">
                      ({wallet.type.toLowerCase()})
                    </span>
                  </Label>
                  <Input
                    id={`wallet-${wallet.id}`}
                    type="number"
                    placeholder="0"
                    step="10000"
                    min="0"
                    value={allocations[wallet.id] || ""}
                    onChange={(e) => handleAllocationChange(wallet.id, e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            ))}
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
          className="flex-1"
        >
          {isLoading ? "Menyimpan..." : "Buat Budget"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}