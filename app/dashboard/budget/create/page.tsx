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
              <h1 className="neo-heading text-2xl">
                <span>📊</span> Buat Budget Baru
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
            <CardTitle className="neo-heading">📅 Buat Budget Bulanan</CardTitle>
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
        <Card className="mt-8 border-orange-100">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-t-lg">
            <CardTitle className="text-orange-700">💡 Panduan Budget</CardTitle>
            <CardDescription className="text-orange-600">
              Tips dan rekomendasi untuk membuat budget yang efektif
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-lg text-orange-700">💰 Rekomendasi Alokasi</h4>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                    <span>Tabungan (20%)</span>
                    <span className="font-medium text-green-700">Rp {(userWallets.reduce((total, wallet) => total + Number(wallet.balance), 0) * 0.2).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                    <span>Kebutuhan (50%)</span>
                    <span className="font-medium text-blue-700">Rp {(userWallets.reduce((total, wallet) => total + Number(wallet.balance), 0) * 0.5).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
                    <span>Keinginan (30%)</span>
                    <span className="font-medium text-orange-700">Rp {(userWallets.reduce((total, wallet) => total + Number(wallet.balance), 0) * 0.3).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-lg text-orange-700">📋 Tips Budget</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">✓</span>
                    <span>Prioritaskan tabungan minimal 10-20% dari gaji</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">✓</span>
                    <span>Alokasikan dana ke berbagai dompet untuk memudahkan tracking</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">✓</span>
                    <span>Buat target pengeluaran yang realistis</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">✓</span>
                    <span>Review dan sesuaikan budget setiap bulan</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-2">✓</span>
                    <span>Sisihkan dana darurat untuk keadaan tak terduga</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}