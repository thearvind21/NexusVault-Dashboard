"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import GlassCard from "@/components/GlassCard";
import AnimatedButton from "@/components/AnimatedButton";
import {
    User, Mail, Calendar, ArrowLeft, LogOut, Shield,
    CheckCircle2, Clock, ListTodo, Pencil, Save, X
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { taskApi, authApi } from "@/lib/api";

export default function ProfilePage() {
    return (
        <ProtectedRoute>
            <ProfileContent />
        </ProtectedRoute>
    );
}

function ProfileContent() {
    const { user, logout, refreshUser } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, done: 0 });

    const [isEditing, setIsEditing] = useState(false);
    const [editUsername, setEditUsername] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState("");
    const [editSuccess, setEditSuccess] = useState(false);

    useEffect(() => {
        taskApi.list().then((res) => {
            const todo = res.tasks.filter((t) => t.status === "todo").length;
            const inProgress = res.tasks.filter((t) => t.status === "in_progress").length;
            const done = res.tasks.filter((t) => t.status === "done").length;
            setStats({ total: res.total, todo, inProgress, done });
        }).catch(() => { });
    }, []);

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const startEditing = () => {
        setEditUsername(user?.username || "");
        setEditEmail(user?.email || "");
        setEditError("");
        setEditSuccess(false);
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setEditError("");
    };

    const handleSaveProfile = async () => {
        if (!editUsername.trim() || editUsername.length < 3) {
            setEditError("Username must be at least 3 characters");
            return;
        }
        if (!editEmail.trim() || !editEmail.includes("@")) {
            setEditError("Please enter a valid email");
            return;
        }

        setEditLoading(true);
        setEditError("");
        try {
            const updated = await authApi.updateProfile({
                username: editUsername,
                email: editEmail,
            });
            if (refreshUser) {
                refreshUser(updated);
            }
            setEditSuccess(true);
            setIsEditing(false);
            setTimeout(() => setEditSuccess(false), 3000);
        } catch (err) {
            setEditError(err instanceof Error ? err.message : "Failed to update profile");
        } finally {
            setEditLoading(false);
        }
    };

    const joinDate = user?.created_at
        ? new Date(user.created_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        })
        : "";

    return (
        <div className="min-h-screen bg-[#0A0A0F] relative overflow-hidden">
            <div className="absolute inset-0 bg-mesh" />
            <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 14, repeat: Infinity }}
                className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-violet-500/[0.04] rounded-full blur-3xl"
            />

            <div className="relative z-10 max-w-sm mx-auto px-4 sm:px-6 py-8">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-10"
                >
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                            NexusVault
                        </span>
                    </Link>
                </motion.div>

                {editSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center"
                    >
                        ✓ Profile updated successfully
                    </motion.div>
                )}

                <GlassCard hover={false} padding="p-8 md:p-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, type: "spring" }}
                        className="flex flex-col items-center mb-8"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500
              flex items-center justify-center text-2xl font-bold text-white mb-4
              shadow-lg shadow-blue-500/20"
                        >
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold text-white">{user?.username}</h2>
                        <p className="text-sm text-slate-400 mt-0.5">{user?.email}</p>

                        {!isEditing && (
                            <button
                                onClick={startEditing}
                                className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                  bg-white/[0.05] border border-white/[0.08] text-slate-400
                  hover:text-white hover:bg-white/[0.08] transition-all"
                            >
                                <Pencil className="w-3 h-3" /> Edit Profile
                            </button>
                        )}
                    </motion.div>

                    {isEditing ? (
                        <div className="space-y-4 mb-8">
                            {editError && (
                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                    {editError}
                                </div>
                            )}

                            <div>
                                <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5 block">Username</label>
                                <input
                                    value={editUsername}
                                    onChange={(e) => setEditUsername(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl text-sm
                    bg-white/[0.04] border border-white/[0.08]
                    text-white placeholder:text-slate-500
                    focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/15
                    transition-all duration-200"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5 block">Email</label>
                                <input
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl text-sm
                    bg-white/[0.04] border border-white/[0.08]
                    text-white placeholder:text-slate-500
                    focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/15
                    transition-all duration-200"
                                />
                            </div>

                            <div className="flex gap-3 pt-1">
                                <AnimatedButton variant="ghost" onClick={cancelEditing} className="flex-1">
                                    <X className="w-3.5 h-3.5" /> Cancel
                                </AnimatedButton>
                                <AnimatedButton onClick={handleSaveProfile} isLoading={editLoading} className="flex-1">
                                    <Save className="w-3.5 h-3.5" /> Save Changes
                                </AnimatedButton>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                                <User className="w-4 h-4 text-blue-400 shrink-0" />
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Username</p>
                                    <p className="text-sm text-white">{user?.username}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                                <Mail className="w-4 h-4 text-violet-400 shrink-0" />
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Email</p>
                                    <p className="text-sm text-white">{user?.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                                <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Joined</p>
                                    <p className="text-sm text-white">{joinDate}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mb-8">
                        <h3 className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-3">Task Overview</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
                                <ListTodo className="w-4 h-4 text-slate-400 mx-auto mb-1.5" />
                                <p className="text-lg font-bold text-white">{stats.todo}</p>
                                <p className="text-[10px] text-slate-500 uppercase">Todo</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
                                <Clock className="w-4 h-4 text-cyan-400 mx-auto mb-1.5" />
                                <p className="text-lg font-bold text-cyan-400">{stats.inProgress}</p>
                                <p className="text-[10px] text-slate-500 uppercase">In Progress</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1.5" />
                                <p className="text-lg font-bold text-emerald-400">{stats.done}</p>
                                <p className="text-[10px] text-slate-500 uppercase">Done</p>
                            </div>
                        </div>
                    </div>

                    <AnimatedButton variant="danger" onClick={handleLogout} fullWidth>
                        Sign Out
                    </AnimatedButton>
                </GlassCard>
            </div>
        </div>
    );
}
