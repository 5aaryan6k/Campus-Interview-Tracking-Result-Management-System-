import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SiWelcometothejungle } from "react-icons/si";
import { 
  GraduationCap, 
  ArrowRight, 
  Sparkles, 
  Building2, 
  Users, 
  Calendar, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  Play 
} from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for the interactive simulator widget
  const [candidateStage, setCandidateStage] = useState(0);
  const stages = [
    { label: 'Screening', status: 'In Progress', detail: 'Resume shortlisted. Technical quiz cleared.', date: 'Today' },
    { label: 'Technical', status: 'Cleared', detail: 'Solved 2 DSA problems on graphs and trees.', date: 'Yesterday' },
    { label: 'HR Round', status: 'Scheduled', detail: 'Cultural fit and expectations round.', date: 'Tomorrow' },
    { label: 'Offer Placed', status: 'Offer Released', detail: 'Package: 18.5 LPA. Joining Date: July 2026.', date: 'Soon' }
  ];

  const handleNextStage = () => {
    setCandidateStage((prev) => (prev + 1) % stages.length);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.06) 0%, transparent 50%), var(--bg-main)',
      color: 'var(--text-primary)',
      overflowX: 'hidden',
      fontFamily: 'var(--font-primary)'
    }}>
      
      {/* Navigation Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--header-height)',
        background: 'rgba(11, 15, 25, 0.7)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <GraduationCap size={22} />
          </div>
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            background: 'linear-gradient(to right, #ffffff, #c084fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            CampusTrack
          </span>
        </div>

        <div>
          {user ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn btn-primary"
              style={{
                borderRadius: '999px',
                padding: '8px 20px',
                fontSize: '0.9rem',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
              }}
            >
              Go to Dashboard
              <ArrowRight size={15} />
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="btn btn-primary"
              style={{
                borderRadius: '999px',
                padding: '8px 20px',
                fontSize: '0.9rem',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
              }}
            >
              Launch Portal
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        paddingTop: 'calc(var(--header-height) + 80px)',
        paddingBottom: '80px',
        paddingLeft: '40px',
        paddingRight: '40px',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Glow Spheres */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            padding: '6px 16px',
            borderRadius: '999px',
            fontSize: '0.8rem',
            color: '#818cf8',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '28px'
          }}>
            <SiWelcometothejungle size={14} />
            Welcome to CampusTrack
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            maxWidth: '900px',
            margin: '0 auto 20px auto',
            background: 'linear-gradient(to bottom, #ffffff 30%, #e2e8f0 70%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Transform Your Campus <br/>
            <span style={{
              background: 'linear-gradient(to right, #818cf8, #c084fc, #f472b6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Placement Intelligence</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'var(--text-secondary)',
            maxWidth: '700px',
            margin: '0 auto 40px auto',
            lineHeight: 1.6
          }}>
            CampusTrack is a next-generation coordinator dashboard and candidate cockpit that manages student profiles, schedules interview pipelines, and displays real-time placement analytics.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate(user ? '/dashboard' : '/login')}
              className="btn btn-primary"
              style={{
                padding: '14px 32px',
                fontSize: '1rem',
                borderRadius: '8px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                border: 'none'
              }}
            >
              {user ? 'Go to Dashboard' : 'Access Officer Portal'}
              <ArrowRight size={18} />
            </button>
            <a 
              href="#widget-preview"
              className="btn btn-secondary"
              style={{
                padding: '14px 32px',
                fontSize: '1rem',
                borderRadius: '8px',
                fontWeight: 600,
                border: '1px solid var(--border-color)',
                background: 'rgba(255, 255, 255, 0.03)'
              }}
            >
              Interactive Preview
            </a>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section style={{
        padding: '40px 40px 80px 40px',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px'
        }}>
          {[
            { val: '94%', label: 'Placement Selection Rate', desc: 'Batch of 2026', icon: <TrendingUp style={{ color: 'var(--success)' }} /> },
            { val: '120+', label: 'Corporate Partners', desc: 'Active engineering recruiters', icon: <Building2 style={{ color: 'var(--secondary)' }} /> },
            { val: '500+', label: 'Candidates Registered', desc: 'Full profile history logged', icon: <Users style={{ color: 'var(--primary)' }} /> },
            { val: '24 LPA', label: 'Highest Package Offered', desc: 'Mock database records', icon: <GraduationCap style={{ color: '#ec4899' }} /> }
          ].map((m, idx) => (
            <div key={idx} className="glass-card" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '24px',
              background: 'rgba(17, 24, 39, 0.5)',
              border: '1px solid var(--border-color)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Subtle background light */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '60px',
                height: '60px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)'
              }} />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  color: 'white'
                }}>{m.val}</span>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {m.icon}
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{m.label}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Simulation Cockpit Widget */}
      <section id="widget-preview" style={{
        padding: '0 40px 80px 40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            color: 'white'
          }}>Interactive Candidate Pipeline Simulator</h2>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            marginTop: '8px',
            maxWidth: '600px',
            margin: '8px auto 0 auto'
          }}>
            Click the button inside to simulate how officers advance candidates through recruitment stages.
          </p>
        </div>

        <div className="glass-card" style={{
          padding: '0',
          overflow: 'hidden',
          background: 'rgba(15, 23, 42, 0.55)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          {/* Mock Window Header */}
          <div style={{
            background: 'rgba(10, 15, 26, 0.8)',
            padding: '14px 24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
              <span style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                marginLeft: '12px',
                fontFamily: 'monospace'
              }}>pipeline_cockpit_simulator.app</span>
            </div>
            <span style={{
              fontSize: '0.75rem',
              color: 'var(--success)',
              background: 'var(--success-glow)',
              padding: '2px 8px',
              borderRadius: '999px',
              fontWeight: 600,
              letterSpacing: '0.05em'
            }}>SIMULATOR LOG</span>
          </div>

          {/* Simulator Body */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            minHeight: '340px'
          }}>
            {/* Left Column: Candidate Detail */}
            <div style={{
              padding: '30px',
              borderRight: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'rgba(17, 24, 39, 0.2)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      letterSpacing: '0.05em'
                    }}>Active Candidate Profile</span>
                    <h3 style={{ fontSize: '1.4rem', color: 'white', marginTop: '4px', fontWeight: 700 }}>Alex Mercer</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Roll: 2022-CSE-084 | B.Tech CSE</p>
                  </div>
                  <span className={`badge ${candidateStage === 3 ? 'badge-placed' : 'badge-progress'}`} style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease'
                  }}>
                    {candidateStage === 3 ? 'Placed' : 'In Progress'}
                  </span>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>CURRENT STAGE</div>
                  <div style={{ fontSize: '1rem', color: 'white', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: candidateStage === 3 ? 'var(--success)' : 'var(--primary)'
                    }} />
                    {stages[candidateStage].label}
                  </div>
                  
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.4 }}>
                    {stages[candidateStage].detail}
                  </div>
                </div>
              </div>

              <div>
                <button 
                  onClick={handleNextStage}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    color: '#a5b4fc',
                    cursor: 'pointer',
                    transition: 'var(--transition-normal)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--primary)';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
                    e.currentTarget.style.color = '#a5b4fc';
                  }}
                >
                  <Play size={16} />
                  Simulate Next Stage
                  <ChevronRight size={16} />
                </button>
                <p style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                  marginTop: '10px'
                }}>
                  Click to cycle through screening, technical, HR, and placed outcomes.
                </p>
              </div>
            </div>

            {/* Right Column: Visual Progress Tracker */}
            <div style={{
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '24px'
            }}>
              {stages.map((stage, idx) => {
                const isCompleted = idx < candidateStage;
                const isActive = idx === candidateStage;
                
                return (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    opacity: isActive || isCompleted ? 1 : 0.4,
                    transition: 'all 0.4s ease',
                    transform: isActive ? 'scale(1.02) translateX(4px)' : 'scale(1)'
                  }}>
                    {/* Circle Node */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      transition: 'all 0.4s ease',
                      border: '2px solid',
                      background: isCompleted 
                        ? 'var(--success-glow)' 
                        : isActive 
                        ? 'linear-gradient(135deg, var(--primary), var(--secondary))' 
                        : 'rgba(255,255,255,0.03)',
                      borderColor: isCompleted 
                        ? 'var(--success)' 
                        : isActive 
                        ? 'var(--primary)' 
                        : 'rgba(255,255,255,0.1)',
                      color: isCompleted 
                        ? 'var(--success)' 
                        : isActive 
                        ? 'white' 
                        : 'var(--text-muted)',
                      boxShadow: isActive ? '0 0 15px var(--primary-glow)' : 'none'
                    }}>
                      {isCompleted ? <CheckCircle2 size={18} /> : idx + 1}
                    </div>

                    {/* Stage Title and Status */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          fontWeight: 600,
                          fontSize: '0.95rem',
                          color: isActive ? 'white' : 'var(--text-primary)'
                        }}>{stage.label}</span>
                        <span style={{
                          fontSize: '0.75rem',
                          color: isCompleted ? 'var(--success)' : isActive ? 'var(--primary)' : 'var(--text-muted)'
                        }}>{isCompleted ? 'Cleared' : isActive ? 'Active' : 'Locked'}</span>
                      </div>
                      <p style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        marginTop: '2px'
                      }}>Status: {stage.status}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section style={{
        padding: '0 40px 80px 40px',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '50px'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            color: 'white'
          }}>Engineered for College Placement Cells</h2>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            marginTop: '8px',
            maxWidth: '600px',
            margin: '8px auto 0 auto'
          }}>
            Fully loaded cockpit to manage, schedule, monitor, and report interviews efficiently.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px'
        }}>
          {[
            {
              title: 'Live Cockpit Analytics',
              desc: 'Monitor branch-wise placement percentages, selection rates, average salary packages, and pending schedules on an elegant, real-time dashboard.',
              icon: <TrendingUp size={24} />,
              color: 'var(--primary)'
            },
            {
              title: 'Recruitment Flow Tracking',
              desc: 'Follow students from their initial written exams through intermediate technical panel discussions all the way to final HR interview approvals.',
              icon: <Users size={24} />,
              color: 'var(--secondary)'
            },
            {
              title: 'Central Corporate Desk',
              desc: 'Keep complete records of partner recruiters, active vacancies, specific eligibility parameters (minimum CGPA, allowed branches), and ongoing cycles.',
              icon: <Building2 size={24} />,
              color: 'var(--success)'
            },
            {
              title: 'Intelligent Calendars',
              desc: 'Schedule placement drives without calendar conflicts. Instantly mark attendance status (Present, Absent) and log round outcomes in one click.',
              icon: <Calendar size={24} />,
              color: '#f59e0b'
            }
          ].map((f, idx) => (
            <div key={idx} className="glass-card" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '30px',
              background: 'rgba(17, 24, 39, 0.45)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `rgba(${f.color === 'var(--primary)' ? '99, 102, 241' : f.color === 'var(--secondary)' ? '168, 85, 247' : f.color === 'var(--success)' ? '16, 185, 129' : '245, 158, 11'}, 0.1)`,
                color: f.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                {f.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'white' }}>{f.title}</h3>
                <p style={{
                  fontSize: '0.88rem',
                  color: 'var(--text-secondary)',
                  marginTop: '8px',
                  lineHeight: 1.6
                }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section style={{
        padding: '0 40px 100px 40px',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative'
      }}>
        <div className="glass-card" style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '60px 40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle background graphics */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 60%)',
            pointerEvents: 'none'
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{
              fontSize: '2.25rem',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              color: 'white',
              marginBottom: '16px'
            }}>Ready to Modernize Your Placement Drives?</h2>
            
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              maxWidth: '600px',
              margin: '0 auto 32px auto',
              lineHeight: 1.6
            }}>
              Equip your institution with the software engine running behind high-performing campus recruitment drives. Set up roles, student records, and company criteria in minutes.
            </p>

            <button 
              onClick={() => navigate(user ? '/dashboard' : '/login')}
              className="btn btn-primary"
              style={{
                padding: '14px 36px',
                fontSize: '1.05rem',
                borderRadius: '8px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                border: 'none'
              }}
            >
              {user ? 'Open Dashboard Panel' : 'Access Officer Portal Now'}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '40px 40px',
        background: 'rgba(10, 15, 26, 0.85)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <GraduationCap size={16} />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>CampusTrack</span>
          </div>

          <div style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)'
          }}>
            © {new Date().getFullYear()} CampusTrack. All rights reserved.
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}>
            <ShieldCheck size={14} style={{ color: 'var(--success)' }} />
            <span>Secure Officer Environment</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
