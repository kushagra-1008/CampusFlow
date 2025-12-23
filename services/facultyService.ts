import { db } from "@/lib/firebase";
import { collection, getDocs, doc, writeBatch, query, where, DocumentData } from "firebase/firestore";

export interface Faculty {
    id: number;
    name: string;
    dept: string;
    email: string;
    status: "Available" | "Busy" | "In Class" | "Meeting";
    location: string;
    schedule?: string[]; // Simplified schedule for "View Schedule"
}

const FACULTY_COLLECTION = "faculty";

// Initial Seed Data
export const INITIAL_FACULTY: Omit<Faculty, "id">[] = [
    { name: "Faculty 1", dept: "CSE", email: "faculty1@lnmiit.ac.in", status: "Available", location: "LT-1", schedule: ["Mon 10:00 - LT-1", "Wed 14:00 - Lab-1"] },
    { name: "Faculty 2", dept: "CSE", email: "faculty2@lnmiit.ac.in", status: "Busy", location: "LT-2", schedule: ["Tue 09:00 - LT-2", "Thu 11:00 - LT-5"] },
    { name: "Faculty 3", dept: "HSS", email: "faculty3@lnmiit.ac.in", status: "Available", location: "LT-3", schedule: ["Fri 15:00 - LT-3"] },
    { name: "Faculty 4", dept: "ECE", email: "faculty4@lnmiit.ac.in", status: "In Class", location: "LT-5", schedule: ["Mon 08:00 - LT-5", "Wed 09:00 - LT-5"] },
    { name: "Faculty 5", dept: "Physics", email: "faculty5@lnmiit.ac.in", status: "Available", location: "LT-4", schedule: ["Tue 14:00 - LT-4"] },
    { name: "Faculty 6", dept: "Math", email: "faculty6@lnmiit.ac.in", status: "Busy", location: "LT-6", schedule: ["Mon 11:00 - LT-6", "Fri 10:00 - LT-6"] },
    { name: "Faculty 7", dept: "ECE", email: "faculty7@lnmiit.ac.in", status: "Meeting", location: "LT-7", schedule: ["Thu 16:00 - LT-7"] },
    { name: "Faculty 8", dept: "HSS", email: "faculty8@lnmiit.ac.in", status: "Available", location: "LT-8", schedule: ["Wed 12:00 - LT-8"] },
];

const seedFaculty = async () => {
    const batch = writeBatch(db);
    INITIAL_FACULTY.forEach((f, index) => {
        // Use email as ID for easier lookup or just random
        const docRef = doc(db, FACULTY_COLLECTION, `faculty_${index + 1}`);
        batch.set(docRef, { ...f, id: index + 1 });
    });
    await batch.commit();
    console.log("Faculty seeded successfully");
};

export const facultyService = {
    getAllFaculty: async (): Promise<Faculty[]> => {
        try {
            const facultyRef = collection(db, FACULTY_COLLECTION);
            const snapshot = await getDocs(facultyRef);

            if (snapshot.empty) {
                console.log("Seeding Faculty...");
                await seedFaculty();
                const newSnapshot = await getDocs(facultyRef);
                return newSnapshot.docs.map(d => d.data() as Faculty).sort((a, b) => a.id - b.id);
            }

            return snapshot.docs.map(d => d.data() as Faculty).sort((a, b) => a.id - b.id);
        } catch (error) {
            console.error("Error fetching faculty:", error);
            return [];
        }
    },

    searchFaculty: async (queryStr: string): Promise<Faculty[]> => {
        // Fetch all and filter client-side for simplicity with small dataset
        const allFaculty = await facultyService.getAllFaculty();
        if (!queryStr) return allFaculty;

        const lowerQuery = queryStr.toLowerCase();
        return allFaculty.filter(f =>
            f.name.toLowerCase().includes(lowerQuery) ||
            f.email.toLowerCase().includes(lowerQuery) ||
            f.dept.toLowerCase().includes(lowerQuery)
        );
    }
};
