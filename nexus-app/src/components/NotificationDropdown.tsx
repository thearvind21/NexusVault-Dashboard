"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle2, Clock, AlertCircle, X } from "lucide-react";
import { TaskResponse } from "@/lib/api";

interface NotificationDropdownProps {
    tasks: TaskResponse[];
}

export default function NotificationDropdown({ tasks }: NotificationDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const [readIds, setReadIds] = useState<number[]>([]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const notifications = tasks.slice(0, 5).map(task => ({
        id: task.id,
        title: `Task Update: ${task.title}`,
        time: "Recently",
        type: task.status === "done" ? "success" : task.status === "in_progress" ? "info" : "warning",
        message: `Task is now ${task.status.replace("_", " ")}`
    }));

    const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            const ids = notifications.map(n => n.id);
            setReadIds(prev => Array.from(new Set([...prev, ...ids])));
        }
    };

    return (
        <div className="relative shrink-0" ref={ref}>
            <button
                onClick={handleToggle}
                className="relative p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]
          hover:bg-white/[0.08] transition-all text-slate-400 hover:text-white shrink-0"
            >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-blue-500
            ring-2 ring-[#0E0E18]" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-80
              bg-[#13132A] border border-white/[0.08]
              rounded-xl shadow-2xl shadow-black/40 z-50
              overflow-hidden"
                    >
                        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-white">Notifications</h3>
                            <span className="text-[10px] text-slate-500 bg-white/[0.05] px-2 py-0.5 rounded-full">
                                {notifications.length} New
                            </span>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="px-4 py-8 text-center text-slate-500 text-xs">
                                    No new notifications
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div key={n.id} className="px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                                        <div className="flex gap-3">
                                            <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0
                        ${n.type === 'success' ? 'bg-emerald-500' :
                                                    n.type === 'info' ? 'bg-blue-500' : 'bg-amber-500'}`}
                                            />
                                            <div>
                                                <p className="text-xs font-medium text-slate-200 line-clamp-1">{n.title}</p>
                                                <p className="text-[11px] text-slate-500 mt-0.5">{n.message}</p>
                                                <p className="text-[10px] text-slate-600 mt-1.5">{n.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-2 border-t border-white/[0.06] bg-white/[0.02]">
                            <button className="w-full py-1.5 text-[10px] text-slate-400 hover:text-white transition-colors">
                                Mark all as read
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
