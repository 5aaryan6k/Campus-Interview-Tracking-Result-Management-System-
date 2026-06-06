import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, GraduationCap, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav
      style={{
        height: 'var(--header-height)',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(12px)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <GraduationCap size={24} />
        </div>
        <span
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            background: 'linear-gradient(to right, #ffffff, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          CampusTrack
        </span>
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}
            >
              <User size={16} />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
              {user.name}
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                background: 'rgba(255,255,255,0.05)',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              Officer
            </span>
          </div>

          <button
            onClick={logout}
            className="btn btn-secondary"
            style={{
              padding: '6px 12px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
