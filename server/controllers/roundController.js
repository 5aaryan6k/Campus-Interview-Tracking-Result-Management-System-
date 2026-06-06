const Round = require('../models/Round');
const Company = require('../models/Company');
const Student = require('../models/Student');
const CandidateRoundStatus = require('../models/CandidateRoundStatus');

// @desc    Get candidates in a round and eligible candidates to be registered
// @route   GET /api/rounds/:roundId/candidates
// @access  Private
const getRoundCandidates = async (req, res) => {
  try {
    const round = await Round.findById(req.params.roundId);
    if (!round) {
      return res.status(404).json({ success: false, message: 'Round not found' });
    }

    const company = await Company.findById(round.companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Associated company not found' });
    }

    // 1. Get already registered candidates
    const registeredStatuses = await CandidateRoundStatus.find({ roundId: round._id })
      .populate('studentId', 'rollNumber name email department cgpa status');
    
    const registeredIds = registeredStatuses.map(status => status.studentId._id.toString());

    // 2. Find eligible candidates
    let eligibleStudents = [];

    if (round.sequenceOrder === 1) {
      // Round 1 eligibility:
      // - Must not be Placed
      // - CGPA >= company.minCGPA
      // - Department is in company.eligibleDepartments
      // - Not already registered
      eligibleStudents = await Student.find({
        status: { $ne: 'Placed' },
        cgpa: { $gte: company.minCGPA },
        department: { $in: company.eligibleDepartments },
        _id: { $nin: registeredIds },
      });
    } else {
      // Round N eligibility:
      // - Must find previous round of the same company (sequenceOrder - 1)
      const prevRound = await Round.findOne({
        companyId: company._id,
        sequenceOrder: round.sequenceOrder - 1,
      });

      if (!prevRound) {
        return res.status(400).json({
          success: false,
          message: `Cannot find previous round (Sequence: ${round.sequenceOrder - 1}) for eligibility check.`,
        });
      }

      // - Must have 'Present' and 'Cleared' in the previous round
      const clearedPrevStatuses = await CandidateRoundStatus.find({
        roundId: prevRound._id,
        attendance: 'Present',
        result: 'Cleared',
      });

      const clearedStudentIds = clearedPrevStatuses.map(status => status.studentId.toString());

      eligibleStudents = await Student.find({
        _id: { $in: clearedStudentIds, $nin: registeredIds },
        status: { $ne: 'Placed' }, // Exclude if they got placed in another company in the meantime
      });
    }

    res.status(200).json({
      success: true,
      data: {
        registered: registeredStatuses,
        eligible: eligibleStudents,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register multiple eligible candidates for a round
// @route   POST /api/rounds/:roundId/candidates/register
// @access  Private
const registerCandidates = async (req, res) => {
  try {
    const { studentIds } = req.body;
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of studentIds' });
    }

    const round = await Round.findById(req.params.roundId);
    if (!round) {
      return res.status(404).json({ success: false, message: 'Round not found' });
    }

    const company = await Company.findById(round.companyId);
    
    // Register each student after checking eligibility
    const creationPromises = studentIds.map(async (studentId) => {
      // 1. Check if already registered
      const existing = await CandidateRoundStatus.findOne({ studentId, roundId: round._id });
      if (existing) return null;

      // 2. Validate eligibility
      const student = await Student.findById(studentId);
      if (!student || student.status === 'Placed') return null;

      if (round.sequenceOrder === 1) {
        const isEligibleDept = company.eligibleDepartments.includes(student.department);
        const isEligibleCgpa = student.cgpa >= company.minCGPA;
        if (!isEligibleDept || !isEligibleCgpa) return null;
      } else {
        // Must check previous round
        const prevRound = await Round.findOne({
          companyId: company._id,
          sequenceOrder: round.sequenceOrder - 1,
        });
        if (!prevRound) return null;

        const prevStatus = await CandidateRoundStatus.findOne({
          studentId,
          roundId: prevRound._id,
          attendance: 'Present',
          result: 'Cleared',
        });
        if (!prevStatus) return null;
      }

      // 3. Create status
      const newStatus = await CandidateRoundStatus.create({
        studentId,
        companyId: company._id,
        roundId: round._id,
        attendance: 'Pending',
        result: 'Pending',
      });

      // 4. Update student status to 'In-Progress' if currently 'Unplaced'
      if (student.status === 'Unplaced') {
        student.status = 'In-Progress';
        await student.save();
      }

      return newStatus;
    });

    const results = await Promise.all(creationPromises);
    const createdCount = results.filter(r => r !== null).length;

    res.status(201).json({
      success: true,
      message: `Successfully registered ${createdCount} candidates.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Record attendance in bulk for a round
// @route   POST /api/rounds/:roundId/attendance
// @access  Private
const recordAttendance = async (req, res) => {
  try {
    const { attendanceData } = req.body; // Array of { studentId, attendance }
    if (!attendanceData || !Array.isArray(attendanceData)) {
      return res.status(400).json({ success: false, message: 'Please provide attendanceData array' });
    }

    const round = await Round.findById(req.params.roundId);
    if (!round) {
      return res.status(404).json({ success: false, message: 'Round not found' });
    }

    const updatePromises = attendanceData.map(async (item) => {
      const { studentId, attendance } = item;
      if (!['Pending', 'Present', 'Absent'].includes(attendance)) return null;

      let statusRecord = await CandidateRoundStatus.findOne({ studentId, roundId: round._id });
      if (!statusRecord) return null;

      statusRecord.attendance = attendance;

      // Business Rule: If student is marked Absent, result must be marked Rejected
      if (attendance === 'Absent') {
        statusRecord.result = 'Rejected';
      }

      await statusRecord.save();
      return statusRecord;
    });

    await Promise.all(updatePromises);

    res.status(200).json({ success: true, message: 'Attendance updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Record results in bulk for a round (handles placement transitions)
// @route   POST /api/rounds/:roundId/results
// @access  Private
const recordResults = async (req, res) => {
  try {
    const { resultData } = req.body; // Array of { studentId, result, remarks }
    if (!resultData || !Array.isArray(resultData)) {
      return res.status(400).json({ success: false, message: 'Please provide resultData array' });
    }

    const round = await Round.findById(req.params.roundId);
    if (!round) {
      return res.status(404).json({ success: false, message: 'Round not found' });
    }

    const company = await Company.findById(round.companyId);

    // Find if this is the final round of the company
    const totalRoundsCount = await Round.countDocuments({ companyId: round.companyId });
    const isFinalRound = (round.sequenceOrder === totalRoundsCount);

    const updatePromises = resultData.map(async (item) => {
      const { studentId, result, remarks } = item;
      if (!['Pending', 'Cleared', 'Rejected'].includes(result)) return null;

      let statusRecord = await CandidateRoundStatus.findOne({ studentId, roundId: round._id });
      if (!statusRecord) return null;

      // Business Rule: Student must be Present to be marked Cleared
      if (result === 'Cleared' && statusRecord.attendance !== 'Present') {
        return { error: `Student cannot be marked Cleared unless attendance is recorded as Present.` };
      }

      statusRecord.result = result;
      if (remarks !== undefined) statusRecord.remarks = remarks;
      await statusRecord.save();

      const student = await Student.findById(studentId);
      if (!student) return null;

      if (result === 'Cleared' && isFinalRound) {
        // Business Rule: Offer Received! Update student placement status.
        student.status = 'Placed';
        student.placedCompanyId = company._id;
        student.packageLPA = company.packageLPA;
        await student.save();

        // Business Rule: Once placed, withdraw the student from all other pending processes
        // By marking them Rejected or withdrawing. Let's mark other pending rounds as Rejected
        // with remark "Withdrawn: Placed in another company".
        await CandidateRoundStatus.updateMany(
          {
            studentId: student._id,
            roundId: { $ne: round._id },
            result: 'Pending',
          },
          {
            $set: {
              result: 'Rejected',
              remarks: `Withdrawn: Placed at ${company.name} (${company.packageLPA} LPA)`,
            },
          }
        );
      } else if (result === 'Rejected') {
        // If rejected, check if student is still active in ANY OTHER company processes
        // A process is active if there is a CandidateRoundStatus for this student where result is 'Pending'
        const activeProcesses = await CandidateRoundStatus.findOne({
          studentId: student._id,
          result: 'Pending',
        });

        // If no active pending rounds anywhere else, and student is currently 'In-Progress', revert to 'Unplaced'
        if (!activeProcesses && student.status === 'In-Progress') {
          student.status = 'Unplaced';
          await student.save();
        }
      }

      return statusRecord;
    });

    const outcomes = await Promise.all(updatePromises);
    const errors = outcomes.filter(o => o && o.error).map(o => o.error);

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    res.status(200).json({ success: true, message: 'Results and student placements updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getRoundCandidates,
  registerCandidates,
  recordAttendance,
  recordResults,
};
