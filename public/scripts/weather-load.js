// Load Google Weather data dynamically with API key from server

export default async function loadWeather(locations) {
    let apiKey;

    try {
        const res = await fetch('/api-key');
        if (!res.ok) throw new Error('API endpoint not found');
        const data = await res.json();
        apiKey = data.key; 
    } catch (error) {
        console.error('Error fetching API key:', error);
        return[];
    }

    let weatherData = [];

    for (let loc of locations) {
        const lat = loc.location.lat;
        const lng = loc.location.lng;

        try {
            const response = await fetch(`https://weather.googleapis.com/v1/currentConditions:lookup?key=${apiKey}&location.latitude=${lat}&location.longitude=${lng}&unitsSystem=IMPERIAL`);

            if (!response.ok) {
                console.error('Error fetching weather data:', response.statusText);
                continue; // Skip to the next location
            }

            // Convert response to JSON
            const weather = await response.json(); 

            // Push data to weatherData array
            weatherData.push({
                nickname: loc.nickname,
                lat: lat,
                lng: lng,
                temp: weather.temperature.degrees,
                desc: weather.weatherCondition.description.text,
                icon: weather.weatherCondition.iconBaseUri,
            });
        } catch (error) {
            console.error('Network or parsing:', error);
        }
    }
    
    return weatherData;
}
