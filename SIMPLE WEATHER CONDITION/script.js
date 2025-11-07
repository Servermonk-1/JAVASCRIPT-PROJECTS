const locationInput = document.getElementById("locationInput");
const submitBtn = document.getElementById("searchBtn");
const weatherCard = document.getElementById("weatherCard");

// Specific elements within the weatherCard container
const cityElement = document.getElementById('city');
const countryElement = document.getElementById('country');
const weatherIconElement = document.getElementById('weatherIcon');
const temperatureElement = document.getElementById('temperature');
const conditionElement = document.getElementById('condition');
const coordsElement = document.getElementById('coords');
const humidityElement = document.getElementById('humidity');
const windElement = document.getElementById('wind');
const pressureElement = document.getElementById('pressure');
const feelsLikeElement = document.getElementById('feelsLike');

// Elements for loading and errors
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');

// --- Helper Function to Toggle Loading State ---
function toggleLoading(isLoading) {
	if (isLoading) {
		loadingSpinner.classList.add('active');
		weatherCard.classList.add('hidden'); // Hide weather card while loading
		errorMessage.classList.remove('active'); // Hide any previous error
	} else {
		loadingSpinner.classList.remove('active');
		weatherCard.classList.remove('hidden'); // Show weather card after loading
	}
}

// --- Helper Function to Display Error ---
function displayError(message) {
	errorMessage.textContent = message;
	errorMessage.classList.add('active');
	weatherCard.classList.add('hidden'); // Hide weather card on error
}

// --- Function to Get Weather Icon SVG ---
function getWeatherIconSVG(iconCode) {
	switch (iconCode) {
		case '01d': // Clear sky day
		case '01n': // Clear sky night
			return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zM11 0h2v3h-2zm0 21h2v3h-2zm-9-8h3v2H2zm16 0h3v2h-3zM4.22 5.64l2.12-2.12 1.41 1.41-2.12 2.12zm12.73 12.73l2.12-2.12-1.41-1.41-2.12 2.12zM3.46 16.95l1.41 1.41 2.12-2.12-1.41-1.41zm12.73-12.73l1.41-1.41 2.12 2.12-1.41 1.41z"/>
                  </svg>`; // Sun
		case '02d': // Few clouds day
		case '02n': // Few clouds night
		case '03d': // Scattered clouds day
		case '03n': // Scattered clouds night
		case '04d': // Broken clouds day
		case '04n': // Broken clouds night
			return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-3.72 0-6.75 2.76-7.25 6.32C2.76 10.87 1 12.78 1 15c0 3.31 2.69 6 6 6h11c3.31 0 6-2.69 6-6 0-2.92-2.03-5.36-4.65-5.96zM18 19H7c-2.21 0-4-1.79-4-4 0-1.75 1.14-3.24 2.73-3.79L6 11.2V11c0-2.76 2.24-5 5-5 2.64 0 4.85 2.06 4.98 4.64l.02.36.31.08C18.36 11.23 20 13.06 20 15c0 2.21-1.79 4-4 4z"/>
                  </svg>`; // Cloud
		case '09d': // Shower rain day
		case '09n': // Shower rain night
		case '10d': // Rain day
		case '10n': // Rain night
			return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-3.72 0-6.75 2.76-7.25 6.32C2.76 10.87 1 12.78 1 15c0 3.31 2.69 6 6 6h11c3.31 0 6-2.69 6-6 0-2.92-2.03-5.36-4.65-5.96zM17 19H7c-2.21 0-4-1.79-4-4 0-1.75 1.14-3.24 2.73-3.79L6 11.2V11c0-2.76 2.24-5 5-5 2.64 0 4.85 2.06 4.98 4.64l.02.36.31.08C18.36 11.23 20 13.06 20 15c0 2.21-1.79 4-4 4zm-5 1c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-4 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm8 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                  </svg>`; // Cloud with rain drops
		case '11d': // Thunderstorm day
		case '11n': // Thunderstorm night
			return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-3.72 0-6.75 2.76-7.25 6.32C2.76 10.87 1 12.78 1 15c0 3.31 2.69 6 6 6h11c3.31 0 6-2.69 6-6 0-2.92-2.03-5.36-4.65-5.96zM17 19H7c-2.21 0-4-1.79-4-4 0-1.75 1.14-3.24 2.73-3.79L6 11.2V11c0-2.76 2.24-5 5-5 2.64 0 4.85 2.06 4.98 4.64l.02.36.31.08C18.36 11.23 20 13.06 20 15c0 2.21-1.79 4-4 4zm-1.5-7.5l-2.5 2.5h2l-3 3-2-2h1.5l-2.5-2.5H10l3-3 2 2h-1.5z"/>
                  </svg>`; // Cloud with lightning
		case '13d': // Snow day
		case '13n': // Snow night
			return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-3.72 0-6.75 2.76-7.25 6.32C2.76 10.87 1 12.78 1 15c0 3.31 2.69 6 6 6h11c3.31 0 6-2.69 6-6 0-2.92-2.03-5.36-4.65-5.96zM17 19H7c-2.21 0-4-1.79-4-4 0-1.75 1.14-3.24 2.73-3.79L6 11.2V11c0-2.76 2.24-5 5-5 2.64 0 4.85 2.06 4.98 4.64l.02.36.31.08C18.36 11.23 20 13.06 20 15c0 2.21-1.79 4-4 4zm-5-3c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-4 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm8 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                  </svg>`; // Cloud with snowflakes
		case '50d': // Mist day
		case '50n': // Mist night
			return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-3.72 0-6.75 2.76-7.25 6.32C2.76 10.87 1 12.78 1 15c0 3.31 2.69 6 6 6h11c3.31 0 6-2.69 6-6 0-2.92-2.03-5.36-4.65-5.96zM17 19H7c-2.21 0-4-1.79-4-4 0-1.75 1.14-3.24 2.73-3.79L6 11.2V11c0-2.76 2.24-5 5-5 2.64 0 4.85 2.06 4.98 4.64l.02.36.31.08C18.36 11.23 20 13.06 20 15c0 2.21-1.79 4-4 4zm-10-6h10v2H7zm0 4h10v2H7z"/>
                  </svg>`; // Fog/Mist
		default:
			return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-3.72 0-6.75 2.76-7.25 6.32C2.76 10.87 1 12.78 1 15c0 3.31 2.69 6 6 6h11c3.31 0 6-2.69 6-6 0-2.92-2.03-5.36-4.65-5.96zM18 19H7c-2.21 0-4-1.79-4-4 0-1.75 1.14-3.24 2.73-3.79L6 11.2V11c0-2.76 2.24-5 5-5 2.64 0 4.85 2.06 4.98 4.64l.02.36.31.08C18.36 11.23 20 13.06 20 15c0 2.21-1.79 4-4 4z"/>
                  </svg>`; // Default cloud
	}
}


const searchWeather = async () => {
	// Show loading spinner and hide previous error/weather card
	toggleLoading(true);
	errorMessage.classList.remove('active');

	try {
		const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${locationInput.value.trim()}&appid=7116c9587478cc5ee80ce0160398483e&units=metric`);
		const data = await res.json();
		console.log(data);

		// Basic error handling for city not found or other API issues
		if (data.cod === '404') {
			displayError(`City Not Found: "${locationInput.value.trim()}"`);
			return;
		} else if (data.cod !== 200) {
			displayError(`Error: ${data.message || 'Something went wrong.'}`);
			return;
		}

		// Update the specific elements in the weather card with fetched data
		cityElement.textContent = data.name;
		countryElement.textContent = `🌍 ${data.sys.country}`;
		temperatureElement.textContent = `${Math.round(data.main.temp)}°C`; // Round temperature for cleaner display
		conditionElement.textContent = data.weather[0].description;
		coordsElement.textContent = `Lat: ${data.coord.lat.toFixed(2)}, Lon: ${data.coord.lon.toFixed(2)}`;
		humidityElement.textContent = `${data.main.humidity}%`;
		windElement.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`; // Convert m/s to km/h
		pressureElement.textContent = `${data.main.pressure} hPa`;
		feelsLikeElement.textContent = `${Math.round(data.main.feels_like)}°C`;

		// Set weather icon based on the API response using the getWeatherIconSVG function
		weatherIconElement.innerHTML = getWeatherIconSVG(data.weather[0].icon);

	} catch (error) {
		console.error('Error fetching weather:', error);
		displayError('Could not fetch weather data. Please check your internet connection.');
	} finally {
		toggleLoading(false); // Hide loading spinner regardless of success or failure
	}
}

// Event listeners for search button and Enter key
submitBtn.addEventListener("click", searchWeather);
locationInput.addEventListener("keydown", (event) => {
	if (event.key === "Enter") {
		searchWeather();
	}
});

// Optional: Load a default city on page load
window.onload = () => {
	locationInput.value = 'Lagos'; // Set a default city
	searchWeather();
};