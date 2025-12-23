"use client";

import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { Calendar as CalendarIcon, MapPin, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { bookingService, Hall } from "@/services/bookingService";

export default function BookingPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSlot, setSelectedSlot] = useState<{ hallId: string, time: string } | null>(null);
    const [halls, setHalls] = useState<Hall[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBooking, setIsBooking] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());

    // 1. Fetch Halls on Mount
    useEffect(() => {
        let mounted = true;

        bookingService.getHalls()
            .then(data => {
                if (mounted) {
                    setHalls(data);
                    setIsLoading(false);
                }
            })
            .catch(err => {
                if (mounted) {
                    console.error("Failed to load halls", err);
                    setError("Failed to load halls. Set up Firebase keys or disable AdBlocker.");
                    setIsLoading(false);
                }
            });

        return () => { mounted = false; };
    }, []);

    // 2. Fetch Bookings when Date Changes
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const bookings = await bookingService.getBookingsForDate(selectedDate);
                const bookedSet = new Set(bookings.map(b => `${b.hallId}-${b.time}`));
                setBookedSlots(bookedSet);
            } catch (err) {
                console.error("Failed to load bookings", err);
            }
        };

        fetchBookings();
    }, [selectedDate]);

    const filteredHalls = halls.filter(hall =>
        hall.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hall.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const timeSlots = bookingService.getTimeSlots().slice(0, 9);

    const handleBook = async () => {
        if (!selectedSlot) return;
        setIsBooking(true);

        // Simulate user ID from auth context in real app
        const result = await bookingService.bookSlot({
            hallId: selectedSlot.hallId,
            time: selectedSlot.time,
            date: selectedDate,
            userId: "mock-user"
        });

        alert(result.message);
        setSelectedSlot(null);
        setIsBooking(false);
        // Refresh bookings
        if (result.success) {
            const bookings = await bookingService.getBookingsForDate(selectedDate);
            setBookedSlots(new Set(bookings.map(b => `${b.hallId}-${b.time}`)));
        }
    };

    if (isLoading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    if (error) {
        return (
            <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
                    <MapPin className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Unable to Load Venues</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-1">{error}</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="text-primary hover:underline font-medium text-sm"
                >
                    Try Reloading
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Venue Booking</h1>
                    <p className="text-slate-500 dark:text-slate-400">Reserve lecture booking and event spaces</p>
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <button
                        onClick={() => setSelectedDate(d => addDays(d, -1))}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <div className="px-4 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                        {format(selectedDate, "EEE, MMM d, yyyy")}
                    </div>
                    <button
                        onClick={() => setSelectedDate(d => addDays(d, 1))}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
                    >
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search halls..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredHalls.map((hall) => (
                    <motion.div
                        key={hall.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col"
                    >
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">{hall.name}</h3>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        <MapPin className="w-3 h-3" /> {hall.type} • {hall.capacity} Seats
                                    </div>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            </div>
                        </div>

                        <div className="p-4 grid grid-cols-3 gap-2">
                            {timeSlots.map((time) => {
                                const isSelected = selectedSlot?.hallId === hall.id && selectedSlot?.time === time;
                                const isBooked = bookedSlots.has(`${hall.id}-${time}`);

                                return (
                                    <button
                                        key={time}
                                        disabled={isBooked}
                                        onClick={() => !isBooked && setSelectedSlot({ hallId: hall.id, time })}
                                        className={cn(
                                            "text-xs py-1.5 rounded-md border transition-all",
                                            isBooked
                                                ? "bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50 text-red-300 cursor-not-allowed decoration-slice opacity-60"
                                                : isSelected
                                                    ? "bg-primary text-white border-primary shadow-sm scale-105 font-medium"
                                                    : "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:border-emerald-500 hover:shadow-sm"
                                        )}
                                    >
                                        {time}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Booking Modal / Action Bar */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: selectedSlot ? 0 : 100 }}
                className="fixed bottom-0 left-0 right-0 p-4 z-40 flex justify-center pointer-events-none"
            >
                <div className="bg-slate-900 text-white rounded-full px-6 py-3 shadow-2xl flex items-center gap-6 pointer-events-auto min-w-[320px] justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                            {isBooking ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <CalendarIcon className="w-5 h-5 text-primary" />}
                        </div>
                        <div>
                            <div className="font-medium text-sm">Confirm Booking</div>
                            <div className="text-xs text-slate-400">
                                {selectedSlot?.hallId} • {selectedSlot?.time} • {format(selectedDate, "MMM d")}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleBook}
                        disabled={isBooking}
                        className="bg-primary hover:bg-red-600 text-white px-5 py-2 rounded-full text-xs font-bold transition-colors disabled:opacity-70"
                    >
                        {isBooking ? "Booking..." : "Confirm"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
