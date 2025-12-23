import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, query, where, addDoc, writeBatch, onSnapshot } from "firebase/firestore";

export interface Hall {
    id: string; // "LT-1"
    name: string;
    capacity: number;
    type: string;
}

export interface Booking {
    id?: string;
    hallId: string;
    time: string;
    date: Date;
    userId: string;
    purpose: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    userName?: string; // Cache for display
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
                return newSnapshot.docs.map(d => d.data() as Hall).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
            }

            return snapshot.docs.map(d => d.data() as Hall).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
        } catch (error) {
            console.error("Error fetching halls:", error);
            throw error; // Re-throw to let UI handle it
        }
    },

    getTimeSlots: () => [
        "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
    ],

    // 2. Fetch Bookings for a Date (Real-time Listener)
    subscribeToBookings: (date: Date, callback: (bookings: Booking[]) => void) => {
        const dateStr = date.toISOString().split('T')[0];
        const q = query(
            collection(db, BOOKINGS_COLLECTION),
            where("dateStr", "==", dateStr)
        );

        // onSnapshot returns an unsubscribe function
        return onSnapshot(q, (snapshot) => {
            const bookings = snapshot.docs.map(d => d.data() as Booking);
            callback(bookings);
        });
    },

    // 2b. Fetch Bookings (One-time - Kept for reference or other uses)
    getBookingsForDate: async (date: Date): Promise<Booking[]> => {

        const dateStr = date.toISOString().split('T')[0];
        const q = query(
            collection(db, BOOKINGS_COLLECTION),
            where("dateStr", "==", dateStr)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => d.data() as Booking);
    },

    // 3. Check Availability (Single - Helper)
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
    bookSlot: async (booking: Omit<Booking, 'id' | 'status'>): Promise<{ success: boolean; message: string }> => {
        const dateStr = booking.date.toISOString().split('T')[0];

        // Optimistic check
        const isAvailable = await bookingService.checkAvailability(booking.hallId, booking.time, booking.date);

        if (!isAvailable) {
            return { success: false, message: "Slot already taken" };
        }

        try {
            await addDoc(collection(db, BOOKINGS_COLLECTION), {
                ...booking,
                status: 'Pending', // Default to Pending for approval workflow
                dateStr,
                createdAt: new Date().toISOString()
            });
            return { success: true, message: "Booking request sent! Waiting for approval." };
        } catch (error) {
            console.error("Booking error:", error);
            return { success: false, message: "Failed to book slot" };
        }
    },

    // 4. User Bookings (Student Dashboard)
    subscribeToUserBookings: (userId: string, callback: (bookings: Booking[]) => void) => {
        const q = query(
            collection(db, BOOKINGS_COLLECTION),
            where("userId", "==", userId)
        );
        return onSnapshot(q, (snapshot) => {
            const bookings = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
            // Sort by Date (newest first or future first could be complex without index, doing in JS)
            bookings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            callback(bookings);
        });
    },

    // 5. All Bookings (Teacher Dashboard)
    subscribeToAllBookings: (callback: (bookings: Booking[]) => void) => {
        const q = collection(db, BOOKINGS_COLLECTION);
        return onSnapshot(q, (snapshot) => {
            const bookings = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
            bookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Newest created/date
            callback(bookings);
        });
    },

    // 6. Approve/Reject
    updateBookingStatus: async (bookingId: string, status: 'Approved' | 'Rejected') => {
        try {
            await setDoc(doc(db, BOOKINGS_COLLECTION, bookingId), { status }, { merge: true });
            return true;
        } catch (e) {
            console.error("Error updating status", e);
            return false;
        }
    }
};

// Seeding Logic (Optimized with Batch)
const seedHalls = async () => {
    const batch = writeBatch(db);

    // LT-1 to LT-19
    for (let i = 1; i <= 19; i++) {
        const id = `LT-${i}`;
        const ref = doc(db, HALLS_COLLECTION, id);
        batch.set(ref, {
            id,
            name: `Lecture Theatre ${i}`,
            capacity: 150 + (i % 3) * 50,
            type: "Lecture Hall"
        });
    }

    // OAT
    const oatRef = doc(db, HALLS_COLLECTION, "OAT");
    batch.set(oatRef, {
        id: "OAT",
        name: "Open Air Theatre",
        capacity: 800,
        type: "Open Air"
    });

    await batch.commit();
};
