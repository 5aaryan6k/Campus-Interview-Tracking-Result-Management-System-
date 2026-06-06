import React, { useEffect, useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Plus, Search, Edit2, Trash2, X, Eye } from 'lucide-react';

const Students = () => {
  const {
    students,
    companies,
    fetchStudents,
    fetchCompanies,
    createStudent,
    updateStudent,
    deleteStudent,
    loadingData,
  } = useAppData();

  const [filters, setFilters] = useState({
    search: '',
    department: '',
    status: '',
    minCgpa: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    email: '',
    department: 'CSE',
    cgpa: '',
    resumeUrl: '',
    status: 'Unplaced',
    placedCompanyId: '',
    packageLPA: '',
  });

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchStudents(filters);
  }, [filters, fetchStudents]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setIsEdit(false);
    setSelectedStudentId(null);
    setFormData({
      name: '',
      rollNumber: '',
      email: '',
      department: 'CSE',
      cgpa: '',
      resumeUrl: '',
      status: 'Unplaced',
      placedCompanyId: '',
      packageLPA: '',
    });
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setIsEdit(true);
    setSelectedStudentId(student._id);
    setFormData({
      name: student.name,
      rollNumber: student.rollNumber,
      email: student.email,
      department: student.department,
      cgpa: student.cgpa,
      resumeUrl: student.resumeUrl || '',
      status: student.status,
      placedCompanyId: student.placedCompanyId?._id || '',
      packageLPA: student.packageLPA || '',
    });
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    if (!formData.name || !formData.rollNumber || !formData.email || !formData.department || formData.cgpa === '') {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    const cgpaVal = parseFloat(formData.cgpa);
    if (isNaN(cgpaVal) || cgpaVal < 0 || cgpaVal > 10) {
      setErrorMessage('CGPA must be a number between 0.0 and 10.0');
      return;
    }

    const payload = {
      ...formData,
      cgpa: cgpaVal,
      packageLPA: formData.status === 'Placed' ? parseFloat(formData.packageLPA) : null,
      placedCompanyId: formData.status === 'Placed' ? formData.placedCompanyId : null,
    };

    if (formData.status === 'Placed') {
      if (!payload.placedCompanyId || isNaN(payload.packageLPA)) {
        setErrorMessage('For Placed candidates, you must specify the placed company and package (LPA)');
        return;
      }
    }

    let result;
    if (isEdit) {
      result = await updateStudent(selectedStudentId, payload);
    } else {
      result = await createStudent(payload);
    }

    if (result.success) {
      setIsModalOpen(false);
    } else {
      setErrorMessage(result.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student? This will permanently wipe all their round participation data.')) {
      const result = await deleteStudent(id);
      if (!result.success) {
        alert(result.message);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header with Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Students</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Manage student records, review academic criteria, and update employment placements.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} />
          Register Student
        </button>
      </div>

      {/* Filters Card */}
      <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by name, roll number, email..."
            className="form-control"
            style={{ width: '100%', paddingLeft: '42px' }}
          />
        </div>

        {/* Branch Filter */}
        <div style={{ minWidth: '150px' }}>
          <select
            name="department"
            value={filters.department}
            onChange={handleFilterChange}
            className="form-control"
            style={{ width: '100%', background: 'rgba(30, 41, 59, 0.4)' }}
          >
            <option value="">All Departments</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
            <option value="IT">IT</option>
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ minWidth: '150px' }}>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="form-control"
            style={{ width: '100%' }}
          >
            <option value="">All Statuses</option>
            <option value="Unplaced">Unplaced</option>
            <option value="In-Progress">In-Progress</option>
            <option value="Placed">Placed</option>
          </select>
        </div>

        {/* Min CGPA filter */}
        <div style={{ minWidth: '150px' }}>
          <input
            type="number"
            name="minCgpa"
            value={filters.minCgpa}
            onChange={handleFilterChange}
            placeholder="Min CGPA"
            className="form-control"
            style={{ width: '100%' }}
            step="0.1"
            min="0"
            max="10"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        {loadingData && students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading student records...</div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Dept</th>
                  <th>CGPA</th>
                  <th>Resume</th>
                  <th>Status</th>
                  <th>Company / Offer</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                      No students found matching current filters.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student._id}>
                      <td style={{ fontWeight: 600 }}>{student.rollNumber}</td>
                      <td>{student.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{student.email}</td>
                      <td>{student.department}</td>
                      <td style={{ fontWeight: 500 }}>{student.cgpa.toFixed(2)}</td>
                      <td>
                        {student.resumeUrl ? (
                          <a
                            href={student.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--primary)', fontWeight: 500, borderBottom: '1px dotted var(--primary)' }}
                          >
                            Resume Link
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No link</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            student.status === 'Placed'
                              ? 'badge-placed'
                              : student.status === 'In-Progress'
                              ? 'badge-progress'
                              : 'badge-unplaced'
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td>
                        {student.status === 'Placed' && student.placedCompanyId ? (
                          <div>
                            <span style={{ fontWeight: 500, color: 'var(--success)' }}>{student.placedCompanyId.name}</span>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {student.placedCompanyId.jobRole} • {student.packageLPA} LPA
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            className="btn btn-secondary btn-icon"
                            title="Edit Student"
                            onClick={() => openEditModal(student)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-secondary btn-icon"
                            style={{ color: 'var(--danger)' }}
                            title="Delete Student"
                            onClick={() => handleDelete(student._id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem' }}>{isEdit ? 'Edit Student Details' : 'Register New Student'}</h3>
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
                    <label>Roll Number / ID *</label>
                    <input
                      type="text"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleFormChange}
                      placeholder="e.g. CSE-2023-04"
                      className="form-control"
                      disabled={isEdit}
                    />
                  </div>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="Student Name"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="student@gmail.com"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Branch / Department *</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleFormChange}
                      className="form-control"
                    >
                      <option value="CSE">CSE</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                      <option value="MECH">MECH</option>
                      <option value="CIVIL">CIVIL</option>
                      <option value="IT">IT</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>CGPA *</label>
                    <input
                      type="number"
                      name="cgpa"
                      value={formData.cgpa}
                      onChange={handleFormChange}
                      placeholder="e.g. 8.75"
                      className="form-control"
                      step="0.01"
                      min="0"
                      max="10"
                    />
                  </div>
                  <div className="form-group">
                    <label>Resume Link (URL)</label>
                    <input
                      type="url"
                      name="resumeUrl"
                      value={formData.resumeUrl}
                      onChange={handleFormChange}
                      placeholder="https://drive.google.com/..."
                      className="form-control"
                    />
                  </div>
                </div>

                {isEdit && (
                  <div
                    style={{
                      marginTop: '20px',
                      paddingTop: '20px',
                      borderTop: '1px solid var(--border-color)',
                    }}
                  >
                    <h4 style={{ fontSize: '1rem', marginBottom: '12px' }}>Employment Status</h4>
                    <div className="form-group">
                      <label>Placement Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleFormChange}
                        className="form-control"
                      >
                        <option value="Unplaced">Unplaced</option>
                        <option value="In-Progress">In-Progress</option>
                        <option value="Placed">Placed</option>
                      </select>
                    </div>

                    {formData.status === 'Placed' && (
                      <div className="form-row" style={{ marginTop: '12px' }}>
                        <div className="form-group">
                          <label>Placed Company *</label>
                          <select
                            name="placedCompanyId"
                            value={formData.placedCompanyId}
                            onChange={handleFormChange}
                            className="form-control"
                          >
                            <option value="">Select Company</option>
                            {companies.map((c) => (
                              <option key={c._id} value={c._id}>
                                {c.name} ({c.jobRole})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Salary Package (LPA) *</label>
                          <input
                            type="number"
                            name="packageLPA"
                            value={formData.packageLPA}
                            onChange={handleFormChange}
                            placeholder="e.g. 10.5"
                            className="form-control"
                            step="0.1"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEdit ? 'Save Changes' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
