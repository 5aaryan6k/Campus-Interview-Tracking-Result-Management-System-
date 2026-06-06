import { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
    const [data, setData] = useState({ totalStudents: 0, totalCompanies: 0 });

    useEffect(() => {
        api.get('/dashboard/stats').then(res => setData(res.data));
    }, []);

    return (
        <div>
            <h2>Dashboard</h2>
            <p>Total Students: {data.totalStudents}</p>
            <p>Total Companies: {data.totalCompanies}</p>
            <p>Selected Students: {data.selectedStudents}</p>
            <p>Rejected Students: {data.rejectedStudents}</p>
        </div>
    );
}