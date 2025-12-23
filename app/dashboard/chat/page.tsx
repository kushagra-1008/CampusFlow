"use client";

import { useState } from "react";
import { Search, Send, MoreVertical, Phone, Video, Paperclip, Check, CheckCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSocket, Message } from "@/context/SocketContext";

// Mock Contacts (Static for now, could be service driven)
// Mock Contacts (Static for now, could be service driven)
const CONTACTS = [
    { id: 1, name: "Faculty 1", role: "Faculty", lastMsg: "Please submit the report by Friday.", time: "10:30 AM", unread: 2, status: "online" },
    { id: 2, name: "Student 1", role: "Student", lastMsg: "Sir, is the LT-4 available?", time: "Yesterday", unread: 0, status: "offline" },
    { id: 3, name: "Faculty 2", role: "Faculty", lastMsg: "Confirmed. See you then.", time: "Mon", unread: 0, status: "online" },
    { id: 4, name: "Coding Club", role: "Group", lastMsg: "Event starts at 6 PM!", time: "Sun", unread: 5, status: "online" },
];

export default function ChatPage() {
    const [selectedContact, setSelectedContact] = useState(CONTACTS[0]);
    const [messageInput, setMessageInput] = useState("");
    const { messages, sendMessage, isConnected } = useSocket();

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim()) return;
        sendMessage(messageInput);
        setMessageInput("");
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            {/* Sidebar - Contacts */}
            <div className="w-80 border-r border-slate-200 dark:border-slate-700 flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border-none text-sm focus:ring-1 focus:ring-primary outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {CONTACTS.map((contact) => (
                        <div
                            key={contact.id}
                            onClick={() => setSelectedContact(contact)}
                            className={cn(
                                "p-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors border-l-4",
                                selectedContact.id === contact.id ? "bg-slate-50 dark:bg-slate-700/50 border-primary" : "border-transparent"
                            )}
                        >
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                                    {contact.name[0]}
                                </div>
                                {contact.status === "online" && (
                                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800"></span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-medium text-sm text-slate-900 dark:text-white truncate">{contact.name}</h3>
                                    <span className="text-xs text-slate-400">{contact.time}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-slate-500 truncate">{contact.lastMsg}</p>
                                    {contact.unread > 0 && (
                                        <span className="min-w-[1.25rem] h-5 px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                                            {contact.unread}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
                <header className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center font-bold">
                            {selectedContact.name[0]}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">{selectedContact.name}</h3>
                            <p className="text-xs text-emerald-600 flex items-center gap-1">
                                {isConnected ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> : <Loader2 className="w-3 h-3 animate-spin" />}
                                {isConnected ? "Online (Socket Connected)" : "Connecting..."}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"><Phone className="w-5 h-5" /></button>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"><Video className="w-5 h-5" /></button>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"><MoreVertical className="w-5 h-5" /></button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex w-full",
                                msg.sender === "me" ? "justify-end" : "justify-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "max-w-[70%] px-4 py-3 rounded-2xl shadow-sm",
                                    msg.sender === "me"
                                        ? "bg-primary text-white rounded-tr-none"
                                        : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none border border-slate-200 dark:border-slate-700"
                                )}
                            >
                                <p className="text-sm">{msg.text}</p>
                                <div className={cn(
                                    "text-[10px] bg-transparent mt-1 flex items-center justify-end gap-1",
                                    msg.sender === "me" ? "text-primary-foreground/70" : "text-slate-400"
                                )}>
                                    {msg.time}
                                    {msg.sender === "me" && (
                                        msg.status === "read" ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                    <form onSubmit={handleSend} className="flex items-center gap-2">
                        <button type="button" className="p-2 text-slate-400 hover:text-primary transition-colors">
                            <Paperclip className="w-5 h-5" />
                        </button>
                        <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder="Type your message..."
                            disabled={!isConnected}
                            className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-full border border-transparent focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-primary outline-none transition-all disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={!messageInput.trim() || !isConnected}
                            className="p-2 bg-primary text-white rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
