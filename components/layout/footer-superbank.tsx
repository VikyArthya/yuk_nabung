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
    <footer className="bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
      {/* Newsletter Section */}
      <div className="border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              <span className="text-orange-500">💰</span> Raih Target Keuangan Anda
            </h2>
            <p className="text-gray-600 mb-8 text-base sm:text-lg">
              Dapatkan tips dan panduan menabung langsung di inbox Anda
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Masukkan email Anda"
                className="flex-1 px-4 py-3 rounded-lg border border-orange-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg">
                Langganan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">💰</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">
                  <span className="text-orange-500">Nabung</span>
                  <span className="text-gray-900">ku</span>
                </span>
                <p className="text-sm text-gray-600">Aplikasi Keuangan Pribadi</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed max-w-md">
              Platform digital untuk membantu Anda mengatur keuangan pribadi, menabung dengan disiplin, dan mencapai target finansial dengan mudah dan transparan.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-600">
                <Mail className="w-4 h-4 text-orange-500" />
                <a href="mailto:info@nabungku.id" className="hover:text-orange-500 transition-colors">
                  info@nabungku.id
                </a>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <Phone className="w-4 h-4 text-orange-500" />
                <a href="tel:+62215008888" className="hover:text-orange-500 transition-colors">
                  0808 1500 888
                </a>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span className="hover:text-orange-500 transition-colors">
                  Jakarta, Indonesia
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-white border border-orange-200 rounded-lg flex items-center justify-center hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 hover:scale-105 shadow-sm"
                >
                  <social.icon className="w-5 h-5 text-gray-600" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-gray-900">Produk</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-orange-500 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-6 text-gray-900">Perusahaan</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-orange-500 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-6 text-gray-900">Layanan</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-orange-500 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* App Download Section */}
        <div className="border-t border-orange-200 mt-12 pt-12">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Download Aplikasi Mobile</h3>
            <p className="text-gray-600 mb-6">Kelola keuangan Anda dimana saja, kapan saja</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200">
                <div className="w-5 h-5">📱</div>
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </button>
              <button className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200">
                <div className="w-5 h-5">🤖</div>
                <div className="text-left">
                  <div className="text-xs">Get it on</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2 text-gray-600 text-sm">
              <span>© {currentYear} Nabungku.</span>
              <span>All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-orange-500 fill-current" />
              <span>in Indonesia 💙</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}