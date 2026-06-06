import React, { useEffect, useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, X, PlusCircle, ArrowRight, ClipboardList, Briefcase, GraduationCap } from 'lucide-react';

const Companies = () => {
  const {
    companies,
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    loadingData,
  } = useAppData();

  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    jobRole: '',
    packageLPA: '',
    description: '',
    minCGPA: '0',
    eligibleDepartments: [],
  });

  // Dynamic rounds sub-form (only for new company creation)
  const [rounds, setRounds] = useState([
    { roundName: 'Aptitude Test', sequenceOrder: 1, roundType: 'Aptitude' },
  ]);

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDeptToggle = (dept) => {
    const isSelected = formData.eligibleDepartments.includes(dept);
    if (isSelected) {
      setFormData({
        ...formData,
        eligibleDepartments: formData.eligibleDepartments.filter((d) => d !== dept),
      });
    } else {
      setFormData({
        ...formData,
        eligibleDepartments: [...formData.eligibleDepartments, dept],
      });
    }
  };

  // Add a round row in the form
  const addRoundRow = () => {
    const nextSeq = rounds.length + 1;
    setRounds([
      ...rounds,
      { roundName: `Round ${nextSeq}`, sequenceOrder: nextSeq, roundType: 'Technical' },
    ]);
  };

  // Remove a round row
  const removeRoundRow = (index) => {
    if (rounds.length === 1) return;
    const filtered = rounds.filter((_, idx) => idx !== index);
    // Recalculate sequence orders
    const updated = filtered.map((r, idx) => ({
      ...r,
      sequenceOrder: idx + 1,
    }));
    setRounds(updated);
  };

  // Handle changes in dynamic round entries
  const handleRoundRowChange = (index, field, value) => {
    const updated = rounds.map((r, idx) => {
      if (idx === index) {
        return { ...r, [field]: value };
      }
      return r;
    });
    setRounds(updated);
  };

  const openAddModal = () => {
    setIsEdit(false);
    setSelectedCompanyId(null);
    setFormData({
      name: '',
      jobRole: '',
      packageLPA: '',
      description: '',
      minCGPA: '6.0',
      eligibleDepartments: ['CSE', 'IT', 'ECE'],
    });
    setRounds([
      { roundName: 'Aptitude Test', sequenceOrder: 1, roundType: 'Aptitude' },
      { roundName: 'Technical Interview', sequenceOrder: 2, roundType: 'Technical' },
      { roundName: 'HR Round', sequenceOrder: 3, roundType: 'HR' },
    ]);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const openEditModal = (e, company) => {
    e.stopPropagation(); // Avoid triggering card navigation
    setIsEdit(true);
    setSelectedCompanyId(company._id);
    setFormData({
      name: company.name,
      jobRole: company.jobRole,
      packageLPA: company.packageLPA,
      description: company.description || '',
      minCGPA: company.minCGPA,
      eligibleDepartments: company.eligibleDepartments,
    });
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name || !formData.jobRole || formData.packageLPA === '' || formData.eligibleDepartments.length === 0) {
      setErrorMessage('Please fill in all required fields and select at least one eligible department');
      return;
    }

    const pkgVal = parseFloat(formData.packageLPA);
    const cgpaVal = parseFloat(formData.minCGPA);

    if (isNaN(pkgVal) || pkgVal <= 0) {
      setErrorMessage('Package must be a valid number greater than 0');
      return;
    }

    if (isNaN(cgpaVal) || cgpaVal < 0 || cgpaVal > 10) {
      setErrorMessage('Minimum CGPA criteria must be between 0.0 and 10.0');
      return;
    }

    const payload = {
      ...formData,
      packageLPA: pkgVal,
      minCGPA: cgpaVal,
    };

    if (!isEdit) {
      // Adding rounds only during creation
      // Check sequence constraints
      payload.rounds = rounds;
    }

    let result;
    if (isEdit) {
      result = await updateCompany(selectedCompanyId, payload);
    } else {
      result = await createCompany(payload);
    }

    if (result.success) {
      setIsModalOpen(false);
    } else {
      setErrorMessage(result.message || 'Operation failed');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this company? This will delete all its interview stages, candidate statuses, and reset placements associated with this company.')) {
      const result = await deleteCompany(id);
      if (!result.success) {
        alert(result.message);
      }
    }
  };

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.jobRole.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Companies</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Configure job profiles, set eligibility parameters, and track recruitment sequences.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} />
          Register Company Drive
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-card" style={{ padding: '16px' }}>
        <div style={{ position: 'relative', maxWidth: '480px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company name or role..."
            className="form-control"
            style={{ width: '100%', paddingLeft: '42px' }}
          />
        </div>
      </div>

      {/* Companies Cards Grid */}
      {loadingData && companies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading companies list...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {filteredCompanies.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No companies drives registered.
            </div>
          ) : (
            filteredCompanies.map((company) => (
              <div
                key={company._id}
                className="glass-card"
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onClick={() => navigate(`/companies/${company._id}`)}
              >
                {/* Visual badge top right */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '6px 14px',
                    borderBottomLeftRadius: 'var(--radius-sm)',
                  }}
                >
                  {company.packageLPA} LPA
                </div>

                <div>
                  <h3 style={{ fontSize: '1.25rem', paddingRight: '70px' }}>{company.name}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <Briefcase size={12} /> {company.jobRole}
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4', minHeight: '40px' }}>
                  {company.description ? (company.description.length > 100 ? `${company.description.substring(0, 100)}...` : company.description) : 'No description provided.'}
                </p>

                {/* Eligibility criteria */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Min CGPA Cutoff: </span>
                    <strong style={{ color: 'white' }}>{company.minCGPA.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>Branches: </span>
                    <strong style={{ color: 'white' }}>{company.eligibleDepartments.join(', ')}</strong>
                  </div>
                </div>

                {/* Performance stats */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: 'auto' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                    <ClipboardList size={14} /> {company.roundCount} Rounds
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontWeight: 600 }}>
                    <GraduationCap size={14} /> {company.placedCount} Offers
                  </span>
                </div>

                {/* Admin operations */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <button
                    className="btn btn-secondary btn-icon"
                    title="Edit Drive details"
                    onClick={(e) => openEditModal(e, company)}
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    className="btn btn-secondary btn-icon"
                    style={{ color: 'var(--danger)' }}
                    title="Delete Drive"
                    onClick={(e) => handleDelete(e, company._id)}
                  >
                    <Trash2 size={12} />
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '6px 12px', fontSize: '0.75rem', marginLeft: 'auto' }}
                  >
                    Manage Pipeline
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add / Edit Company Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem' }}>{isEdit ? 'Edit Drive Parameters' : 'Register Recruitment Drive'}</h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {errorMessage && (
                  <div
                    style={{
                      background: 'var(--danger-glow)',
                      color: 'var(--danger)',
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '16px',
                      fontSize: '0.85rem',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                    }}
                  >
                    {errorMessage}
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Company Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="e.g. Google India"
                      className="form-control"
                      disabled={isEdit}
                    />
                  </div>
                  <div className="form-group">
                    <label>Job Profile / Role *</label>
                    <input
                      type="text"
                      name="jobRole"
                      value={formData.jobRole}
                      onChange={handleFormChange}
                      placeholder="e.g. Associate Software Engineer"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Compensation Package (LPA) *</label>
                    <input
                      type="number"
                      name="packageLPA"
                      value={formData.packageLPA}
                      onChange={handleFormChange}
                      placeholder="e.g. 14.25"
                      className="form-control"
                      step="0.1"
                    />
                  </div>
                  <div className="form-group">
                    <label>Minimum CGPA Criteria *</label>
                    <input
                      type="number"
                      name="minCGPA"
                      value={formData.minCGPA}
                      onChange={handleFormChange}
                      placeholder="e.g. 7.50"
                      className="form-control"
                      step="0.01"
                      min="0"
                      max="10"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Job Profile Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Short description of the job profile and specifications..."
                    className="form-control"
                    rows="3"
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>

                {/* Department checklist */}
                <div className="form-group">
                  <label>Eligible Branches *</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '4px' }}>
                    {['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'].map((dept) => {
                      const isChecked = formData.eligibleDepartments.includes(dept);
                      return (
                        <button
                          key={dept}
                          type="button"
                          onClick={() => handleDeptToggle(dept)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid',
                            borderColor: isChecked ? 'var(--primary)' : 'var(--border-color)',
                            background: isChecked ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                            color: isChecked ? 'white' : 'var(--text-secondary)',
                            fontWeight: 500,
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            transition: 'var(--transition-fast)',
                          }}
                        >
                          {dept}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Recruitment Rounds Sub-Form (Only during creation) */}
                {!isEdit && (
                  <div
                    style={{
                      marginTop: '24px',
                      paddingTop: '20px',
                      borderTop: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Interview rounds sequence</h4>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        onClick={addRoundRow}
                      >
                        <PlusCircle size={14} />
                        Add Round
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {rounds.map((round, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center',
                            background: 'rgba(255,255,255,0.02)',
                            padding: '12px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)',
                          }}
                        >
                          <span
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: 'var(--bg-main)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                            }}
                          >
                            {round.sequenceOrder}
                          </span>

                          <input
                            type="text"
                            value={round.roundName}
                            onChange={(e) => handleRoundRowChange(index, 'roundName', e.target.value)}
                            placeholder="Round Name"
                            className="form-control"
                            style={{ flex: 2, padding: '8px 12px' }}
                          />

                          <select
                            value={round.roundType}
                            onChange={(e) => handleRoundRowChange(index, 'roundType', e.target.value)}
                            className="form-control"
                            style={{ flex: 1, padding: '8px 12px' }}
                          >
                            <option value="Aptitude">Aptitude</option>
                            <option value="Coding">Coding</option>
                            <option value="GD">Group Discussion</option>
                            <option value="Technical">Technical</option>
                            <option value="HR">HR Interview</option>
                          </select>

                          <button
                            type="button"
                            className="btn btn-secondary btn-icon"
                            style={{ color: 'var(--danger)', padding: '6px' }}
                            onClick={() => removeRoundRow(index)}
                            disabled={rounds.length === 1}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEdit ? 'Save Changes' : 'Initialize Recruitment Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;
