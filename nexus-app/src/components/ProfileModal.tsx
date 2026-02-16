"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import {
    X, Camera, User, Mail, Calendar, Lock, Eye, EyeOff, Save, CheckCircle2,
} from "lucide-react";
import { authApi, UserResponse } from "@/lib/api";

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserResponse | null;
    onUserUpdate: (user: UserResponse) => void;
}

export default function ProfileModal({ isOpen, onClose, user, onUserUpdate }: ProfileModalProps) {
    const [tab, setTab] = useState<"profile" | "password">("profile");

    const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem("nexus_avatar");
    });
    const fileRef = useRef<HTMLInputElement>(null);

    const [username, setUsername] = useState(user?.username || "");
    const [email, setEmail] = useState(user?.email || "");
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMsg, setProfileMsg] = useState("");
    const [profileErr, setProfileErr] = useState("");

    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);
    const [pwMsg, setPwMsg] = useState("");
    const [pwErr, setPwErr] = useState("");

    const handleOpen = () => {
        setUsername(user?.username || "");
        setEmail(user?.email || "");
        setProfileMsg("");
        setProfileErr("");
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
        setPwMsg("");
        setPwErr("");
        setTab("profile");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            setProfileErr("Image must be under 2MB");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const data = reader.result as string;
            setAvatarUrl(data);
            localStorage.setItem("nexus_avatar", data);
            setProfileErr("");
        };
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = async () => {
        if (!username.trim() || username.length < 3) {
            setProfileErr("Username must be at least 3 characters");
            return;
        }
        if (!email.trim() || !email.includes("@")) {
            setProfileErr("Please enter a valid email");
            return;
        }
        setProfileLoading(true);
        setProfileErr("");
        setProfileMsg("");
        try {
            const updated = await authApi.updateProfile({ username, email });
            onUserUpdate(updated);
            setProfileMsg("Profile updated!");
            setTimeout(() => setProfileMsg(""), 3000);
        } catch (err) {
            setProfileErr(err instanceof Error ? err.message : "Failed to update");
        } finally {
            setProfileLoading(false);
        }
    };

    const handleChangePassword = async () => {
        setPwErr("");
        setPwMsg("");
        if (!currentPw) { setPwErr("Enter current password"); return; }
        if (newPw.length < 8) { setPwErr("New password must be at least 8 characters"); return; }
        if (newPw !== confirmPw) { setPwErr("Passwords do not match"); return; }
        setPwLoading(true);
        try {
            await authApi.changePassword({ current_password: currentPw, new_password: newPw });
            setPwMsg("Password changed!");
            setCurrentPw(""); setNewPw(""); setConfirmPw("");
            setTimeout(() => setPwMsg(""), 3000);
        } catch (err) {
            setPwErr(err instanceof Error ? err.message : "Failed to change password");
        } finally {
            setPwLoading(false);
        }
    };

    const joinDate = user?.created_at
        ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : "";

    const inputClass = `w-full px-4 py-3 rounded-xl text-sm
    bg-white/[0.04] border border-white/[0.08]
    text-white placeholder:text-slate-500
    focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/15
    transition-all duration-200`;

    return (
        <AnimatePresence onExitComplete={() => { }}>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                    onAnimationStart={handleOpen}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl
              bg-[#12121A] border border-white/[0.08]
              shadow-2xl shadow-black/50"
                    >
                        <div className="sticky top-0 z-10 bg-[#12121A] border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">My Profile</h2>
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-lg hover:bg-white/[0.05] text-slate-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="px-6 py-5">
                            <div className="flex flex-col items-center mb-6">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden
                    bg-gradient-to-br from-blue-500 to-violet-500
                    flex items-center justify-center text-3xl font-bold text-white
                    shadow-lg shadow-blue-500/20 ring-4 ring-white/[0.06]"
                                    >
                                        {avatarUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            user?.username?.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <button
                                        onClick={() => fileRef.current?.click()}
                                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full
                      bg-blue-500 flex items-center justify-center
                      shadow-lg shadow-blue-500/30
                      hover:bg-blue-400 transition-colors cursor-pointer"
                                    >
                                        <Camera className="w-3.5 h-3.5 text-white" />
                                    </button>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <p className="text-base font-bold text-white mt-3">{user?.username}</p>
                                <p className="text-xs text-slate-500">{user?.email}</p>
                            </div>

                            <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-5">
                                <button
                                    onClick={() => setTab("profile")}
                                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all
                    ${tab === "profile"
                                            ? "bg-blue-500/15 text-blue-400 shadow-sm"
                                            : "text-slate-400 hover:text-white"}`}
                                >
                                    Profile Info
                                </button>
                                <button
                                    onClick={() => setTab("password")}
                                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all
                    ${tab === "password"
                                            ? "bg-blue-500/15 text-blue-400 shadow-sm"
                                            : "text-slate-400 hover:text-white"}`}
                                >
                                    Change Password
                                </button>
                            </div>

                            {tab === "profile" && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-4"
                                >
                                    {profileMsg && (
                                        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                                            <CheckCircle2 className="w-4 h-4 shrink-0" /> {profileMsg}
                                        </div>
                                    )}
                                    {profileErr && (
                                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                            {profileErr}
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5 flex items-center gap-1.5">
                                            <User className="w-3 h-3" /> Username
                                        </label>
                                        <input
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5 flex items-center gap-1.5">
                                            <Mail className="w-3 h-3" /> Email
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5 flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3" /> Joined
                                        </label>
                                        <div className={`${inputClass} !bg-white/[0.02] cursor-default text-slate-400`}>
                                            {joinDate}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={profileLoading}
                                        className="w-full mt-2 py-3 rounded-xl text-sm font-semibold
                      bg-gradient-to-r from-blue-500 to-violet-500
                      hover:from-blue-400 hover:to-violet-400
                      text-white shadow-lg shadow-blue-500/20
                      disabled:opacity-50 transition-all duration-200
                      flex items-center justify-center gap-2"
                                    >
                                        {profileLoading ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <><Save className="w-4 h-4" /> Save Changes</>
                                        )}
                                    </button>
                                </motion.div>
                            )}

                            {tab === "password" && (
                                <motion.div
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-4"
                                >
                                    {pwMsg && (
                                        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                                            <CheckCircle2 className="w-4 h-4 shrink-0" /> {pwMsg}
                                        </div>
                                    )}
                                    {pwErr && (
                                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                            {pwErr}
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5 flex items-center gap-1.5">
                                            <Lock className="w-3 h-3" /> Current Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showCurrent ? "text" : "password"}
                                                value={currentPw}
                                                onChange={(e) => setCurrentPw(e.target.value)}
                                                placeholder="Enter current password"
                                                className={inputClass + " pr-10"}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrent(!showCurrent)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                            >
                                                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5 flex items-center gap-1.5">
                                            <Lock className="w-3 h-3" /> New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showNew ? "text" : "password"}
                                                value={newPw}
                                                onChange={(e) => setNewPw(e.target.value)}
                                                placeholder="Minimum 8 characters"
                                                className={inputClass + " pr-10"}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNew(!showNew)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                            >
                                                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5 flex items-center gap-1.5">
                                            <Lock className="w-3 h-3" /> Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPw}
                                            onChange={(e) => setConfirmPw(e.target.value)}
                                            placeholder="Re-enter new password"
                                            className={inputClass}
                                        />
                                    </div>

                                    <button
                                        onClick={handleChangePassword}
                                        disabled={pwLoading}
                                        className="w-full mt-2 py-3 rounded-xl text-sm font-semibold
                      bg-gradient-to-r from-blue-500 to-violet-500
                      hover:from-blue-400 hover:to-violet-400
                      text-white shadow-lg shadow-blue-500/20
                      disabled:opacity-50 transition-all duration-200
                      flex items-center justify-center gap-2"
                                    >
                                        {pwLoading ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <><Lock className="w-4 h-4" /> Update Password</>
                                        )}
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
