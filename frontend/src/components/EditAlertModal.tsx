import React, { useState } from 'react';
import { api } from '../services/api';
import { Alert, Area } from '../types';
import { Icon } from './Icon';

interface EditAlertModalProps {
  alert: Alert;
  token: string;
  areas: Area[];
  onClose: () => void;
  onAlertUpdated: (updated: Alert) => void;
}

export const EditAlertModal: React.FC<EditAlertModalProps> = ({
  alert,
  token,
  areas,
  onClose,
  onAlertUpdated
}) => {
  const [title, setTitle] = useState(alert.title || '');
  const [description, setDescription] = useState(alert.description_original || '');
  const [instruction, setInstruction] = useState(alert.instruction_original || '');
  const [severity, setSeverity] = useState<string>(alert.severity || 'warning');
  const [status, setStatus] = useState<string>(alert.status || 'active');
  const [verificationStatus, setVerificationStatus] = useState<string>(
    alert.verification_status || 'editor_verified'
  );
  const [lat, setLat] = useState<string>(
    alert.lat !== undefined && alert.lat !== null ? String(alert.lat) : ''
  );
  const [lng, setLng] = useState<string>(
    alert.lng !== undefined && alert.lng !== null ? String(alert.lng) : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUseGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(4));
          setLng(pos.coords.longitude.toFixed(4));
        },
        () => {
          // ignore or keep existing
        }
      );
    }
  };

  const handleSetAreaCenter = (areaId: string) => {
    const matched = areas.find((a) => a.id === areaId);
    if (matched) {
      setLat(matched.center_lat.toFixed(4));
      setLng(matched.center_lng.toFixed(4));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const parsedLat = lat.trim() !== '' ? parseFloat(lat) : null;
    const parsedLng = lng.trim() !== '' ? parseFloat(lng) : null;

    try {
      const payload: any = {
        title,
        description_original: description,
        instruction_original: instruction,
        severity,
        status,
        verification_status: verificationStatus,
        lat: parsedLat !== null && !isNaN(parsedLat) ? parsedLat : null,
        lng: parsedLng !== null && !isNaN(parsedLng) ? parsedLng : null
      };

      const updated = await api.adminUpdateAlert(token, alert.id, payload);
      onAlertUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-[#E0F2FE] text-[#0284C7]">
              <Icon name="check" size={18} />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#101828]">
                Edit Emergency Alert
              </h2>
              <p className="text-[11px] text-[#667085] font-mono">
                ID: {alert.id} {alert.is_simulated ? '· Simulated' : '· Official'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-[#667085] hover:bg-slate-100"
            aria-label="Close dialog"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-[#B42318]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#344054]">
              Notice Headline / Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none"
            />
          </div>

          {/* Status & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#344054]">
                Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none"
              >
                <option value="critical">Critical (Red)</option>
                <option value="warning">Warning (Amber)</option>
                <option value="watch">Watch (Yellow)</option>
                <option value="advisory">Advisory</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#344054]">
                Operational Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none"
              >
                <option value="active">Active (Visible)</option>
                <option value="resolved">Resolved</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#344054]">
                Verification Status
              </label>
              <select
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none"
              >
                <option value="editor_verified">Editor Verified</option>
                <option value="official_source">Official Source</option>
                <option value="unverified">Unverified</option>
                <option value="refuted">Refuted</option>
              </select>
            </div>
          </div>

          {/* Location Coordinates */}
          <div className="rounded-xl border border-[#E2E8F0] bg-slate-50/50 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#344054]">
                Map Coordinates (Optional)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUseGps}
                  className="text-[11px] font-bold text-[#007F78] hover:underline"
                >
                  Use My GPS
                </button>
                {alert.area_id && (
                  <button
                    type="button"
                    onClick={() => handleSetAreaCenter(alert.area_id)}
                    className="text-[11px] font-bold text-[#475467] hover:underline"
                  >
                    Reset to Area Center
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#667085]">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="e.g. 13.0827"
                  className="mt-1 w-full rounded-lg border border-[#D0D5DD] bg-white px-2.5 py-1.5 text-xs font-mono focus:border-[#007F78] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#667085]">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="e.g. 80.2707"
                  className="mt-1 w-full rounded-lg border border-[#D0D5DD] bg-white px-2.5 py-1.5 text-xs font-mono focus:border-[#007F78] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#344054]">
              Official Directive / Description
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none"
            />
          </div>

          {/* Tourist Action */}
          <div>
            <label className="block text-xs font-bold text-[#344054]">
              Recommended Tourist Action
            </label>
            <input
              type="text"
              required
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-bold text-[#475467] hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="primary-button cursor-pointer"
            >
              {isSubmitting ? 'Saving Changes…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
