import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, BarChart3 } from 'lucide-react';

const Sidebar = () => {
  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/students', label: 'Students', icon: <Users size={20} /> },
    { to: '/companies', label: 'Companies', icon: <Building2 size={20} /> },
    { to: '/reports', label: 'Reports & Analytics', icon: <BarChart3 size={20} /> },
  ];

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        position: 'fixed',
        top: 'var(--header-height)',
        bottom: 0,
        left: 0,
        zIndex: 90,
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div style={{ marginBottom: '20px', padding: '0 8px' }}>
        <span
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            fontWeight: 700,
            color: 'var(--text-muted)',
            letterSpacing: '0.08em',
          }}
        >
          Placement Cockpit
        </span>
      </div>

      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.95rem',
            fontWeight: 500,
            color: isActive ? 'white' : 'var(--text-secondary)',
            background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            border: isActive ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid transparent',
            transition: 'var(--transition-fast)',
          })}
          className="sidebar-link"
        >
          {link.icon}
          <span>{link.label}</span>
        </NavLink>
      ))}

      <div
        style={{
          marginTop: 'auto',
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>System Active</span>
        <span>Version 1.0.0</span>
      </div>
    </aside>
  );
};

export default Sidebar;
