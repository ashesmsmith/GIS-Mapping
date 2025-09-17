// Fetches weather data from OpenWeatherMap API
// Fetches API key from server endpoint /weather-api-key

export default async function fetchWeather(locations) {
    let apiKey;

    try {
        const res = await fetch('/weather-api-key');
        if (!res.ok) {
            throw new Error('Weather API endpoint not found.');
        }
        const data = await res.json();
        apiKey = data.key;
    } catch (error) {
        console.error('Error fetching Weather API key:', error);
    }

    return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
}