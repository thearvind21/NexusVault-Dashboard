"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      router.replace(isAuthenticated ? "/dashboard" : "/login");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F] relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative flex flex-col items-center gap-4"
      >
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            NexusVault
          </span>
        </h1>
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        <p className="text-sm text-slate-500">Initializing your vault...</p>
      </motion.div>
    </div>
  );
}
