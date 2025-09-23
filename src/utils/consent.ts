export type Consent = {
  analytics?: boolean;
  marketing?: boolean;
};

const KEY = 'cunao.consent';

export function getConsent(): Consent | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveConsent(consent: Consent) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(consent));
  } catch (e) {
    // ignore
  }
}

export function clearConsent() {
  try { window.localStorage.removeItem(KEY); } catch (e) {}
}
