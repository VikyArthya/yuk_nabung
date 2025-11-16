"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddFundsFormProps {
  walletId: string;
  currentBalance: number;
  walletName: string;
}

export default function AddFundsForm({ walletId, currentBalance, walletName }: AddFundsFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const fundAmount = parseFloat(amount);

    if (!fundAmount || fundAmount <= 0) {
      setMessage({
        type: "error",
        text: "Nominal harus diisi dan lebih dari 0"
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/wallets/${walletId}/add-funds`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: fundAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menambah saldo");
      }

      setMessage({
        type: "success",
        text: `Berhasil menambahkan saldo Rp ${fundAmount.toLocaleString('id-ID')} ke ${walletName}`
      });

      // Reset form
      setAmount("");

      // Refresh page to show updated balance
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Terjadi kesalahan saat menambah saldo"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="amount" className="text-sm font-bold">
          Jumlah Penambahan (Rp) *
        </Label>
        <Input
          id="amount"
          type="number"
          step="10000"
          min="0"
          placeholder="contoh: 100000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="neo-input"
        />
        <p className="text-sm font-bold">
          Masukkan nominal yang ingin ditambahkan ke dompet
        </p>
      </div>

      {/* Current Balance Display */}
      <div className="bg-blue-100 border-2 border-black shadow-[4px_4px_0px_black] p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-black">Saldo Saat Ini:</span>
          <span className="font-black">
            Rp {currentBalance.toLocaleString('id-ID')}
          </span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm font-black">Setelah Penambahan:</span>
          <span className="font-black text-green-600">
            Rp {(currentBalance + (parseFloat(amount) || 0)).toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 border-2 border-black shadow-[4px_4px_0px_black] font-black text-sm ${
            message.type === "success"
              ? "bg-green-100 border-green-800 text-green-800"
              : "bg-red-100 border-red-800 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex space-x-3">
        <Button
          type="submit"
          disabled={isLoading || !amount}
          className="flex-1 neo-orange text-white font-black text-lg py-3 px-6 neo-interactive"
          variant="default"
        >
          {isLoading ? "Memproses..." : "Tambah Saldo"}
        </Button>
        <Button
          type="button"
          className="neo-button"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}