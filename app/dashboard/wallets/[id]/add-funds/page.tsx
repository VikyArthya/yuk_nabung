import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import AddFundsForm from "@/components/wallets/add-funds-form";

export default async function AddFundsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session) {
    redirect("/login");
  }

  // Get wallet details
  const wallet = await prisma.wallet.findFirst({
    where: {
      id: id,
      userId: session.user.id,
    },
  });

  if (!wallet) {
    return (
      <div className="min-h-screen flex items-center justify-center neo-yellow">
        <Card className="w-96 neo-card-raised">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-700 font-black mb-4">Dompet tidak ditemukan</p>
            <Link href="/dashboard/wallets">
              <Button className="neo-orange text-white neo-interactive">
                Kembali
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="neo-yellow min-h-screen">
      {/* Header */}
      <div className="neo-border-b-4 border-black bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/wallets">
                <Button className="neo-button">← Kembali</Button>
              </Link>
              <div>
                <h1 className="neo-heading text-2xl sm:text-3xl flex items-center space-x-3">
                  <span>💰</span>
                  <span>Tambah Saldo</span>
                </h1>
                <p className="neo-text mt-1">
                  {wallet.name} ({wallet.type.toLowerCase()})
                </p>
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <Card className="neo-card-raised">
          <CardHeader className="pb-3 sm:pb-6 neo-green border-b-4 border-black">
            <CardTitle className="text-xl sm:text-2xl neo-heading text-white">
              💰 Tambah Saldo Dompet
            </CardTitle>
            <CardDescription className="text-sm sm:text-base neo-text">
              Tambahkan saldo ke dompet {wallet.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 sm:pt-0">
            <AddFundsForm walletId={wallet.id} currentBalance={Number(wallet.balance)} walletName={wallet.name} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}