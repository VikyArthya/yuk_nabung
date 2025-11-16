import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import CreateBudgetForm from "@/components/budget/create-budget-form";
import { Decimal } from "@prisma/client/runtime/library";

export default async function CreateBudgetPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userWalletsRaw = await prisma.wallet.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Convert Decimal to number for client-side usage
  const userWallets = userWalletsRaw.map(wallet => ({
    ...wallet,
    balance: Number(wallet.balance),
  }));

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="min-h-screen neo-yellow">
      {/* Header */}
      <header className="bg-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/budget">
                <Button variant="outline">← Kembali</Button>
              </Link>
              <h1 className="neo-heading text-3xl sm:text-5xl">
                Buat Budget Baru
              </h1>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Card className="neo-card-raised">
          <CardHeader className="neo-yellow border-b-4 border-black">
            <CardTitle className="neo-heading">Buat Budget Bulanan</CardTitle>
            <CardDescription className="neo-text">
              Atur gaji, target nabung, dan alokasi dompet untuk bulan {monthNames[currentMonth - 1]} {currentYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateBudgetForm
              userId={session.user.id}
              wallets={userWallets}
              defaultMonth={currentMonth}
              defaultYear={currentYear}
            />
          </CardContent>
        </Card>

        {/* Budget Guidelines */}
        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rekomendasi Alokasi */}
            <Card className="neo-card-raised">
              <CardHeader className="neo-green border-b-4 border-black">
                <CardTitle className="neo-heading text-white">Rekomendasi Alokasi</CardTitle>
                <CardDescription className="text-xs sm:text-sm neo-text text-white">
                  Berdasarkan total saldo dompet Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 sm:pt-0">
                <div className="space-y-3">
                  <div className="bg-green-50 border-2 border-black shadow-[4px_4px_0px_black] p-4 flex justify-between items-center neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-1px] hover:translate-x-[-1px]">
                    <span className="font-black">Tabungan (20%)</span>
                    <span className="font-black text-green-700">Rp {(userWallets.reduce((total, wallet) => total + Number(wallet.balance), 0) * 0.2).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="bg-blue-50 border-2 border-black shadow-[4px_4px_0px_black] p-4 flex justify-between items-center neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-1px] hover:translate-x-[-1px]">
                    <span className="font-black">Kebutuhan (50%)</span>
                    <span className="font-black text-blue-700">Rp {(userWallets.reduce((total, wallet) => total + Number(wallet.balance), 0) * 0.5).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="bg-orange-50 border-2 border-black shadow-[4px_4px_0px_black] p-4 flex justify-between items-center neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-1px] hover:translate-x-[-1px]">
                    <span className="font-black">Keinginan (30%)</span>
                    <span className="font-black text-orange-700">Rp {(userWallets.reduce((total, wallet) => total + Number(wallet.balance), 0) * 0.3).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips Budget */}
            <Card className="neo-card-raised">
              <CardHeader className="neo-purple border-b-4 border-black">
                <CardTitle className="neo-heading text-white">Tips Budget</CardTitle>
                <CardDescription className="text-xs sm:text-sm neo-text text-white">
                  Panduan untuk membuat budget efektif
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 sm:pt-0">
                <ul className="space-y-3">
                  <li className="flex items-start bg-white border-2 border-black shadow-[4px_4px_0px_black] p-4 neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-1px] hover:translate-x-[-1px]">
                    <span className="text-green-600 mr-3 text-lg font-black">✓</span>
                    <span className="font-bold">Prioritaskan tabungan minimal 10-20% dari gaji</span>
                  </li>
                  <li className="flex items-start bg-white border-2 border-black shadow-[4px_4px_0px_black] p-4 neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-1px] hover:translate-x-[-1px]">
                    <span className="text-blue-600 mr-3 text-lg font-black">✓</span>
                    <span className="font-bold">Alokasikan dana ke berbagai dompet untuk memudahkan tracking</span>
                  </li>
                  <li className="flex items-start bg-white border-2 border-black shadow-[4px_4px_0px_black] p-4 neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-1px] hover:translate-x-[-1px]">
                    <span className="text-purple-600 mr-3 text-lg font-black">✓</span>
                    <span className="font-bold">Buat target pengeluaran yang realistis</span>
                  </li>
                  <li className="flex items-start bg-white border-2 border-black shadow-[4px_4px_0px_black] p-4 neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-1px] hover:translate-x-[-1px]">
                    <span className="text-orange-600 mr-3 text-lg font-black">✓</span>
                    <span className="font-bold">Review dan sesuaikan budget setiap bulan</span>
                  </li>
                  <li className="flex items-start bg-white border-2 border-black shadow-[4px_4px_0px_black] p-4 neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-1px] hover:translate-x-[-1px]">
                    <span className="text-red-600 mr-3 text-lg font-black">✓</span>
                    <span className="font-bold">Sisihkan dana darurat untuk keadaan tak terduga</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}