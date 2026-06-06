import Student from '../models/Student.js';
import Company from '../models/Company.js';

export const getStats = async (req, res) => {
    const students = await Student.countDocuments();
    const companies = await Company.countDocuments();
    
    const selected = await Student.countDocuments({ status: 'Selected' });
    const rejected = await Student.countDocuments({ status: 'Rejected' });
    res.json({ 
        students, 
        companies, 
        selected, 
        rejected 
    });
};
 
