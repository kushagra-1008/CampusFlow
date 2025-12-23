"use client";

import { useState, useEffect } from "react";
import { Check, X, Clock, CalendarDays, MoreVertical, Search, ArrowUpRight, Plus, Loader2, Trash2, Edit2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { parseISO, format } from "date-fns";
import { bookingService, Booking } from "@/services/bookingService";

export default function TheFlowDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("All");
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        setIsLoading(true);

        let unsubscribe: () => void;

        if (user.role === "Student") {
            unsubscribe = bookingService.subscribeToUserBookings(user.id, (data) => {
                setBookings(data);
                setIsLoading(false);
            });
        } else {
            unsubscribe = bookingService.subscribeToAllBookings((data) => {
                setBookings(data);
                setIsLoading(false);
            });
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [user]);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to cancel this booking?")) {
            await bookingService.deleteBooking(id);
        }
    };

    const handleEdit = async (id: string, currentPurpose: string) => {
        const newPurpose = prompt("Update Event Title:", currentPurpose);
        if (newPurpose && newPurpose !== currentPurpose) {
            await bookingService.updateBooking(id, { purpose: newPurpose });
        }
    };

    if (!user) return null;

    // Derived State
    const activeBookingsCount = bookings.filter(b => b.status === 'Approved' || b.status === 'Pending').length;
    const nextEvent = bookings.find(b => new Date(b.date) > new Date());

    // Teacher Specific Derived State
    const pendingApprovals = bookings.filter(b => b.status === "Pending");
    const todaysAppointments = bookings.filter(b => new Date(b.date).toDateString() === new Date().toDateString()).length;

    // --- STUDENT VIEW ---
    // Fetch all approved events for "Campus Events" feed
    const [allEvents, setAllEvents] = useState<Booking[]>([]);

    useEffect(() => {
        if (user.role === "Student") {
            const unsubscribe = bookingService.subscribeToAllBookings((data) => {
                // Filter: Approved + Future/Today
                const approvedFuture = data.filter(b =>
                    b.status === "Approved" &&
                    new Date(b.date) >= new Date(new Date().setHours(0, 0, 0, 0))
                );
                // Sort Ascending (Soonest first)
                approvedFuture.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                setAllEvents(approvedFuture);
            });
            return () => unsubscribe();
        }
    }, [user.role]);

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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="text-sm font-medium text-slate-500 mb-2">My Requests</div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">
                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : bookings.length}
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="col-span-1 md:col-span-2 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-sm overflow-y-auto max-h-[160px]">
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Upcoming Campus Events ({allEvents.length})</div>
                        {allEvents.length > 0 ? (
                            <div className="space-y-3">
                                {allEvents.slice(0, 3).map(event => (
                                    <div key={event.id} className="flex items-center justify-between text-sm">
                                        <span className="font-semibold text-blue-900 dark:text-blue-100 truncate max-w-[200px]">{event.purpose}</span>
                                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-xs">
                                            <span>{event.hallId}</span>
                                            <span>•</span>
                                            <span>{format(new Date(event.date), "MMM d")} {event.time}</span>
                                        </div>
                                    </div>
                                ))}
                                {allEvents.length > 3 && <div className="text-xs text-blue-500 text-center pt-1">+{allEvents.length - 3} more</div>}
                            </div>
                        ) : (
                            <div className="text-blue-900 dark:text-blue-100 font-medium">No schedule classes/events found.</div>
                        )}
                    </motion.div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="font-bold text-lg text-slate-900 dark:text-white">My Booking History</h2>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {bookings.length === 0 && !isLoading && (
                            <div className="p-8 text-center text-slate-500">No bookings found. Start by booking a hall!</div>
                        )}
                        {bookings.map(booking => (
                            <div key={booking.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <div>
                                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                        {booking.purpose}
                                        <button
                                            onClick={() => handleEdit(booking.id!, booking.purpose)}
                                            className="text-slate-400 hover:text-primary transition-colors"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="text-sm text-slate-500">{booking.hallId} • {format(new Date(booking.date), "PPP")} • {booking.time}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-medium border",
                                        booking.status === "Approved" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                            booking.status === "Rejected" ? "bg-red-50 text-red-600 border-red-200" :
                                                "bg-amber-50 text-amber-600 border-amber-200"
                                    )}>
                                        {booking.status}
                                    </span>
                                    <button
                                        onClick={() => handleDelete(booking.id!)}
                                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                        title="Cancel Booking"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
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
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    </div>
                    <div className="text-3xl font-bold mb-1">{pendingApprovals.length}</div>
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
                    <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{todaysAppointments}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-sm">Today's Appointments</div>
                </motion.div>
            </div>

            {/* The Flow - Tasks List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-[600px]">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Approvals</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Review student requests</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={activeTab}
                            onChange={(e) => setActiveTab(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                        {/* Sort Toggle (Simple implementation: toggle between Newest/Oldest) */}
                        <button
                            onClick={() => setBookings(prev => [...prev].reverse())}
                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500"
                            title="Toggle Sort Order"
                        >
                            <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-700/50">
                    {bookings.filter(r => activeTab === "All" || r.status === activeTab).length === 0 && (
                        <div className="p-8 text-center text-slate-500">No requests found.</div>
                    )}
                    {bookings
                        .filter(r => activeTab === "All" || r.status === activeTab)
                        .map((req) => (
                            <div key={req.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-amber-200 bg-amber-50 text-amber-600">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                            {req.purpose || "Booking Request"}
                                            {user.id === req.userId && (
                                                <button
                                                    onClick={() => handleEdit(req.id!, req.purpose)}
                                                    className="text-slate-400 hover:text-primary transition-colors"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-[10px] border",
                                                req.status === "Approved" ? "bg-emerald-100 border-emerald-200 text-emerald-700" :
                                                    req.status === "Rejected" ? "bg-red-100 border-red-200 text-red-700" :
                                                        "bg-amber-100 border-amber-200 text-amber-700"
                                            )}>{req.status}</span>
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                            <span>{req.userName || "Unknown"}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span>{req.hallId} ({req.time})</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span>{format(new Date(req.date), "MMM d")}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {req.status === 'Pending' && (
                                        <>
                                            <button
                                                onClick={() => bookingService.updateBookingStatus(req.id!, 'Approved')}
                                                className="p-2 rounded-full hover:bg-emerald-50 text-emerald-600 transition-colors"
                                                title="Approve"
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => bookingService.updateBookingStatus(req.id!, 'Rejected')}
                                                className="p-2 rounded-full hover:bg-red-50 text-red-600 transition-colors"
                                                title="Reject"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}
                                    {/* Allow Delete if: Owner OR (User is Faculty AND Target is NOT Faculty) */}
                                    {(user.id === req.userId || !req.userId.toLowerCase().startsWith('faculty')) && (
                                        <button
                                            onClick={() => handleDelete(req.id!)}
                                            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}
