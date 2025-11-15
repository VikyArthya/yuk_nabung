"use client";

import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);

      // Clear any lingering WebSocket connections
      if (typeof window !== 'undefined') {
        // Force close any WebSocket connections
        const websockets = [];
        Object.keys(window).forEach(key => {
          if (key.includes('socket') || key.includes('websocket')) {
            const ws = (window as any)[key];
            if (ws && typeof ws.close === 'function') {
              ws.close();
            }
          }
        });
      }

      // Perform signOut with proper cleanup
      await signOut({
        redirect: false // Prevent automatic redirect
      });

      // Force cleanup browser storage
      localStorage.clear();
      sessionStorage.clear();

      // Force full page reload to login to bypass HMR issues
      window.location.replace('/login');

    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect regardless of error
      window.location.replace('/login');
    }
  };

  return (
    <Button
      onClick={handleSignOut}
      variant="destructive"
      className="font-black"
      disabled={isLoading}
    >
      {isLoading ? "Logging out..." : "Keluar"}
    </Button>
  );
}