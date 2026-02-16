const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("nexus_token");
}

export function setToken(token: string): void {
    localStorage.setItem("nexus_token", token);
}

export function removeToken(): void {
    localStorage.removeItem("nexus_token");
}

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: "Request failed" }));
        throw new Error(error.detail || `HTTP ${res.status}`);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
}

export interface UserResponse {
    id: number;
    email: string;
    username: string;
    created_at: string;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
    user: UserResponse;
}

export const authApi = {
    register: (data: { email: string; username: string; password: string }) =>
        request<TokenResponse>("/api/auth/register", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    login: (data: { email: string; password: string }) =>
        request<TokenResponse>("/api/auth/login", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    getMe: () => request<UserResponse>("/api/auth/me"),

    updateProfile: (data: { username?: string; email?: string }) =>
        request<UserResponse>("/api/auth/me", {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    changePassword: (data: { current_password: string; new_password: string }) =>
        request<{ message: string }>("/api/auth/me/password", {
            method: "PUT",
            body: JSON.stringify(data),
        }),
};

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface TaskResponse {
    id: number;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    created_at: string;
    updated_at: string;
}

export interface TaskListResponse {
    tasks: TaskResponse[];
    total: number;
}

export interface TaskCreateData {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
}

export interface TaskUpdateData {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
}

export const taskApi = {
    list: (params?: { status?: TaskStatus; priority?: TaskPriority; search?: string }) => {
        const query = new URLSearchParams();
        if (params?.status) query.set("status", params.status);
        if (params?.priority) query.set("priority", params.priority);
        if (params?.search) query.set("search", params.search);
        const qs = query.toString();
        return request<TaskListResponse>(`/api/tasks${qs ? `?${qs}` : ""}`);
    },

    create: (data: TaskCreateData) =>
        request<TaskResponse>("/api/tasks", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    update: (id: number, data: TaskUpdateData) =>
        request<TaskResponse>(`/api/tasks/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    delete: (id: number) =>
        request<void>(`/api/tasks/${id}`, { method: "DELETE" }),
};
