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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
              <span className="text-orange-500">💰</span> Nabung<span className="text-orange-500">ku</span>
              <div className="block text-gray-800 mt-2">Solusi Keuangan Pribadi</div>
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-base text-gray-600 sm:text-lg md:text-xl md:mt-8 leading-relaxed">
              Aplikasi digital untuk membantu Anda mengatur keuangan pribadi,
              menabung dengan disiplin, dan mencapai target finansial dengan mudah dan transparan.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row sm:justify-center sm:mt-10 space-y-4 sm:space-y-0 sm:space-x-6 max-w-lg mx-auto">
              <div className="rounded-xl shadow-lg overflow-hidden">
                <Link href="/register">
                  <Button className="w-full text-base sm:text-lg py-4 px-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold border-0 shadow-md hover:shadow-lg transition-all duration-200">
                    🚀 Mulai Sekarang
                  </Button>
                </Link>
              </div>
              <div className="rounded-xl shadow-lg overflow-hidden">
                <Link href="/login">
                  <Button variant="outline" className="w-full text-base sm:text-lg py-4 px-8 border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold transition-all duration-200">
                    🔑 Masuk ke Akun
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-20 sm:mt-24">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                💎 <span className="text-orange-500">Fitur</span> Unggulan
              </h2>
              <p className="mt-3 max-w-3xl mx-auto text-base sm:text-lg text-gray-600 leading-relaxed">
                Platform lengkap untuk membantu Anda mencapai tujuan keuangan dengan mudah dan efektif
              </p>
            </div>

            <div className="mt-12">
              <div className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl mb-4">
                    <span className="text-3xl">📊</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                    Perencanaan Budget
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    Buat anggaran bulanan, target menabung, dan alokasi dana dengan interface yang intuitif dan real-time tracking.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl mb-4">
                    <span className="text-3xl">💳</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                    Multi-Dompet
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    Kelola berbagai jenis dompet digital dalam satu platform dengan integrasi seamless dan notifikasi otomatis.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl mb-4">
                    <span className="text-3xl">📈</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                    Analisis Laporan
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    Dashboard analitik komprehensif untuk pantau performa keuangan dan progress tujuan finansial Anda.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Example Budget Display */}
          <div className="mt-20 sm:mt-24 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 sm:p-8 border border-orange-200">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
              💰 <span className="text-orange-500">Simulasi</span> Budget Bulanan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="bg-white rounded-xl p-6 border border-orange-200 shadow-md">
                <h4 className="font-semibold text-gray-900 mb-4 text-lg flex items-center">
                  <span className="mr-2">📋</span> Rencana Anggaran
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-700 font-medium">Pendapatan Bulanan:</span>
                    <span className="font-bold text-gray-900 text-lg">Rp 5.000.000</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-700 font-medium">Target Menabung:</span>
                    <span className="font-bold text-green-600 text-lg">Rp 3.000.000</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-700 font-medium">Budget Harian:</span>
                    <span className="font-bold text-orange-600 text-lg">Rp 2.000.000</span>
                  </div>
                  <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                    <div className="flex justify-between text-sm font-medium text-orange-800">
                      <span>Pencapaian Target:</span>
                      <span>60% 💪</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-orange-200 shadow-md">
                <h4 className="font-semibold text-gray-900 mb-4 text-lg flex items-center">
                  <span className="mr-2">💰</span> Alokasi Dana
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        SB
                      </div>
                      <span className="text-gray-700 font-medium">Seabank</span>
                    </div>
                    <span className="font-bold text-gray-900 text-lg">Rp 1.200.000</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        GP
                      </div>
                      <span className="text-gray-700 font-medium">Gopay</span>
                    </div>
                    <span className="font-bold text-gray-900 text-lg">Rp 300.000</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        CS
                      </div>
                      <span className="text-gray-700 font-medium">Cash</span>
                    </div>
                    <span className="font-bold text-gray-900 text-lg">Rp 500.000</span>
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
