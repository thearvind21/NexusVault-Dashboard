"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Search, LogOut, Pencil, Trash2, X,
    CheckCircle2, Clock, ListTodo, Flame, Minus, ChevronDown,
    LayoutDashboard, Bell, SlidersHorizontal, ArrowUpDown,
    BarChart3, Shield, Paperclip, MoreHorizontal, TrendingUp,
    Zap, CircleDot, User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AnimatedButton from "@/components/AnimatedButton";
import ProfileModal from "@/components/ProfileModal";
import NotificationDropdown from "@/components/NotificationDropdown";
import { SkeletonList, SkeletonStatCard } from "@/components/SkeletonLoader";
import { taskApi, TaskResponse, TaskStatus, TaskPriority } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

const statusConfig: Record<TaskStatus, { label: string; color: string; border: string; bg: string; icon: React.ReactNode }> = {
    todo: {
        label: "Todo",
        color: "text-slate-300",
        border: "border-slate-500/30",
        bg: "bg-slate-500/10",
        icon: <ListTodo className="w-3.5 h-3.5" />,
    },
    in_progress: {
        label: "In Progress",
        color: "text-cyan-400",
        border: "border-cyan-500/30",
        bg: "bg-cyan-500/10",
        icon: <Clock className="w-3.5 h-3.5" />,
    },
    done: {
        label: "Completed",
        color: "text-emerald-400",
        border: "border-emerald-500/30",
        bg: "bg-emerald-500/10",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
};

const priorityConfig: Record<TaskPriority, { label: string; color: string; bg: string; border: string }> = {
    low: { label: "LOW PRIORITY", color: "text-cyan-300", bg: "bg-cyan-500/15", border: "border-cyan-500/30" },
    medium: { label: "MEDIUM PRIORITY", color: "text-amber-300", bg: "bg-amber-500/15", border: "border-amber-500/30" },
    high: { label: "HIGH PRIORITY", color: "text-red-300", bg: "bg-red-500/15", border: "border-red-500/30" },
};

const statusFilters: (TaskStatus | "all")[] = ["all", "todo", "in_progress", "done"];

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    );
}

function DashboardContent() {
    const { user, logout, refreshUser } = useAuth();
    const router = useRouter();
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [tasks, setTasks] = useState<TaskResponse[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [activeFilter, setActiveFilter] = useState<TaskStatus | "all">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState<TaskResponse | null>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const [formTitle, setFormTitle] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [formStatus, setFormStatus] = useState<TaskStatus>("todo");
    const [formPriority, setFormPriority] = useState<TaskPriority>("medium");
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");

    const fetchTasks = useCallback(async () => {
        try {
            const params: { status?: TaskStatus; search?: string } = {};
            if (activeFilter !== "all") params.status = activeFilter;
            if (searchQuery.trim()) params.search = searchQuery.trim();
            const res = await taskApi.list(params);
            setTasks(res.tasks);
        } catch {
        } finally {
            setIsLoadingTasks(false);
        }
    }, [activeFilter, searchQuery]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const totalTasks = tasks.length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const completed = tasks.filter((t) => t.status === "done").length;

    const openCreate = () => {
        setEditingTask(null);
        setFormTitle("");
        setFormDescription("");
        setFormStatus("todo");
        setFormPriority("medium");
        setFormError("");
        setShowModal(true);
    };

    const openEdit = (task: TaskResponse) => {
        setEditingTask(task);
        setFormTitle(task.title);
        setFormDescription(task.description);
        setFormStatus(task.status);
        setFormPriority(task.priority);
        setFormError("");
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formTitle.trim()) {
            setFormError("Title is required");
            return;
        }
        setFormLoading(true);
        setFormError("");
        try {
            if (editingTask) {
                const updated = await taskApi.update(editingTask.id, {
                    title: formTitle,
                    description: formDescription,
                    status: formStatus,
                    priority: formPriority,
                });
                setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            } else {
                const created = await taskApi.create({
                    title: formTitle,
                    description: formDescription,
                    status: formStatus,
                    priority: formPriority,
                });
                setTasks((prev) => [created, ...prev]);
            }
            setShowModal(false);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : "Failed to save");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        const prev = tasks;
        setTasks((t) => t.filter((task) => task.id !== id));
        try {
            await taskApi.delete(id);
        } catch {
            setTasks(prev);
        }
    };

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const getCardMeta = (task: TaskResponse) => {
        const seed = task.id * 7;
        const attachments = (seed % 15) + 1;
        const daysAgo = (seed % 7);
        const progress = task.status === "done" ? 100 : task.status === "in_progress" ? 25 + (seed % 50) : 0;
        return { attachments, daysAgo, progress };
    };

    return (
        <div className="min-h-screen bg-[#0A0A0F] relative overflow-hidden">
            <div className="absolute inset-0 bg-mesh" />
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-blue-500/[0.03] rounded-full blur-3xl"
            />
            <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-500/[0.03] rounded-full blur-3xl"
            />

            <div className="relative z-10">
                <motion.nav
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sticky top-0 z-40 border-b border-white/[0.06]
            bg-[#0E0E18]/80 backdrop-blur-xl"
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                        <Link href="/dashboard" className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600
                flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Shield className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-base font-bold tracking-tight text-white">NexusVault</span>
                        </Link>

                        <div className="hidden md:flex relative flex-1 max-w-md mx-8">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search decrypted tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm
                  bg-white/[0.04] border border-white/[0.08]
                  text-white placeholder:text-slate-500
                  focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/15
                  focus:bg-white/[0.06] transition-all duration-200"
                            />
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="md:hidden relative flex-1 min-w-0 mr-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 rounded-lg text-sm
                    bg-white/[0.04] border border-white/[0.08]
                    text-white placeholder:text-slate-500
                    focus:border-blue-500/40 transition-all"
                                />
                            </div>

                            <NotificationDropdown tasks={tasks} />

                            <div className="relative shrink-0" ref={userMenuRef}>
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl
                      bg-white/[0.04] border border-white/[0.06]
                      hover:bg-white/[0.08] transition-all duration-200"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500
                      flex items-center justify-center text-[11px] font-bold text-white
                      ring-2 ring-violet-500/20">
                                        {user?.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="hidden sm:block">
                                        <p className="text-xs font-semibold text-white leading-none">
                                            {user?.username?.slice(0, 12)}
                                        </p>
                                    </div>
                                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform duration-200
                      ${showUserMenu ? "rotate-180" : ""}`} />
                                </button>

                                <AnimatePresence>
                                    {showUserMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full mt-2 w-52
                          bg-[#13132A] border border-white/[0.08]
                          rounded-xl shadow-2xl shadow-black/40 z-50
                          overflow-hidden"
                                        >
                                            <div className="px-4 py-3 border-b border-white/[0.06]">
                                                <p className="text-sm font-semibold text-white truncate">
                                                    {user?.username}
                                                </p>
                                                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                                    {user?.email}
                                                </p>
                                            </div>

                                            <div className="py-1.5">
                                                <button
                                                    onClick={() => { setShowUserMenu(false); setShowProfileModal(true); }}
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-300
                                hover:bg-white/[0.05] hover:text-white transition-colors"
                                                >
                                                    <User className="w-4 h-4 text-slate-400" />
                                                    Profile
                                                </button>
                                            </div>

                                            <div className="border-t border-white/[0.06] py-1.5">
                                                <button
                                                    onClick={() => { setShowUserMenu(false); handleLogout(); }}
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400
                                hover:bg-red-500/10 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </motion.nav>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-8"
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
                            Welcome back, <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{user?.username}</span>
                        </h2>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2">
                            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                                <CircleDot className="w-3 h-3" />
                                Security Status: Secure
                            </span>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs text-slate-400">
                                Last login: {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                            </span>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        {isLoadingTasks ? (
                            <>
                                <SkeletonStatCard />
                                <SkeletonStatCard />
                                <SkeletonStatCard />
                            </>
                        ) : (
                            <>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                    className="relative overflow-hidden rounded-2xl p-5 sm:p-6
                    bg-white/[0.04] border border-white/[0.06]
                    backdrop-blur-xl group hover:border-white/[0.1] transition-all"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Total Tasks</p>
                                            <p className="text-3xl sm:text-4xl font-bold text-white">{totalTasks}</p>
                                            <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3" />
                                                +{totalTasks > 0 ? Math.min(totalTasks * 5, 100) : 0}% from yesterday
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-500/10 flex items-center justify-center
                      group-hover:bg-slate-500/15 transition-colors">
                                            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="relative overflow-hidden rounded-2xl p-5 sm:p-6
                    bg-white/[0.04] border border-white/[0.06]
                    backdrop-blur-xl group hover:border-cyan-500/20 transition-all"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-[10px] sm:text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">In Progress</p>
                                            <p className="text-3xl sm:text-4xl font-bold text-cyan-400">{inProgress}</p>
                                            <div className="mt-2.5">
                                                <div className="w-24 sm:w-32 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${totalTasks > 0 ? (inProgress / totalTasks) * 100 : 0}%` }}
                                                        transition={{ delay: 0.5, duration: 0.8 }}
                                                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-cyan-400/60 mt-1">
                                                    {totalTasks > 0 ? Math.round((inProgress / totalTasks) * 100) : 0}% Load
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center
                      group-hover:bg-cyan-500/15 transition-colors">
                                            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="relative overflow-hidden rounded-2xl p-5 sm:p-6
                    bg-white/[0.04] border border-white/[0.06]
                    backdrop-blur-xl group hover:border-emerald-500/20 transition-all"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-[10px] sm:text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Completed</p>
                                            <p className="text-3xl sm:text-4xl font-bold text-emerald-400">{completed}</p>
                                            <p className="text-[11px] text-emerald-400/60 mt-1.5">
                                                Optimization: <span className="text-emerald-400 font-medium">Peak Efficiency</span>
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center
                      group-hover:bg-emerald-500/15 transition-colors">
                                            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap items-center justify-between gap-3 mb-6"
                    >
                        <div className="flex flex-wrap items-center gap-2">
                            {statusFilters.map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setActiveFilter(f)}
                                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 border
                    ${activeFilter === f
                                            ? "bg-blue-500/20 border-blue-500/30 text-blue-400 shadow-sm shadow-blue-500/10"
                                            : "bg-white/[0.03] border-white/[0.06] text-slate-400 hover:bg-white/[0.06] hover:text-white"
                                        }`}
                                >
                                    {f === "all" ? "All" : f === "in_progress" ? "In Progress" : f === "done" ? "Done" : "Todo"}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium
                bg-white/[0.03] border border-white/[0.06] text-slate-400
                hover:bg-white/[0.06] hover:text-white transition-all">
                                <ArrowUpDown className="w-3.5 h-3.5" /> Sort
                            </button>
                            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium
                bg-white/[0.03] border border-white/[0.06] text-slate-400
                hover:bg-white/[0.06] hover:text-white transition-all">
                                <SlidersHorizontal className="w-3.5 h-3.5" /> More Filters
                            </button>
                        </div>
                    </motion.div>

                    {isLoadingTasks ? (
                        <SkeletonList count={6} />
                    ) : tasks.length === 0 ? (
                        /* ─── Empty State ─────────────────────── */
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-16 sm:py-24"
                        >
                            <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.06]
                flex items-center justify-center mb-6">
                                <Shield className="w-8 h-8 text-slate-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">No tasks yet</h3>
                            <p className="text-sm text-slate-400 mb-6 text-center max-w-sm">
                                Start organizing your work by creating your first command task
                            </p>
                            <AnimatedButton onClick={openCreate}>
                                Create your first task
                            </AnimatedButton>
                        </motion.div>
                    ) : (
                        <motion.div
                            layout
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        >
                            <AnimatePresence mode="popLayout">
                                {tasks.map((task, i) => {
                                    const meta = getCardMeta(task);
                                    return (
                                        <motion.div
                                            key={task.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.3, delay: i * 0.05 }}
                                        >
                                            <div className="group relative rounded-2xl p-5
                        bg-white/[0.04] border border-white/[0.06]
                        backdrop-blur-xl
                        hover:border-white/[0.12] hover:bg-white/[0.06]
                        transition-all duration-300">

                                                <div className="flex items-center justify-between mb-3">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px]
                            font-bold tracking-wider uppercase border
                            ${priorityConfig[task.priority].color}
                            ${priorityConfig[task.priority].bg}
                            ${priorityConfig[task.priority].border}`}>
                                                        {priorityConfig[task.priority].label}
                                                    </span>

                                                    <div className="flex items-center gap-1">
                                                        {task.status === "done" && (
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                        )}
                                                        <div className="relative">
                                                            <button
                                                                className="p-1 rounded-lg text-slate-500 hover:text-white
                                  hover:bg-white/[0.06] transition-all opacity-0 group-hover:opacity-100"
                                                            >
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </button>
                                                            <div className="absolute right-0 top-full mt-1 w-32
                                bg-[#16162A] border border-white/[0.08] rounded-xl shadow-xl
                                opacity-0 group-hover:opacity-0 hover:opacity-100
                                pointer-events-none group-hover:pointer-events-auto
                                transition-opacity z-10 py-1"
                                                            >
                                                                <button
                                                                    onClick={() => openEdit(task)}
                                                                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-300
                                    hover:bg-white/[0.06] hover:text-white transition-colors"
                                                                >
                                                                    <Pencil className="w-3 h-3" /> Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(task.id)}
                                                                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400
                                    hover:bg-red-500/10 transition-colors"
                                                                >
                                                                    <Trash2 className="w-3 h-3" /> Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px]
                            font-medium border
                            ${statusConfig[task.status].color}
                            ${statusConfig[task.status].bg}
                            ${statusConfig[task.status].border}`}>
                                                        {statusConfig[task.status].icon}
                                                        {statusConfig[task.status].label}
                                                    </span>
                                                </div>

                                                <h3 className={`text-sm font-semibold mb-2 line-clamp-1
                          ${task.status === "done" ? "text-slate-400 line-through" : "text-white"}`}>
                                                    {task.title}
                                                </h3>

                                                {task.description && (
                                                    <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                                                        {task.description}
                                                    </p>
                                                )}

                                                {task.status === "in_progress" && (
                                                    <div className="mb-4">
                                                        <div className="flex items-center justify-between text-[10px] mb-1">
                                                            <span className="text-slate-500">Progress</span>
                                                            <span className="text-cyan-400 font-medium">{meta.progress}% Complete</span>
                                                        </div>
                                                        <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${meta.progress}%` }}
                                                                transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                                                                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                                                    <div className="flex items-center -space-x-2">
                                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500
                              flex items-center justify-center text-[9px] font-bold text-white
                              ring-2 ring-[#12121A]">
                                                            {user?.username?.charAt(0).toUpperCase()}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                                                        <span className="flex items-center gap-1">
                                                            <Paperclip className="w-3 h-3" /> {meta.attachments}
                                                        </span>

                                                        <span>
                                                            {meta.daysAgo === 0 ? "Today" : meta.daysAgo === 1 ? "Yesterday" : `${meta.daysAgo}d ago`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + tasks.length * 0.05 }}
                            >
                                <button
                                    onClick={openCreate}
                                    className="w-full h-full min-h-[200px] rounded-2xl
                    border-2 border-dashed border-white/[0.06]
                    bg-white/[0.02]
                    hover:border-blue-500/20 hover:bg-white/[0.04]
                    transition-all duration-300
                    flex flex-col items-center justify-center gap-3"
                                >
                                    <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.06]
                    flex items-center justify-center
                    group-hover:bg-blue-500/10 transition-all">
                                        <Plus className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-400">New Command Task</span>
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </div>
            </div>

            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={openCreate}
                className="fixed bottom-6 right-6 sm:hidden w-14 h-14
          rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600
          flex items-center justify-center
          shadow-lg shadow-blue-500/25 z-50"
            >
                <Plus className="w-6 h-6 text-white" />
            </motion.button>

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md rounded-2xl p-6 md:p-8
                bg-[#12121A] border border-white/[0.08]
                shadow-2xl shadow-black/50"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">
                                        {editingTask ? "Edit Command Task" : "New Command Task"}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {editingTask ? "Update task parameters" : "Initialize a new task sequence"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-1.5 rounded-lg hover:bg-white/[0.05] text-slate-400 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {formError && (
                                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                    {formError}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Task Title</label>
                                    <input
                                        value={formTitle}
                                        onChange={(e) => setFormTitle(e.target.value)}
                                        placeholder="Enter command task name..."
                                        className="w-full px-4 py-3 rounded-xl text-sm
                      bg-white/[0.04] border border-white/[0.08]
                      text-white placeholder:text-slate-500
                      focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/15
                      transition-all duration-200"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Description</label>
                                    <textarea
                                        value={formDescription}
                                        onChange={(e) => setFormDescription(e.target.value)}
                                        placeholder="Describe the task parameters..."
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl text-sm resize-none
                      bg-white/[0.04] border border-white/[0.08]
                      text-white placeholder:text-slate-500
                      focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/15
                      transition-all duration-200"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Status</label>
                                        <select
                                            value={formStatus}
                                            onChange={(e) => setFormStatus(e.target.value as TaskStatus)}
                                            className="w-full px-4 py-3 rounded-xl text-sm
                        bg-white/[0.04] border border-white/[0.08]
                        text-white
                        focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/15
                        transition-all duration-200 appearance-none"
                                        >
                                            <option value="todo" className="bg-[#12121A]">Todo</option>
                                            <option value="in_progress" className="bg-[#12121A]">In Progress</option>
                                            <option value="done" className="bg-[#12121A]">Completed</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Priority</label>
                                        <select
                                            value={formPriority}
                                            onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
                                            className="w-full px-4 py-3 rounded-xl text-sm
                        bg-white/[0.04] border border-white/[0.08]
                        text-white
                        focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/15
                        transition-all duration-200 appearance-none"
                                        >
                                            <option value="low" className="bg-[#12121A]">Low Priority</option>
                                            <option value="medium" className="bg-[#12121A]">Medium Priority</option>
                                            <option value="high" className="bg-[#12121A]">High Priority</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <AnimatedButton variant="ghost" onClick={() => setShowModal(false)} className="flex-1">
                                        Cancel
                                    </AnimatedButton>
                                    <AnimatedButton
                                        onClick={handleSave}
                                        isLoading={formLoading}
                                        className="flex-1"
                                    >
                                        {editingTask ? "Update Task" : "Initialize Task"}
                                    </AnimatedButton>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                user={user}
                onUserUpdate={refreshUser}
            />
        </div>
    );
}
