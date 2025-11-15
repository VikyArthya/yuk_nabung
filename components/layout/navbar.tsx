"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Menu, X, Home, Wallet, PieChart, LogOut, User, TrendingUp, Shield, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
    setIsMobileMenuOpen(false);
  };

  const dashboardLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home, description: "Lihat overview keuangan Anda" },
    { href: "/dashboard/budget", label: "Budget", icon: PieChart, description: "Kelola budget dan alokasi" },
    { href: "/dashboard/wallets", label: "Dompet", icon: Wallet, description: "Kelola e-wallet dan bank" },
  ];

  const featuresLinks = [
    { href: "/#features", label: "Fitur Utama", description: "Tracking pengeluaran dan budget" },
    { href: "/#analytics", label: "Analytics", description: "Laporan dan insight keuangan" },
    { href: "/#goals", label: "Target Nabung", description: "Set dan capai target finansial" },
  ];

  const companyLinks = [
    { href: "/#about", label: "Tentang", description: "Informasi tentang Nabung" },
    { href: "/#pricing", label: "Harga", description: "Pilihan berlangganan" },
    { href: "/#contact", label: "Kontak", description: "Hubungi tim kami" },
  ];

  // ListItem component for dropdown
  function ListItem({
    className,
    title,
    children,
    href,
    ...props
  }: React.ComponentProps<"a"> & { title: string; href: string }) {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            href={href}
            className={cn(
              "block text-black select-none space-y-1 bg-white border-2 border-black shadow-[4px_4px_0px_black] p-3 leading-none no-underline outline-hidden transition-all hover:bg-yellow-100 hover:shadow-[6px_6px_0px_black] hover:translate-y-[-2px] hover:translate-x-[-2px] neo-interactive",
              className,
            )}
            {...props}
          >
            <div className="text-base font-black leading-none">{title}</div>
            <p className="font-medium line-clamp-2 text-sm leading-snug">
              {children}
            </p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "neo-yellow neo-border neo-shadow-sm"
          : "neo-yellow neo-border neo-shadow-lg"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 neo-interactive">
            <div className="w-8 h-8 sm:w-10 sm:h-10 neo-blue neo-border neo-shadow flex items-center justify-center">
              <span className="text-white font-black text-lg sm:text-xl">💰</span>
            </div>
            <span className="neo-heading text-lg sm:text-xl hidden sm:block">
              Nabung
            </span>
          </Link>

          {/* Desktop Navigation with NavigationMenu */}
          <div className="hidden lg:flex items-center space-x-8">
            {status === "authenticated" ? (
              <>
                {/* Dashboard Dropdown */}
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="neo-button font-black">
                        Dashboard
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="bg-white neo-border neo-shadow p-4">
                          <div className="mb-4">
                            <h4 className="neo-subheading mb-2">📊 Keuangan Anda</h4>
                            <p className="neo-text text-sm">Kelola semua aspek keuangan Anda dari satu tempat</p>
                          </div>
                          <ul className="grid gap-2">
                            {dashboardLinks.map((link) => (
                              <ListItem
                                key={link.href}
                                href={link.href}
                                title={link.label}
                              >
                                {link.description}
                              </ListItem>
                            ))}
                          </ul>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>

                {/* Quick Links */}
                <Link
                  href="/dashboard/wallets/create"
                  className="neo-button neo-green text-white font-black flex items-center space-x-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Tambah Dompet</span>
                </Link>

                <Link
                  href="/dashboard/budget/create"
                  className="neo-button neo-blue text-white font-black flex items-center space-x-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Budget Baru</span>
                </Link>
              </>
            ) : (
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="neo-button font-black">
                      Fitur
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="bg-white neo-border neo-shadow p-4">
                        <div className="mb-4">
                          <h4 className="neo-subheading mb-2">🚀 Apa yang Kami Tawarkan</h4>
                          <p className="neo-text text-sm">Alat lengkap untuk manajemen keuangan pribadi</p>
                        </div>
                        <ul className="grid gap-2">
                          {featuresLinks.map((link) => (
                            <ListItem
                              key={link.href}
                              href={link.href}
                              title={link.label}
                            >
                              {link.description}
                            </ListItem>
                          ))}
                        </ul>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="neo-button font-black">
                      Perusahaan
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="bg-white neo-border neo-shadow p-4">
                        <div className="mb-4">
                          <h4 className="neo-subheading mb-2">🏢 Tentang Nabung</h4>
                          <p className="neo-text text-sm">Misi dan informasi perusahaan kami</p>
                        </div>
                        <ul className="grid gap-2">
                          {companyLinks.map((link) => (
                            <ListItem
                              key={link.href}
                              href={link.href}
                              title={link.label}
                            >
                              {link.description}
                            </ListItem>
                          ))}
                        </ul>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {status === "loading" ? (
              <div className="w-8 h-8 neo-border neo-shadow bg-yellow-100 animate-spin flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"></div>
              </div>
            ) : status === "authenticated" ? (
              <>
                {/* User Info - Hidden on mobile */}
                <div className="hidden sm:flex items-center space-x-2 bg-white neo-border neo-shadow p-2 neo-interactive">
                  <div className="w-8 h-8 neo-green neo-border neo-shadow flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-black">
                    {session.user?.name}
                  </span>
                </div>

                {/* Sign Out Button - Hidden on mobile */}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleSignOut}
                  className="hidden sm:flex items-center space-x-1 font-black"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar</span>
                </Button>
              </>
            ) : (
              <>
                {/* Sign In Button - Hidden on mobile */}
                <Link href="/login">
                  <Button variant="outline" size="sm" className="hidden sm:block font-black">
                    Masuk
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="hidden sm:block neo-blue text-white font-black">
                    Daftar
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden neo-border neo-shadow bg-white p-2 neo-interactive"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "max-h-96 opacity-100 visible"
              : "max-h-0 opacity-0 invisible"
          } overflow-hidden`}
        >
          <div className="py-4 space-y-3 bg-white neo-border-b-4">
            {status === "authenticated" ? (
              <>
                {/* User Info in Mobile */}
                <div className="flex items-center space-x-3 px-4 py-3 bg-white neo-border neo-shadow mx-4">
                  <div className="w-10 h-10 neo-green neo-border neo-shadow flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-black">{session.user?.name}</p>
                    <p className="text-sm font-medium text-gray-600">{session.user?.email}</p>
                  </div>
                </div>

                {/* Dashboard Links */}
                {dashboardLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 mx-4 px-4 py-3 bg-white neo-border neo-shadow hover:bg-yellow-50 neo-interactive"
                  >
                    <link.icon className="w-5 h-5" />
                    <span className="font-bold">{link.label}</span>
                  </Link>
                ))}

                <div className="pt-3 space-y-2 px-4">
                  <Link
                    href="/dashboard/wallets/create"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center space-x-2 w-full neo-button neo-green text-white font-black"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Tambah Dompet</span>
                  </Link>
                  <Link
                    href="/dashboard/budget/create"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center space-x-2 w-full neo-button neo-blue text-white font-black"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Budget Baru</span>
                  </Link>
                  <Button
                    variant="destructive"
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center space-x-2 font-black"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar</span>
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Public Links */}
                {featuresLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block mx-4 px-4 py-3 bg-white neo-border neo-shadow hover:bg-yellow-50 font-bold neo-interactive"
                  >
                    {link.label}
                  </Link>
                ))}

                {companyLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block mx-4 px-4 py-3 bg-white neo-border neo-shadow hover:bg-yellow-50 font-bold neo-interactive"
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="pt-3 space-y-2 px-4">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full font-black">
                      Masuk
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full neo-blue text-white font-black">
                      Daftar
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}