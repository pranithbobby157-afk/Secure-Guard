import React from 'react';
import { EmergencyContact } from '../types';
import { Phone, X } from 'lucide-react';

interface EmergencyContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: EmergencyContact[];
  areaName?: string;
}

export const EmergencyContactsModal: React.FC<EmergencyContactsModalProps> = ({
  isOpen,
  onClose,
  contacts,
  areaName
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: '#ef4444', padding: '0.4rem', borderRadius: '8px', color: 'white', display: 'flex' }}>
              <Phone size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#f8fafc' }}>
                Emergency Helplines & Guidance
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Verified contacts for {areaName || 'Tamil Nadu'}
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Immediate Danger Alert */}
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#fca5a5', fontSize: '0.84rem' }}>
          <strong>If you are in immediate life danger:</strong> Call <strong>112</strong> immediately. SafeRoute is an informational aid and cannot dispatch emergency rescue units directly.
        </div>

        {/* Contacts List */}
        <h4 style={{ fontSize: '0.92rem', color: '#e2e8f0', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Official Disaster Helplines
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
          {contacts.map((c) => (
            <div
              key={c.id}
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.92rem' }}>
                  {c.service_name}
                </div>
                {c.description && (
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                    {c.description}
                  </div>
                )}
              </div>

              <a
                href={`tel:${c.phone_number}`}
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '0.45rem 0.95rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                }}
              >
                <Phone size={13} /> {c.phone_number}
              </a>
            </div>
          ))}
        </div>

        {/* Essential Extreme Weather Tips for Tourists */}
        <h4 style={{ fontSize: '0.92rem', color: '#e2e8f0', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Tourist Survival Checklist
        </h4>
        <ul style={{ paddingLeft: '1.25rem', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.6 }}>
          <li>Never step into flood water — concealed manholes, electrical currents, and currents pose severe hazards.</li>
          <li>Preserve phone battery by switching to battery saver and offline offline maps.</li>
          <li>Drink only bottled or boiled water during flood alerts to prevent waterborne contamination.</li>
          <li>Foreign nationals: Keep your passport and visa documents in a sealed waterproof pouch.</li>
        </ul>
      </div>
    </div>
  );
};
