import { useEffect, useState } from "react";
import api from "../services/api";

export default function Students() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    api.get("/students").then((res) => setStudents(res.data));
  }, []);

  return (
    <div>
      <h1>Students</h1>

      {students.map((s) => (
        <div key={s._id}>
          {s.name} - {s.department}
        </div>
      ))}
    </div>
  );
}
