"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateWalletFormProps {
  userId: string;
}

export default function CreateWalletForm({ userId }: CreateWalletFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "BANK" as "BANK" | "EWALLET" | "CASH",
    initialBalance: "0",
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/wallets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          name: formData.name,
          type: formData.type,
          balance: parseFloat(formData.initialBalance) || 0,
        }),
      });

      if (response.ok) {
        router.push("/dashboard/wallets");
        router.refresh();
      } else {
        const error = await response.json();
        alert("Gagal membuat wallet: " + error.message);
      }
    } catch (error) {
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const walletTypes = [
    { value: "BANK", label: "🏦 Bank", description: "Rekening bank" },
    { value: "EWALLET", label: "📱 E-Wallet", description: "Dompet digital" },
    { value: "CASH", label: "💵 Cash", description: "Uang tunai" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Dompet</Label>
        <Input
          id="name"
          type="text"
          placeholder="Contoh: Seabank, Gopay, Dompet Tunai"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Jenis Dompet</Label>
        <div className="grid grid-cols-1 gap-3">
          {walletTypes.map((type) => (
            <div key={type.value} className="flex items-center space-x-3">
              <input
                type="radio"
                id={type.value}
                name="walletType"
                value={type.value}
                checked={formData.type === type.value}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div className="flex-1">
                <Label htmlFor={type.value} className="font-medium">
                  {type.label}
                </Label>
                <p className="text-sm text-gray-500">{type.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="initialBalance">Saldo Awal (Opsional)</Label>
        <Input
          id="initialBalance"
          type="number"
          placeholder="0"
          step="0.01"
          min="0"
          value={formData.initialBalance}
          onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
        />
        <p className="text-sm text-gray-500">
          Saldo awal dompet Anda saat ini
        </p>
      </div>

      <div className="flex space-x-3">
        <Button
          type="submit"
          disabled={isLoading || !formData.name}
          className="flex-1"
        >
          {isLoading ? "Menyimpan..." : "Buat Dompet"}
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