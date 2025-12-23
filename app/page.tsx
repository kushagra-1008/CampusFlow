"use client";

import Link from "next/link";
import { GraduationCap, Users, ArrowRight, LayoutDashboard, Calendar, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-slate-600 bg-clip-text text-transparent">
              CampusFlow
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
              About
            </Link>
            <Link href="#" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-24 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-slate-400/10 rounded-full blur-3xl -z-10" />

        <div className="max-w-4xl w-full space-y-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              The <span className="text-primary">Pulse</span> of LNMIIT
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Your seamless gateway to campus resources, faculty availability, and real-time academic collaboration.
            </p>
          </motion.div>

          {/* Cards for Role Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto mt-12">
            <Link href="/auth/login?type=student">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <GraduationCap className="w-8 h-8 text-slate-600 dark:text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Student Portal</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Access bookings & chat</p>
                  </div>
                  <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Login with Roll No <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </motion.div>
            </Link>

            <Link href="/auth/login?type=faculty">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 hover:border-slate-500/50 transition-all cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-slate-500/10 transition-colors">
                    <Users className="w-8 h-8 text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Faculty Portal</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage schedules & status</p>
                  </div>
                  <div className="mt-4 flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    Login via Department <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 text-left">
            {[
              { icon: Calendar, title: "Smart Booking", desc: "Conflict-free hall reservation system" },
              { icon: Users, title: "Faculty Matrix", desc: "Real-time availability tracking" },
              { icon: MessageSquare, title: "Academic Chat", desc: "Direct student-teacher messaging" }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                className="flex items-start gap-3 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <feature.icon className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">{feature.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <footer className="py-6 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500 dark:text-slate-400">
        © {new Date().getFullYear()} The LNM Institute of Information Technology. All rights reserved.
      </footer>
    </div>
  );
}
