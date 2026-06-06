const mongoose = require('mongoose');

const CandidateRoundStatusSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'A status must belong to a student'],
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'A status must reference the target company'],
  },
  roundId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Round',
    required: [true, 'A status must reference the specific interview round'],
  },
  attendance: {
    type: String,
    enum: ['Pending', 'Present', 'Absent'],
    default: 'Pending',
  },
  result: {
    type: String,
    enum: ['Pending', 'Cleared', 'Rejected'],
    default: 'Pending',
  },
  remarks: {
    type: String,
    trim: true,
    default: '',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// A student can only have a single progress tracker document per round
CandidateRoundStatusSchema.index({ studentId: 1, roundId: 1 }, { unique: true });

// Pre-save middleware to update the updatedAt timestamp
CandidateRoundStatusSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CandidateRoundStatus', CandidateRoundStatusSchema);
