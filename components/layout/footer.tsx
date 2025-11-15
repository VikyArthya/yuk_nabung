import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Tutorial", href: "/#tutorial" },
      { label: "FAQ", href: "/#faq" },
    ],
    company: [
      { label: "About Us", href: "/#about" },
      { label: "Blog", href: "/#blog" },
      { label: "Careers", href: "/#careers" },
      { label: "Contact", href: "/#contact" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/#privacy" },
      { label: "Terms of Service", href: "/#terms" },
      { label: "Cookie Policy", href: "/#cookies" },
      { label: "Disclaimer", href: "/#disclaimer" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="neo-yellow neo-border neo-shadow-lg">
      {/* Newsletter Section */}
      <div className="neo-border-b-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white neo-border neo-shadow p-6">
              <h2 className="neo-heading text-2xl sm:text-3xl mb-4">
                🎯 Tingkatkan Kontrol Keuangan Anda
              </h2>
              <p className="neo-text mb-8 text-base sm:text-lg">
                Dapatkan tips dan trik manajemen keuangan langsung di inbox Anda
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Email Anda"
                  className="flex-1 neo-input"
                />
                <button className="neo-button neo-blue text-white px-6 py-3 font-black">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="bg-white neo-border neo-shadow p-6 neo-interactive">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 neo-blue neo-border neo-shadow flex items-center justify-center">
                  <span className="text-white font-black text-xl">💰</span>
                </div>
                <span className="neo-heading text-xl">Nabung</span>
              </div>
              <p className="neo-text mb-6 leading-relaxed">
                Aplikasi manajemen keuangan pribadi yang membantu Anda mengatur gaji,
                target nabung, dan tracking pengeluaran dengan mudah dan efisien.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 neo-text">
                  <Mail className="w-4 h-4 neo-blue border-2 border-black rounded-full p-0.5" />
                  <a href="mailto:info@nabung.app" className="hover:text-blue-600 transition-colors font-bold">
                    info@nabung.app
                  </a>
                </div>
                <div className="flex items-center space-x-3 neo-text">
                  <Phone className="w-4 h-4 neo-green border-2 border-black rounded-full p-0.5" />
                  <a href="tel:+6281234567890" className="hover:text-green-600 transition-colors font-bold">
                    +62 812-3456-7890
                  </a>
                </div>
                <div className="flex items-center space-x-3 neo-text">
                  <MapPin className="w-4 h-4 neo-red border-2 border-black rounded-full p-0.5" />
                  <span className="hover:text-red-600 transition-colors font-bold">
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
                    className="w-10 h-10 neo-border neo-shadow bg-white flex items-center justify-center neo-interactive"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div className="bg-white neo-border neo-shadow p-6 neo-interactive">
            <h3 className="neo-subheading mb-6">Produk</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="neo-text hover:text-blue-600 transition-colors duration-200 font-bold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white neo-border neo-shadow p-6 neo-interactive">
            <h3 className="neo-subheading mb-6">Perusahaan</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="neo-text hover:text-blue-600 transition-colors duration-200 font-bold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white neo-border neo-shadow p-6 neo-interactive">
            <h3 className="neo-subheading mb-6">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="neo-text hover:text-blue-600 transition-colors duration-200 font-bold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* App Download Section */}
        <div className="neo-border-t-4 mt-12 pt-12">
          <div className="text-center">
            <div className="bg-white neo-border neo-shadow p-6 inline-block">
              <h3 className="neo-subheading mb-4">Download Aplikasi Mobile</h3>
              <p className="neo-text mb-6">Kelola keuangan Anda dimana saja, kapan saja</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="neo-button bg-black text-white px-6 py-3 flex items-center space-x-2">
                  <div className="w-5 h-5">📱</div>
                  <div className="text-left">
                    <div className="text-xs font-bold">Download on the</div>
                    <div className="text-sm font-black">App Store</div>
                  </div>
                </button>
                <button className="neo-button bg-black text-white px-6 py-3 flex items-center space-x-2">
                  <div className="w-5 h-5">🤖</div>
                  <div className="text-left">
                    <div className="text-xs font-bold">Get it on</div>
                    <div className="text-sm font-black">Google Play</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="neo-border-t-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white neo-border neo-shadow p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-2 text-black text-sm font-bold">
                <span>© {currentYear} Nabung.</span>
                <span>All rights reserved.</span>
              </div>
              <div className="flex items-center space-x-2 text-black text-sm font-bold">
                <span>Made with</span>
                <Heart className="w-4 h-4 neo-red fill-current" />
                <span>in Indonesia</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}