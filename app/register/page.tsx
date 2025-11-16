"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Akun berhasil dibuat! Mengalihkan ke halaman login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.error || "Terjadi kesalahan saat mendaftar");
      }
    } catch (error) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="neo-yellow min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_black] max-w-md w-full space-y-8 p-8 neo-interactive hover:shadow-[10px_10px_0px_black] hover:translate-y-[-2px] hover:translate-x-[-2px]">
        <div>
          <h2 className="mt-6 text-center neo-heading text-3xl flex items-center justify-center space-x-3">
            <span>🎯</span>
            <span>Buat Akun Baru</span>
          </h2>
          <p className="mt-2 text-center neo-text text-sm">
            Atau{" "}
            <Link
              href="/login"
              className="font-black text-blue-600 hover:text-blue-800 underline decoration-4 underline-offset-2 neo-inline-link"
            >
              masuk ke akun yang ada
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border-2 border-black shadow-[4px_4px_0px_black] px-4 py-3 font-black text-sm text-red-800">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border-2 border-black shadow-[4px_4px_0px_black] px-4 py-3 font-black text-sm text-green-800">
              {success}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-bold">Nama Lengkap</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 neo-input"
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-bold">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 neo-input"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-bold">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 neo-input"
                placeholder="Minimal 6 karakter"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-bold">Konfirmasi Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 neo-input"
                placeholder="Ketik ulang password"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full neo-green text-white font-black text-lg py-3 px-6 neo-interactive"
            >
              {isLoading ? "Mendaftar..." : "Buat Akun"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}