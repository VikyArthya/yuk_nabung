import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Redirect to dashboard if user is already logged in
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col -mt-16 lg:-mt-20">
      {/* Hero Section */}
      <main className="flex-grow pt-16 lg:pt-20">
        <div className="neo-yellow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
            <div className="text-center">
              <div className="bg-white neo-border neo-shadow-lg p-8 inline-block">
                <h1 className="neo-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                  <span className="text-black">💰</span> Nabung<span className="text-black">ku</span>
                  <div className="neo-subheading mt-2">Solusi Keuangan Pribadi</div>
                </h1>
                <p className="mt-6 max-w-3xl mx-auto neo-text text-base sm:text-lg md:text-xl leading-relaxed">
                  Aplikasi digital untuk membantu Anda mengatur keuangan pribadi,
                  menabung dengan disiplin, dan mencapai target finansial dengan mudah dan transparan.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row sm:justify-center sm:mt-10 space-y-4 sm:space-y-0 sm:space-x-6 max-w-lg mx-auto">
                  <Link href="/register">
                    <Button className="w-full text-base sm:text-lg py-4 px-8 neo-blue text-white font-black neo-interactive">
                      🚀 Mulai Sekarang
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" className="w-full text-base sm:text-lg py-4 px-8 font-black neo-interactive">
                      🔑 Masuk ke Akun
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="bg-white neo-border neo-shadow p-8 inline-block">
                <h2 className="neo-heading text-3xl sm:text-4xl">
                  💎 <span className="text-black">Fitur</span> Unggulan
                </h2>
                <p className="mt-3 max-w-3xl mx-auto neo-text text-base sm:text-lg leading-relaxed">
                  Platform lengkap untuk membantu Anda mencapai tujuan keuangan dengan mudah dan efektif
                </p>
              </div>
            </div>

            <div className="mt-12">
              <div className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <div className="neo-card p-6 sm:p-8 neo-interactive">
                  <div className="flex items-center justify-center w-16 h-16 neo-yellow neo-border neo-shadow mx-auto mb-4">
                    <span className="text-3xl">📊</span>
                  </div>
                  <h3 className="neo-subheading text-xl mb-3 text-center">
                    Perencanaan Budget
                  </h3>
                  <p className="neo-text text-center leading-relaxed">
                    Buat anggaran bulanan, target menabung, dan alokasi dana dengan interface yang intuitif dan real-time tracking.
                  </p>
                </div>

                <div className="neo-card p-6 sm:p-8 neo-interactive">
                  <div className="flex items-center justify-center w-16 h-16 neo-blue neo-border neo-shadow mx-auto mb-4">
                    <span className="text-3xl">💳</span>
                  </div>
                  <h3 className="neo-subheading text-xl mb-3 text-center">
                    Multi-Dompet
                  </h3>
                  <p className="neo-text text-center leading-relaxed">
                    Kelola berbagai jenis dompet digital dalam satu platform dengan integrasi seamless dan notifikasi otomatis.
                  </p>
                </div>

                <div className="neo-card p-6 sm:p-8 neo-interactive">
                  <div className="flex items-center justify-center w-16 h-16 neo-green neo-border neo-shadow mx-auto mb-4">
                    <span className="text-3xl">📈</span>
                  </div>
                  <h3 className="neo-subheading text-xl mb-3 text-center">
                    Analisis Laporan
                  </h3>
                  <p className="neo-text text-center leading-relaxed">
                    Dashboard analitik komprehensif untuk pantau performa keuangan dan progress tujuan finansial Anda.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Example Budget Display */}
        <div className="neo-yellow py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="bg-white neo-border neo-shadow p-8 inline-block">
                <h3 className="neo-heading text-2xl sm:text-3xl">
                  💰 <span className="text-black">Simulasi</span> Budget Bulanan
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="neo-card p-6">
                <h4 className="neo-subheading mb-6 text-lg flex items-center">
                  <span className="mr-3 neo-border neo-shadow bg-white p-2">📋</span> Rencana Anggaran
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 neo-border-b-4">
                    <span className="font-bold text-black">Pendapatan Bulanan:</span>
                    <span className="font-black text-lg">Rp 5.000.000</span>
                  </div>
                  <div className="flex justify-between items-center py-3 neo-border-b-4">
                    <span className="font-bold text-black">Target Menabung:</span>
                    <span className="font-black neo-green text-lg">Rp 3.000.000</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="font-bold text-black">Budget Harian:</span>
                    <span className="font-black neo-orange text-lg">Rp 2.000.000</span>
                  </div>
                  <div className="mt-6 bg-white neo-border neo-shadow p-4">
                    <div className="flex justify-between font-black">
                      <span>Pencapaian Target:</span>
                      <span>60% 💪</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="neo-card p-6">
                <h4 className="neo-subheading mb-6 text-lg flex items-center">
                  <span className="mr-3 neo-border neo-shadow bg-white p-2">💰</span> Alokasi Dana
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 neo-border-b-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 neo-yellow neo-border neo-shadow flex items-center justify-center font-black text-sm">
                        SB
                      </div>
                      <span className="font-bold text-black">Seabank</span>
                    </div>
                    <span className="font-black text-lg">Rp 1.200.000</span>
                  </div>
                  <div className="flex justify-between items-center py-3 neo-border-b-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 neo-green neo-border neo-shadow flex items-center justify-center text-white font-black text-sm">
                        GP
                      </div>
                      <span className="font-bold text-black">Gopay</span>
                    </div>
                    <span className="font-black text-lg">Rp 300.000</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 neo-blue neo-border neo-shadow flex items-center justify-center text-white font-black text-sm">
                        CS
                      </div>
                      <span className="font-bold text-black">Cash</span>
                    </div>
                    <span className="font-black text-lg">Rp 500.000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}