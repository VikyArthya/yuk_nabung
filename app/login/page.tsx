"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Check if error is about email verification
        if (result.error.includes("verify your email")) {
          setError("📧 Silakan verifikasi email Anda terlebih dahulu. Periksa inbox Anda termasuk folder spam.");
        } else {
          setError("Email atau password salah");
        }
      } else {
        router.push("/dashboard");
        router.refresh();
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
            <span>🔑</span>
            <span>Masuk ke YukNabung App</span>
          </h2>
          <p className="mt-2 text-center neo-text text-sm">
            Atau{" "}
            <Link
              href="/register"
              className="font-black text-blue-600 hover:text-blue-800 underline decoration-4 underline-offset-2 neo-inline-link"
            >
              buat akun baru
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border-2 border-black shadow-[4px_4px_0px_black] px-4 py-3 font-black text-sm text-red-800">
              {error}
            </div>
          )}
          <div className="space-y-4">
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
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 neo-input"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full neo-orange text-white font-black text-lg py-3 px-6 neo-interactive"
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}