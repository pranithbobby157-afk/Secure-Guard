import React from 'react';
import { Shield, ExternalLink, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        {/* Col 1: Mission & Safety Mandate */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
            <div style={{ background: '#ef4444', padding: '0.35rem', borderRadius: '6px', color: 'white', display: 'flex' }}>
              <Shield size={18} />
            </div>
            <strong style={{ fontSize: '1.15rem', color: '#f8fafc' }}>SafeRoute</strong>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.55 }}>
            Real-time crisis communication aid designed to eliminate linguistic barriers and orient tourists during severe cyclones, flash floods, and coastal weather emergencies in Tamil Nadu.
          </p>

          <div className="disclaimer-box">
            <strong>Mandatory Safety Disclaimer:</strong> SafeRoute compiles and translates published bulletins for traveller convenience. SafeRoute is <strong>not</strong> an emergency rescue dispatch authority. In life-threatening emergencies, immediately dial <strong>112</strong> or <strong>1070</strong>. Never enter floodwaters based on navigational approximations.
          </div>
        </div>

        {/* Col 2: Authoritative Data Connectors */}
        <div>
          <h4 style={{ fontSize: '0.88rem', color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem' }}>
            Data Provenance
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.8rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <a href="https://mausam.imd.gov.in" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                India Meteorological Dept (IMD) <ExternalLink size={11} />
              </a>
            </li>
            <li>
              <a href="https://tnsdma.tn.gov.in" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                TN State Disaster Authority (TNSDMA) <ExternalLink size={11} />
              </a>
            </li>
            <li>
              <a href="https://chennaicorporation.gov.in" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                Greater Chennai Corporation (GCC) <ExternalLink size={11} />
              </a>
            </li>
            <li>
              <a href="https://112.gov.in" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                National Emergency Helpline (112) <ExternalLink size={11} />
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3: Privacy & Hackathon Context */}
        <div>
          <h4 style={{ fontSize: '0.88rem', color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem' }}>
            Hackathon Project
          </h4>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '0.75rem' }}>
            Built for <strong>IIITDM Kancheepuram 24-Hour Web Development Hackathon</strong>. Track: <strong>TravelTech</strong>.
          </p>
          <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
            🔒 <strong>Privacy First:</strong> Geolocation coordinates stay strictly in your browser memory and are never stored on any server.
          </div>
        </div>
      </div>
    </footer>
  );
};
