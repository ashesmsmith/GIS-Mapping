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
        throw error;
    }

    return new Promise((resolve, reject) => {
        // If already loaded, resolve immediately
        if (window.google && window.google.maps) {
            resolve();
            return;
        }

        // Create a global callback function
        window.initMapCallback = () => {
            resolve();
            delete window.initMapCallback;
        };

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=places&callback=initMapCallback`;
        script.async = true;
        script.defer = true;

        script.onerror = () => reject(new Error('Google Maps failed to load'));

        document.head.appendChild(script);
    });
}

