"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, LogIn, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
    const { login } = useAuth();
    const searchParams = useSearchParams();
    const type = searchParams.get("type"); // 'student' | 'faculty'

    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Role Enforcement
        if (type === "student" && email.startsWith("faculty@")) {
            setError("Access Restricted: Please use the Faculty Portal for faculty accounts.");
            setIsLoading(false);
            return;
        }

        if (type === "faculty" && !email.startsWith("faculty@")) {
            setError("Access Restricted: Please use the Student Portal for student accounts.");
            setIsLoading(false);
            return;
        }

        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message || "Login failed. Please check your credentials.");
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
            <div className="p-8">
                <div className="flex flex-col items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <LogIn className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {type === "faculty" ? "Faculty Login" : type === "student" ? "Student Login" : "Welcome Back"}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Sign in to CampusFlow</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Institute Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="yours@lnmiit.ac.in"
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 rounded-lg bg-primary hover:bg-red-900 text-white font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>
            </div>
        </motion.div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
            <Link href="/" className="absolute top-8 left-8 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
            </Link>

            <Suspense fallback={<div className="w-full max-w-md h-96 bg-white dark:bg-slate-800 rounded-2xl animate-pulse" />}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
