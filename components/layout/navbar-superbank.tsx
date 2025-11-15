"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Menu, X, Home, Wallet, PieChart, LogOut, User, ChevronDown } from "lucide-react";

export default function NavbarSuperbank() {
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserMenuOpen && !(event.target as HTMLElement).closest('.user-menu')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
    setIsMobileMenuOpen(false);
  };

  const dashboardLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/budget", label: "Budget", icon: PieChart },
    { href: "/dashboard/wallets", label: "Dompet", icon: Wallet },
  ];

  const publicLinks = [
    { href: "/#features", label: "Fitur" },
    { href: "/#about", label: "Tentang" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/98 backdrop-blur-sm shadow-md border-b border-orange-100"
          : "bg-white border-b border-orange-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">💰</span>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                <span className="text-orange-500">Nabung</span>
                <span className="text-gray-900">ku</span>
              </span>
              <span className="text-lg font-bold text-gray-900 sm:hidden">
                <span className="text-orange-500">N</span>abungku
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {status === "authenticated" ? (
              dashboardLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors duration-200 font-medium"
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              ))
            ) : (
              publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-600 hover:text-orange-500 transition-colors duration-200 font-medium"
                >
                  {link.label}
                </Link>
              ))
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {status === "loading" ? (
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            ) : status === "authenticated" ? (
              <>
                {/* User Dropdown - Desktop */}
                <div className="hidden sm:block user-menu relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden md:block">
                      {session.user?.name}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                        isUserMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-orange-100 overflow-hidden">
                      <div className="py-3 border-b border-gray-100">
                        <div className="px-4 py-2">
                          <p className="text-sm font-medium text-gray-900">Halo, {session.user?.name}</p>
                          <p className="text-xs text-gray-500">{session.user?.email}</p>
                        </div>
                      </div>
                      <div className="py-2">
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200 flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Keluar</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Simple Sign Out Button - Mobile */}
                <button
                  onClick={handleSignOut}
                  className="sm:hidden p-2 rounded-lg hover:bg-orange-50 transition-colors duration-200"
                  aria-label="Sign out"
                >
                  <LogOut className="w-5 h-5 text-orange-500" />
                </button>
              </>
            ) : (
              <>
                {/* Sign In Button - Hidden on mobile */}
                <Link href="/login">
                  <Button variant="outline" size="sm" className="hidden sm:block border-orange-500 text-orange-500 hover:bg-orange-50">
                    Masuk
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="hidden sm:block bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-orange-500">
                    Daftar
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-orange-50 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
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
          <div className="py-4 space-y-3 border-t border-orange-100">
            {status === "authenticated" ? (
              <>
                {/* User Info in Mobile */}
                <div className="flex items-center space-x-3 px-4 py-3 bg-orange-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{session.user?.name}</p>
                    <p className="text-sm text-gray-600">{session.user?.email}</p>
                  </div>
                </div>

                {/* Dashboard Links */}
                {dashboardLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-orange-50 hover:text-orange-500 rounded-lg transition-colors duration-200"
                  >
                    <link.icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                ))}

                <div className="border-t border-orange-200 pt-3">
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center space-x-2 border-orange-500 text-orange-500 hover:bg-orange-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar</span>
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Public Links */}
                {publicLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-gray-600 hover:bg-orange-50 hover:text-orange-500 rounded-lg transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="border-t border-orange-200 pt-3 space-y-2">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-orange-500 text-orange-500 hover:bg-orange-50">
                      Masuk
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-orange-500">
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