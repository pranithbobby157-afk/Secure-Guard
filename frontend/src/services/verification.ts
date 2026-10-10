import { Alert } from '../types';

export interface VerificationResult {
  status: 'verified_official_match' | 'partial_match' | 'no_match' | 'stale_match';
  matchedAlert?: Alert;
  confidenceScore: number;
  matchedKeywords: string[];
  summary: string;
  sourceAttribution?: string;
  issuedAt?: string;
  disclaimer: string;
}

const STOP_WORDS = new Set([
  'the', 'is', 'in', 'at', 'of', 'on', 'and', 'a', 'to', 'for', 'with', 'from',
  'by', 'about', 'as', 'into', 'like', 'through', 'after', 'over', 'between', 'out',
  'this', 'that', 'these', 'those', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'but', 'if', 'or', 'because', 'as',
  'until', 'while', 'so', 'it', 'its'
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

export function verifyClaim(claimText: string, knownAlerts: Alert[]): VerificationResult {
  const cleanInput = claimText.trim();
  if (!cleanInput) {
    throw new Error('Please enter or paste a claim, news snippet, or forward message to verify.');
  }

  const inputTokens = tokenize(cleanInput);
  if (inputTokens.length === 0) {
    return {
      status: 'no_match',
      confidenceScore: 0,
      matchedKeywords: [],
      summary: 'Input contained insufficient descriptive keywords to match against crisis bulletins.',
      disclaimer: 'No official bulletin matched this text. SafeRoute cannot independently confirm external social media claims.'
    };
  }

  let bestMatch: Alert | null = null;
  let bestScore = 0;
  let bestKeywords: string[] = [];

  for (const alert of knownAlerts) {
    const alertCorpus = `${alert.title} ${alert.description_original} ${alert.instruction_original || ''} ${alert.hazard_type} ${alert.external_id || ''}`;
    const alertTokens = new Set(tokenize(alertCorpus));

    const matching = inputTokens.filter((token) => alertTokens.has(token));
    const uniqueMatches = Array.from(new Set(matching));

    // Jaccard-like keyword overlap
    const score = Math.round((uniqueMatches.length / Math.max(inputTokens.length, 3)) * 100);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = alert;
      bestKeywords = uniqueMatches;
    }
  }

  const standardDisclaimer =
    'Notice: SafeRoute compares text against configured government disaster alerts (IMD, TNSDMA, GCC). A match verifies consistency with active bulletins, but does not substitute for checking official portals directly.';

  if (bestMatch && bestScore >= 45) {
    const isStale = bestMatch.is_stale || (bestMatch.expires_at && new Date(bestMatch.expires_at) < new Date());
    if (isStale) {
      return {
        status: 'stale_match',
        matchedAlert: bestMatch,
        confidenceScore: Math.min(bestScore, 95),
        matchedKeywords: bestKeywords,
        summary: `Matches a past or expired advisory (${bestMatch.title}). This alert may no longer be active.`,
        sourceAttribution: bestMatch.source?.name || 'Tamil Nadu Disaster Management Cell',
        issuedAt: bestMatch.issued_at,
        disclaimer: standardDisclaimer
      };
    }

    return {
      status: 'verified_official_match',
      matchedAlert: bestMatch,
      confidenceScore: Math.min(bestScore, 98),
      matchedKeywords: bestKeywords,
      summary: `High correlation with active official bulletin: "${bestMatch.title}".`,
      sourceAttribution: bestMatch.source?.name || 'Regional Meteorological Centre / Local Disaster Authority',
      issuedAt: bestMatch.issued_at,
      disclaimer: standardDisclaimer
    };
  } else if (bestMatch && bestScore >= 20) {
    return {
      status: 'partial_match',
      matchedAlert: bestMatch,
      confidenceScore: bestScore,
      matchedKeywords: bestKeywords,
      summary: `Partial thematic match found with "${bestMatch.title}", but specific claims differ or lack official confirmation.`,
      sourceAttribution: bestMatch.source?.name,
      issuedAt: bestMatch.issued_at,
      disclaimer: standardDisclaimer
    };
  }

  return {
    status: 'no_match',
    confidenceScore: 0,
    matchedKeywords: [],
    summary: 'No matching official advisory or disaster alert was found in the database.',
    disclaimer:
      'Absence of an alert in SafeRoute does not prove complete safety or falsify breaking news. Always consult official police (112) or meteorological bulletins during extreme weather.'
  };
}
