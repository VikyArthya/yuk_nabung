"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface Wallet {
  id: string;
  name: string;
  type: string;
  balance: number;
}

interface EditBudgetFormProps {
  budget: any;
  wallets: Wallet[];
  initialAllocations: { [key: string]: string };
}

export default function EditBudgetForm({
  budget,
  wallets,
  initialAllocations
}: EditBudgetFormProps) {
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAllocationChange = (walletId: string, value: string) => {
    setAllocations(prev => ({ ...prev, [walletId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/budgets/${budget.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          allocations
        }),
      });

      if (response.ok) {
        router.push("/dashboard/budget");
        router.refresh();
      } else {
        throw new Error("Failed to update budget");
      }
    } catch (error) {
      console.error("Error updating budget:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Budget Period */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Bulan</Label>
          <select
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
          <Label>Tahun</Label>
          <Input
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
        <h3 className="neo-subheading">Penghasilan dan Target</h3>

        <div className="space-y-2">
          <Label>Gaji Bulanan</Label>
          <Input
            type="number"
            placeholder="3500000"
            step="10000"
            min="0"
            value={formData.salary}
            onChange={(e) => handleInputChange("salary", e.target.value)}
            required
          />
          <p className="neo-text text-sm">
            Total penghasilan bulanan Anda
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Target Nabung</Label>
            <Input
              type="number"
              placeholder="2000000"
              step="10000"
              min="0"
              value={formData.savingTarget}
              onChange={(e) => handleInputChange("savingTarget", e.target.value)}
              required
            />
            <p className="neo-text text-sm">
              Disarankan 20% dari gaji
            </p>
          </div>

          <div className="space-y-2">
            <Label>Target Pengeluaran</Label>
            <Input
              type="number"
              placeholder="1500000"
              step="10000"
              min="0"
              value={formData.spendingTarget}
              onChange={(e) => handleInputChange("spendingTarget", e.target.value)}
              required
            />
            <p className="neo-text text-sm">
              Sisa setelah nabung
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Budget Mingguan</Label>
          <Input
            type="number"
            placeholder="875000"
            step="10000"
            min="0"
            value={formData.weeklyBudget}
            onChange={(e) => handleInputChange("weeklyBudget", e.target.value)}
            required
          />
          <p className="neo-text text-sm">
            Budget yang tersedia per minggu
          </p>
        </div>
      </div>

      {/* Wallet Allocations */}
      <div className="space-y-4">
        <h3 className="neo-subheading">Alokasi Dompet</h3>
        <div className="neo-blue text-white p-4 neo-border neo-shadow">
          <p className="font-black text-sm">
            💰 Alokasikan budget mingguan ke berbagai dompet
          </p>
          <p className="font-medium text-sm mt-1">
            Total: {Object.values(allocations).reduce((sum, amount) => sum + Number(amount), 0).toLocaleString('id-ID')}
            / {Number(formData.weeklyBudget).toLocaleString('id-ID')}
          </p>
        </div>

        <div className="space-y-3">
          {wallets.map((wallet) => (
            <div key={wallet.id} className="bg-white border-2 border-black shadow-[4px_4px_0px_black] p-4 neo-interactive">
              <div className="flex-1">
                <Label className="font-black">
                  💳 {wallet.name}
                </Label>
                <span className="neo-text text-sm ml-2 capitalize">
                  ({wallet.type.toLowerCase()})
                </span>
                <div className="neo-text text-xs mt-1">
                  Saldo: Rp {wallet.balance.toLocaleString('id-ID')}
                  <span className="neo-green ml-2">
                    + Rp {Number(allocations[wallet.id] || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
              <Input
                type="number"
                placeholder="0"
                step="10000"
                min="0"
                value={allocations[wallet.id] || ""}
                onChange={(e) => handleAllocationChange(wallet.id, e.target.value)}
                className="w-full mt-3"
              />
            </div>
          ))}
        </div>

        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_black] p-4">
          <div className="flex justify-between neo-heading text-lg">
            <span>Total Alokasi:</span>
            <span>
              Rp {Object.values(allocations).reduce((sum, amount) => sum + Number(amount), 0).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="neo-text text-sm mt-1">
            {Object.values(allocations).reduce((sum, amount) => sum + Number(amount), 0) > Number(formData.weeklyBudget) && (
              <span className="neo-red font-black block mt-1">
                ⚠️ Total alokasi melebihi budget mingguan!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex space-x-3">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 neo-blue text-white font-black"
        >
          {isLoading ? "Menyimpan..." : "Update Budget"}
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