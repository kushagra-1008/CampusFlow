export interface Faculty {
    id: number;
    name: string;
    dept: string;
    email: string;
    status: "Available" | "Busy" | "In Class" | "Meeting";
    location: string;
}

const FACULTY: Faculty[] = [
    { id: 1, name: "Dr. Anupam Singh", dept: "CSE", email: "anupam.singh@lnmiit.ac.in", status: "Available", location: "CSE-101" },
    { id: 2, name: "Prof. R P Gorthi", dept: "CSE", email: "rpg@lnmiit.ac.in", status: "Busy", location: "L-102" },
    { id: 3, name: "Dr. Preety Singh", dept: "HSS", email: "preety@lnmiit.ac.in", status: "Available", location: "HSS-203" },
    { id: 4, name: "Dr. Somnath Biswas", dept: "ECE", email: "somnath@lnmiit.ac.in", status: "In Class", location: "LT-5" },
    { id: 5, name: "Dr. Subhayan Biswas", dept: "Physics", email: "subhayan@lnmiit.ac.in", status: "Available", location: "PHY-LB" },
    { id: 6, name: "Dr. Usha Canoo", dept: "Math", email: "usha@lnmiit.ac.in", status: "Busy", location: "MATH-1" },
    { id: 7, name: "Dr. Sandeep Saini", dept: "ECE", email: "sandeep@lnmiit.ac.in", status: "Meeting", location: "Conf-1" },
    { id: 8, name: "Dr. Rajbir Kaur", dept: "HSS", email: "rajbir@lnmiit.ac.in", status: "Available", location: "HSS-Office" },
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
