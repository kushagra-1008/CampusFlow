"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface Message {
    id: number;
    text: string;
    sender: "me" | "them";
    time: string;
    status: "sent" | "delivered" | "read";
}

interface SocketContextType {
    isConnected: boolean;
    messages: Message[];
    sendMessage: (text: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Hello Sir, I wanted to discuss the project requirements.", sender: "me", time: "10:00 AM", status: "read" },
        { id: 2, text: "Sure, come to my office at 2 PM.", sender: "them", time: "10:15 AM", status: "read" },
    ]);

    useEffect(() => {
        // Simulate connection delay
        const timer = setTimeout(() => {
            setIsConnected(true);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const sendMessage = (text: string) => {
        const newMessage: Message = {
            id: Date.now(),
            text,
            sender: "me",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: "sent"
        };

        setMessages(prev => [...prev, newMessage]);

        // Simulate server response/ack
        setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: "delivered" } : m));
        }, 1000);

        // Simulate reply
        if (text.toLowerCase().includes("hello") || text.toLowerCase().includes("hi")) {
            setTimeout(() => {
                const reply: Message = {
                    id: Date.now() + 1,
                    text: "Hi there! How can I help you?",
                    sender: "them",
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: "read"
                };
                setMessages(prev => [...prev, reply]);
            }, 3000);
        }
    };

    return (
        <SocketContext.Provider value={{ isConnected, messages, sendMessage }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
}
