const STORAGE_KEY = 'weather-dashboard:recent-cities';
const MAX_RECENT = 5;

export function getRecentCities() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function addRecentCity(city) {
  if (!city || !city.name) return getRecentCities();
  const current = getRecentCities();
  const key = cityKey(city);
  const deduped = current.filter((c) => cityKey(c) !== key);
  const next = [city, ...deduped].slice(0, MAX_RECENT);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearRecentCities() {
  localStorage.removeItem(STORAGE_KEY);
}

function cityKey(c) {
  return `${c.name}|${c.country ?? ''}|${c.latitude}|${c.longitude}`;
}
