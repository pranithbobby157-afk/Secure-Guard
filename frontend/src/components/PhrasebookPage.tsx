import React, { useState } from 'react';
import { Copy, Language } from '../i18n/messages';
import { Icon } from './Icon';
import {
  CATEGORY_LABELS,
  EMERGENCY_PHRASES,
  EmergencyPhrase,
  PhraseCategory
} from '../services/phrases';
import { savedStore } from '../services/savedStore';

interface PhrasebookPageProps {
  t: Copy;
  currentLanguage: Language;
}

export const PhrasebookPage: React.FC<PhrasebookPageProps> = ({
  t: _t,
  currentLanguage
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [targetLang, setTargetLang] = useState<Language>(
    currentLanguage === 'en' ? 'ta' : currentLanguage
  );
  const [largeText, setLargeText] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  // Filter phrases
  const filteredPhrases = EMERGENCY_PHRASES.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.en.toLowerCase().includes(q) ||
      p.ta.toLowerCase().includes(q) ||
      p.taPhonetic.toLowerCase().includes(q) ||
      p.hi.toLowerCase().includes(q) ||
      p.hiPhonetic.toLowerCase().includes(q) ||
      p.fr.toLowerCase().includes(q)
    );
  });

  // Copy to clipboard
  const handleCopy = (phrase: EmergencyPhrase) => {
    const textToCopy =
      targetLang === 'ta'
        ? `${phrase.ta} (${phrase.taPhonetic})`
        : targetLang === 'hi'
        ? `${phrase.hi} (${phrase.hiPhonetic})`
        : targetLang === 'fr'
        ? phrase.fr
        : phrase.en;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopiedId(phrase.id);
        setTimeout(() => setCopiedId(null), 2500);
      });
    }
  };

  // Text-to-speech with Web Speech API
  const handleSpeak = (phrase: EmergencyPhrase) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported by your browser.');
      return;
    }

    window.speechSynthesis.cancel();

    let textToSpeak = phrase.en;
    let langCode = 'en-US';

    if (targetLang === 'ta') {
      textToSpeak = phrase.ta;
      langCode = 'ta-IN';
    } else if (targetLang === 'hi') {
      textToSpeak = phrase.hi;
      langCode = 'hi-IN';
    } else if (targetLang === 'fr') {
      textToSpeak = phrase.fr;
      langCode = 'fr-FR';
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = langCode;
    utterance.rate = 0.9; // Slightly slower for clarity during emergencies

    utterance.onstart = () => setSpeakingId(phrase.id);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Save phrase
  const handleSavePhrase = (phrase: EmergencyPhrase) => {
    const text =
      targetLang === 'ta'
        ? phrase.ta
        : targetLang === 'hi'
        ? phrase.hi
        : targetLang === 'fr'
        ? phrase.fr
        : phrase.en;

    savedStore.save({
      id: `phrase-${phrase.id}-${targetLang}`,
      type: 'phrase',
      title: phrase.en,
      subtitle: text,
      badge: targetLang.toUpperCase(),
      details: targetLang === 'ta' ? phrase.taPhonetic : targetLang === 'hi' ? phrase.hiPhonetic : undefined,
      data: phrase
    });

    setSavedId(phrase.id);
    setTimeout(() => setSavedId(null), 2500);
  };

  const categories: PhraseCategory[] = [
    'help',
    'medical',
    'police',
    'directions',
    'needs',
    'danger',
    'shelter',
    'missing',
    'translation'
  ];

  return (
    <div className="page-shell">
      {/* Intro Header */}
      <section className="page-intro">
        <div>
          <div className="eyebrow">
            <Icon name="globe" size={14} />
            Multilingual Emergency Phrasebook
          </div>
          <h1>Crisis Phrasebook & Audio Pronunciation</h1>
          <p>
            Communicate vital emergency needs with local residents, rescue personnel, and healthcare workers across Tamil Nadu and India.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Large text toggle */}
          <button
            type="button"
            onClick={() => setLargeText(!largeText)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
              largeText
                ? 'border-[#007F78] bg-[#DDF8EF] text-[#005E59]'
                : 'border-[#E2E8F0] bg-white text-[#475467] hover:bg-slate-50'
            }`}
            title="Toggle high-visibility large text mode"
          >
            <span className="font-extrabold text-sm">Aa</span>
            <span>{largeText ? 'Large Text Active' : 'Large Text Mode'}</span>
          </button>

          {/* Target language selector */}
          <div className="flex rounded-xl border border-[#E2E8F0] bg-white p-1">
            {[
              ['ta', 'தமிழ் (Tamil)'],
              ['hi', 'हिन्दी (Hindi)'],
              ['fr', 'Français'],
              ['en', 'English']
            ].map(([code, name]) => (
              <button
                type="button"
                key={code}
                onClick={() => setTargetLang(code as Language)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                  targetLang === code
                    ? 'bg-[#007F78] text-white'
                    : 'text-[#475467] hover:bg-slate-50'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-3 text-[#98A2B3]">
            <Icon name="search" size={18} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search emergency phrases in English, Tamil, Hindi, or French..."
            className="w-full rounded-xl border border-[#D0D5DD] bg-white py-2.5 pl-10 pr-4 text-sm text-[#101828] focus:border-[#007F78] focus:ring-1 focus:ring-[#007F78]"
          />
        </div>

        {/* Category Pills */}
        <div className="filter-row" aria-label="Phrase categories">
          <button
            type="button"
            className={selectedCategory === 'all' ? 'selected' : ''}
            onClick={() => setSelectedCategory('all')}
          >
            All Phrases ({EMERGENCY_PHRASES.length})
          </button>
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              className={selectedCategory === cat ? 'selected' : ''}
              onClick={() => setSelectedCategory(cat)}
            >
              {CATEGORY_LABELS[cat][currentLanguage] || CATEGORY_LABELS[cat].en}
            </button>
          ))}
        </div>
      </div>

      {/* Phrases Grid */}
      {filteredPhrases.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPhrases.map((phrase) => {
            const translatedText =
              targetLang === 'ta'
                ? phrase.ta
                : targetLang === 'hi'
                ? phrase.hi
                : targetLang === 'fr'
                ? phrase.fr
                : phrase.en;

            const phonetic =
              targetLang === 'ta'
                ? phrase.taPhonetic
                : targetLang === 'hi'
                ? phrase.hiPhonetic
                : null;

            return (
              <div
                key={phrase.id}
                className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-[#F2F4F7] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#475467]">
                      {CATEGORY_LABELS[phrase.category].en}
                    </span>
                    <span className="text-[11px] font-bold text-[#007F78] uppercase">
                      {targetLang.toUpperCase()}
                    </span>
                  </div>

                  {/* Primary Translated Output (Large and clear) */}
                  <div className="mt-3">
                    <p
                      className={`font-extrabold text-[#101828] leading-tight ${
                        largeText ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'
                      }`}
                    >
                      {translatedText}
                    </p>

                    {/* Phonetic Pronunciation for non-native speakers */}
                    {phonetic && (
                      <p className="mt-1.5 text-xs font-semibold text-[#007F78] italic">
                        Pronounce: "{phonetic}"
                      </p>
                    )}

                    {/* English Reference */}
                    {targetLang !== 'en' && (
                      <p className="mt-2 text-xs text-[#667085] border-t border-[#F2F4F7] pt-2">
                        {phrase.en}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 flex items-center justify-between border-t border-[#E2E8F0] pt-3">
                  <div className="flex items-center gap-2">
                    {/* Speak Button */}
                    <button
                      type="button"
                      onClick={() => handleSpeak(phrase)}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors ${
                        speakingId === phrase.id
                          ? 'bg-[#007F78] text-white'
                          : 'bg-[#F2F4F7] text-[#344054] hover:bg-[#EAECF0]'
                      }`}
                      title="Speak phrase using text-to-speech audio"
                      aria-label="Speak phrase aloud"
                    >
                      <Icon name="volume" size={15} />
                      <span>{speakingId === phrase.id ? 'Speaking…' : 'Speak'}</span>
                    </button>

                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={() => handleCopy(phrase)}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#475467] hover:bg-[#F2F4F7]"
                      title="Copy text to clipboard"
                      aria-label="Copy phrase"
                    >
                      <Icon name="copy" size={14} />
                      <span>{copiedId === phrase.id ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={() => handleSavePhrase(phrase)}
                    className="flex size-8 items-center justify-center rounded-lg text-[#667085] hover:bg-[#F2F4F7] hover:text-[#101828]"
                    title="Bookmark to Saved Items"
                    aria-label="Save phrase"
                  >
                    <Icon name={savedId === phrase.id ? 'check' : 'bookmark'} size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <Icon name="search" size={24} />
          <h3>No phrases found</h3>
          <p>Try searching for keywords like "doctor", "water", "hospital", or "danger".</p>
        </div>
      )}

      {/* Offline Advice */}
      <div className="trust-note mt-8">
        <Icon name="info" size={19} />
        <p>
          <strong>Offline Ready</strong>
          <br />
          All phrases and phonetic guides are embedded locally and remain fully accessible even if mobile connectivity is lost during a cyclone or flood. Bookmark critical phrases to your <strong>Saved</strong> tab for instant offline access.
        </p>
      </div>
    </div>
  );
};
