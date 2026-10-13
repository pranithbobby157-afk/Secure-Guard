import React, { useState } from 'react';
import { api } from '../services/api';
import { Area, SafeZone } from '../types';
import { Icon } from './Icon';

interface EditSafeZoneModalProps {
  safeZone: SafeZone;
  token: string;
  areas: Area[];
  onClose: () => void;
  onSafeZoneUpdated: (updated: SafeZone) => void;
}

type FacilityType = 'designated_shelter' | 'relief_centre' | 'hospital' | 'transit_hub';
type OperationalStatus = 'open' | 'on_standby' | 'unverified';

export const EditSafeZoneModal: React.FC<EditSafeZoneModalProps> = ({
  safeZone,
  token,
  areas,
  onClose,
  onSafeZoneUpdated
}) => {
  const [name, setName] = useState(safeZone.name || '');
  const [facilityType, setFacilityType] = useState<FacilityType>(
    (safeZone.facility_type as FacilityType) || 'designated_shelter'
  );
  const [operationalStatus, setOperationalStatus] = useState<OperationalStatus>(
    (safeZone.operational_status as OperationalStatus) || 'open'
  );
  const [address, setAddress] = useState(safeZone.address || '');
  const [lat, setLat] = useState<string>(
    safeZone.latitude !== undefined && safeZone.latitude !== null
      ? String(safeZone.latitude)
      : '13.0827'
  );
  const [lng, setLng] = useState<string>(
    safeZone.longitude !== undefined && safeZone.longitude !== null
      ? String(safeZone.longitude)
      : '80.2707'
  );
  const [contactPhone, setContactPhone] = useState(safeZone.contact_phone || '');
  const [capacityNotes, setCapacityNotes] = useState(safeZone.capacity_notes || '');
  const [sourceName, setSourceName] = useState(safeZone.source_name || 'Greater Chennai Corporation (GCC)');
  const [verificationStatus, setVerificationStatus] = useState(safeZone.verification_status || 'official_verified');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUseGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(4));
          setLng(pos.coords.longitude.toFixed(4));
        },
        () => {}
      );
    }
  };

  const handleSetAreaCenter = () => {
    const matched = areas.find((a) => a.id === safeZone.area_id);
    if (matched) {
      setLat(matched.center_lat.toFixed(4));
      setLng(matched.center_lng.toFixed(4));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      setError('Please provide valid latitude and longitude coordinates.');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload: any = {
        name,
        facility_type: facilityType,
        operational_status: operationalStatus,
        address,
        latitude: parsedLat,
        longitude: parsedLng,
        contact_phone: contactPhone || null,
        capacity_notes: capacityNotes || null,
        source_name: sourceName,
        verification_status: verificationStatus
      };

      const updated = await api.adminUpdateSafeZone(token, safeZone.id, payload);
      onSafeZoneUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update safe zone');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-[#DDF8EF] text-[#005E59]">
              <Icon name="shield" size={18} />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#101828]">
                Edit Designated Safe Place / Shelter
              </h2>
              <p className="text-[11px] text-[#667085] font-mono">
                ID: {safeZone.id} {safeZone.is_simulated ? '· Simulated' : '· Official'}
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
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-[#344054]">
              Shelter / Facility Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none"
            />
          </div>

          {/* Facility Type & Operational Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#344054]">
                Facility Type
              </label>
              <select
                value={facilityType}
                onChange={(e) => setFacilityType(e.target.value as FacilityType)}
                className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none"
              >
                <option value="designated_shelter">Designated Cyclone Shelter</option>
                <option value="relief_centre">Relief Centre / Community Hall</option>
                <option value="hospital">Hospital / Medical Hub</option>
                <option value="transit_hub">Safe Transit Hub</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#344054]">
                Operational Status
              </label>
              <select
                value={operationalStatus}
                onChange={(e) => setOperationalStatus(e.target.value as OperationalStatus)}
                className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none"
              >
                <option value="open">Open (Accepting Evacuees)</option>
                <option value="on_standby">On Standby / Limited</option>
                <option value="unverified">Unverified / Needs Check</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-[#344054]">
              Physical Address & Location Details
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none"
            />
          </div>

          {/* Coordinates */}
          <div className="rounded-xl border border-[#E2E8F0] bg-slate-50/50 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#344054]">
                Geographic Coordinates
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUseGps}
                  className="text-[11px] font-bold text-[#007F78] hover:underline"
                >
                  Use My GPS
                </button>
                <button
                  type="button"
                  onClick={handleSetAreaCenter}
                  className="text-[11px] font-bold text-[#475467] hover:underline"
                >
                  Reset to Area Center
                </button>
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
                  required
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
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
                  required
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#D0D5DD] bg-white px-2.5 py-1.5 text-xs font-mono focus:border-[#007F78] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Phone and Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#344054]">
                Contact Helpline Phone
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="e.g. +91 44 2561 9206"
                className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#344054]">
                Managing Source / Agency
              </label>
              <input
                type="text"
                required
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none"
              />
            </div>
          </div>

          {/* Capacity Notes */}
          <div>
            <label className="block text-xs font-bold text-[#344054]">
              Capacity & Facilities Description
            </label>
            <textarea
              rows={2}
              value={capacityNotes}
              onChange={(e) => setCapacityNotes(e.target.value)}
              placeholder="e.g. Capacity for 400 evacuees, food, clean drinking water, generator standby"
              className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none"
            />
          </div>

          {/* Verification Status */}
          <div>
            <label className="block text-xs font-bold text-[#344054]">
              Verification Status
            </label>
            <select
              value={verificationStatus}
              onChange={(e) => setVerificationStatus(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none"
            >
              <option value="official_verified">Official Verified</option>
              <option value="editor_verified">Editor Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>

          {/* Action Buttons */}
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
              {isSubmitting ? 'Saving Changes…' : 'Save Safe Place'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
