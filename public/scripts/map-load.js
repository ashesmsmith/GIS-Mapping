// Load Google Maps dynamically with API key from server

export default async function loadMaps() {
    let apiKey;

    try {
        const res = await fetch('/api-key');
        if (!res.ok) throw new Error('API endpoint not found');
        const data = await res.json();
        apiKey = data.key;
    } catch (error) {
        console.error('Error fetching API key:', error);
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=beta`;
        script.async = true;
        script.defer = true;

        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Google Maps failed to load'));
        
        document.head.appendChild(script);
    });
};
