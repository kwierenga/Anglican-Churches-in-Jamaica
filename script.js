// Replace with your Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyDP4lZ04MBr2VNH8m37UyMFYSV52D9fo1g';

// Map initialization with error handling
let map;
try {
    map = L.map('map').setView([18.1, -77.3], 9);
    
    // Add a temporary fallback tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);
    
    console.log('Base map initialized');
} catch (error) {
    console.error('Error initializing map:', error);
    document.getElementById('map').innerHTML = `
        <div style="padding: 20px; text-align: center; color: red;">
            <h3>Map Error</h3>
            <p>Failed to initialize map: ${error.message}</p>
            <p>Check console for details</p>
        </div>
    `;
}

// Define Google Maps layers with error handling
const googleLayers = {
    "Street Map": L.gridLayer.googleMutant({
        type: 'roadmap'
    }).on('tileerror', function(err) {
        console.error('Google Street Map error:', err);
        alert('Google Street Map failed to load. Check API key and billing.');
    }),
    "Satellite": L.gridLayer.googleMutant({
        type: 'satellite'
    }).on('tileerror', function(err) {
        console.error('Google Satellite error:', err);
    }),
    "Hybrid": L.gridLayer.googleMutant({
        type: 'hybrid'
    }).on('tileerror', function(err) {
        console.error('Google Hybrid error:', err);
    }),
    "Terrain": L.gridLayer.googleMutant({
        type: 'terrain'
    }).on('tileerror', function(err) {
        console.error('Google Terrain error:', err);
    })
};

// Try to add Google Maps layer
function initializeGoogleMaps() {
    if (!window.google) {
        // Load Google Maps script dynamically
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initGoogleMaps`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    } else {
        initGoogleMaps();
    }
}

window.initGoogleMaps = function() {
    console.log('Google Maps API loaded successfully');
    
    // Now try to add Google Maps layer
    try {
        // Remove the fallback OpenStreetMap layer
        map.eachLayer(layer => {
            if (layer instanceof L.TileLayer && layer._url.includes('openstreetmap')) {
                map.removeLayer(layer);
            }
        });
        
        // Add Google Street Map
        googleLayers["Street Map"].addTo(map);
        console.log('Google Maps layer added successfully');
    } catch (error) {
        console.error('Error adding Google Maps layer:', error);
    }
};

// Initialize Google Maps
initializeGoogleMaps();

// Rest of your existing code for church markers, filters, etc.
const activeLayer = L.layerGroup();
const ruinLayer = L.layerGroup();
const unknownLayer = L.layerGroup();
const closedLayer = L.layerGroup();

// Status colors
const statusColors = {
    'Active': '#28a745',
    'Ruin': '#dc3545', 
    'Unknown': '#6c757d',
    'Closed': '#ffc107',
    'Ruin?': '#dc3545'
};

// Create markers for each church
churches.forEach(church => {
    const marker = L.circleMarker([church.Latitude, church.Longitude], {
        radius: 6,
        fillColor: statusColors[church.Status] || '#6c757d',
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    });

    // Add popup
    marker.bindPopup(`
        <strong>${church.Name}</strong><br>
        <em>${church.Location}</em><br>
        Parish: ${church.Parish}<br>
        Status: <span style="color: ${statusColors[church.Status]}">${church.Status}</span><br>
        Type: ${church.Classification}
    `);

    // Add to appropriate layer
    switch(church.Status) {
        case 'Active':
            marker.addTo(activeLayer);
            break;
        case 'Ruin':
        case 'Ruin?':
            marker.addTo(ruinLayer);
            break;
        case 'Unknown':
            marker.addTo(unknownLayer);
            break;
        case 'Closed':
            marker.addTo(closedLayer);
            break;
        default:
            marker.addTo(unknownLayer);
    }

    marker.on('click', function() {
        showChurchDetails(church);
    });
});

// Add church layers to map
activeLayer.addTo(map);

// Layer control for church status
const overlayMaps = {
    "Active Churches": activeLayer,
    "Ruins": ruinLayer,
    "Unknown Status": unknownLayer,
    "Closed": closedLayer
};

// Add layer control
L.control.layers(googleLayers, overlayMaps).addTo(map);

// Add legend
const legend = L.control({position: 'bottomright'});
legend.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'legend');
    div.innerHTML = '<h6>Status Legend</h6>';
    
    Object.entries(statusColors).forEach(([status, color]) => {
        div.innerHTML += `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${color}"></div>
                <span>${status}</span>
            </div>
        `;
    });
    
    return div;
};
legend.addTo(map);

// Map type selector functionality
document.getElementById('map-type').addEventListener('change', function(e) {
    const selectedType = e.target.value;
    
    // Remove all Google layers
    Object.values(googleLayers).forEach(layer => {
        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
        }
    });
    
    // Add selected layer
    let layerToAdd;
    switch(selectedType) {
        case 'satellite':
            layerToAdd = googleLayers["Satellite"];
            break;
        case 'hybrid':
            layerToAdd = googleLayers["Hybrid"];
            break;
        case 'terrain':
            layerToAdd = googleLayers["Terrain"];
            break;
        default:
            layerToAdd = googleLayers["Street Map"];
    }
    
    layerToAdd.addTo(map);
});

// Initialize filters and statistics
initializeFilters();
updateStatistics();
updateChurchList(churches);

// [Keep all your existing filter functions below - they remain the same]
function initializeFilters() {
    // Your existing filter initialization code
}

function applyFilters() {
    // Your existing filter application code
}

function updateMapMarkers(filteredChurches) {
    // Your existing marker update code
}

function updateChurchList(churchList) {
    // Your existing church list update code
}

function updateStatistics(churchList = churches) {
    // Your existing statistics update code
}

function showChurchDetails(church) {
    // Your existing church details code
}