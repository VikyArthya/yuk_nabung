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
    <div className="neo-yellow min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">← Kembali</Button>
              </Link>
              <h1 className="neo-heading text-xl sm:text-2xl flex items-center space-x-3">
                <span>💳</span>
                <span>Kelola Dompet</span>
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <Link href="/dashboard/wallets/create">
                <Button size="sm" className="w-full sm:w-auto neo-orange text-white">➕ Tambah Dompet</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Summary Card */}
        <Card className="mb-6 sm:mb-8 neo-card-raised">
          <CardHeader className="pb-3 sm:pb-6 neo-yellow border-b-4 border-black">
            <CardTitle className="neo-heading text-base sm:text-lg">💰 Ringkasan Saldo</CardTitle>
            <CardDescription className="neo-text text-xs sm:text-sm">Total saldo semua dompet</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 sm:pt-0">
            <div className="text-2xl sm:text-3xl font-black break-all">
              Rp {totalBalance.toLocaleString('id-ID')}
            </div>
            <p className="neo-text text-xs sm:text-sm mt-1">
              {wallets.length} dompet aktif
            </p>
          </CardContent>
        </Card>

        {/* Wallets Grid */}
        {wallets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {wallets.map((wallet) => (
              <Card key={wallet.id} className="neo-card-raised neo-interactive hover:shadow-[8px_8px_0px_black] hover:translate-y-[-4px] hover:translate-x-[-4px]">
                <CardHeader className="pb-3 sm:pb-6 neo-yellow border-b-4 border-black">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="font-black text-base sm:text-lg truncate">{wallet.name}</CardTitle>
                      <CardDescription className="capitalize neo-text text-xs sm:text-sm">
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
                    <div className="text-lg sm:text-xl sm:text-2xl font-black break-all">
                      Rp {Number(wallet.balance).toLocaleString('id-ID')}
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/dashboard/wallets/${wallet.id}/add-funds`}>
                        <Button size="sm" className="flex-1 text-xs sm:text-sm neo-orange text-white">Tambah Saldo</Button>
                      </Link>
                      <Link href={`/dashboard/wallets/${wallet.id}/transactions`}>
                        <Button size="sm" variant="outline" className="flex-1 text-xs sm:text-sm">Riwayat</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="neo-card-raised">
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">💳</div>
              <h3 className="neo-subheading mb-2">
                Belum ada dompet
              </h3>
              <p className="neo-text mb-6">
                Mulai dengan menambahkan dompet pertama Anda
              </p>
              <Link href="/dashboard/wallets/create">
                <Button className="neo-orange text-white">Tambah Dompet Pertama</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Wallet Types Info */}
        <Card className="mt-8 neo-card-raised">
          <CardHeader className="neo-yellow border-b-4 border-black">
            <CardTitle className="neo-heading">🏦 Jenis Dompet</CardTitle>
            <CardDescription className="neo-text">Penjelasan jenis-jenis dompet yang tersedia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white border-2 border-black shadow-[4px_4px_0px_black] neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-2px] hover:translate-x-[-2px]">
                <div className="text-3xl mb-2">🏦</div>
                <h4 className="font-black">Bank</h4>
                <p className="neo-text text-sm">
                  Akun bank seperti Seabank, BCA, Mandiri, dll
                </p>
              </div>
              <div className="text-center p-4 bg-white border-2 border-black shadow-[4px_4px_0px_black] neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-2px] hover:translate-x-[-2px]">
                <div className="text-3xl mb-2">📱</div>
                <h4 className="font-black">E-Wallet</h4>
                <p className="neo-text text-sm">
                  Dompet digital seperti Gopay, OVO, Dana, ShopeePay
                </p>
              </div>
              <div className="text-center p-4 bg-white border-2 border-black shadow-[4px_4px_0px_black] neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-2px] hover:translate-x-[-2px]">
                <div className="text-3xl mb-2">💵</div>
                <h4 className="font-black">Cash</h4>
                <p className="neo-text text-sm">
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