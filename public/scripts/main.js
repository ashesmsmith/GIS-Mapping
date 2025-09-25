// Initialize Google Maps API - default location Rexburg, ID
// Input from user (nickname and location) processed added to locations and markers arrays
// SortableJS used to enable drag-and-drop sorting of locations list
// Calculate and display route using Directions API
// Calculate and display total distance and duration of route

// Imports
import loadMaps from './map-load.js';
import loadWeather from './weather-load.js';

// Variables
let map;
let markers = []; // Array to hold map markers
let locations = []; // Array to hold location data
let directionsService;
let directionsRenderer;
let infoWindow;

// Initialize and display the map
function initMap() {
    const defaultPosition = { lat: 43.8231, lng: -111.7924 }; // Rexburg, ID, USA

    // Find the 'map' div element and display the map in it
    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultPosition,
        zoom: 10, // City View
        clickableIcons: false,
        mapId: 'JS Maps',
    });

    // Initialize Directions Service and Renderer
    directionsService = new google.maps.DirectionsService(); // Used to calculate the route
    directionsRenderer = new google.maps.DirectionsRenderer( { map: map, suppressMarkers: true } ); // Used to display the route

    infoWindow = new google.maps.InfoWindow();
}

// Setup event listeners for buttons and sortable list
function setupEventListeners() {
    // Add Location Button
    document.getElementById('add-btn')
        .addEventListener('click', addLocation);

    // Create Itinerary Button
    document.getElementById('create-itinerary-btn')
        .addEventListener('click', createRoute);

    // SortableJS - Drag-and-Drop for Locations List
    new Sortable(document.getElementById('locations-list'), {
        animation: 150,
        ghostClass: 'ghost'
    });
}

// Add a user entered location to the list
function addLocation() {
    const locationInput = document.querySelector('#location').value;

    // Alert user of missing input
    if (!locationInput) {
        alert("Please enter a Location.");
        return;
    }

    // Geocode the location input to get latitude and longitude
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': locationInput }, (results, status) =>{
        if (status == 'OK') {
            const position = results[0].geometry.location;
            const formattedName = results[0].formatted_address;

            // Add location to list with updated location format (lat, lng)
            locations.push({ nickname: formattedName, location: { lat: position.lat(), lng: position.lng() } });

            // Add location to the list on page
            const locationsList = document.getElementById('locations-list');
            const listItem = document.createElement('li');
            listItem.textContent = `${formattedName}`;
            locationsList.appendChild(listItem);
        } else {
            alert('Geocode Failed: ' + status);
        }
    });

    // Clear input field for reuse
    document.querySelector('#location').value = '';
    document.querySelector('#location').focus();
}

// Create and display the route on map
async function createRoute() {
    syncLocations(); // Sync locations array with drag-and-drop order

    // Check that there are at least 2 locations
    if (locations.length < 2) {
        alert("Please add at least 2 locations to create a route.");
        return;
    }

    // Clear previous route from map
    directionsRenderer.set('directions', null);
    markers.forEach(m => m.setMap(null));
    markers = [];

    // Select Waypoints (all locations except start and end) for the route
    let waypoints = []; // Remains empty if only 2 locations
    if (locations.length > 2) {
        waypoints = locations.slice(1, -1).map(loc => ({ //creates new array of waypoints in required format
            location: loc.location,
            stopover: true
        }));
    }

    try {
        // Directions Service method route() to calculate the route
        directionsService.route(
            {
                origin: locations[0].location, // Required - Start location
                destination: locations[locations.length - 1].location, // Required - End location
                waypoints: waypoints, // Optional - All the locations in between
                travelMode: google.maps.TravelMode.DRIVING, // Required - Travel by driving
            },
            (result, status) => {
                if (status == 'OK') {
                    directionsRenderer.setDirections(result);

                    // Calculate and display Total Distance
                    const distances = result.routes[0].legs.map(leg => leg.distance.value); // distance in meters
                    const totalDistance = calculateDistance(distances).toFixed(2);
                    document.getElementById('total-distance').innerText = `${(totalDistance)} miles`;

                    // Calculate and display Total Duration
                    const durations = result.routes[0].legs.map(leg => leg.duration.value); // duration in seconds
                    const totalDuration = calculateDuration(durations);
                    document.getElementById('total-duration').innerText = `${totalDuration}`;

                    loadWeather(locations).then(weatherData => {
                        addMarkers(weatherData);
                    });
                } else {
                    alert('Directions Request Failed:' + status);
                }
            }
        )
    } catch (error) {
        console.error("Error creating route:", error);
    }
}

// Sync locations array with drag-and-drop order before creating route
function syncLocations() {
    const listLocations = document.querySelectorAll('#locations-list li');
    const newLocationsOrder = [];

    listLocations.forEach(item => {
        const nickname = item.textContent;
        const location = locations.find(l => l.nickname === nickname); // Find location by nickname
        if (location) {
            newLocationsOrder.push(location); // Add to new order array if found
        }
    });

    locations = newLocationsOrder;
}

// Calculate total distance in miles
function calculateDistance(distances, i = 0) {
    if (i >= distances.length) return 0; // base case to stop recursion

    // Convert meters to miles (1 meter = 0.00062137 miles)
    // Recursion - add current distance conversion to the sum of the rest
    return (distances[i] * 0.00062137) + calculateDistance(distances, i + 1);
}

// Calculate total time in minutes then hours and minutes
function calculateDuration(durations, i = 0) {
    if (i >= durations.length) return 0; // base case to stop recursion

    // Convert seconds to minutes
    // Recursion - add current duration conversion to the sum of the rest
    let duration = (durations[i] / 60) + calculateDuration(durations, i + 1);

    // Formatting - Completed after recursion
    // Convert to hours and minutes if 60 minutes or more
    if (i === 0) {
        if (duration >= 60) {
            const hours = Math.floor(duration / 60); // Rounds down to nearest hour
            const minutes = Math.round(duration % 60); // Remaining minutes rounded to nearest minute
            duration = `${hours} hr ${minutes} min`;
        } else {
            duration = `${Math.round(duration)} min`;
        }
    }

    return duration;
}

// Add markers with weather data to map
async function addMarkers(data) {
    for (const loc of data) {
        const position = { lat: loc.lat, lng: loc.lng };

        const contentString = `<div class='weather-info'>
            <h4>${loc.nickname}</h4>
            <img src='${loc.icon}.png' alt='${loc.desc} Icon' width='50' height='50'>
            <p>${loc.desc}</p>
            <p>${loc.temp}°F</p>
        </div>`

        const marker = new google.maps.Marker({
            position,
            map,
            title: '',
        });

        marker.addListener('click', () => {
            infoWindow.setContent(contentString);
            infoWindow.open(map, marker);
        });

        markers.push(marker);
    }
}

// Load Google Maps API and initialize map
// Immediately Invoked Function Expression (IIFE)
(async () => {
    try {
        await loadMaps();
        initMap();
        setupEventListeners();
    } catch (error) {
        console.error('Error Loading: ', error);
    }  
})();
