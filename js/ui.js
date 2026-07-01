import { getWeatherInfo } from './api.js';

const statusEl = document.getElementById('status');
const weatherSection = document.getElementById('weather-section');
const currentEl = document.getElementById('current-weather');
const forecastListEl = document.getElementById('forecast-list');
const recentSectionEl = document.getElementById('recent-section');
const recentChipsEl = document.getElementById('recent-chips');

export function renderEmpty() {
  weatherSection.hidden = true;
  statusEl.innerHTML = `
    <div class="status-message empty">
      <span class="status-emoji">🌤️</span>
      <span>Search for a city to see the weather</span>
    </div>
  `;
}

export function renderLoading() {
  weatherSection.hidden = true;
  statusEl.innerHTML = `
    <div class="status-message loading">
      <span class="spinner" aria-hidden="true"></span>
      <span>Loading weather data...</span>
    </div>
  `;
}

export function renderError(message) {
  weatherSection.hidden = true;
  statusEl.innerHTML = `
    <div class="status-message error">
      <span>⚠️ ${escapeHtml(message)}</span>
    </div>
  `;
}

export function renderWeather(city, data) {
  statusEl.innerHTML = '';
  weatherSection.hidden = false;
  renderCurrent(city, data);
  renderForecast(data);
}

function renderCurrent(city, data) {
  const c = data.current;
  const info = getWeatherInfo(c.weather_code);
  const units = data.current_units ?? {};
  const updated = formatDateTime(c.time, data.timezone);
  const location = [city.name, city.admin1, city.country].filter(Boolean).join(', ');

  currentEl.innerHTML = `
    <div class="current-location">📍 ${escapeHtml(location)}</div>
    <div class="current-updated">Last updated: ${escapeHtml(updated)}</div>
    <div class="current-main">
      <div class="current-icon" aria-hidden="true">${info.icon}</div>
      <div>
        <div class="current-temp">${Math.round(c.temperature_2m)}${units.temperature_2m ?? '°C'}</div>
        <div class="current-condition">${escapeHtml(info.label)}</div>
      </div>
    </div>
    <div class="current-details">
      <div class="detail-item">
        <span class="detail-label">Feels like</span>
        <span class="detail-value">${Math.round(c.apparent_temperature)}${units.apparent_temperature ?? '°C'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Humidity</span>
        <span class="detail-value">${c.relative_humidity_2m}${units.relative_humidity_2m ?? '%'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Wind</span>
        <span class="detail-value">${Math.round(c.wind_speed_10m)} ${units.wind_speed_10m ?? 'km/h'}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Condition</span>
        <span class="detail-value">${escapeHtml(info.label)}</span>
      </div>
    </div>
  `;
}

function renderForecast(data) {
  const d = data.daily;
  const units = data.daily_units ?? {};
  const cards = d.time.map((iso, i) => {
    const info = getWeatherInfo(d.weather_code[i]);
    const dayName = i === 0 ? 'Today' : formatDay(iso);
    const max = Math.round(d.temperature_2m_max[i]);
    const min = Math.round(d.temperature_2m_min[i]);
    const precip = d.precipitation_probability_max[i] ?? 0;
    const tempUnit = units.temperature_2m_max ?? '°';
    return `
      <div class="forecast-card" title="${escapeHtml(info.label)}">
        <div class="forecast-day">${escapeHtml(dayName)}</div>
        <div class="forecast-icon" aria-hidden="true">${info.icon}</div>
        <div class="forecast-temps">
          ${max}${tempUnit} <span class="forecast-temp-min">/ ${min}${tempUnit}</span>
        </div>
        <div class="forecast-precip">💧 ${precip}%</div>
      </div>
    `;
  });
  forecastListEl.innerHTML = cards.join('');
}

export function renderRecent(cities, onSelect) {
  if (!cities || cities.length === 0) {
    recentSectionEl.hidden = true;
    recentChipsEl.innerHTML = '';
    return;
  }
  recentSectionEl.hidden = false;
  recentChipsEl.innerHTML = cities
    .map(
      (c, i) =>
        `<button type="button" class="recent-chip" data-index="${i}">${escapeHtml(c.name)}${
          c.countryCode ? `, ${escapeHtml(c.countryCode)}` : ''
        }</button>`
    )
    .join('');
  recentChipsEl.querySelectorAll('.recent-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.index);
      onSelect(cities[idx]);
    });
  });
}

function formatDay(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: 'short' });
}

function formatDateTime(iso, timezone) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone || undefined,
    });
  } catch {
    return iso;
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
