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
    <div className="neo-yellow min-h-screen">
      {/* Header */}
      <header className="neo-border-b-4 border-black bg-white">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="neo-heading text-3xl sm:text-5xl flex items-center space-x-4">
                <span>Tambah Dompet Baru</span>
              </h1>
              <p className="neo-text text-lg mt-2">Buat dompet baru untuk mengelola keuangan Anda</p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <Link href="/dashboard/wallets">
                <Button className="neo-gray">← Kembali</Button>
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="neo-card-raised">
              <CardHeader className="neo-orange border-b-4 border-black">
                <CardTitle className="neo-heading text-white">Buat Dompet Baru</CardTitle>
                <CardDescription className="text-xs sm:text-sm neo-text text-white">
                  Tambahkan dompet baru untuk mengelola keuangan Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 sm:pt-0">
                <CreateWalletForm userId={session.user.id} />
              </CardContent>
            </Card>
          </div>

          {/* Examples Sidebar */}
          <div className="lg:col-span-1">
            <Card className="neo-card-raised">
              <CardHeader className="neo-blue border-b-4 border-black">
                <CardTitle className="neo-heading text-white">Contoh Dompet</CardTitle>
                <CardDescription className="text-xs sm:text-sm neo-text text-white">
                  Beberapa contoh dompet yang biasa digunakan
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 sm:pt-0">
                <div className="space-y-4">
                  <div className="bg-green-100 border-2 border-black shadow-[4px_4px_0px_black] p-4 neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-1px] hover:translate-x-[-1px]">
                    <h4 className="font-black mb-3 text-green-700">Bank</h4>
                    <ul className="text-sm font-bold space-y-1">
                      <li>• Seabank</li>
                      <li>• BCA</li>
                      <li>• Mandiri</li>
                      <li>• BNI</li>
                      <li>• BRI</li>
                    </ul>
                  </div>
                  <div className="bg-purple-100 border-2 border-black shadow-[4px_4px_0px_black] p-4 neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-1px] hover:translate-x-[-1px]">
                    <h4 className="font-black mb-3 text-purple-700">E-Wallet</h4>
                    <ul className="text-sm font-bold space-y-1">
                      <li>• Gopay</li>
                      <li>• OVO</li>
                      <li>• Dana</li>
                      <li>• ShopeePay</li>
                      <li>• LinkAja</li>
                    </ul>
                  </div>
                  <div className="bg-yellow-100 border-2 border-black shadow-[4px_4px_0px_black] p-4 neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-1px] hover:translate-x-[-1px]">
                    <h4 className="font-black mb-3 text-yellow-700">Lainnya</h4>
                    <ul className="text-sm font-bold space-y-1">
                      <li>• Tunai</li>
                      <li>• Kartu Kredit</li>
                      <li>• PayPal</li>
                      <li>• Crypto</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}