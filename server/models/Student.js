import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    name: String,
    email: String,
    department: String,
    cgpa: Number,
    status: {
        type: String,
        default: 'pending',
    },
});   

export default mongoose.model('Student', studentSchema);
