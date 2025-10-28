let map;
let markers = [];

function initializeMap(churches) {
    // Center on Jamaica
    map = L.map('map').setView([18.1096, -77.2975], 9);
    
    // Base layers
    const satellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0','mt1','mt2','mt3'],
        attribution: 'Map data © Google'
    });
    
    const hybrid = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0','mt1','mt2','mt3'],
        attribution: 'Map data © Google'
    });
    
    const street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}/.png', {
        attribution: '© OpenStreetMap contributors'
    });
    
    // Add default layer
    satellite.addTo(map);
    
    // Layer control
    const baseLayers = {
        "Satellite": satellite,
        "Hybrid": hybrid,
        "Street": street
    };
    
    L.control.layers(baseLayers).addTo(map);
    
    // Add church markers
    addChurchMarkers(churches);
}

function addChurchMarkers(churches) {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    churches.forEach(church => {
        const marker = L.marker([church.location.latitude, church.location.longitude])
            .bindPopup(`
                <div class="map-popup">
                    <h3>${church.name}</h3>
                    <p>${church.location.address}</p>
                    <p><strong>Parish:</strong> ${church.location.parish}</p>
                    <p><strong>Status:</strong> ${church.status}</p>
                    <a href="church.html?id=${church.id}" class="popup-link">View Details</a>
                </div>
            `)
            .addTo(map);
        
        markers.push(marker);
    });
}

function updateMapMarkers(churches) {
    addChurchMarkers(churches);
    
    // Adjust map view if needed
    if (churches.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}