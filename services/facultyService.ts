export interface Faculty {
    id: number;
    name: string;
    dept: string;
    email: string;
    status: "Available" | "Busy" | "In Class" | "Meeting";
    location: string;
}

const FACULTY: Faculty[] = [
    { id: 1, name: "Faculty 1", dept: "CSE", email: "faculty1@lnmiit.ac.in", status: "Available", location: "CSE-101" },
    { id: 2, name: "Faculty 2", dept: "CSE", email: "faculty2@lnmiit.ac.in", status: "Busy", location: "L-102" },
    { id: 3, name: "Faculty 3", dept: "HSS", email: "faculty3@lnmiit.ac.in", status: "Available", location: "HSS-203" },
    { id: 4, name: "Faculty 4", dept: "ECE", email: "faculty4@lnmiit.ac.in", status: "In Class", location: "LT-5" },
    { id: 5, name: "Faculty 5", dept: "Physics", email: "faculty5@lnmiit.ac.in", status: "Available", location: "PHY-LB" },
    { id: 6, name: "Faculty 6", dept: "Math", email: "faculty6@lnmiit.ac.in", status: "Busy", location: "MATH-1" },
    { id: 7, name: "Faculty 7", dept: "ECE", email: "faculty7@lnmiit.ac.in", status: "Meeting", location: "Conf-1" },
    { id: 8, name: "Faculty 8", dept: "HSS", email: "faculty8@lnmiit.ac.in", status: "Available", location: "HSS-Office" },
];

export const facultyService = {
    getAllFaculty: async (): Promise<Faculty[]> => {
        await new Promise(resolve => setTimeout(resolve, 600));
        return FACULTY;
    },

    searchFaculty: async (query: string): Promise<Faculty[]> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const lowerQuery = query.toLowerCase();
        return FACULTY.filter(f =>
            f.name.toLowerCase().includes(lowerQuery) ||
            f.email.toLowerCase().includes(lowerQuery) ||
            f.dept.toLowerCase().includes(lowerQuery)
        );
    }
};
