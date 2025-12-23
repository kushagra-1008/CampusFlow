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
        } else if (normalizedEmail.startsWith("faculty")) {
            // Fallback inference if portalRole not passed (though page.tsx passes it)
            role = "Teacher";
        }

        // 3b. Verify Faculty & Student Email Allowlist
        if (role === "Teacher") {
            const allowedFaculty = [
                "faculty1@lnmiit.ac.in", "faculty2@lnmiit.ac.in", "faculty3@lnmiit.ac.in",
                "faculty4@lnmiit.ac.in", "faculty5@lnmiit.ac.in", "faculty6@lnmiit.ac.in",
                "faculty7@lnmiit.ac.in", "faculty8@lnmiit.ac.in"
            ];

            if (!allowedFaculty.includes(normalizedEmail)) {
                setIsLoading(false);
                throw new Error("Access Denied: This email is not authorized for Faculty Portal.");
            }
        } else {
            // Student Role Strict Check
            const allowedStudents = Array.from({ length: 20 }, (_, i) => `student${i + 1}@lnmiit.ac.in`);
            if (!allowedStudents.includes(normalizedEmail)) {
                setIsLoading(false);
                throw new Error("Access Denied: Only student1-20@lnmiit.ac.in are allowed.");
            }
        }

        // 4. Create User Object
        // Extracts "student1" from "student1@lnmiit.ac.in" and capitalizes it -> "Student1"
        const emailPrefix = normalizedEmail.split('@')[0];
        const displayName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

        const mockUser: User = {
            id: normalizedEmail, // Use email as consistent ID
            name: displayName,
            email: normalizedEmail,
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
