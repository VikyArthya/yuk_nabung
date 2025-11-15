import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import CreateBudgetForm from "@/components/budget/create-budget-form";

export default async function CreateBudgetPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userWallets = await prisma.wallet.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/budget">
                <Button variant="outline">← Kembali</Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                📊 Buat Budget Baru
              </h1>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Buat Budget Bulanan</CardTitle>
            <CardDescription>
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
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Panduan Budget</CardTitle>
            <CardDescription>
              Tips dan rekomendasi untuk membuat budget yang efektif
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-lg">💰 Rekomendasi Alokasi</h4>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                    <span>Tabungan (20%)</span>
                    <span className="font-medium text-green-700">Rp {(userWallets.reduce((total, wallet) => total + Number(wallet.balance), 0) * 0.2).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                    <span>Kebutuhan (50%)</span>
                    <span className="font-medium text-blue-700">Rp {(userWallets.reduce((total, wallet) => total + Number(wallet.balance), 0) * 0.5).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-purple-50 rounded-lg">
                    <span>Keinginan (30%)</span>
                    <span className="font-medium text-purple-700">Rp {(userWallets.reduce((total, wallet) => total + Number(wallet.balance), 0) * 0.3).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-lg">📋 Tips Budget</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Prioritaskan tabungan minimal 10-20% dari gaji</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Alokasikan dana ke berbagai dompet untuk memudahkan tracking</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Buat target pengeluaran yang realistis</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Review dan sesuaikan budget setiap bulan</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
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