const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    required: [true, 'Please add a roll number/student ID'],
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Please add student name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add student email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
    lowercase: true,
    trim: true,
  },
  department: {
    type: String,
    required: [true, 'Please add a department/branch'],
    trim: true,
  },
  cgpa: {
    type: Number,
    required: [true, 'Please add CGPA'],
    min: [0, 'CGPA cannot be less than 0'],
    max: [10, 'CGPA cannot be more than 10'],
  },
  resumeUrl: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['Unplaced', 'In-Progress', 'Placed'],
    default: 'Unplaced',
  },
  placedCompanyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null,
  },
  packageLPA: {
    type: Number,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Student', StudentSchema);
