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
              <div className="bg-white border-4 border-black shadow-[12px_12px_0px_black] p-12 inline-block neo-interactive hover:shadow-[14px_14px_0px_black] hover:translate-y-[-2px] hover:translate-x-[-2px]">
                <h1 className="neo-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                  <span className="text-black">💰</span> Nabung<span className="text-black">ku</span>
                  <div className="neo-subheading mt-4">Solusi Keuangan Pribadi</div>
                </h1>
                <p className="mt-8 max-w-3xl mx-auto neo-text text-base sm:text-lg md:text-xl leading-relaxed">
                  Aplikasi digital untuk membantu Anda mengatur keuangan pribadi,
                  menabung dengan disiplin, dan mencapai target finansial dengan mudah dan transparan.
                </p>
                <div className="mt-12 flex flex-col sm:flex-row sm:justify-center space-y-6 sm:space-y-0 sm:space-x-8 max-w-lg mx-auto">
                  <Link href="/register">
                    <Button className="w-full text-base sm:text-lg py-6 px-10 neo-blue text-white font-black text-xl neo-interactive hover:shadow-[8px_8px_0px_black] hover:translate-y-[-4px] hover:translate-x-[-4px]">
                      🚀 Mulai Sekarang
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" className="w-full text-base sm:text-lg py-6 px-10 font-black text-xl neo-button hover:shadow-[8px_8px_0px_black] hover:translate-y-[-4px] hover:translate-x-[-4px]">
                      🔑 Masuk ke Akun
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="neo-yellow py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_black] p-10 inline-block neo-interactive hover:shadow-[10px_10px_0px_black] hover:translate-y-[-2px] hover:translate-x-[-2px]">
                <h2 className="neo-heading text-3xl sm:text-4xl">
                  💎 <span className="text-black">Fitur</span> Unggulan
                </h2>
                <p className="mt-4 max-w-3xl mx-auto neo-text text-base sm:text-lg leading-relaxed">
                  Platform lengkap untuk membantu Anda mencapai tujuan keuangan dengan mudah dan efektif
                </p>
              </div>
            </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 sm:gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    icon: "📊",
                    title: "Perencanaan Budget",
                    description: "Buat anggaran bulanan, target menabung, dan alokasi dana dengan interface yang intuitif dan real-time tracking.",
                    bgClass: "bg-green-100",
                    iconBgClass: "bg-yellow-100"
                  },
                  {
                    icon: "💳",
                    title: "Multi-Dompet",
                    description: "Kelola berbagai jenis dompet digital dalam satu platform dengan integrasi seamless dan notifikasi otomatis.",
                    bgClass: "bg-purple-100",
                    iconBgClass: "bg-blue-100"
                  },
                  {
                    icon: "📈",
                    title: "Analisis Laporan",
                    description: "Dashboard analitik komprehensif untuk pantau performa keuangan dan progress tujuan finansial Anda.",
                    bgClass: "bg-pink-100",
                    iconBgClass: "bg-green-100"
                  }
                ].map((feature, index) => (
                  <div key={index} className={`${feature.bgClass} border-4 border-black shadow-[8px_8px_0px_black] p-8 neo-interactive hover:shadow-[10px_10px_0px_black] hover:translate-y-[-2px] hover:translate-x-[-2px]`}>
                    <div className={`flex items-center justify-center w-20 h-20 ${feature.iconBgClass} border-4 border-black shadow-[4px_4px_0px_black] mx-auto mb-6`}>
                      <span className="text-4xl">{feature.icon}</span>
                    </div>
                    <h3 className="neo-subheading text-2xl mb-4 text-center">
                      {feature.title}
                    </h3>
                    <p className="neo-text text-center leading-relaxed font-bold">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Example Budget Display */}
        <div className="neo-yellow py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_black] p-10 inline-block neo-interactive hover:shadow-[10px_10px_0px_black] hover:translate-y-[-2px] hover:translate-x-[-2px]">
                <h3 className="neo-heading text-2xl sm:text-3xl">
                  💰 <span className="text-black">Simulasi</span> Budget Bulanan
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
              <div className="bg-blue-100 border-4 border-black shadow-[8px_8px_0px_black] p-8 neo-interactive hover:shadow-[10px_10px_0px_black] hover:translate-y-[-2px] hover:translate-x-[-2px]">
                <h4 className="neo-subheading mb-8 text-xl flex items-center">
                  <span className="mr-4 border-4 border-black shadow-[4px_4px_0px_black] bg-white p-3">📋</span> Rencana Anggaran
                </h4>
                <div className="space-y-6">
                  <div className="flex justify-between items-center py-4 border-b-4 border-black">
                    <span className="font-black text-black">Pendapatan Bulanan:</span>
                    <span className="font-black text-xl">Rp 5.000.000</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b-4 border-black">
                    <span className="font-black text-black">Target Menabung:</span>
                    <span className="font-black text-xl bg-green-200 px-3 py-1 border-2 border-black">Rp 3.000.000</span>
                  </div>
                  <div className="flex justify-between items-center py-4">
                    <span className="font-black text-black">Budget Harian:</span>
                    <span className="font-black text-xl bg-orange-200 px-3 py-1 border-2 border-black">Rp 2.000.000</span>
                  </div>
                  <div className="mt-8 bg-purple-200 border-4 border-black shadow-[4px_4px_0px_black] p-6">
                    <div className="flex justify-between font-black text-xl">
                      <span>Pencapaian Target:</span>
                      <span>60% 💪</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-pink-100 border-4 border-black shadow-[8px_8px_0px_black] p-8 neo-interactive hover:shadow-[10px_10px_0px_black] hover:translate-y-[-2px] hover:translate-x-[-2px]">
                <h4 className="neo-subheading mb-8 text-xl flex items-center">
                  <span className="mr-4 border-4 border-black shadow-[4px_4px_0px_black] bg-white p-3">💰</span> Alokasi Dana
                </h4>
                <div className="space-y-6">
                  <div className="flex justify-between items-center py-4 border-b-4 border-black">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-yellow-200 border-4 border-black shadow-[4px_4px_0px_black] flex items-center justify-center font-black text-lg">
                        SB
                      </div>
                      <span className="font-black text-black text-lg">Seabank</span>
                    </div>
                    <span className="font-black text-xl">Rp 1.200.000</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b-4 border-black">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-green-200 border-4 border-black shadow-[4px_4px_0px_black] flex items-center justify-center font-black text-lg">
                        GP
                      </div>
                      <span className="font-black text-black text-lg">Gopay</span>
                    </div>
                    <span className="font-black text-xl">Rp 300.000</span>
                  </div>
                  <div className="flex justify-between items-center py-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-purple-200 border-4 border-black shadow-[4px_4px_0px_black] flex items-center justify-center font-black text-lg">
                        CS
                      </div>
                      <span className="font-black text-black text-lg">Cash</span>
                    </div>
                    <span className="font-black text-xl">Rp 500.000</span>
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