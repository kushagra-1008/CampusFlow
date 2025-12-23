"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/services/userService";

export type UserRole = "Student" | "Teacher";

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    details?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string, portalRole?: UserRole) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem("campusflow_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string, portalRole?: UserRole) => {
        setIsLoading(true);
        const normalizedEmail = email.toLowerCase();

        // 1. Validate Password
        if (password !== "CampusFlow") {
            setIsLoading(false);
            throw new Error("Invalid password");
        }

        // 2. Validate Domain
        if (!normalizedEmail.endsWith("@lnmiit.ac.in")) {
            setIsLoading(false);
            throw new Error("Only @lnmiit.ac.in emails are allowed");
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 3. Dynamic Role Assignment
        // Priority: portalRole > email prefix > "Student"
        let role: UserRole = "Student";

        if (portalRole) {
            role = portalRole;
        } else if (normalizedEmail.startsWith("faculty@")) {
            role = "Teacher";
        }

        // 4. Create User Object
        // Anonymization: Use "Student X" or "Faculty Y" based on random ID or hash
        // For simplicity in this mock data generation, we'll use a random suffix
        const randomSuffix = Math.floor(Math.random() * 1000);
        const namePrefix = role === "Teacher" ? "Faculty" : "Student";

        const mockUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            name: `${namePrefix} ${randomSuffix}`,
            email: normalizedEmail,
            role,
            details: role === "Student" ? "Roll No: Pending" : "Dept: Pending" // Placeholder
        };

        // 5. Store in "Firestore" (Side Effect - Non-blocking)
        userService.saveUser(mockUser).catch(err => console.error("Background sync failed:", err));

        // 6. Set State & Persist Local
        setUser(mockUser);
        localStorage.setItem("campusflow_user", JSON.stringify(mockUser));
        setIsLoading(false);

        router.push("/dashboard");
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("campusflow_user");
        router.push("/");
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
