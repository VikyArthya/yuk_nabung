"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Memuat...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Aplikasi Menabung
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Halo, {session.user?.name}!
              </span>
              <Button
                onClick={() => signOut({ callbackUrl: "/login" })}
                variant="outline"
              >
                Keluar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Selamat Datang di Dashboard!
              </h2>
              <p className="text-gray-600 mb-8">
                Aplikasi manajemen keuangan pribadi Anda sudah siap digunakan.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    📊 Budget Bulanan
                  </h3>
                  <p className="text-gray-600">
                    Kelola gaji, target nabung, dan pengeluaran bulanan Anda.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    💳 Dompet Digital
                  </h3>
                  <p className="text-gray-600">
                    Atur alokasi dana ke Seabank, Gopay, dan dompet lainnya.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    📈 Tracking Pengeluaran
                  </h3>
                  <p className="text-gray-600">
                    Pantau pengeluaran harian dan mingguan Anda.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}