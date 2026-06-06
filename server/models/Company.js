import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
    name: String,
    role: String,
    package: String,
});

export default mongoose.model('Company', companySchema);
