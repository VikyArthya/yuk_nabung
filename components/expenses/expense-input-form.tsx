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
    <Card className="neo-card-raised">
      <CardHeader className="pb-3 sm:pb-6 neo-orange border-b-4 border-black">
        <CardTitle className="text-base sm:text-lg neo-heading text-white">💰 Catat Pengeluaran Harian</CardTitle>
        <CardDescription className="text-xs sm:text-sm neo-text">
          Input pengeluaran harian Anda
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 sm:pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-bold">
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
              className="neo-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet" className="text-sm font-bold">
              Dompet *
            </Label>
            {isLoadingWallets ? (
              <div className="bg-white border-2 border-black shadow-[4px_4px_0px_black] p-4 text-sm font-bold">
                Memuat dompet...
              </div>
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
              <div className="bg-white border-2 border-black shadow-[4px_4px_0px_black] p-4 text-sm font-black">
                ⚠️ Wajib buat dompet terlebih dahulu!
                <a href="/dashboard/wallets/create" className="neo-inline-link ml-1">
                  Buat dompet sekarang
                </a>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm font-bold">
              Catatan (opsional)
            </Label>
            <Input
              id="note"
              type="text"
              placeholder="contoh: Beli makan siang di kantin"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="neo-input"
            />
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

          <Button
            type="submit"
            disabled={isLoading || !amount || !walletId || wallets.length === 0}
            className="w-full neo-orange text-white font-black text-lg py-3 px-6 neo-interactive"
          >
            {isLoading ? "Menyimpan..." : "Catat Pengeluaran"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}