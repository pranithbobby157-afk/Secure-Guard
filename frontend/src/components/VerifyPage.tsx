import React, { useState } from 'react';
import { Alert } from '../types';
import { Copy } from '../i18n/messages';
import { Icon } from './Icon';
import { VerificationResult, verifyClaim } from '../services/verification';
import { savedStore } from '../services/savedStore';

interface VerifyPageProps {
  t: Copy;
  alerts: Alert[];
}

export const VerifyPage: React.FC<VerifyPageProps> = ({ t, alerts }) => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const sampleClaims = [
    {
      label: 'Cyclone Red Alert',
      text: 'Severe cyclonic storm approaching Chennai coast with gusts up to 95 km/h. Marina Beach evacuated.'
    },
    {
      label: 'Velachery Flooding',
      text: 'Severe waterlogging in Velachery 100 Feet Road and Madipakkam Lake. Road access curtailed.'
    },
    {
      label: 'Palar River Inflow',
      text: 'Heavy rainfall and reservoir inflow advisory for Palar River basin check dams.'
    },
    {
      label: 'Unverified Rumor',
      text: 'Entire Chennai power grid will be shut down for next 5 days and all airport flights permanently cancelled.'
    }
  ];

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSavedSuccess(false);

    if (!inputText.trim()) {
      setErrorMsg('Please paste or type a message, claim, or news snippet to verify.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      try {
        const res = verifyClaim(inputText, alerts);
        setResult(res);
      } catch (err: any) {
        setErrorMsg(err.message || 'An error occurred during verification.');
      } finally {
        setIsVerifying(false);
      }
    }, 200);
  };

  const handleSaveResult = () => {
    if (!result) return;
    savedStore.save({
      id: `verify-${Date.now()}`,
      type: 'alert',
      title: `Verification: ${result.status.replace('_', ' ').toUpperCase()}`,
      subtitle: result.summary,
      badge: `${result.confidenceScore}% match`,
      details: `Input: "${inputText.slice(0, 100)}..."`,
      data: {
        query: inputText,
        result
      }
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="page-shell narrow">
      {/* Page Intro */}
      <section className="page-intro">
        <div>
          <div className="eyebrow">
            <Icon name="shield" size={14} />
            {t.verification || 'Message Verification'}
          </div>
          <h1>Verify Emergency Claims & Messages</h1>
          <p>
            Cross-reference viral WhatsApp forwards, SMS messages, and social media claims against official disaster management bulletins.
          </p>
        </div>

        <div className="freshness">
          <span className="status-dot bg-[#007F78]" />
          <span>
            <strong>Official Cross-Reference</strong>
            <small>IMD · TNSDMA · GCC Active Records</small>
          </span>
        </div>
      </section>

      {/* Main Verification Input Card */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label
              htmlFor="verify-textarea"
              className="block text-xs font-bold uppercase tracking-wider text-[#475467] mb-2"
            >
              Paste Message or Forwarded Text
            </label>
            <textarea
              id="verify-textarea"
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste emergency WhatsApp message, news alert, or crisis announcement here..."
              className="w-full rounded-xl border border-[#D0D5DD] p-3 text-sm text-[#101828] placeholder-[#98A2B3] focus:border-[#007F78] focus:ring-1 focus:ring-[#007F78]"
            />
          </div>

          {/* Sample Prompts */}
          <div>
            <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block mb-1.5">
              Try sample claims:
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleClaims.map((sample) => (
                <button
                  type="button"
                  key={sample.label}
                  onClick={() => {
                    setInputText(sample.text);
                    setErrorMsg(null);
                  }}
                  className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-xs font-semibold text-[#475467] hover:bg-[#EAECF0]"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-[#B42318] flex items-center gap-2">
              <Icon name="warning" size={15} />
              {errorMsg}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isVerifying}
              className="primary-button min-w-40"
            >
              <Icon name="search" size={16} />
              {isVerifying ? 'Verifying Records…' : 'Verify Against Bulletins'}
            </button>

            {inputText && (
              <button
                type="button"
                onClick={() => {
                  setInputText('');
                  setResult(null);
                  setErrorMsg(null);
                }}
                className="text-xs font-bold text-[#667085] hover:text-[#101828] px-3 py-2"
              >
                Clear Input
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Verification Result Display */}
      {result && (
        <div className="mt-8 space-y-4">
          <div
            className={`rounded-2xl border p-6 shadow-sm ${
              result.status === 'verified_official_match'
                ? 'border-emerald-300 bg-emerald-50/40'
                : result.status === 'partial_match'
                ? 'border-amber-300 bg-amber-50/40'
                : result.status === 'stale_match'
                ? 'border-purple-300 bg-purple-50/40'
                : 'border-[#CBD5E1] bg-[#F8FAFC]'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span
                  className={`grid size-9 place-items-center rounded-xl text-white ${
                    result.status === 'verified_official_match'
                      ? 'bg-[#079455]'
                      : result.status === 'partial_match'
                      ? 'bg-[#DC6803]'
                      : result.status === 'stale_match'
                      ? 'bg-[#7E56D9]'
                      : 'bg-[#667085]'
                  }`}
                >
                  <Icon
                    name={
                      result.status === 'verified_official_match'
                        ? 'check'
                        : result.status === 'no_match'
                        ? 'x'
                        : 'warning'
                    }
                    size={20}
                  />
                </span>

                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#667085]">
                    Verification Status
                  </span>
                  <h3 className="text-lg font-extrabold text-[#101828]">
                    {result.status === 'verified_official_match'
                      ? 'Verified Official Match Found'
                      : result.status === 'partial_match'
                      ? 'Partial Match / Unconfirmed Details'
                      : result.status === 'stale_match'
                      ? 'Matched Expired / Past Advisory'
                      : 'No Matching Official Bulletin Found'}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveResult}
                className="flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-bold text-[#475467] hover:bg-[#F2F4F7]"
              >
                <Icon name="bookmark" size={14} />
                {savedSuccess ? 'Saved' : 'Save Result'}
              </button>
            </div>

            <p className="mt-4 text-sm font-semibold text-[#344054]">
              {result.summary}
            </p>

            {/* Keyword chips */}
            {result.matchedKeywords.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#667085]">
                  Matched terms:
                </span>
                {result.matchedKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded bg-white/80 px-2 py-0.5 text-[11px] font-bold text-[#007F78] ring-1 ring-[#E2E8F0]"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}

            {/* Official Bulletin Metadata if Matched */}
            {result.matchedAlert && (
              <div className="mt-5 rounded-xl border border-[#E2E8F0] bg-white p-4 text-xs">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                  <span className="font-bold text-[#007F78]">
                    Official Source: {result.sourceAttribution || result.matchedAlert.source?.name}
                  </span>
                  <span className="text-[#667085]">
                    Issued:{' '}
                    {result.issuedAt
                      ? new Date(result.issuedAt).toLocaleString()
                      : 'Active'}
                  </span>
                </div>
                <div className="mt-3">
                  <strong className="block text-sm font-bold text-[#101828]">
                    {result.matchedAlert.title}
                  </strong>
                  <p className="mt-1 text-[#475467] leading-5">
                    {result.matchedAlert.description_original}
                  </p>
                  {result.matchedAlert.instruction_original && (
                    <div className="mt-2 rounded bg-red-50 p-2 font-semibold text-[#B42318]">
                      Official Instruction: {result.matchedAlert.instruction_original}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-4 border-t border-black/10 pt-3 text-[11px] leading-5 text-[#475467]">
              <div className="flex items-start gap-1.5">
                <Icon name="info" size={14} />
                <span>{result.disclaimer}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guidance Note */}
      <div className="trust-note mt-8">
        <Icon name="info" size={19} />
        <p>
          <strong>Responsible Information Verification</strong>
          <br />
          During disaster events, misinformation spreads rapidly on social media and messaging apps. SafeRoute compares messages with published meteorological bulletins. If in doubt, dial <strong>112</strong> or consult official state emergency portals directly.
        </p>
      </div>
    </div>
  );
};
