"use client";

import { useState } from "react";
import { Check, X, Clock, CalendarDays, MoreVertical, Search, ArrowUpRight, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { parseISO, format } from "date-fns";

// Mock Data
const APPROVAL_REQUESTS = [
    { id: 1, type: "Meeting", title: "Project Review: CampusFlow", from: "Kushagra Singh", time: "Today, 4:00 PM", status: "Pending", priority: "High" },
    { id: 2, type: "Hall Booking", title: "Coding Club Session (LT-5)", from: "Ravi Kumar", time: "Tomorrow, 6:00 PM", status: "Pending", priority: "Normal" },
];

const MY_BOOKINGS = [
    { id: 101, hall: "LT-5", date: "2025-12-24T18:00:00", purpose: "Coding Club Session", status: "Approved" },
    { id: 102, hall: "OAT", date: "2025-12-28T17:00:00", purpose: "Drama Rehearsal", status: "Pending" },
];

export default function TheFlowDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("All");

    if (!user) return null;

    // --- STUDENT VIEW ---
    if (user.role === "Student") {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Dashboard</h1>
                        <p className="text-slate-500 dark:text-slate-400">Manage your bookings and requests</p>
                    </div>
                    <Link href="/dashboard/booking" className="bg-primary hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors">
                        <Plus className="w-4 h-4" /> Book Hall
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="text-sm font-medium text-slate-500 mb-2">Active Bookings</div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">{MY_BOOKINGS.length}</div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-sm">
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Next Event</div>
                        <div className="text-xl font-bold text-blue-900 dark:text-blue-100">Coding Club Session</div>
                        <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">Tomorrow, 6:00 PM • LT-5</div>
                    </motion.div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="font-bold text-lg text-slate-900 dark:text-white">Booking History</h2>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {MY_BOOKINGS.map(booking => (
                            <div key={booking.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <div>
                                    <div className="font-semibold text-slate-900 dark:text-white">{booking.purpose}</div>
                                    <div className="text-sm text-slate-500">{booking.hall} • {format(parseISO(booking.date), "PPP p")}</div>
                                </div>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-medium border",
                                    booking.status === "Approved" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-amber-50 text-amber-600 border-amber-200"
                                )}>
                                    {booking.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // --- TEACHER VIEW ---
    return (
        <div className="space-y-8">
            {/* Header Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-primary to-rose-700 rounded-2xl p-6 text-white shadow-lg shadow-primary/20"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <Clock className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">+2 new</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">{APPROVAL_REQUESTS.length}</div>
                    <div className="text-primary-foreground/80 text-sm">Pending Approvals</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg">
                            <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">8</div>
                    <div className="text-slate-500 dark:text-slate-400 text-sm">Today's Appointments</div>
                </motion.div>
            </div>

            {/* The Flow - Tasks List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Approvals</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Review student requests</p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                        {["All", "Pending"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                    activeTab === tab
                                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {APPROVAL_REQUESTS.filter(r => activeTab === "All" || r.status === activeTab).map((req) => (
                        <div key={req.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-amber-200 bg-amber-50 text-amber-600">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                        {req.title}
                                        {req.priority === "High" && <span className="w-2 h-2 rounded-full bg-red-500" />}
                                    </h3>
                                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                        <span>{req.from}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                                        <span>{req.time}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="p-2 rounded-full hover:bg-emerald-50 text-emerald-600 transition-colors" title="Approve">
                                    <Check className="w-5 h-5" />
                                </button>
                                <button className="p-2 rounded-full hover:bg-red-50 text-red-600 transition-colors" title="Reject">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
