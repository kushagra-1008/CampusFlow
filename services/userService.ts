import { User } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const userService = {
    saveUser: async (user: User): Promise<void> => {
        try {
            const userRef = doc(db, "users", user.id);
            // Storing essential user data + last login
            await setDoc(userRef, {
                email: user.email,
                role: user.role,
                name: user.name,
                // Store conditional details based on role
                ...(user.role === "Student" ? { rollNumber: user.details } : {}),
                ...(user.role === "Teacher" ? { department: user.details } : {}),
                lastLogin: new Date().toISOString()
            }, { merge: true });
        } catch (error) {
            console.error("Error saving user to Firestore:", error);
            // Fail gracefully (maybe connectivity issue), app can still run locally context
        }
    },

    getUser: async (id: string): Promise<User | null> => {
        try {
            const userRef = doc(db, "users", id);
            const snapshot = await getDoc(userRef);
            if (snapshot.exists()) {
                const data = snapshot.data();
                return {
                    id: snapshot.id,
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    details: data.rollNumber || data.department
                };
            }
            return null;
        } catch (error) {
            console.error("Error fetching user:", error);
            return null;
        }
    }
};
