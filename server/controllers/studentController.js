const Student = require('../models/Student');
const CandidateRoundStatus = require('../models/CandidateRoundStatus');

// @desc    Get all students (with search and filtering)
// @route   GET /api/students
// @access  Private
const getStudents = async (req, res) => {
  try {
    const { search, department, status, minCgpa, maxCgpa } = req.query;
    let query = {};

    // Search query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by department
    if (department) {
      query.department = department;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by CGPA range
    if (minCgpa || maxCgpa) {
      query.cgpa = {};
      if (minCgpa) query.cgpa.$gte = Number(minCgpa);
      if (maxCgpa) query.cgpa.$lte = Number(maxCgpa);
    }

    const students = await Student.find(query).populate('placedCompanyId', 'name jobRole packageLPA');
    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single student details
// @route   GET /api/students/:id
// @access  Private
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('placedCompanyId', 'name jobRole packageLPA');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Fetch placement rounds history
    const roundHistory = await CandidateRoundStatus.find({ studentId: student._id })
      .populate('companyId', 'name jobRole packageLPA')
      .populate('roundId', 'roundName sequenceOrder roundType');

    res.status(200).json({ success: true, data: { student, roundHistory } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new student
// @route   POST /api/students
// @access  Private
const createStudent = async (req, res) => {
  try {
    const { rollNumber, name, email, department, cgpa, resumeUrl } = req.body;

    if (!rollNumber || !name || !email || !department || cgpa === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Check if rollNumber is unique
    const rollExists = await Student.findOne({ rollNumber });
    if (rollExists) {
      return res.status(400).json({ success: false, message: 'Student with this roll number already exists' });
    }

    // Check if email is unique
    const emailExists = await Student.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Student with this email already exists' });
    }

    const student = await Student.create({
      rollNumber,
      name,
      email,
      department,
      cgpa,
      resumeUrl: resumeUrl || '',
    });

    res.status(201).json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update student profile
// @route   PUT /api/students/:id
// @access  Private
const updateStudent = async (req, res) => {
  try {
    const { rollNumber, name, email, department, cgpa, resumeUrl, status, placedCompanyId, packageLPA } = req.body;

    let student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // If changing roll number, ensure uniqueness
    if (rollNumber && rollNumber !== student.rollNumber) {
      const rollExists = await Student.findOne({ rollNumber });
      if (rollExists) {
        return res.status(400).json({ success: false, message: 'Roll number already in use' });
      }
      student.rollNumber = rollNumber;
    }

    // If changing email, ensure uniqueness
    if (email && email !== student.email) {
      const emailExists = await Student.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      student.email = email;
    }

    // Apply basic updates
    if (name) student.name = name;
    if (department) student.department = department;
    if (cgpa !== undefined) student.cgpa = cgpa;
    if (resumeUrl !== undefined) student.resumeUrl = resumeUrl;

    // Apply status-specific logic
    if (status) {
      if (status === 'Placed') {
        if (!placedCompanyId || packageLPA === undefined) {
          return res.status(400).json({
            success: false,
            message: 'To mark a student as Placed, you must specify the company ID and package in LPA',
          });
        }
        student.status = 'Placed';
        student.placedCompanyId = placedCompanyId;
        student.packageLPA = packageLPA;
      } else {
        // If transitioning away from Placed
        student.status = status;
        student.placedCompanyId = null;
        student.packageLPA = null;
      }
    }

    await student.save();
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a student and cascade clear participation records
// @route   DELETE /api/students/:id
// @access  Private
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Remove status entries
    await CandidateRoundStatus.deleteMany({ studentId: student._id });

    // Remove student
    await Student.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Student and related round history deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
