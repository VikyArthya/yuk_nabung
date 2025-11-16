"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getServerSession } from "next-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";

interface Wallet {
  id: string;
  name: string;
  type: string;
  balance: number;
}

export default function EditWalletPage() {
  const params = useParams();
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    type: "",
  });

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const response = await fetch(`/api/wallets/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch wallet");
        }
        const data = await response.json();
        setWallet(data);
        setFormData({
          name: data.name,
          type: data.type.toLowerCase(),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWallet();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/wallets/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update wallet");
      }

      router.push("/dashboard/wallets");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  if (isLoading) {
    return (
      <div className="neo-yellow min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="neo-text">Memuat data dompet...</p>
        </div>
      </div>
    );
  }

  if (error || !wallet) {
    return (
      <div className="neo-yellow min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="neo-text text-red-600 mb-4">{error || "Dompet tidak ditemukan"}</p>
          <Link href="/dashboard/wallets">
            <Button className="neo-gray">← Kembali</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="neo-yellow min-h-screen">
      {/* Header */}
      <header className="neo-border-b-4 border-black bg-white">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="neo-heading text-3xl sm:text-5xl flex items-center space-x-4">
                <span>Edit Dompet</span>
              </h1>
              <p className="neo-text text-lg mt-2">Perbarui informasi dompet Anda</p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <Link href={`/dashboard/wallets/${wallet.id}`}>
                <Button className="neo-gray">← Kembali</Button>
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Edit Form */}
          <div className="lg:col-span-2">
            <Card className="neo-card-raised">
              <CardHeader className="neo-blue border-b-4 border-black">
                <CardTitle className="neo-heading text-white">Edit Informasi Dompet</CardTitle>
                <CardDescription className="text-xs sm:text-sm neo-text text-white">
                  Perbarui nama dan jenis dompet
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 sm:pt-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-100 border-2 border-black shadow-[4px_4px_0px_black] p-4">
                      <p className="font-black text-red-700">{error}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-bold">Nama Dompet</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Contoh: BCA Personal"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="neo-input"
                      required
                    />
                    <p className="text-xs font-bold text-gray-600">
                      Nama unik untuk mengidentifikasi dompet Anda
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-bold">Jenis Dompet</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => handleInputChange("type", e.target.value)}
                      className="w-full neo-select"
                      required
                    >
                      <option value="">Pilih jenis dompet</option>
                      <option value="bank">Bank</option>
                      <option value="ewallet">E-Wallet</option>
                      <option value="cash">Cash</option>
                    </select>
                    <p className="text-xs font-bold text-gray-600">
                      Pilih kategori yang sesuai dengan dompet Anda
                    </p>
                  </div>

                  {/* Current Info Display */}
                  <div className="bg-yellow-100 border-2 border-black shadow-[4px_4px_0px_black] p-4">
                    <h4 className="font-black mb-3 text-yellow-800">Informasi Saat Ini</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-bold text-gray-700">Saldo:</span>
                        <span className="font-black text-gray-900">
                          Rp {wallet.balance.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-bold text-gray-700">Dibuat:</span>
                        <span className="font-black text-gray-900">
                          {new Date(wallet.id).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex space-x-4">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 neo-blue text-white font-black text-lg py-4 px-8 neo-interactive"
                    >
                      {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => router.back()}
                      disabled={isSaving}
                      className="neo-gray font-black text-lg py-4 px-8 neo-interactive"
                    >
                      Batal
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Info Sidebar */}
          <div className="lg:col-span-1">
            <Card className="neo-card-raised">
              <CardHeader className="neo-purple border-b-4 border-black">
                <CardTitle className="neo-heading text-white">Tips Edit Dompet</CardTitle>
                <CardDescription className="text-xs sm:text-sm neo-text text-white">
                  Panduan untuk mengedit dompet
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 sm:pt-0">
                <div className="space-y-4">
                  <div className="bg-white border-2 border-black shadow-[4px_4px_0px_black] p-4 neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-1px] hover:translate-x-[-1px]">
                    <h4 className="font-black mb-2 text-purple-700">📝 Nama yang Jelas</h4>
                    <p className="text-sm font-bold text-gray-600">
                      Gunakan nama yang mudah diingat dan deskriptif
                    </p>
                  </div>
                  <div className="bg-white border-2 border-black shadow-[4px_4px_0px_black] p-4 neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-1px] hover:translate-x-[-1px]">
                    <h4 className="font-black mb-2 text-purple-700">🏷️ Kategori yang Tepat</h4>
                    <p className="text-sm font-bold text-gray-600">
                      Pilih jenis dompet yang sesuai dengan kegunaan
                    </p>
                  </div>
                  <div className="bg-white border-2 border-black shadow-[4px_4px_0px_black] p-4 neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-1px] hover:translate-x-[-1px]">
                    <h4 className="font-black mb-2 text-purple-700">⚠️ Saldo Tetap Aman</h4>
                    <p className="text-sm font-bold text-gray-600">
                      Edit dompet tidak mengubah saldo yang ada
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="neo-card-raised mt-6">
              <CardHeader className="neo-green border-b-4 border-black">
                <CardTitle className="neo-heading text-white">Aksi Cepat</CardTitle>
                <CardDescription className="text-xs sm:text-sm neo-text text-white">
                  Aksi lain untuk dompet ini
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 sm:pt-0">
                <div className="space-y-3">
                  <Link href={`/dashboard/wallets/${wallet.id}/add-funds`}>
                    <Button className="w-full neo-orange text-white font-black neo-interactive">
                      + Tambah Saldo
                    </Button>
                  </Link>
                  <Link href={`/dashboard/wallets/${wallet.id}/transactions`}>
                    <Button variant="outline" className="w-full neo-gray font-black neo-interactive">
                      📊 Lihat Transaksi
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}