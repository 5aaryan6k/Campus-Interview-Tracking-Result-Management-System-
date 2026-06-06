import React, { useEffect, useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Download, Search, FileSpreadsheet, Sparkles, Building, Users, BookOpen } from 'lucide-react';

const Reports = () => {
  const {
    students,
    companies,
    dashboardStats,
    fetchStudents,
    fetchCompanies,
    fetchDashboardStats,
  } = useAppData();

  const [reportType, setReportType] = useState('placed'); // 'placed' | 'unplaced' | 'companies'
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchCompanies();
    fetchDashboardStats();
  }, [fetchStudents, fetchCompanies, fetchDashboardStats]);

  // Export JSON file utility
  const exportToJSON = (data, filename) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `${filename}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export PDF file utility using window.print in a clean print-friendly template
  const exportToPDF = (data, filename, title) => {
    if (data.length === 0) return;

    const printWindow = window.open('', '_blank');
    const headers = Object.keys(data[0]);

    // Create human-readable header mapping
    const headerLabels = headers.map(h => {
      // Split camelCase words and capitalize
      const spaced = h.replace(/([A-Z])/g, ' $1');
      return spaced.charAt(0).toUpperCase() + spaced.slice(1);
    });

    const html = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 30px; color: #1e293b; background: white; }
            .header { margin-bottom: 25px; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; }
            h1 { font-size: 22px; margin: 0 0 6px 0; color: #0f172a; }
            .meta { font-size: 13px; color: #64748b; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #475569; letter-spacing: 0.05em; }
            td { border: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; font-size: 12px; color: #334155; }
            tr:nth-child(even) td { background-color: #f8fafc; }
            .footer { margin-top: 30px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
            <div class="meta">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} | CampusTrack</div>
          </div>
          <table>
            <thead>
              <tr>
                ${headerLabels.map(h => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${headers.map(key => {
      let val = row[key];
      if (val === undefined || val === null) val = '-';
      return `<td>${val}</td>`;
    }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            Campus Placement & Interview Tracker Report
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Filtered lists
  const placedList = students.filter((s) => s.status === 'Placed');
  const unplacedList = students.filter((s) => s.status === 'Unplaced' || s.status === 'In-Progress');

  let currentList = [];
  let exportData = [];
  let exportFilename = '';

  if (reportType === 'placed') {
    currentList = placedList.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase())
    );
    exportData = placedList.map((s) => ({
      rollNumber: s.rollNumber,
      name: s.name,
      email: s.email,
      department: s.department,
      cgpa: s.cgpa,
      company: s.placedCompanyId?.name || 'Unknown',
      role: s.placedCompanyId?.jobRole || 'Unknown',
      packageLPA: s.packageLPA,
    }));
    exportFilename = 'placed_students_report';
  } else if (reportType === 'unplaced') {
    currentList = unplacedList.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase())
    );
    exportData = unplacedList.map((s) => ({
      rollNumber: s.rollNumber,
      name: s.name,
      email: s.email,
      department: s.department,
      cgpa: s.cgpa,
      status: s.status,
    }));
    exportFilename = 'unplaced_students_report';
  } else if (reportType === 'companies' && dashboardStats) {
    currentList = dashboardStats.companyStats.filter((c) =>
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.jobRole.toLowerCase().includes(search.toLowerCase())
    );
    exportData = dashboardStats.companyStats.map(c => ({
      companyName: c.companyName,
      jobRole: c.jobRole,
      packageLPA: c.packageLPA,
      candidatesInProgress: c.inProgressCount,
      offersReleased: c.placedCount
    }));
    exportFilename = 'company_recruitment_report';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Reports & Analytics</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Generate analytical insights and download student recruitment sheets.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => exportToJSON(exportData, exportFilename)}
            disabled={exportData.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Download size={16} />
            Export (JSON)
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              const friendlyTitle = reportType === 'placed'
                ? 'Placed Students Directory'
                : reportType === 'unplaced'
                  ? 'Unplaced Candidate Pool'
                  : 'Recruiter Conversion Stats';
              exportToPDF(exportData, exportFilename, friendlyTitle);
            }}
            disabled={exportData.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Download size={16} />
            Export (PDF)
          </button>
        </div>
      </div>

      {/* Analytics widgets */}
      {dashboardStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="stats-icon emerald" style={{ flexShrink: 0 }}>
              <Users size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Placed Ratios</span>
              <h4 style={{ fontSize: '1.25rem', marginTop: '2px' }}>
                {placedList.length} / {students.length} Students
              </h4>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="stats-icon purple" style={{ flexShrink: 0, color: 'var(--secondary)', background: 'rgba(168, 85, 247, 0.1)' }}>
              <Building size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Registered Drives</span>
              <h4 style={{ fontSize: '1.25rem', marginTop: '2px' }}>
                {companies.length} Recruiter Profiles
              </h4>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="stats-icon amber" style={{ flexShrink: 0 }}>
              <BookOpen size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Branch Count</span>
              <h4 style={{ fontSize: '1.25rem', marginTop: '2px' }}>
                {dashboardStats.deptStats.length} Academic Branches
              </h4>
            </div>
          </div>

        </div>
      )}

      {/* Report Controls (Tabs + Search) */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>

          {/* Report Toggles */}
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => { setReportType('placed'); setSearch(''); }}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                background: reportType === 'placed' ? 'var(--primary)' : 'transparent',
                color: reportType === 'placed' ? 'white' : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'var(--transition-fast)',
              }}
            >
              Placed Student Directory
            </button>
            <button
              onClick={() => { setReportType('unplaced'); setSearch(''); }}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                background: reportType === 'unplaced' ? 'var(--primary)' : 'transparent',
                color: reportType === 'unplaced' ? 'white' : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'var(--transition-fast)',
              }}
            >
              Unplaced Candidate Pool
            </button>
            <button
              onClick={() => { setReportType('companies'); setSearch(''); }}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                background: reportType === 'companies' ? 'var(--primary)' : 'transparent',
                color: reportType === 'companies' ? 'white' : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'var(--transition-fast)',
              }}
            >
              Recruiter Conversion stats
            </button>
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports..."
              className="form-control"
              style={{ width: '100%', paddingLeft: '42px', paddingTop: '8px', paddingBottom: '8px' }}
            />
          </div>
        </div>

        {/* Tab content Tables */}
        <div className="table-container" style={{ border: 'none' }}>

          {reportType === 'placed' && (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>CGPA</th>
                  <th>Company Drive</th>
                  <th>Role Offer</th>
                  <th>Package Package</th>
                </tr>
              </thead>
              <tbody>
                {currentList.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                      No placed records matched search criteria.
                    </td>
                  </tr>
                ) : (
                  currentList.map((student) => (
                    <tr key={student._id}>
                      <td style={{ fontWeight: 600 }}>{student.rollNumber}</td>
                      <td>{student.name}</td>
                      <td>{student.department}</td>
                      <td>{student.cgpa.toFixed(2)}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 500 }}>
                        {student.placedCompanyId?.name || 'Unknown'}
                      </td>
                      <td>{student.placedCompanyId?.jobRole || 'Unknown'}</td>
                      <td>
                        <strong style={{ color: 'white' }}>{student.packageLPA} LPA</strong>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {reportType === 'unplaced' && (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>CGPA</th>
                  <th>Email Profile</th>
                  <th>State Status</th>
                </tr>
              </thead>
              <tbody>
                {currentList.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                      No unplaced records matched search criteria.
                    </td>
                  </tr>
                ) : (
                  currentList.map((student) => (
                    <tr key={student._id}>
                      <td style={{ fontWeight: 600 }}>{student.rollNumber}</td>
                      <td>{student.name}</td>
                      <td>{student.department}</td>
                      <td>{student.cgpa.toFixed(2)}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{student.email}</td>
                      <td>
                        <span className={`badge ${student.status === 'In-Progress' ? 'badge-progress' : 'badge-unplaced'}`}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {reportType === 'companies' && (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Recruiter Name</th>
                  <th>Job Designation</th>
                  <th>Compensations</th>
                  <th>In-Progress Pool</th>
                  <th>Selected Hires</th>
                </tr>
              </thead>
              <tbody>
                {currentList.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                      No company profiles found.
                    </td>
                  </tr>
                ) : (
                  currentList.map((c, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: 600 }}>{c.companyName}</td>
                      <td>{c.jobRole}</td>
                      <td>{c.packageLPA} LPA</td>
                      <td style={{ color: 'var(--warning)', fontWeight: 500 }}>
                        {c.inProgressCount} Candidates
                      </td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>
                        {c.placedCount} Offers
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

        </div>
      </div>
    </div>
  );
};

export default Reports;
