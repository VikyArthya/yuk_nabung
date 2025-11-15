import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function WalletsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const wallets = await prisma.wallet.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const totalBalance = wallets.reduce((total, wallet) => total + Number(wallet.balance), 0);

  return (
    <div className="bg-gradient-to-br from-orange-50 via-yellow-50 to-white min-h-screen">
      {/* Page Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-orange-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="border-orange-500 text-orange-500 hover:bg-orange-50">← Kembali</Button>
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center space-x-3">
                <span className="text-orange-500">💳</span>
                <span>Kelola Dompet</span>
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <Link href="/dashboard/wallets/create">
                <Button size="sm" className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0">➕ Tambah Dompet</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Summary Card */}
        <Card className="mb-6 sm:mb-8 border-orange-100">
          <CardHeader className="pb-3 sm:pb-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-t-lg">
            <CardTitle className="text-base sm:text-lg text-orange-700">💰 Ringkasan Saldo</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-orange-600">Total saldo semua dompet</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 sm:pt-0">
            <div className="text-2xl sm:text-3xl font-bold text-orange-600 break-all">
              Rp {totalBalance.toLocaleString('id-ID')}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {wallets.length} dompet aktif
            </p>
          </CardContent>
        </Card>

        {/* Wallets Grid */}
        {wallets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {wallets.map((wallet) => (
              <Card key={wallet.id} className="hover:shadow-lg transition-shadow border-orange-100 hover:border-orange-300">
                <CardHeader className="pb-3 sm:pb-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-t-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg truncate text-orange-700">{wallet.name}</CardTitle>
                      <CardDescription className="capitalize text-xs sm:text-sm text-orange-600">
                        {wallet.type.toLowerCase()}
                      </CardDescription>
                    </div>
                    <div className="text-xl sm:text-2xl ml-2">
                      {wallet.type === 'BANK' ? '🏦' :
                       wallet.type === 'EWALLET' ? '📱' : '💵'}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 sm:pt-0">
                  <div className="space-y-3">
                    <div className="text-lg sm:text-xl sm:text-2xl font-bold text-orange-600 break-all">
                      Rp {Number(wallet.balance).toLocaleString('id-ID')}
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/dashboard/wallets/${wallet.id}/add-funds`}>
                        <Button size="sm" className="flex-1 text-xs sm:text-sm bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0">Tambah Saldo</Button>
                      </Link>
                      <Link href={`/dashboard/wallets/${wallet.id}/transactions`}>
                        <Button size="sm" variant="outline" className="flex-1 text-xs sm:text-sm border-orange-500 text-orange-500 hover:bg-orange-50">Riwayat</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-orange-100">
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4 text-orange-500">💳</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada dompet
              </h3>
              <p className="text-gray-500 mb-6">
                Mulai dengan menambahkan dompet pertama Anda
              </p>
              <Link href="/dashboard/wallets/create">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0">Tambah Dompet Pertama</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Wallet Types Info */}
        <Card className="mt-8 border-orange-100">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-t-lg">
            <CardTitle className="text-orange-700">🏦 Jenis Dompet</CardTitle>
            <CardDescription className="text-orange-600">Penjelasan jenis-jenis dompet yang tersedia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                <div className="text-3xl mb-2">🏦</div>
                <h4 className="font-medium text-orange-700">Bank</h4>
                <p className="text-sm text-gray-500">
                  Akun bank seperti Seabank, BCA, Mandiri, dll
                </p>
              </div>
              <div className="text-center p-4 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                <div className="text-3xl mb-2">📱</div>
                <h4 className="font-medium text-orange-700">E-Wallet</h4>
                <p className="text-sm text-gray-500">
                  Dompet digital seperti Gopay, OVO, Dana, ShopeePay
                </p>
              </div>
              <div className="text-center p-4 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                <div className="text-3xl mb-2">💵</div>
                <h4 className="font-medium text-orange-700">Cash</h4>
                <p className="text-sm text-gray-500">
                  Uang tunai yang Anda pegang
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}