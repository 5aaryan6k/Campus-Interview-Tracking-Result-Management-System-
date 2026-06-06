import React, { useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Users, Briefcase, GraduationCap, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { dashboardStats, fetchDashboardStats, loadingData } = useAppData();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  if (!dashboardStats) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Loading Dashboard Analytics...</div>
      </div>
    );
  }

  const { summary, deptStats, companyStats, attendanceStats, resultStats, recentPlacements, activeRounds } = dashboardStats;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Overview of ongoing campus drives, attendance rates, and student selection progression.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="dashboard-grid">
        {/* Total Students */}
        <div className="glass-card dashboard-stats-card">
          <div className="stats-icon">
            <Users size={24} />
          </div>
          <div className="stats-info">
            <span className="stats-val">{summary.totalStudents}</span>
            <span className="stats-lbl">Total Candidates</span>
          </div>
        </div>

        {/* Placed Students */}
        <div className="glass-card dashboard-stats-card">
          <div className="stats-icon emerald">
            <GraduationCap size={24} />
          </div>
          <div className="stats-info">
            <span className="stats-val">{summary.placedStudents}</span>
            <span className="stats-lbl">Placed Candidates</span>
          </div>
        </div>

        {/* In-Progress */}
        <div className="glass-card dashboard-stats-card">
          <div className="stats-icon amber">
            <TrendingUp size={24} />
          </div>
          <div className="stats-info">
            <span className="stats-val">{summary.inProgressStudents}</span>
            <span className="stats-lbl">In Placement Process</span>
          </div>
        </div>

        {/* Average Package */}
        <div className="glass-card dashboard-stats-card">
          <div className="stats-icon purple" style={{ color: 'var(--secondary)', background: 'rgba(168, 85, 247, 0.1)' }}>
            <Briefcase size={24} />
          </div>
          <div className="stats-info">
            <span className="stats-val">{summary.avgPackage} LPA</span>
            <span className="stats-lbl">Average Package</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Breakdown Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Branch-wise Placement Rate */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Department Placement Rates</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Performance across engineering and application departments.</p>
          
          <div className="chart-bar-container" style={{ marginTop: '10px' }}>
            {deptStats.length === 0 ? (
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No student records registered.</span>
            ) : (
              deptStats.map((dept) => (
                <div key={dept.department} style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600 }}>{dept.department}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {dept.placed}/{dept.total} Placed ({dept.placementRate}%)
                    </span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${dept.placementRate}%` }}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recruitment Pipeline Summary & Attendance */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Interview Results & Attendance</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Selection Rates */}
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '12px' }}>
                Outcome Breakdown
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--success)', fontWeight: 500 }}>Cleared Rounds</span>
                  <span>{resultStats.Cleared}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--danger)', fontWeight: 500 }}>Rejections</span>
                  <span>{resultStats.Rejected}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--warning)', fontWeight: 500 }}>Pending Review</span>
                  <span>{resultStats.Pending}</span>
                </div>
              </div>
            </div>

            {/* Attendance summaries */}
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '12px' }}>
                Attendance Status
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--success)', fontWeight: 500 }}>Present</span>
                  <span>{attendanceStats.Present}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--danger)', fontWeight: 500 }}>Absent</span>
                  <span>{attendanceStats.Absent}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--warning)', fontWeight: 500 }}>Not Scheduled</span>
                  <span>{attendanceStats.Pending}</span>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(99, 102, 241, 0.05)',
              border: '1px solid rgba(99, 102, 241, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.85rem',
            }}
          >
            <AlertCircle size={16} style={{ color: 'var(--primary)' }} />
            <span>Placement Rate: <strong>{summary.placementRate}%</strong> of overall registered student batch.</span>
          </div>
        </div>

      </div>

      {/* Bottom Layout - Recent placements & Active drives */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Recent Placements list */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Recent Offers Received</h3>
          
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Branch</th>
                  <th>Company</th>
                  <th>Package</th>
                </tr>
              </thead>
              <tbody>
                {recentPlacements.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No placements recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentPlacements.map((placement, index) => (
                    <tr key={index}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{placement.studentName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{placement.rollNumber}</div>
                      </td>
                      <td>{placement.department}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 500 }}>{placement.companyName}</td>
                      <td>{placement.packageLPA} LPA</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Drives & Rounds */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Active Interview Processes</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeRounds.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No active recruitment rounds.
              </div>
            ) : (
              activeRounds.map((round, index) => (
                <div
                  key={index}
                  className="event-card"
                  style={{
                    borderLeftColor:
                      round.roundType === 'HR'
                        ? 'var(--secondary)'
                        : round.roundType === 'Technical'
                        ? 'var(--primary)'
                        : 'var(--warning)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{round.companyName}</h4>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {round.roundName} ({round.roundType})
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <Calendar size={12} />
                      <span>{new Date(round.dateScheduled).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
