"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Wallet {
  id: string;
  name: string;
  type: string;
  balance: number;
}

interface ExpenseInputFormProps {
  onExpenseAdded?: () => void;
}

export function ExpenseInputForm({ onExpenseAdded }: ExpenseInputFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [walletId, setWalletId] = useState("");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWallets, setIsLoadingWallets] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch user's wallets on component mount
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const response = await fetch("/api/wallets/user");
        if (response.ok) {
          const data = await response.json();
          setWallets(data);
        }
      } catch (error) {
        console.error("Error fetching wallets:", error);
      } finally {
        setIsLoadingWallets(false);
      }
    };

    fetchWallets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          note: note || undefined,
          walletId: walletId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mencatat pengeluaran");
      }

      // Show success message with budget info
      if (data.dailyRecord.isOverBudget) {
        setMessage({
          type: "success",
          text: `Pengeluaran berhasil dicatat! ⚠️ Budget harian terlampaui Rp${Math.abs(data.dailyRecord.dailyBudgetRemaining).toLocaleString('id-ID')}`
        });
      } else {
        setMessage({
          type: "success",
          text: `Pengeluaran berhasil dicatat! Sisa budget: Rp${data.dailyRecord.dailyBudgetRemaining.toLocaleString('id-ID')}`
        });
      }

      // Reset form
      setAmount("");
      setNote("");
      setWalletId("");

      // Trigger callback and refresh page
      if (onExpenseAdded) {
        onExpenseAdded();
      }
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Terjadi kesalahan"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-orange-100">
      <CardHeader className="pb-3 sm:pb-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-t-lg">
        <CardTitle className="text-base sm:text-lg text-orange-700">🍽️ Catat Pengeluaran Makan</CardTitle>
        <CardDescription className="text-xs sm:text-sm text-orange-600">
          Input pengeluaran makan hari ini
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 sm:pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Nominal (Rp) *
            </Label>
            <Input
              id="amount"
              type="number"
              step="1000"
              min="0"
              placeholder="contoh: 15000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet" className="text-sm font-medium">
              Dompet *
            </Label>
            {isLoadingWallets ? (
              <div className="text-sm text-gray-500 py-2">Memuat dompet...</div>
            ) : wallets.length > 0 ? (
              <select
                id="wallet"
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                required
                className="w-full neo-select text-sm"
              >
                <option value="">Pilih dompet...</option>
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name} ({wallet.type.toLowerCase()}) - Rp {wallet.balance.toLocaleString('id-ID')}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-sm text-red-500 py-2 border border-red-200 rounded-md bg-red-50 px-3">
                ⚠️ Wajib buat dompet terlebih dahulu!
                <a href="/dashboard/wallets/create" className="text-orange-600 hover:underline ml-1 font-medium">
                  Buat dompet sekarang
                </a>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm font-medium">
              Catatan (opsional)
            </Label>
            <Input
              id="note"
              type="text"
              placeholder="contoh: Makan siang di kantin"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="border-orange-200 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !amount || !walletId || wallets.length === 0}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0"
          >
            {isLoading ? "Menyimpan..." : "Catat Pengeluaran"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}