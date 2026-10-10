import React, { useState } from 'react';
import { api } from '../services/api';
import { Area } from '../types';
import { Icon } from './Icon';

interface CreateAlertModalProps {
  token: string;
  areas: Area[];
  onClose: () => void;
  onAlertCreated: () => void;
}

export const CreateAlertModal: React.FC<CreateAlertModalProps> = ({
  token,
  areas,
  onClose,
  onAlertCreated
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instruction, setInstruction] = useState('');
  const [hazardType, setHazardType] = useState('cyclone');
  const [severity, setSeverity] = useState('critical');
  const [areaId, setAreaId] = useState(areas[0]?.id || 'area-chennai');
  const initialArea = areas.find((a) => a.id === (areas[0]?.id || 'area-chennai')) || areas[0];
  const [lat, setLat] = useState<string>(initialArea ? initialArea.center_lat.toFixed(4) : '13.0827');
  const [lng, setLng] = useState<string>(initialArea ? initialArea.center_lng.toFixed(4) : '80.2707');
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
        () => {
          // fallback
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    try {
      await api.adminCreateAlert(token, {
        title,
        description_original: description,
        instruction_original: instruction,
        original_language: 'en',
        hazard_type: hazardType,
        severity: severity,
        area_id: areaId,
        source_id: 'source-imd',
        is_simulated: true,
        verification_status: 'editor_verified',
        lat: !isNaN(parsedLat) ? parsedLat : null,
        lng: !isNaN(parsedLng) ? parsedLng : null
      });
      onAlertCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to publish alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-lg bg-[#DDF8EF] text-[#005E59]">
              <Icon name="plus" size={18} />
            </span>
            <h2 className="text-lg font-extrabold text-[#101828]">
              Publish Curated Emergency Notice
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
              Notice Title / Headline
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Flash Flood Alert for Velachery Sector"
              className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#344054]">
                Hazard Type
              </label>
              <select
                value={hazardType}
                onChange={(e) => setHazardType(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none"
              >
                <option value="cyclone">Cyclone</option>
                <option value="flood">Flood</option>
                <option value="heavy_rain">Heavy Rain</option>
                <option value="waterlogging">Waterlogging</option>
              </select>
            </div>
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
          </div>

          <div>
            <label className="block text-xs font-bold text-[#344054]">
              Target Area
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#344054]">
                  Latitude (for Map Marker)
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
                placeholder="e.g. 13.0827"
                className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#344054]">
                Longitude (for Map Marker)
              </label>
              <input
                type="number"
                step="0.0001"
                required
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="e.g. 80.2707"
                className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#344054]">
              Official Directive / Description
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State the observed conditions and official advisory."
              className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#344054]">
              Recommended Tourist Action
            </label>
            <input
              type="text"
              required
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g. Avoid low-lying subways; seek designated shelter if stranded."
              className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none"
            />
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
              {isSubmitting ? 'Publishing…' : 'Publish Curated Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
