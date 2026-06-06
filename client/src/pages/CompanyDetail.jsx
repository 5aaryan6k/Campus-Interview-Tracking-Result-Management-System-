import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { ArrowLeft, UserCheck, AlertTriangle, UserPlus, Check, CheckCircle2, XCircle, Clock, Save, Info } from 'lucide-react';

const CompanyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    fetchCompanyById,
    fetchRoundCandidates,
    registerCandidates,
    recordAttendance,
    recordResults,
  } = useAppData();

  const [companyData, setCompanyData] = useState(null);
  const [activeRoundIndex, setActiveRoundIndex] = useState(0);
  const [roundCandidates, setRoundCandidates] = useState(null); // { registered: [], eligible: [] }
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('registered'); // 'registered' | 'register-new'

  // Selection states for registering new candidates
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  // Input states for updating current candidates in the round
  const [localStatuses, setLocalStatuses] = useState([]); // Array of { studentId, attendance, result, remarks }
  
  const [feedbackMessage, setFeedbackMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCompanyDetails = useCallback(async () => {
    setLoading(true);
    const data = await fetchCompanyById(id);
    if (data) {
      setCompanyData(data);
      // Fetch details of first round if available
      if (data.rounds.length > 0) {
        await loadRoundData(data.rounds[0]._id);
      }
    }
    setLoading(false);
  }, [id, fetchCompanyById]);

  useEffect(() => {
    loadCompanyDetails();
  }, [loadCompanyDetails]);

  const loadRoundData = async (roundId) => {
    const data = await fetchRoundCandidates(roundId);
    if (data) {
      setRoundCandidates(data);
      // Initialize local input bindings for bulk modification
      const bindings = data.registered.map((item) => ({
        studentId: item.studentId._id,
        rollNumber: item.studentId.rollNumber,
        name: item.studentId.name,
        cgpa: item.studentId.cgpa,
        department: item.studentId.department,
        attendance: item.attendance,
        result: item.result,
        remarks: item.remarks || '',
      }));
      setLocalStatuses(bindings);
      setSelectedStudentIds([]);
    }
  };

  const handleRoundChange = async (index) => {
    setActiveRoundIndex(index);
    setFeedbackMessage({ type: '', text: '' });
    setActiveTab('registered');
    await loadRoundData(companyData.rounds[index]._id);
  };

  // Handle local state updates for registered students
  const handleLocalChange = (studentId, field, value) => {
    setLocalStatuses((prev) =>
      prev.map((item) => {
        if (item.studentId === studentId) {
          const updatedItem = { ...item, [field]: value };
          
          // Business Rule check: If attendance is marked Absent, result must be marked Rejected
          if (field === 'attendance' && value === 'Absent') {
            updatedItem.result = 'Rejected';
          }
          
          // Clear result if attendance becomes pending
          if (field === 'attendance' && value === 'Pending') {
            updatedItem.result = 'Pending';
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  // Checkbox toggle for adding new candidates
  const handleCheckboxToggle = (studentId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = (eligibleList) => {
    if (selectedStudentIds.length === eligibleList.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(eligibleList.map((s) => s._id));
    }
  };

  // Bulk Register Candidates
  const handleBulkRegister = async () => {
    if (selectedStudentIds.length === 0) return;
    setIsSubmitting(true);
    setFeedbackMessage({ type: '', text: '' });

    const activeRound = companyData.rounds[activeRoundIndex];
    const res = await registerCandidates(activeRound._id, selectedStudentIds);

    if (res.success) {
      setFeedbackMessage({ type: 'success', text: 'Successfully registered candidates in this round.' });
      await loadRoundData(activeRound._id);
      setActiveTab('registered');
    } else {
      setFeedbackMessage({ type: 'danger', text: res.message || 'Failed to register candidates.' });
    }
    setIsSubmitting(false);
  };

  // Save changes (attendance and results)
  const handleSaveChanges = async () => {
    setIsSubmitting(true);
    setFeedbackMessage({ type: '', text: '' });

    const activeRound = companyData.rounds[activeRoundIndex];

    // Validate logic constraints
    const errors = [];
    localStatuses.forEach((status) => {
      if (status.result === 'Cleared' && status.attendance !== 'Present') {
        errors.push(`Candidate ${status.name} (${status.rollNumber}) cannot be marked "Cleared" without being marked "Present".`);
      }
    });

    if (errors.length > 0) {
      setFeedbackMessage({ type: 'danger', text: errors.join(' ') });
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Submit Attendance Data
      const attendancePayload = localStatuses.map((s) => ({
        studentId: s.studentId,
        attendance: s.attendance,
      }));
      const attRes = await recordAttendance(activeRound._id, attendancePayload);
      if (!attRes.success) throw new Error(attRes.message);

      // 2. Submit Results Data
      const resultsPayload = localStatuses.map((s) => ({
        studentId: s.studentId,
        result: s.result,
        remarks: s.remarks,
      }));
      const resRes = await recordResults(activeRound._id, resultsPayload);
      if (!resRes.success) throw new Error(resRes.message);

      setFeedbackMessage({ type: 'success', text: 'Attendance and results updated successfully.' });
      
      // Reload round data and company placements counts
      await loadRoundData(activeRound._id);
      
      // Fetch details of company again to update numbers
      const refreshedCompany = await fetchCompanyById(id);
      if (refreshedCompany) {
        setCompanyData(refreshedCompany);
      }
    } catch (err) {
      setFeedbackMessage({ type: 'danger', text: err.message || 'Failed to save updates.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !companyData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Loading recruitment pipeline...</div>
      </div>
    );
  }

  const { company, rounds, placedCount } = companyData;
  const activeRound = rounds[activeRoundIndex];
  const isFinalRound = activeRoundIndex === rounds.length - 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header & Back Button */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => navigate('/companies')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.9rem',
              fontWeight: 600,
              padding: '4px 0',
            }}
          >
            <ArrowLeft size={16} />
            Back to Companies Drives
          </button>
          
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
            {company.name} <span style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-muted)' }}>Pipeline</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {company.jobRole} • {company.packageLPA} LPA • CGPA Cutoff: {company.minCGPA.toFixed(2)}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '12px 20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Offers Issued</span>
            <strong style={{ fontSize: '1.4rem', color: 'var(--success)' }}>{placedCount} Candidates</strong>
          </div>
        </div>
      </div>

      {/* Visual Timeline Stepper */}
      <div className="glass-card" style={{ padding: '30px 24px 20px 24px' }}>
        <div className="timeline-tracker">
          {rounds.map((round, index) => {
            const isCompleted = index < activeRoundIndex;
            const isActive = index === activeRoundIndex;
            
            return (
              <div
                key={round._id}
                className={`timeline-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => handleRoundChange(index)}
              >
                <div className="step-node">
                  {isCompleted ? <Check size={20} /> : round.sequenceOrder}
                </div>
                <div className="step-label">
                  <div>{round.roundName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '2px' }}>
                    {round.roundType}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Stage Panel */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Stage Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: 'var(--primary)',
                letterSpacing: '0.05em',
                background: 'rgba(99,102,241,0.1)',
                padding: '4px 10px',
                borderRadius: '4px',
              }}
            >
              Stage {activeRound.sequenceOrder} / {rounds.length}
            </span>
            <h2 style={{ fontSize: '1.5rem', marginTop: '8px' }}>{activeRound.roundName} ({activeRound.roundType})</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
              Define attendance schedules and assess qualification results.
            </p>
          </div>

          {/* Save Button */}
          {activeTab === 'registered' && roundCandidates?.registered?.length > 0 && (
            <button
              className="btn btn-primary"
              disabled={isSubmitting}
              onClick={handleSaveChanges}
              style={{ padding: '12px 24px' }}
            >
              <Save size={18} />
              Save Pipeline Changes
            </button>
          )}
        </div>

        {/* Business Rule Banners */}
        {isFinalRound && (
          <div
            style={{
              padding: '16px',
              background: 'rgba(168, 85, 247, 0.1)',
              border: '1px solid rgba(168, 85, 247, 0.2)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <Info size={20} style={{ color: 'var(--secondary)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: 'var(--secondary)' }}>Final Offer Selection: </strong>
              This is the final round of the process. Marking a candidate as <strong>Cleared</strong> here will automatically:
              <ul style={{ marginLeft: '20px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>Change their student status to <strong>Placed</strong>.</li>
                <li>Record <strong>{company.name}</strong> as their hired company with package <strong>{company.packageLPA} LPA</strong>.</li>
                <li>Withdraw/reject them from all other active companies' pipelines automatically to prevent double offers.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Inline Feedback Message */}
        {feedbackMessage.text && (
          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.9rem',
              fontWeight: 500,
              background: feedbackMessage.type === 'success' ? 'var(--success-glow)' : 'var(--danger-glow)',
              color: feedbackMessage.type === 'success' ? 'var(--success)' : 'var(--danger)',
              border: `1px solid ${feedbackMessage.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}
          >
            {feedbackMessage.text}
          </div>
        )}

        {/* Tabs for Candidates */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
          <button
            onClick={() => { setActiveTab('registered'); setFeedbackMessage({ type: '', text: '' }); }}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'registered' ? '3px solid var(--primary)' : '3px solid transparent',
              color: activeTab === 'registered' ? 'white' : 'var(--text-secondary)',
              padding: '12px 24px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.95rem',
            }}
          >
            Registered Candidates ({roundCandidates?.registered?.length || 0})
          </button>
          
          <button
            onClick={() => { setActiveTab('register-new'); setFeedbackMessage({ type: '', text: '' }); }}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'register-new' ? '3px solid var(--primary)' : '3px solid transparent',
              color: activeTab === 'register-new' ? 'white' : 'var(--text-secondary)',
              padding: '12px 24px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.95rem',
            }}
          >
            Register Eligible Candidates ({roundCandidates?.eligible?.length || 0})
          </button>
        </div>

        {/* Tab 1: Candidates Registered (Log attendance and results) */}
        {activeTab === 'registered' && (
          <div>
            {!roundCandidates || roundCandidates.registered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                <UserCheck size={48} style={{ strokeWidth: 1, marginBottom: '16px' }} />
                <h3>No candidates registered in this stage yet.</h3>
                <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                  Switch to the "Register Eligible Candidates" tab to add candidates to this round.
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Roll Number</th>
                      <th>Candidate</th>
                      <th>Dept</th>
                      <th>CGPA</th>
                      <th>Attendance</th>
                      <th>Evaluation Result</th>
                      <th>Remarks / Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localStatuses.map((item) => (
                      <tr key={item.studentId}>
                        <td style={{ fontWeight: 600 }}>{item.rollNumber}</td>
                        <td>{item.name}</td>
                        <td>{item.department}</td>
                        <td>{item.cgpa.toFixed(2)}</td>
                        <td>
                          <select
                            value={item.attendance}
                            onChange={(e) => handleLocalChange(item.studentId, 'attendance', e.target.value)}
                            className="form-control"
                            style={{
                              padding: '6px 12px',
                              background: 'var(--bg-glass-input)',
                              borderColor:
                                item.attendance === 'Present'
                                  ? 'rgba(16,185,129,0.3)'
                                  : item.attendance === 'Absent'
                                  ? 'rgba(239,68,68,0.3)'
                                  : 'var(--border-color)',
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                          </select>
                        </td>
                        <td>
                          <select
                            value={item.result}
                            onChange={(e) => handleLocalChange(item.studentId, 'result', e.target.value)}
                            className="form-control"
                            style={{
                              padding: '6px 12px',
                              background: 'var(--bg-glass-input)',
                              borderColor:
                                item.result === 'Cleared'
                                  ? 'rgba(16,185,129,0.3)'
                                  : item.result === 'Rejected'
                                  ? 'rgba(239,68,68,0.3)'
                                  : 'var(--border-color)',
                            }}
                            disabled={item.attendance === 'Absent'} // Forced rejected if absent
                          >
                            <option value="Pending">Pending</option>
                            <option value="Cleared">Cleared</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="text"
                            value={item.remarks}
                            onChange={(e) => handleLocalChange(item.studentId, 'remarks', e.target.value)}
                            placeholder="Feedback comments..."
                            className="form-control"
                            style={{ padding: '6px 12px', minWidth: '180px' }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Register Eligible Candidates */}
        {activeTab === 'register-new' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {!roundCandidates || roundCandidates.eligible.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                <UserPlus size={48} style={{ strokeWidth: 1, marginBottom: '16px' }} />
                <h3>No eligible candidates available.</h3>
                {activeRound.sequenceOrder === 1 ? (
                  <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                    All eligible student profiles meeting the criteria (CGPA &gt;= {company.minCGPA} and department eligibility) are already registered.
                  </p>
                ) : (
                  <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                    There are no candidates who cleared the previous round (Stage {activeRound.sequenceOrder - 1}) and are unregistered.
                  </p>
                )}
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Eligible candidates meeting criteria for this drive.
                  </span>
                  <button
                    className="btn btn-primary"
                    disabled={selectedStudentIds.length === 0 || isSubmitting}
                    onClick={handleBulkRegister}
                  >
                    Register Selected ({selectedStudentIds.length})
                  </button>
                </div>

                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th style={{ width: '50px', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.length === roundCandidates.eligible.length}
                            onChange={() => handleSelectAll(roundCandidates.eligible)}
                            style={{ cursor: 'pointer' }}
                          />
                        </th>
                        <th>Roll Number</th>
                        <th>Name</th>
                        <th>Branch</th>
                        <th>CGPA</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roundCandidates.eligible.map((student) => (
                        <tr key={student._id}>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={selectedStudentIds.includes(student._id)}
                              onChange={() => handleCheckboxToggle(student._id)}
                              style={{ cursor: 'pointer' }}
                            />
                          </td>
                          <td style={{ fontWeight: 600 }}>{student.rollNumber}</td>
                          <td>{student.name}</td>
                          <td>{student.department}</td>
                          <td>{student.cgpa.toFixed(2)}</td>
                          <td>
                            <span className="badge badge-unplaced">{student.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};

export default CompanyDetail;
