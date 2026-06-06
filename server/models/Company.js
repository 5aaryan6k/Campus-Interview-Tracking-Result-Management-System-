const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add company name'],
    unique: true,
    trim: true,
  },
  jobRole: {
    type: String,
    required: [true, 'Please add the job role/profile'],
    trim: true,
  },
  packageLPA: {
    type: Number,
    required: [true, 'Please add the compensation package in LPA'],
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  minCGPA: {
    type: Number,
    required: [true, 'Please specify minimum CGPA required'],
    min: [0, 'CGPA criteria cannot be less than 0'],
    max: [10, 'CGPA criteria cannot be more than 10'],
    default: 0,
  },
  eligibleDepartments: {
    type: [String],
    required: [true, 'Please specify eligible departments/branches'],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Company', CompanySchema);
