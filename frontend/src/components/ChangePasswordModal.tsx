import React, { useState } from 'react';
import { api } from '../services/api';
import { Icon } from './Icon';

interface ChangePasswordModalProps {
  token: string;
  username: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  token,
  username,
  onClose,
  onSuccess
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (oldPassword === newPassword) {
      setError('New password must be different from the current password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.changePassword(token, {
        old_password: oldPassword,
        new_password: newPassword
      });
      setSuccess(res.message || 'Password updated successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-[#E0F2FE] text-[#0284C7]">
              <Icon name="lock" size={18} />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#101828]">
                Change Account Password
              </h2>
              <p className="text-[11px] text-[#667085]">
                Account: <strong className="text-[#101828]">{username}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-[#667085] hover:bg-slate-100 cursor-pointer"
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

        {success && (
          <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-[#079455]">
            ✓ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#344054]">
              Current Password
            </label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#344054]">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#344054]">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] px-3 py-2 text-sm focus:border-[#007F78] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg px-4 py-2 text-xs font-bold text-[#475467] hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="primary-button cursor-pointer"
            >
              {isSubmitting ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
