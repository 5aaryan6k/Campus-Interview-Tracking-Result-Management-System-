const mongoose = require('mongoose');

const RoundSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'A round must belong to a company'],
  },
  roundName: {
    type: String,
    required: [true, 'Please add round name'],
    trim: true,
  },
  sequenceOrder: {
    type: Number,
    required: [true, 'Please specify the sequence order (e.g. 1, 2, 3)'],
  },
  roundType: {
    type: String,
    required: [true, 'Please specify the round type'],
    enum: ['Aptitude', 'Coding', 'GD', 'Technical', 'HR'],
  },
  dateScheduled: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// A company cannot have duplicate sequence numbers for its rounds
RoundSchema.index({ companyId: 1, sequenceOrder: 1 }, { unique: true });

module.exports = mongoose.model('Round', RoundSchema);
