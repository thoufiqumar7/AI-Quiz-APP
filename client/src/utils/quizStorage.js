const ACTIVE_QUIZ_KEY = 'smartquiz_active_quiz';
const LAST_RESULT_KEY = 'smartquiz_last_result';

export function saveActiveQuizState(payload) {
  localStorage.setItem(ACTIVE_QUIZ_KEY, JSON.stringify(payload));
}

export function getActiveQuizState() {
  const raw = localStorage.getItem(ACTIVE_QUIZ_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
}

export function clearActiveQuizState() {
  localStorage.removeItem(ACTIVE_QUIZ_KEY);
}

export function saveLastResult(result) {
  localStorage.setItem(LAST_RESULT_KEY, JSON.stringify(result));
}

export function getLastResult() {
  const raw = localStorage.getItem(LAST_RESULT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
}

export function clearLastResult() {
  localStorage.removeItem(LAST_RESULT_KEY);
}

export function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Number(totalSeconds) || 0);
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}
