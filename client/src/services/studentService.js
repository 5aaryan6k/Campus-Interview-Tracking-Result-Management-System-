import api from "./api";

export const getStudents = () => api.get('/students');
export const addStudent = (student) => api.post('/students', student);
