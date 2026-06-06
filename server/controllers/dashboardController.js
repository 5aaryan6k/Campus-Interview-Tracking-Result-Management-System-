const Student = require('../models/Student');
const Company = require('../models/Company');
const Round = require('../models/Round');
const CandidateRoundStatus = require('../models/CandidateRoundStatus');

// @desc    Get dashboard metrics and analysis
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    // 1. Overall student stats
    const totalStudents = await Student.countDocuments();
    const placedStudents = await Student.countDocuments({ status: 'Placed' });
    const inProgressStudents = await Student.countDocuments({ status: 'In-Progress' });
    const unplacedStudents = await Student.countDocuments({ status: 'Unplaced' });
    
    // Average Package
    const placedWithPackage = await Student.find({ status: 'Placed', packageLPA: { $ne: null } });
    const totalPackage = placedWithPackage.reduce((acc, curr) => acc + (curr.packageLPA || 0), 0);
    const avgPackage = placedWithPackage.length > 0 ? (totalPackage / placedWithPackage.length).toFixed(2) : 0;

    const placementRate = totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : 0;

    // 2. Department-wise breakdown
    // We can group students by department and count placement statuses
    const departmentsList = await Student.distinct('department');
    const deptStats = await Promise.all(
      departmentsList.map(async (dept) => {
        const total = await Student.countDocuments({ department: dept });
        const placed = await Student.countDocuments({ department: dept, status: 'Placed' });
        const inProgress = await Student.countDocuments({ department: dept, status: 'In-Progress' });
        const rate = total > 0 ? ((placed / total) * 100).toFixed(1) : 0;
        return {
          department: dept,
          total,
          placed,
          inProgress,
          placementRate: parseFloat(rate),
        };
      })
    );

    // 3. Company-wise breakdown
    const companies = await Company.find({});
    const companyStats = await Promise.all(
      companies.map(async (company) => {
        const placedCount = await Student.countDocuments({ placedCompanyId: company._id });
        const inProgressCount = await CandidateRoundStatus.distinct('studentId', {
          companyId: company._id,
          result: 'Pending',
        });
        return {
          companyName: company.name,
          jobRole: company.jobRole,
          packageLPA: company.packageLPA,
          placedCount,
          inProgressCount: inProgressCount.length,
        };
      })
    );

    // 4. Attendance Summary
    const attendanceStats = {
      Present: await CandidateRoundStatus.countDocuments({ attendance: 'Present' }),
      Absent: await CandidateRoundStatus.countDocuments({ attendance: 'Absent' }),
      Pending: await CandidateRoundStatus.countDocuments({ attendance: 'Pending' }),
    };

    // 5. Result Summary
    const resultStats = {
      Cleared: await CandidateRoundStatus.countDocuments({ result: 'Cleared' }),
      Rejected: await CandidateRoundStatus.countDocuments({ result: 'Rejected' }),
      Pending: await CandidateRoundStatus.countDocuments({ result: 'Pending' }),
    };

    // 6. Recent placements
    const recentPlacements = await Student.find({ status: 'Placed' })
      .populate('placedCompanyId', 'name')
      .sort({ updatedAt: -1 })
      .limit(5);

    // 7. Upcoming / Active rounds list
    const activeRounds = await Round.find({})
      .populate('companyId', 'name')
      .sort({ dateScheduled: 1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalStudents,
          placedStudents,
          inProgressStudents,
          unplacedStudents,
          placementRate: parseFloat(placementRate),
          avgPackage: parseFloat(avgPackage),
        },
        deptStats,
        companyStats,
        attendanceStats,
        resultStats,
        recentPlacements: recentPlacements.map(student => ({
          studentName: student.name,
          rollNumber: student.rollNumber,
          department: student.department,
          companyName: student.placedCompanyId ? student.placedCompanyId.name : 'Unknown',
          packageLPA: student.packageLPA,
        })),
        activeRounds: activeRounds.map(round => ({
          roundId: round._id,
          companyName: round.companyId ? round.companyId.name : 'Unknown',
          roundName: round.roundName,
          roundType: round.roundType,
          dateScheduled: round.dateScheduled,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
};
