// ------------------------------
// Configuration
// ------------------------------

// TODO: Replace the text YOUR_API_KEY_HERE with your actual OpenWeatherMap API key.
// Sign up at: https://openweathermap.org/api
// Example:
// const API_KEY = "abc123yourkey";
const API_KEY = "YOUR_API_KEY_HERE";

// Base URL for current weather data (metric units for Celsius)
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// ------------------------------
// DOM elements
// ------------------------------

const form = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const statusMessage = document.getElementById("status-message");
const resultContainer = document.getElementById("weather-result");

const cityNameEl = document.getElementById("city-name");
const temperatureEl = document.getElementById("temperature");
const conditionEl = document.getElementById("condition");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");

// ------------------------------
// Helper functions
// ------------------------------

/**
 * Show a status message (for loading or error)
 * @param {string} message - Text to show
 * @param {"normal" | "error" | "loading"} type - Type of message (controls styling)
 */
function showStatus(message, type = "normal") {
  statusMessage.textContent = message;
  statusMessage.classList.remove("status-message--error", "status-message--loading");

  if (type === "error") {
    statusMessage.classList.add("status-message--error");
  } else if (type === "loading") {
    statusMessage.classList.add("status-message--loading");
  }
}

/**
 * Clear status message
 */
function clearStatus() {
  statusMessage.textContent = "";
  statusMessage.classList.remove("status-message--error", "status-message--loading");
}

/**
 * Build the request URL for the API
 * @param {string} city - City name to search
 * @returns {string} - Full API request URL
 */
function buildRequestUrl(city) {
  const encodedCity = encodeURIComponent(city.trim());
  return `${BASE_URL}?q=${encodedCity}&appid=${API_KEY}&units=metric`;
}

/**
 * Update the UI with weather data from the API response
 * @param {object} data - Parsed JSON from OpenWeatherMap
 */
function displayWeather(data) {
  // City name and country code
  const city = data.name;
  const country = data.sys?.country || "";

  // Main temperature and condition
  const temp = Math.round(data.main.temp);
  const description = data.weather?.[0]?.description || "Unknown";

  // Humidity and wind speed
  const humidity = data.main.humidity;
  const windSpeed = data.wind.speed; // Already in m/s with metric units

  cityNameEl.textContent = country ? `${city}, ${country}` : city;
  temperatureEl.textContent = temp.toString();
  conditionEl.textContent = description;
  humidityEl.textContent = `${humidity} %`;
  windEl.textContent = `${windSpeed} m/s`;

  // Reveal the result container (it is hidden initially)
  resultContainer.hidden = false;
}

// ------------------------------
// Main fetch function
// ------------------------------

/**
 * Fetch weather for a given city using async/await and fetch()
 * @param {string} city
 */
async function fetchWeather(city) {
  // If no API key is provided, show a helpful message
  if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
    showStatus(
      "Please set your OpenWeatherMap API key in script.js (API_KEY variable).",
      "error"
    );
    resultContainer.hidden = true;
    return;
  }

  const url = buildRequestUrl(city);

  try {
    // Show loading state
    showStatus("Loading weather data...", "loading");

    const response = await fetch(url);

    // If the city name is invalid or there is another error, OpenWeatherMap
    // will still return a JSON response with a "cod" and "message".
    const data = await response.json();

    if (!response.ok) {
      // Handle common errors like city not found (404) or bad API key (401)
      const errorMessage =
        data?.message === "city not found"
          ? "City not found. Please check the spelling and try again."
          : data?.message || "Unable to fetch weather data.";

      showStatus(errorMessage, "error");
      resultContainer.hidden = true;
      return;
    }

    // If all is good, clear the status and update the UI
    clearStatus();
    displayWeather(data);
  } catch (error) {
    // Network or unexpected error
    showStatus("Network error. Please check your connection and try again.", "error");
    resultContainer.hidden = true;
    console.error(error);
  }
}

// ------------------------------
// Event listeners
// ------------------------------

form.addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent page refresh

  const city = cityInput.value.trim();

  if (!city) {
    showStatus("Please enter a city name.", "error");
    resultContainer.hidden = true;
    return;
  }

  // Trigger API call
  fetchWeather(city);
});

// Optional: allow pressing Enter in the input without button click (handled by form submit)
// and focus the input on first load for convenience.
window.addEventListener("DOMContentLoaded", function () {
  cityInput.focus();
});


