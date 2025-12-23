"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, Users, MessageSquare, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useAuth();

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }

    const navItems = [
        { href: "/dashboard", label: "The Flow", icon: LayoutDashboard },
        { href: "/dashboard/booking", label: "LT Booking", icon: Calendar },
        { href: "/dashboard/faculty", label: "Faculty Matrix", icon: Users },
    ];

    return (

        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                className={cn(
                    "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform lg:translate-x-0",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mr-3">
                        <LayoutDashboard className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">CampusFlow</span>
                    <button onClick={() => setIsSidebarOpen(false)} className="ml-auto lg:hidden">
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>

                <nav className="flex-1 p-4 espace-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                                    isActive
                                        ? "bg-primary/10 text-primary shadow-sm"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-current")} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <Link
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            logout();
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition-all font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </Link>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="hidden sm:flex items-center text-sm text-slate-500 dark:text-slate-400 ml-auto gap-4">
                        {user && (
                            <>
                                <span>Welcome, <strong>{user.name}</strong> ({user.role === 'Student' ? 'Student' : 'Faculty'})</span>
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                    {getInitials(user.name)}
                                </div>
                            </>
                        )}
                    </div>
                </header>

                <SocketProvider>
                    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
                        {/* Mobile Sidebar Overlay */}
                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                                />
                            )}
                        </AnimatePresence>

                        {/* Sidebar */}
                        <motion.aside
                            className={cn(
                                "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform lg:translate-x-0",
                                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                            )}
                        >
                            <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
                                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mr-3">
                                    <LayoutDashboard className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-slate-900 dark:text-white">CampusFlow</span>
                                <button onClick={() => setIsSidebarOpen(false)} className="ml-auto lg:hidden">
                                    <X className="w-6 h-6 text-slate-500" />
                                </button>
                            </div>

                            <nav className="flex-1 p-4 espace-y-2">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsSidebarOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                                                isActive
                                                    ? "bg-primary/10 text-primary shadow-sm"
                                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                                            )}
                                        >
                                            <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-current")} />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                                <Link
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        logout();
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition-all font-medium"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Sign Out
                                </Link>
                            </div>
                        </motion.aside>

                        {/* Main Content */}
                        <div className="flex-1 flex flex-col min-w-0">
                            <header className="h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                                >
                                    <Menu className="w-6 h-6" />
                                </button>

                                <div className="hidden sm:flex items-center text-sm text-slate-500 dark:text-slate-400 ml-auto gap-4">
                                    {user && (
                                        <>
                                            <span>Welcome, <strong>{user.name}</strong> ({user.role === 'Student' ? 'Student' : 'Faculty'})</span>
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                                {getInitials(user.name)}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </header>

                            <main className="flex-1 overflow-auto p-4 lg:p-8">
                                <div className="max-w-6xl mx-auto">
                                    {children}
                                </div>
                            </main>
                        </div>
                    </div>
                </SocketProvider>
                );
}
