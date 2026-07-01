import { geocodeCity, fetchWeather } from './api.js';
import { getRecentCities, addRecentCity, clearRecentCities } from './storage.js';
import {
  renderEmpty,
  renderLoading,
  renderError,
  renderWeather,
  renderRecent,
} from './ui.js';

const form = document.getElementById('search-form');
const input = document.getElementById('city-input');
const clearBtn = document.getElementById('clear-history');

function refreshRecent() {
  renderRecent(getRecentCities(), loadCity);
}

async function searchByName(name) {
  const trimmed = name.trim();
  if (!trimmed) return;
  renderLoading();
  try {
    const city = await geocodeCity(trimmed);
    const data = await fetchWeather(city.latitude, city.longitude);
    renderWeather(city, data);
    addRecentCity(city);
    refreshRecent();
  } catch (err) {
    renderError(err.message || 'Something went wrong. Please try again.');
  }
}

async function loadCity(city) {
  renderLoading();
  try {
    const data = await fetchWeather(city.latitude, city.longitude);
    renderWeather(city, data);
    addRecentCity(city);
    refreshRecent();
  } catch (err) {
    renderError(err.message || 'Something went wrong. Please try again.');
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  searchByName(input.value);
  input.blur();
});

clearBtn.addEventListener('click', () => {
  clearRecentCities();
  refreshRecent();
});

renderEmpty();
refreshRecent();
