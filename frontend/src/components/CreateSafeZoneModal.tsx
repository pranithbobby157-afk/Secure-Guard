import React, { useState } from 'react';
import { api } from '../services/api';
import { Area } from '../types';
import { Icon } from './Icon';

interface CreateSafeZoneModalProps {
  token: string;
  areas: Area[];
  onClose: () => void;
  onSafeZoneCreated: () => void;
}

export const CreateSafeZoneModal: React.FC<CreateSafeZoneModalProps> = ({
  token,
  areas,
  onClose,
  onSafeZoneCreated
}) => {
  const [areaId, setAreaId] = useState(areas[0]?.id || 'area-chennai-coastal');
  const initialArea = areas.find((a) => a.id === areaId) || areas[0];

  const [name, setName] = useState('');
  const [facilityType, setFacilityType] = useState('cyclone_shelter');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<string>(initialArea ? initialArea.center_lat.toFixed(4) : '13.0827');
  const [lng, setLng] = useState<string>(initialArea ? initialArea.center_lng.toFixed(4) : '80.2707');
  const [operationalStatus, setOperationalStatus] = useState('open');
  const [contactPhone, setContactPhone] = useState('');
  const [capacityNotes, setCapacityNotes] = useState('Capacity for 300 evacuees, food and medical supplies available');
  const [sourceName, setSourceName] = useState('Greater Chennai Corporation (GCC)');
  const [isSimulated, setIsSimulated] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAreaChange = (newAreaId: string) => {
    setAreaId(newAreaId);
    const selected = areas.find((a) => a.id === newAreaId);
    if (selected) {
      setLat(selected.center_lat.toFixed(4));
      setLng(selected.center_lng.toFixed(4));
    }
  };

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
      await api.adminCreateSafeZone(token, {
        area_id: areaId,
        name,
        facility_type: facilityType,
        address,
        latitude: parsedLat,
        longitude: parsedLng,
        operational_status: operationalStatus,
        contact_phone: contactPhone || null,
        capacity_notes: capacityNotes || null,
        source_name: sourceName,
        source_url: 'https://chennaicorporation.gov.in',
        verification_status: 'official_verified',
        is_simulated: isSimulated
      });
      onSafeZoneCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to register safe place');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-lg bg-[#DDF8EF] text-[#005E59]">
              <Icon name="shield" size={18} />
            </span>
            <h2 className="text-lg font-extrabold text-[#101828]">
              Register Safe Place / Shelter
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-[#667085] hover:bg-slate-100"
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
          <div>
            <label className="block text-xs font-bold text-[#344054]">
              Shelter / Facility Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marina Beach GCC Community Hall & Relief Center"
              className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#344054]">
                Facility Type
              </label>
              <select
                value={facilityType}
                onChange={(e) => setFacilityType(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none"
              >
                <option value="cyclone_shelter">Cyclone Shelter</option>
                <option value="flood_relief_camp">Flood Relief Camp</option>
                <option value="community_hall">Community Hall</option>
                <option value="hospital">Hospital / Medical Hub</option>
                <option value="relief_camp">Relief Camp</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#344054]">
                Operational Status
              </label>
              <select
                value={operationalStatus}
                onChange={(e) => setOperationalStatus(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none"
              >
                <option value="open">Open (Accepting Evacuees)</option>
                <option value="limited">Limited Capacity</option>
                <option value="full">Full</option>
                <option value="closed">Closed / Standby</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#344054]">
              Assigned Geographic Area
            </label>
            <select
              value={areaId}
              onChange={(e) => handleAreaChange(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none"
            >
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.state_region})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#344054]">
              Street Address & Landmarks
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Kamarajar Salai, Triplicane, Chennai 600005"
              className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#344054]">
                  Latitude (Map Pin)
                </label>
                <button
                  type="button"
                  onClick={handleUseGps}
                  className="text-[10px] text-[#007F78] font-bold hover:underline"
                >
                  Use GPS
                </button>
              </div>
              <input
                type="number"
                step="0.0001"
                required
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="13.0500"
                className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#344054]">
                Longitude (Map Pin)
              </label>
              <input
                type="number"
                step="0.0001"
                required
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="80.2824"
                className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#344054]">
                Direct Contact Phone
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="044-25619206"
                className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#344054]">
                Managing Authority
              </label>
              <input
                type="text"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="Greater Chennai Corporation"
                className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#344054]">
              Capacity & Facilities
            </label>
            <input
              type="text"
              value={capacityNotes}
              onChange={(e) => setCapacityNotes(e.target.value)}
              placeholder="e.g. Capacity 400 evacuees, generator, drinking water"
              className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_simulated_sz"
              checked={isSimulated}
              onChange={(e) => setIsSimulated(e.target.checked)}
              className="size-4 rounded border-[#D0D5DD] text-[#007F78] focus:ring-[#007F78]"
            />
            <label htmlFor="is_simulated_sz" className="text-xs font-medium text-[#475467]">
              Mark with SIMULATION badge (demonstration facility)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-bold text-[#475467] hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="primary-button"
            >
              {isSubmitting ? 'Registering…' : 'Register Safe Place on Map'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
