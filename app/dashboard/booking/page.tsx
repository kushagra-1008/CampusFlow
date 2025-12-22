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

    useEffect(() => {
        bookingService.getHalls().then(data => {
            setHalls(data);
            setIsLoading(false);
        });
    }, []);

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
    };

    if (isLoading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
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
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    Math.random() > 0.2 ? "bg-emerald-500" : "bg-red-500"
                                )} />
                            </div>
                        </div>

                        <div className="p-4 grid grid-cols-3 gap-2">
                            {timeSlots.map((time) => {
                                const isSelected = selectedSlot?.hallId === hall.id && selectedSlot?.time === time;

                                // Note: In real implementation, availability would be async/pre-fetched. 
                                // For this refactor, we are using the service structure but keeping simple sync check logic 
                                // would require async calls for each button which is bad. 
                                // Optimally, getHalls would return availability map. 
                                // We'll trust the visual "taken" simulation is mostly static for now to update UI structure.

                                return (
                                    <button
                                        key={time}
                                        onClick={() => setSelectedSlot({ hallId: hall.id, time })}
                                        className={cn(
                                            "text-xs py-1.5 rounded-md border transition-all",
                                            isSelected
                                                ? "bg-primary text-white border-primary shadow-sm scale-105 font-medium"
                                                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:text-primary"
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
