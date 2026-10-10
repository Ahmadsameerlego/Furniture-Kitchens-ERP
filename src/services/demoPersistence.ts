// Keeps the demo's working data in the browser so a refresh doesn't wipe what was
// done on screen. "Reset demo" clears it and reloads the original scenario.

import { daysFromToday, shiftMockDates } from '../mock/scenario';

const STORAGE_KEY = 'furniture-land-demo-state-v2';

interface StoredDemoState {
  savedOn: string;
  data: Record<string, unknown>;
}

export function loadDemoState(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as StoredDemoState;
    if (!stored?.data || !stored.savedOn) return null;
    // Saved on an earlier day: move every date forward so "today" stays today
    return stored.savedOn === daysFromToday(0) ? stored.data : shiftMockDates(stored.data, stored.savedOn);
  } catch {
    return null;
  }
}

export function saveDemoState(data: Record<string, unknown>): void {
  try {
    const stored: StoredDemoState = { savedOn: daysFromToday(0), data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Storage full or blocked (private window): the demo keeps working in memory.
  }
}

export function resetDemoState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  window.location.reload();
}
