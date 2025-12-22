import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, query, where, addDoc } from "firebase/firestore";

export interface Hall {
    id: string; // "LT-1"
    name: string;
    capacity: number;
    type: string;
}

export interface Booking {
    hallId: string;
    time: string;
    date: Date;
    userId: string;
}

const HALLS_COLLECTION = "halls";
const BOOKINGS_COLLECTION = "bookings";

export const bookingService = {
    // 1. Fetch Halls (with Auto-Seeding check)
    getHalls: async (): Promise<Hall[]> => {
        try {
            const snapshot = await getDocs(collection(db, HALLS_COLLECTION));

            if (snapshot.empty) {
                console.log("Seeding Database...");
                await seedHalls();
                // Fetch again after seed
                const newSnapshot = await getDocs(collection(db, HALLS_COLLECTION));
                return newSnapshot.docs.map(d => d.data() as Hall);
            }

            return snapshot.docs.map(d => d.data() as Hall).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
        } catch (error) {
            console.error("Error fetching halls:", error);
            return [];
        }
    },

    getTimeSlots: () => [
        "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
    ],

    // 2. Check Availability (Real Firestore Query)
    checkAvailability: async (hallId: string, time: string, date: Date): Promise<boolean> => {
        // Simplified: Check if any booking exists for this hall+time (ignoring date strictness for this prototype unless date is formatted string)
        // In real app, store date as ISO string "YYYY-MM-DD"
        const dateStr = date.toISOString().split('T')[0];

        const q = query(
            collection(db, BOOKINGS_COLLECTION),
            where("hallId", "==", hallId),
            where("time", "==", time),
            where("dateStr", "==", dateStr) // Assuming we save this field
        );
        const snapshot = await getDocs(q);
        return snapshot.empty;
    },

    // 3. Book Slot
    bookSlot: async (booking: Booking): Promise<{ success: boolean; message: string }> => {
        const dateStr = booking.date.toISOString().split('T')[0];

        // Optimistic check (Race conditions possible without Transaction, but acceptable for prototype)
        const isAvailable = await bookingService.checkAvailability(booking.hallId, booking.time, booking.date);

        if (!isAvailable) {
            return { success: false, message: "Slot already taken" };
        }

        try {
            await addDoc(collection(db, BOOKINGS_COLLECTION), {
                ...booking,
                dateStr, // Helper for querying
                createdAt: new Date().toISOString()
            });
            return { success: true, message: "Booking confirmed" };
        } catch (error) {
            console.error("Booking error:", error);
            return { success: false, message: "Failed to book slot" };
        }
    }
};

// Seeding Logic
const seedHalls = async () => {
    const batchPromises = [];

    // LT-1 to LT-19
    for (let i = 1; i <= 19; i++) {
        const id = `LT-${i}`;
        batchPromises.push(
            setDoc(doc(db, HALLS_COLLECTION, id), {
                id,
                name: `Lecture Theatre ${i}`,
                capacity: 150 + (i % 3) * 50,
                type: "Lecture Hall"
            })
        );
    }

    // OAT
    batchPromises.push(
        setDoc(doc(db, HALLS_COLLECTION, "OAT"), {
            id: "OAT",
            name: "Open Air Theatre",
            capacity: 800,
            type: "Open Air"
        })
    );

    await Promise.all(batchPromises);
};
