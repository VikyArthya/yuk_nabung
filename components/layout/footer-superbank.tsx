import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Heart, Shield, Award, Zap, Users } from "lucide-react";

export default function FooterSuperbank() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: "Tabungan", href: "/#tabungan" },
      { label: "Anggaran", href: "/#anggaran" },
      { label: "Dompet Digital", href: "/#dompet" },
      { label: "Tutorial", href: "/#tutorial" },
    ],
    company: [
      { label: "Tentang Kami", href: "/#tentang" },
      { label: "Karir", href: "/#karir" },
      { label: "Blog", href: "/#blog" },
      { label: "Hubungi Kami", href: "/#kontak" },
    ],
    support: [
      { label: "FAQ", href: "/#faq" },
      { label: "Bantuan", href: "/#bantuan" },
      { label: "Keamanan", href: "/#keamanan" },
      { label: "Syarat & Ketentuan", href: "/#syarat" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  const features = [
    { icon: Shield, title: "Aman & Terpercaya", description: "Data Anda dilindungi dengan enkripsi tingkat tinggi" },
    { icon: Zap, title: "Transaksi Cepat", description: "Proses transaksi instan tanpa hambatan" },
    { icon: Users, title: "Mudah Digunakan", description: "Interface yang intuitif dan user-friendly" },
    { icon: Award, title: "Fitur Lengkap", description: "Semua yang Anda butuh untuk kelola keuangan" },
  ];

  return (
    <footer className="neo-yellow">
      {/* Newsletter Section */}
      <div className="neo-border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-blue-100 border-4 border-black shadow-[8px_8px_0px_black] p-8 inline-block neo-interactive hover:shadow-[10px_10px_0px_black] hover:translate-y-[-2px] hover:translate-x-[-2px]">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">
                <span>💰</span> Raih Target Keuangan Anda
              </h2>
              <p className="text-gray-800 mb-8 text-base sm:text-lg font-bold">
                Dapatkan tips dan panduan menabung langsung di inbox Anda
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 max-w-md mx-auto mt-8">
              <input
                type="email"
                placeholder="Masukkan email Anda"
                className="flex-1 px-4 py-4 border-2 border-black shadow-[4px_4px_0px_black] font-bold placeholder-gray-600 focus:outline-none focus:shadow-[6px_6px_0px_black] focus:translate-y-[-1px] focus:translate-x-[-1px] bg-white"
              />
              <button className="px-8 py-4 neo-orange text-white font-black neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-2px] hover:translate-x-[-2px]">
                Langganan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="neo-border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const cardColors = ['bg-green-100', 'bg-pink-100', 'bg-purple-100', 'bg-blue-100'];
              const iconColors = ['text-green-600', 'text-pink-600', 'text-purple-600', 'text-blue-600'];
              const colorClass = cardColors[index % cardColors.length];
              const iconColorClass = iconColors[index % iconColors.length];

              return (
                <div key={index} className={`text-center ${colorClass} border-2 border-black shadow-[4px_4px_0px_black] p-6 neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-1px] hover:translate-x-[-1px]`}>
                  <div className="w-20 h-20 bg-white border-4 border-black shadow-[2px_2px_0px_black] flex items-center justify-center mx-auto mb-4">
                    <feature.icon className={`w-10 h-10 ${iconColorClass}`} />
                  </div>
                  <h3 className="font-black text-lg text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm font-bold leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 bg-red-100 border-2 border-black shadow-[4px_4px_0px_black] p-6 neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-1px] hover:translate-x-[-1px]">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-white border-4 border-black shadow-[4px_4px_0px_black] flex items-center justify-center">
                <span className="font-black text-3xl">💰</span>
              </div>
              <div>
                <span className="text-3xl font-black text-gray-900">
                  <span className="text-red-600">Nabung</span>
                  <span className="text-gray-900">ku</span>
                </span>
                <p className="text-sm font-bold text-gray-800">Aplikasi Keuangan Pribadi</p>
              </div>
            </div>
            <p className="text-gray-800 mb-6 leading-relaxed max-w-md font-bold">
              Platform digital untuk membantu Anda mengatur keuangan pribadi, menabung dengan disiplin, dan mencapai target finansial dengan mudah dan transparan.
            </p>

            {/* Contact Info */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-4 text-gray-700">
                <div className="w-8 h-8 bg-orange-100 border-2 border-black flex items-center justify-center">
                  <Mail className="w-4 h-4 text-orange-600" />
                </div>
                <a href="mailto:info@nabungku.id" className="font-black hover:text-orange-600 transition-colors">
                  info@nabungku.id
                </a>
              </div>
              <div className="flex items-center space-x-4 text-gray-700">
                <div className="w-8 h-8 bg-orange-100 border-2 border-black flex items-center justify-center">
                  <Phone className="w-4 h-4 text-orange-600" />
                </div>
                <a href="tel:+62215008888" className="font-black hover:text-orange-600 transition-colors">
                  0808 1500 888
                </a>
              </div>
              <div className="flex items-center space-x-4 text-gray-700">
                <div className="w-8 h-8 bg-orange-100 border-2 border-black flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-orange-600" />
                </div>
                <span className="font-black hover:text-orange-600 transition-colors">
                  Jakarta, Indonesia
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-12 h-12 bg-white border-2 border-black shadow-[2px_2px_0px_black] flex items-center justify-center hover:bg-orange-100 hover:shadow-[4px_4px_0px_black] hover:translate-y-[-1px] hover:translate-x-[-1px] transition-all duration-200"
                >
                  <social.icon className="w-6 h-6 text-gray-700" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div className="bg-green-100 border-2 border-black shadow-[4px_4px_0px_black] p-6 neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-1px] hover:translate-x-[-1px]">
            <h3 className="font-black text-lg mb-6 text-gray-900">Produk</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-800 hover:text-green-600 transition-colors duration-200 font-bold block py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-purple-100 border-2 border-black shadow-[4px_4px_0px_black] p-6 neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-1px] hover:translate-x-[-1px]">
            <h3 className="font-black text-lg mb-6 text-gray-900">Perusahaan</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-800 hover:text-purple-600 transition-colors duration-200 font-bold block py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-pink-100 border-2 border-black shadow-[4px_4px_0px_black] p-6 neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-1px] hover:translate-x-[-1px]">
            <h3 className="font-black text-lg mb-6 text-gray-900">Layanan</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-800 hover:text-pink-600 transition-colors duration-200 font-bold block py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* App Download Section */}
        <div className="neo-border-t-4 border-black mt-12 pt-12">
          <div className="text-center">
            <div className="bg-yellow-100 border-4 border-black shadow-[8px_8px_0px_black] p-8 inline-block mb-6 neo-interactive hover:shadow-[10px_10px_0px_black] hover:translate-y-[-2px] hover:translate-x-[-2px]">
              <h3 className="text-xl font-black text-gray-900 mb-4">Download Aplikasi Mobile</h3>
              <p className="text-gray-800 mb-6 font-bold">Kelola keuangan Anda dimana saja, kapan saja</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button className="bg-black border-2 border-black shadow-[4px_4px_0px_black] hover:shadow-[6px_6px_0px_black] hover:translate-y-[-1px] hover:translate-x-[-1px] text-white px-8 py-4 rounded-lg flex items-center space-x-3 transition-all duration-200 neo-interactive">
                <div className="w-6 h-6">📱</div>
                <div className="text-left">
                  <div className="text-xs font-bold">Download on the</div>
                  <div className="text-sm font-black">App Store</div>
                </div>
              </button>
              <button className="bg-black border-2 border-black shadow-[4px_4px_0px_black] hover:shadow-[6px_6px_0px_black] hover:translate-y-[-1px] hover:translate-x-[-1px] text-white px-8 py-4 rounded-lg flex items-center space-x-3 transition-all duration-200 neo-interactive">
                <div className="w-6 h-6">🤖</div>
                <div className="text-left">
                  <div className="text-xs font-bold">Get it on</div>
                  <div className="text-sm font-black">Google Play</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="neo-border-t-4 border-black bg-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-orange-100 border-2 border-black shadow-[4px_4px_0px_black] p-6 neo-interactive hover:shadow-[6px_6px_0px_black] hover:translate-y-[-1px] hover:translate-x-[-1px]">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-2 text-gray-800 text-sm font-black">
                <span>© {currentYear} Nabungku.</span>
                <span>All rights reserved.</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-800 text-sm font-black">
                <span>Made with</span>
                <div className="w-6 h-6 bg-red-200 border-2 border-black shadow-[2px_2px_0px_black] flex items-center justify-center">
                  <Heart className="w-4 h-4 text-red-600 fill-current" />
                </div>
                <span>in Indonesia 💙</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}