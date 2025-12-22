"use client";

import { useState, useEffect } from "react";
import { Search, Mail, Building2, Clock, MoreHorizontal, CheckCircle2, XCircle, Users, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { facultyService, Faculty } from "@/services/facultyService";

const STATUS_CONFIG: Record<string, { color: string, icon: any }> = {
    "Available": { color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
    "Busy": { color: "text-slate-600 bg-slate-100 border-slate-200", icon: XCircle },
    "In Class": { color: "text-amber-600 bg-amber-50 border-amber-200", icon: Clock },
    "Meeting": { color: "text-indigo-600 bg-indigo-50 border-indigo-200", icon: Users },
};

export default function FacultyMatrix() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDept, setSelectedDept] = useState("All");
    const [facultyList, setFacultyList] = useState<Faculty[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        facultyService.getAllFaculty().then(data => {
            setFacultyList(data);
            setIsLoading(false);
        });
    }, []);

    const filteredFaculty = facultyList.filter(f => {
        const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = selectedDept === "All" || f.dept === selectedDept;
        return matchesSearch && matchesDept;
    });

    const uniqueDepts = ["All", ...Array.from(new Set(facultyList.map(f => f.dept)))];

    if (isLoading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Faculty Matrix</h1>
                    <p className="text-slate-500 dark:text-slate-400">Real-time availability status of professors</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                        Live Updates
                    </span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search faculty by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm"
                    />
                </div>
                <div className="sm:w-48">
                    <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm cursor-pointer"
                    >
                        {uniqueDepts.map(dept => (
                            <option key={dept} value={dept}>{dept} Department</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFaculty.map((faculty) => {
                    const statusStyle = STATUS_CONFIG[faculty.status] || STATUS_CONFIG["Busy"];
                    const StatusIcon = statusStyle.icon;

                    return (
                        <motion.div
                            key={faculty.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg font-bold text-slate-600 dark:text-slate-300">
                                        {faculty.name.split(' ')[1]?.[0] || faculty.name[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white">{faculty.name}</h3>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <Building2 className="w-3 h-3" /> {faculty.dept}
                                        </div>
                                    </div>
                                </div>
                                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        <span className="truncate max-w-[140px]">{faculty.email.split('@')[0]}</span>
                                    </div>
                                    <div className="text-slate-400 text-xs">@lnmiit.ac.in</div>
                                </div>

                                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                                        <Clock className="w-4 h-4" />
                                        {faculty.location}
                                    </div>
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border",
                                        statusStyle.color
                                    )}>
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        {faculty.status}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="w-full py-1.5 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white text-xs font-medium transition-colors">
                                    Request Meeting
                                </button>
                                <button className="w-full py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium transition-colors">
                                    View Schedule
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
