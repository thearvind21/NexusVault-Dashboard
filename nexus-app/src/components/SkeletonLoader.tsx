"use client";

export function SkeletonCard() {
    return (
        <div className="rounded-2xl p-6 bg-white/[0.04] border border-white/[0.06]">
            <div className="skeleton h-5 w-3/4 rounded-lg mb-3" />
            <div className="skeleton h-4 w-full rounded-lg mb-2" />
            <div className="skeleton h-4 w-2/3 rounded-lg mb-4" />
            <div className="flex gap-2">
                <div className="skeleton h-6 w-16 rounded-full" />
                <div className="skeleton h-6 w-20 rounded-full" />
            </div>
        </div>
    );
}

export function SkeletonStatCard() {
    return (
        <div className="rounded-2xl p-6 bg-white/[0.04] border border-white/[0.06]">
            <div className="skeleton h-4 w-24 rounded-lg mb-3" />
            <div className="skeleton h-8 w-16 rounded-lg" />
        </div>
    );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}
