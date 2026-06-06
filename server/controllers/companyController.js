const Company = require('../models/Company');
const Round = require('../models/Round');
const CandidateRoundStatus = require('../models/CandidateRoundStatus');
const Student = require('../models/Student');

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private
const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find({});
    
    // Enrich companies with round counts and current placements counts
    const enrichedCompanies = await Promise.all(
      companies.map(async (company) => {
        const roundCount = await Round.countDocuments({ companyId: company._id });
        const placedCount = await Student.countDocuments({ placedCompanyId: company._id });
        
        return {
          ...company.toObject(),
          roundCount,
          placedCount,
        };
      })
    );

    res.status(200).json({ success: true, count: enrichedCompanies.length, data: enrichedCompanies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single company (with its rounds sorted by sequenceOrder)
// @route   GET /api/companies/:id
// @access  Private
const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const rounds = await Round.find({ companyId: company._id }).sort({ sequenceOrder: 1 });
    const placedCount = await Student.countDocuments({ placedCompanyId: company._id });

    res.status(200).json({
      success: true,
      data: {
        company,
        rounds,
        placedCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a company (and optionally its rounds)
// @route   POST /api/companies
// @access  Private
const createCompany = async (req, res) => {
  try {
    const { name, jobRole, packageLPA, description, minCGPA, eligibleDepartments, rounds } = req.body;

    if (!name || !jobRole || packageLPA === undefined || !eligibleDepartments) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Check unique company name
    const companyExists = await Company.findOne({ name });
    if (companyExists) {
      return res.status(400).json({ success: false, message: 'Company with this name already exists' });
    }

    const company = await Company.create({
      name,
      jobRole,
      packageLPA,
      description: description || '',
      minCGPA: minCGPA || 0,
      eligibleDepartments,
    });

    let createdRounds = [];
    if (rounds && Array.isArray(rounds) && rounds.length > 0) {
      // Validate rounds data
      // Check sequence duplicate
      const sequenceNumbers = rounds.map(r => Number(r.sequenceOrder));
      const duplicates = sequenceNumbers.filter((item, index) => sequenceNumbers.indexOf(item) !== index);
      if (duplicates.length > 0) {
        // Rollback created company
        await Company.findByIdAndDelete(company._id);
        return res.status(400).json({ success: false, message: 'Duplicate sequence orders are not allowed in rounds list' });
      }

      // Create rounds
      const roundsPayload = rounds.map((round) => ({
        companyId: company._id,
        roundName: round.roundName,
        sequenceOrder: Number(round.sequenceOrder),
        roundType: round.roundType,
        dateScheduled: round.dateScheduled || Date.now(),
      }));

      createdRounds = await Round.insertMany(roundsPayload);
    }

    res.status(201).json({
      success: true,
      data: {
        company,
        rounds: createdRounds,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update company details
// @route   PUT /api/companies/:id
// @access  Private
const updateCompany = async (req, res) => {
  try {
    const { name, jobRole, packageLPA, description, minCGPA, eligibleDepartments } = req.body;

    let company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    // Uniqueness checks on name change
    if (name && name !== company.name) {
      const nameExists = await Company.findOne({ name });
      if (nameExists) {
        return res.status(400).json({ success: false, message: 'Company name already in use' });
      }
      company.name = name;
    }

    if (jobRole) company.jobRole = jobRole;
    if (packageLPA !== undefined) company.packageLPA = packageLPA;
    if (description !== undefined) company.description = description;
    if (minCGPA !== undefined) company.minCGPA = minCGPA;
    if (eligibleDepartments) company.eligibleDepartments = eligibleDepartments;

    await company.save();
    res.status(200).json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete company (with rounds and student status cleanups)
// @route   DELETE /api/companies/:id
// @access  Private
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    // Cascade clear: rounds associated with this company
    const rounds = await Round.find({ companyId: company._id });
    const roundIds = rounds.map(r => r._id);

    // Clear candidate status entries
    await CandidateRoundStatus.deleteMany({ companyId: company._id });

    // Clear Round documents
    await Round.deleteMany({ companyId: company._id });

    // Release placed students back to 'Unplaced'
    await Student.updateMany(
      { placedCompanyId: company._id },
      { $set: { status: 'Unplaced', placedCompanyId: null, packageLPA: null } }
    );

    // Delete company
    await Company.findByIdAndDelete(company._id);

    res.status(200).json({ success: true, message: 'Company, its rounds, candidate statuses, and placements reverted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
};
