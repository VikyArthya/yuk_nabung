import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              💰 Aplikasi Menabung
            </h1>
            <div className="space-x-4">
              <Link href="/login">
                <Button variant="outline">Masuk</Button>
              </Link>
              <Link href="/register">
                <Button>Daftar</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              Kelola Keuangan Pribadi
              <span className="block text-primary"> dengan Mudah</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Aplikasi manajemen keuangan untuk mengatur gaji, target nabung,
              dan tracking pengeluaran harian Anda. Pantau alokasi dana ke berbagai dompet.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link href="/register">
                  <Button className="w-full">
                    Mulai Gratis
                  </Button>
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Masuk ke Akun
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-20">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Fitur Utama
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                Semua yang Anda butuhkan untuk mengelola keuangan pribadi
              </p>
            </div>

            <div className="mt-12">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <div className="pt-6">
                  <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                          <span className="text-2xl">📊</span>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                        Budget Bulanan
                      </h3>
                      <p className="mt-5 text-base text-gray-500">
                        Atur gaji bulanan, target nabung, dan batas pengeluaran dengan mudah.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-green-500 rounded-md shadow-lg">
                          <span className="text-2xl">💳</span>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                        Multi-Dompet
                      </h3>
                      <p className="mt-5 text-base text-gray-500">
                        Kelola Seabank, Gopay, dan dompet lainnya dalam satu aplikasi.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-purple-500 rounded-md shadow-lg">
                          <span className="text-2xl">📈</span>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                        Tracking Real-time
                      </h3>
                      <p className="mt-5 text-base text-gray-500">
                        Pantau pengeluaran harian dan mingguan untuk tetap on budget.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Example Budget Display */}
          <div className="mt-20 bg-gray-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Contoh Konfigurasi Budget
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">📋 Anggaran Bulanan</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gaji:</span>
                    <span className="font-medium">Rp 3.500.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Target Nabung:</span>
                    <span className="font-medium text-green-600">Rp 2.000.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Target Pengeluaran:</span>
                    <span className="font-medium text-red-600">Rp 1.500.000</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">💰 Alokasi Dompet</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Seabank:</span>
                    <span className="font-medium">Rp 1.440.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gopay:</span>
                    <span className="font-medium">Rp 60.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Harian (20rb x 28hr):</span>
                    <span className="font-medium">Rp 560.000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-base text-gray-500">
            © 2024 Aplikasi Menabung. Kelola keuangan pribadi dengan lebih baik.
          </p>
        </div>
      </footer>
    </div>
  );
}
