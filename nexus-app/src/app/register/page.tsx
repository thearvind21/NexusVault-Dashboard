"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Mail, Lock, User, ShieldCheck, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AnimatedButton from "@/components/AnimatedButton";
import Link from "next/link";

const registerSchema = z
    .object({
        username: z.string().min(3, "Username must be at least 3 characters").max(32),
        email: z.string().email("Enter a valid email"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const { register: registerUser } = useAuth();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        setError("");
        try {
            await registerUser(data.email, data.username, data.password);
            router.push("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#0A0A0F] relative overflow-hidden">
            <div className="absolute inset-0 bg-mesh" />
            <motion.div
                animate={{ y: [0, -15, 0], x: [0, 12, 0] }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/3 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-violet-500/[0.06] rounded-full blur-3xl"
            />
            <motion.div
                animate={{ y: [0, 20, 0], x: [0, -8, 0] }}
                transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-1/3 left-1/4 w-48 h-48 md:w-72 md:h-72 bg-blue-500/[0.06] rounded-full blur-3xl"
            />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative w-full max-w-[420px] rounded-2xl p-8 md:p-10
          bg-white/[0.04] backdrop-blur-xl border border-white/[0.08]
          shadow-2xl shadow-black/40"
            >
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                        <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                            NexusVault
                        </span>
                    </h1>
                    <div className="mt-1 h-0.5 w-12 mx-auto bg-gradient-to-r from-violet-500 to-blue-500 rounded-full" />
                </motion.div>

                <div className="mb-6 text-center">
                    <h2 className="text-lg md:text-xl font-semibold text-white">Create your vault</h2>
                    <p className="text-sm text-slate-400 mt-1">Start managing your tasks</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                {...register("username")}
                                type="text"
                                placeholder="Username"
                                className="w-full pl-11 pr-4 py-3.5 rounded-xl
                  bg-white/[0.05] border border-white/[0.08]
                  text-white text-sm placeholder:text-slate-500
                  focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20
                  transition-all duration-200"
                            />
                        </div>
                        {errors.username && (
                            <p className="text-xs text-red-400 mt-1.5 ml-1">{errors.username.message}</p>
                        )}
                    </div>

                    <div>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                {...register("email")}
                                type="email"
                                placeholder="Email address"
                                className="w-full pl-11 pr-4 py-3.5 rounded-xl
                  bg-white/[0.05] border border-white/[0.08]
                  text-white text-sm placeholder:text-slate-500
                  focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20
                  transition-all duration-200"
                            />
                        </div>
                        {errors.email && (
                            <p className="text-xs text-red-400 mt-1.5 ml-1">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                {...register("password")}
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                className="w-full pl-11 pr-11 py-3.5 rounded-xl
                  bg-white/[0.05] border border-white/[0.08]
                  text-white text-sm placeholder:text-slate-500
                  focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20
                  transition-all duration-200"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-xs text-red-400 mt-1.5 ml-1">{errors.password.message}</p>
                        )}
                    </div>

                    <div>
                        <div className="relative">
                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                {...register("confirmPassword")}
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm password"
                                className="w-full pl-11 pr-4 py-3.5 rounded-xl
                  bg-white/[0.05] border border-white/[0.08]
                  text-white text-sm placeholder:text-slate-500
                  focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20
                  transition-all duration-200"
                            />
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-xs text-red-400 mt-1.5 ml-1">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <AnimatedButton type="submit" isLoading={isLoading} fullWidth size="lg">
                        Create Account
                    </AnimatedButton>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/[0.06]" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="px-3 bg-[#0A0A0F] text-slate-500">or</span>
                    </div>
                </div>

                <p className="text-center text-sm text-slate-400">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
                    >
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
