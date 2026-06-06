import Student from '../models/Student.js';

export const getStudents = async (req, res) => {
    const data = await Student.find();
    res.json(data);
};

export const addStudent = async (req, res) => {
    const student = await Student.create(req.body);
    res.json(student);
};

export const updateStudent = async (req, res) => {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(student);
};

export const deleteStudent = async (req, res) => {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted' });
};


