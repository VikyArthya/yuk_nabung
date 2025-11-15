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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline">← Kembali</Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                💳 Kelola Dompet
              </h1>
            </div>
            <div className="space-x-4">
              <Link href="/dashboard/wallets/create">
                <Button>Tambah Dompet</Button>
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Summary Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Ringkasan Saldo</CardTitle>
            <CardDescription>Total saldo semua dompet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              Rp {totalBalance.toLocaleString('id-ID')}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {wallets.length} dompet aktif
            </p>
          </CardContent>
        </Card>

        {/* Wallets Grid */}
        {wallets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wallets.map((wallet) => (
              <Card key={wallet.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{wallet.name}</CardTitle>
                      <CardDescription className="capitalize">
                        {wallet.type.toLowerCase()}
                      </CardDescription>
                    </div>
                    <div className="text-2xl">
                      {wallet.type === 'BANK' ? '🏦' :
                       wallet.type === 'EWALLET' ? '📱' : '💵'}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-2xl font-bold text-green-600">
                      Rp {Number(wallet.balance).toLocaleString('id-ID')}
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/dashboard/wallets/${wallet.id}/add-funds`}>
                        <Button size="sm" className="flex-1">Tambah Saldo</Button>
                      </Link>
                      <Link href={`/dashboard/wallets/${wallet.id}/transactions`}>
                        <Button size="sm" variant="outline" className="flex-1">Riwayat</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">💳</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada dompet
              </h3>
              <p className="text-gray-500 mb-6">
                Mulai dengan menambahkan dompet pertama Anda
              </p>
              <Link href="/dashboard/wallets/create">
                <Button>Tambah Dompet Pertama</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Wallet Types Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Jenis Dompet</CardTitle>
            <CardDescription>Penjelasan jenis-jenis dompet yang tersedia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl mb-2">🏦</div>
                <h4 className="font-medium">Bank</h4>
                <p className="text-sm text-gray-500">
                  Akun bank seperti Seabank, BCA, Mandiri, dll
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl mb-2">📱</div>
                <h4 className="font-medium">E-Wallet</h4>
                <p className="text-sm text-gray-500">
                  Dompet digital seperti Gopay, OVO, Dana, ShopeePay
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl mb-2">💵</div>
                <h4 className="font-medium">Cash</h4>
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