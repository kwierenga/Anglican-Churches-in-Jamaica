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
    
    const street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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
        // Create custom icon based on church status
        const iconHtml = `
            <div style="
                background: ${getStatusColor(church.status)};
                width: 20px;
                height: 20px;
                border: 2px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            "></div>
        `;
        
        const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-church-marker',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
        
        const marker = L.marker([church.location.latitude, church.location.longitude], { icon: customIcon })
            .bindPopup(`
                <div class="map-popup">
                    <h3>${church.name}</h3>
                    <p><strong>Location:</strong> ${church.location.address}</p>
                    <p><strong>Parish:</strong> ${church.location.parish}</p>
                    <p><strong>Status:</strong> ${church.status}</p>
                    <p><strong>Type:</strong> ${church.classification}</p>
                    <a href="church.html?id=${church.id}" class="popup-link">View Church Details</a>
                </div>
            `)
            .addTo(map);
        
        markers.push(marker);
    });
    
    // Fit map to show all markers if we have churches
    if (churches.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

function getStatusColor(status) {
    switch (status.toLowerCase()) {
        case 'active':
            return '#28a745'; // Green
        case 'ruin':
            return '#dc3545'; // Red
        case 'closed':
            return '#6c757d'; // Gray
        default:
            return '#007bff'; // Blue
    }
}

function updateMapMarkers(churches) {
    addChurchMarkers(churches);
    
    // Adjust map view if needed
    if (churches.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    } else {
        // Reset to Jamaica view if no churches found
        map.setView([18.1096, -77.2975], 9);
    }
}

// Add click event to markers for better mobile experience
document.addEventListener('DOMContentLoaded', function() {
    // This will be called after the map is initialized
    setTimeout(() => {
        markers.forEach(marker => {
            marker.on('click', function() {
                this.openPopup();
            });
        });
    }, 1000);
});

// Temporary debug code - add to main.js
console.log('Total churches:', getAllChurches().length);
console.log('First church coordinates:', {
    name: getAllChurches()[0].name,
    lat: getAllChurches()[0].location.latitude,
    lng: getAllChurches()[0].location.longitude
});