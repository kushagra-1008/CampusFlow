import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, query, where, addDoc, writeBatch, onSnapshot, deleteDoc } from "firebase/firestore";

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

// Helper to safely convert Firestore data to Booking type
const mapDocToBooking = (doc: any): Booking => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp to JS Date
        date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
    } as Booking;
};

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
            const bookings = snapshot.docs.map(mapDocToBooking);
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
        return snapshot.docs.map(mapDocToBooking);
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
    bookSlot: async (booking: Omit<Booking, 'id' | 'status'> & { userRole: string }): Promise<{ success: boolean; message: string }> => {
        const dateStr = booking.date.toISOString().split('T')[0];

        // Optimistic check
        const isAvailable = await bookingService.checkAvailability(booking.hallId, booking.time, booking.date);

        if (!isAvailable) {
            return { success: false, message: "Slot already taken" };
        }

        // Auto-approve if Faculty, otherwise Pending
        const initialStatus = booking.userRole === 'Teacher' ? 'Approved' : 'Pending';
        const message = initialStatus === 'Approved' ? "Booking confirmed!" : "Booking request sent! Waiting for approval.";

        try {
            // Remove userRole from the object before saving to Firestore (it's consistent with schema)
            const { userRole, ...bookingData } = booking;

            await addDoc(collection(db, BOOKINGS_COLLECTION), {
                ...bookingData,
                status: initialStatus,
                dateStr,
                createdAt: new Date().toISOString()
            });
            return { success: true, message };
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
            const bookings = snapshot.docs.map(mapDocToBooking);
            // Sort by Date (newest first or future first could be complex without index, doing in JS)
            bookings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            callback(bookings);
        });
    },

    // 5. All Bookings (Teacher Dashboard)
    subscribeToAllBookings: (callback: (bookings: Booking[]) => void) => {
        const q = collection(db, BOOKINGS_COLLECTION);
        return onSnapshot(q, (snapshot) => {
            const bookings = snapshot.docs.map(mapDocToBooking);
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
    },

    // 7. Delete Booking
    deleteBooking: async (bookingId: string) => {
        try {
            await deleteDoc(doc(db, BOOKINGS_COLLECTION, bookingId));
            return true;
        } catch (e) {
            console.error("Error deleting booking", e);
            return false;
        }
    },

    // 8. Update Booking Details (e.g. Purpose)
    updateBooking: async (bookingId: string, data: Partial<Booking>) => {
        try {
            await setDoc(doc(db, BOOKINGS_COLLECTION, bookingId), data, { merge: true });
            return true;
        } catch (e) {
            console.error("Error updating booking", e);
            return false;
        }
    }
};

// Helper to get next occurrence of a day (Mon=1, ... Sun=0/7)
const getNextDate = (dayName: string, timeStr: string): Date => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const targetDayIndex = days.indexOf(dayName);
    const today = new Date();
    const currentDayIndex = today.getDay();

    let daysUntil = targetDayIndex - currentDayIndex;
    if (daysUntil < 0) daysUntil += 7; // Next week
    // If today is the day but time passed? For simplicity, treat today as valid if created now.

    const nextDate = new Date();
    nextDate.setDate(today.getDate() + daysUntil);
    const [hours, minutes] = timeStr.split(':').map(Number);
    nextDate.setHours(hours, minutes, 0, 0);
    return nextDate;
}

import { INITIAL_FACULTY } from "./facultyService";

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
    console.log("Halls seeded.");

    // Seed Classes
    await seedClasses();
};

const seedClasses = async () => {
    console.log("Seeding initial faculty classes...");
    const batch = writeBatch(db);

    for (const faculty of INITIAL_FACULTY) {
        if (!faculty.schedule) continue;

        for (const slot of faculty.schedule) {
            // Format: "Mon 10:00 - LT-1"
            const parts = slot.split(" - ");
            if (parts.length < 2) continue;

            const location = parts[1].trim();
            // Only book valid halls
            if (!location.startsWith("LT-")) continue;

            const timeParts = parts[0].split(" "); // ["Mon", "10:00"]
            const dayName = timeParts[0];
            const time = timeParts[1];

            const date = getNextDate(dayName, time);
            const dateStr = date.toISOString().split('T')[0];

            // Construct a deterministic ID so we don't duplicate on re-runs usually
            // but for simple logic we'll just let Firestore geneate or simple hash
            const docRef = doc(collection(db, BOOKINGS_COLLECTION));

            batch.set(docRef, {
                hallId: location,
                time: time,
                date: date, // Firestore timestamp conversion handled by SDK? No, we need object or native date. SDK handles JS Date.
                dateStr: dateStr,
                userId: faculty.email,
                purpose: `Class: ${faculty.dept} Lecture`,
                status: 'Approved', // Auto-approved class
                userName: faculty.name,
                createdAt: new Date().toISOString()
            });
        }
    }

    await batch.commit();
    console.log("Classes seeded as bookings.");
}
