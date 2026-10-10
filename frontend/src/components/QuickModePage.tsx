import React from 'react';
import { Copy } from '../i18n/messages';
import { Icon } from './Icon';
import { Page } from './Header';
import { EMERGENCY_PHRASES } from '../services/phrases';

interface QuickModePageProps {
  t: Copy;
  navigate: (p: Page) => void;
  areaName?: string;
}

export const QuickModePage: React.FC<QuickModePageProps> = ({
  t: _t,
  navigate,
  areaName
}) => {
  const speakQuickPhrase = (text: string, lang = 'ta-IN') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang;
    utt.rate = 0.85;
    window.speechSynthesis.speak(utt);
  };

  const topPhrases = EMERGENCY_PHRASES.slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      {/* High-Contrast Quick Mode Header */}
      <div className="rounded-2xl border-2 border-red-500 bg-red-50/50 p-5 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#D92D20]">
            <Icon name="zap" size={16} />
            Quick Emergency Mode
          </div>
          <span className="rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-extrabold text-[#B42318]">
            HIGH PRIORITY
          </span>
        </div>

        <h1 className="mt-2 text-2xl font-black text-[#101828] sm:text-3xl">
          Immediate Emergency Assistance
        </h1>
        <p className="mt-1 text-sm font-semibold text-[#475467]">
          One-tap access to primary verified disaster and medical lifelines for {areaName || 'Tamil Nadu & India'}.
        </p>

        {/* Anti-Fake SOS Transparent Notice */}
        <div className="mt-4 rounded-xl border border-red-200 bg-white p-3.5 text-xs text-[#7A271A]">
          <div className="flex items-start gap-2">
            <span className="text-[#D92D20] shrink-0 mt-0.5">
              <Icon name="info" size={16} />
            </span>
            <p className="leading-5">
              <strong>TELEPHONE CALL NOTICE:</strong> SafeRoute is an informational crisis aid. Tapping below opens your device's cellular dialer to connect directly with official government dispatchers. SafeRoute does not silently track or dispatch emergency personnel.
            </p>
          </div>
        </div>
      </div>

      {/* 1-Tap Emergency Call Grid (Large touch targets) */}
      <div className="mt-6">
        <h2 className="text-sm font-black uppercase tracking-wider text-[#344054] mb-3">
          1-Tap Emergency Helplines (24x7 Toll Free)
        </h2>
        <div className="grid gap-3.5 sm:grid-cols-2">
          {/* 112 All-India Emergency */}
          <a
            href="tel:112"
            className="flex min-h-[84px] items-center justify-between rounded-2xl bg-[#D92D20] p-4 text-white shadow-lg transition-transform active:scale-98 hover:bg-[#B42318]"
          >
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest opacity-90 block">
                POLICE · FIRE · DISASTER
              </span>
              <strong className="text-3xl font-black tracking-tight">112</strong>
              <span className="text-[11px] font-semibold opacity-90 block">
                All-India Emergency Number
              </span>
            </div>
            <span className="grid size-12 place-items-center rounded-xl bg-white/20 text-white">
              <Icon name="phone" size={26} />
            </span>
          </a>

          {/* 108 Medical Ambulance */}
          <a
            href="tel:108"
            className="flex min-h-[84px] items-center justify-between rounded-2xl bg-[#007F78] p-4 text-white shadow-lg transition-transform active:scale-98 hover:bg-[#005E59]"
          >
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest opacity-90 block">
                MEDICAL EMERGENCY
              </span>
              <strong className="text-3xl font-black tracking-tight">108</strong>
              <span className="text-[11px] font-semibold opacity-90 block">
                Free Ambulance & Life Support
              </span>
            </div>
            <span className="grid size-12 place-items-center rounded-xl bg-white/20 text-white">
              <Icon name="hospital" size={26} />
            </span>
          </a>

          {/* 1913 GCC Flood Line */}
          <a
            href="tel:1913"
            className="flex min-h-[76px] items-center justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 text-[#101828] shadow-sm transition-transform active:scale-98 hover:bg-slate-50"
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#007F78] block">
                CHENNAI CORPORATION
              </span>
              <strong className="text-2xl font-black text-[#101828]">1913</strong>
              <span className="text-[11px] font-medium text-[#667085] block">
                Waterlogging & Flood Help
              </span>
            </div>
            <span className="grid size-10 place-items-center rounded-lg bg-[#F2F4F7] text-[#007F78]">
              <Icon name="phone" size={20} />
            </span>
          </a>

          {/* 1070 State Disaster Operations */}
          <a
            href="tel:1070"
            className="flex min-h-[76px] items-center justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 text-[#101828] shadow-sm transition-transform active:scale-98 hover:bg-slate-50"
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#DC6803] block">
                TAMIL NADU DISASTER ROOM
              </span>
              <strong className="text-2xl font-black text-[#101828]">1070</strong>
              <span className="text-[11px] font-medium text-[#667085] block">
                State Emergency Control
              </span>
            </div>
            <span className="grid size-10 place-items-center rounded-lg bg-[#F2F4F7] text-[#DC6803]">
              <Icon name="phone" size={20} />
            </span>
          </a>
        </div>
      </div>

      {/* Instant Crisis Audio Phrases */}
      <div className="mt-8 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-extrabold text-[#101828]">
              Instant Emergency Audio Phrases (Tamil)
            </h2>
            <p className="text-xs text-[#667085]">
              Tap "Play Audio" to speak these urgent phrases aloud in Tamil.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('phrasebook')}
            className="text-xs font-bold text-[#007F78] hover:underline"
          >
            View All Phrases →
          </button>
        </div>

        <div className="space-y-3">
          {topPhrases.map((phrase) => (
            <div
              key={phrase.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5"
            >
              <div>
                <strong className="text-sm font-bold text-[#101828] block">
                  {phrase.ta}
                </strong>
                <span className="text-xs text-[#007F78] font-medium block">
                  "{phrase.taPhonetic}"
                </span>
                <span className="text-[11px] text-[#667085] block mt-0.5">
                  Meaning: {phrase.en}
                </span>
              </div>

              <button
                type="button"
                onClick={() => speakQuickPhrase(phrase.ta, 'ta-IN')}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#007F78] px-3 py-2 text-xs font-bold text-white hover:bg-[#005E59]"
              >
                <Icon name="volume" size={15} />
                <span>Play Audio</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Rapid Action Navigation Buttons */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => navigate('map')}
          className="flex flex-col items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white p-4 text-center hover:bg-slate-50 shadow-sm"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-[#007F78] mb-2">
            <Icon name="building" size={20} />
          </span>
          <strong className="text-sm font-bold text-[#101828]">Nearest Shelters</strong>
          <small className="text-[11px] text-[#667085]">View on Map</small>
        </button>

        <button
          type="button"
          onClick={() => navigate('routes')}
          className="flex flex-col items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white p-4 text-center hover:bg-slate-50 shadow-sm"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-[#175CD3] mb-2">
            <Icon name="route" size={20} />
          </span>
          <strong className="text-sm font-bold text-[#101828]">Check Route Corridor</strong>
          <small className="text-[11px] text-[#667085]">Safe travel check</small>
        </button>

        <button
          type="button"
          onClick={() => navigate('verify')}
          className="flex flex-col items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white p-4 text-center hover:bg-slate-50 shadow-sm"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-[#DC6803] mb-2">
            <Icon name="shield" size={20} />
          </span>
          <strong className="text-sm font-bold text-[#101828]">Verify News / Rumors</strong>
          <small className="text-[11px] text-[#667085]">Cross-reference claims</small>
        </button>
      </div>
    </div>
  );
};
