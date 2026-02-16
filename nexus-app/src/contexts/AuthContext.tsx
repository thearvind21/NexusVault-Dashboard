"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, setToken, removeToken, getToken, UserResponse } from "@/lib/api";

interface AuthContextType {
    user: UserResponse | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, username: string, password: string) => Promise<void>;
    logout: () => void;
    refreshUser: (updatedUser: UserResponse) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadUser = useCallback(async () => {
        const token = getToken();
        if (!token) {
            setIsLoading(false);
            return;
        }
        try {
            const me = await authApi.getMe();
            setUser(me);
        } catch {
            removeToken();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const login = async (email: string, password: string) => {
        const res = await authApi.login({ email, password });
        setToken(res.access_token);
        setUser(res.user);
    };

    const register = async (email: string, username: string, password: string) => {
        const res = await authApi.register({ email, username, password });
        setToken(res.access_token);
        setUser(res.user);
    };

    const logout = () => {
        removeToken();
        setUser(null);
    };

    const refreshUser = (updatedUser: UserResponse) => {
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}
