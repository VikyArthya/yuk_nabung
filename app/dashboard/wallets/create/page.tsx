import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import CreateWalletForm from "@/components/wallets/create-wallet-form";

export default async function CreateWalletPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/wallets">
                <Button variant="outline">← Kembali</Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                💳 Tambah Dompet Baru
              </h1>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Buat Dompet Baru</CardTitle>
            <CardDescription>
              Tambahkan dompet baru untuk mengelola keuangan Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateWalletForm userId={session.user.id} />
          </CardContent>
        </Card>

        {/* Quick Examples */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Contoh Dompet</CardTitle>
            <CardDescription>
              Beberapa contoh dompet yang biasa digunakan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">🏦 Bank</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Seabank</li>
                  <li>• BCA</li>
                  <li>• Mandiri</li>
                  <li>• BNI</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">📱 E-Wallet</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Gopay</li>
                  <li>• OVO</li>
                  <li>• Dana</li>
                  <li>• ShopeePay</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}