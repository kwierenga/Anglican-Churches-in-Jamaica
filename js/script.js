// Map initialization
const map = L.map('map').setView([18.1, -77.3], 9);

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Create layer groups
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

    // Click event
    marker.on('click', function() {
        showChurchDetails(church);
    });
});

// Add layers to map
activeLayer.addTo(map);

// Layer control
const overlayMaps = {
    "Active Churches": activeLayer,
    "Ruins": ruinLayer,
    "Unknown Status": unknownLayer,
    "Closed": closedLayer
};

L.control.layers(null, overlayMaps).addTo(map);

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

// Initialize filters and statistics
initializeFilters();
updateStatistics();
updateChurchList(churches);

// Filter functions
function initializeFilters() {
    // Get unique values for filters
    const parishes = [...new Set(churches.map(c => c.Parish))].sort();
    const classifications = [...new Set(churches.map(c => c.Classification))].sort();
    
    // Populate parish filter
    const parishFilter = document.getElementById('parish-filter');
    parishes.forEach(parish => {
        const option = document.createElement('option');
        option.value = parish;
        option.textContent = parish;
        parishFilter.appendChild(option);
    });
    
    // Populate classification filter
    const classificationFilter = document.getElementById('classification-filter');
    classifications.forEach(classification => {
        const option = document.createElement('option');
        option.value = classification;
        option.textContent = classification;
        classificationFilter.appendChild(option);
    });
    
    // Add event listeners
    document.getElementById('search').addEventListener('input', applyFilters);
    document.getElementById('status-filter').addEventListener('change', applyFilters);
    document.getElementById('parish-filter').addEventListener('change', applyFilters);
    document.getElementById('classification-filter').addEventListener('change', applyFilters);
}

function applyFilters() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    const parishFilter = document.getElementById('parish-filter').value;
    const classificationFilter = document.getElementById('classification-filter').value;
    
    const filteredChurches = churches.filter(church => {
        const matchesSearch = church.Name.toLowerCase().includes(searchTerm) || 
                            church.Location.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || church.Status === statusFilter;
        const matchesParish = parishFilter === 'all' || church.Parish === parishFilter;
        const matchesClassification = classificationFilter === 'all' || church.Classification === classificationFilter;
        
        return matchesSearch && matchesStatus && matchesParish && matchesClassification;
    });
    
    updateChurchList(filteredChurches);
    updateMapMarkers(filteredChurches);
    updateStatistics(filteredChurches);
}

function updateMapMarkers(filteredChurches) {
    // Clear all layers
    activeLayer.clearLayers();
    ruinLayer.clearLayers();
    unknownLayer.clearLayers();
    closedLayer.clearLayers();
    
    // Add filtered markers
    filteredChurches.forEach(church => {
        const marker = L.circleMarker([church.Latitude, church.Longitude], {
            radius: 6,
            fillColor: statusColors[church.Status] || '#6c757d',
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });
        
        marker.bindPopup(`
            <strong>${church.Name}</strong><br>
            <em>${church.Location}</em><br>
            Parish: ${church.Parish}<br>
            Status: <span style="color: ${statusColors[church.Status]}">${church.Status}</span><br>
            Type: ${church.Classification}
        `);
        
        marker.on('click', function() {
            showChurchDetails(church);
        });
        
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
    });
}

function updateChurchList(churchList) {
    const churchListContainer = document.getElementById('church-list');
    const churchCount = document.getElementById('church-count');
    
    churchListContainer.innerHTML = '';
    churchCount.textContent = churchList.length;
    
    churchList.forEach(church => {
        const item = document.createElement('button');
        item.className = `list-group-item list-group-item-action church-item ${church.Status.toLowerCase()}`;
        item.innerHTML = `
            <strong>${church.Name}</strong><br>
            <small class="text-muted">${church.Location}, ${church.Parish}</small>
        `;
        
        item.addEventListener('click', function() {
            showChurchDetails(church);
            map.setView([church.Latitude, church.Longitude], 13);
        });
        
        churchListContainer.appendChild(item);
    });
}

function updateStatistics(churchList = churches) {
    const statsContainer = document.getElementById('stats');
    
    const statusCount = {};
    const parishCount = {};
    const classificationCount = {};
    
    churchList.forEach(church => {
        statusCount[church.Status] = (statusCount[church.Status] || 0) + 1;
        parishCount[church.Parish] = (parishCount[church.Parish] || 0) + 1;
        classificationCount[church.Classification] = (classificationCount[church.Classification] || 0) + 1;
    });
    
    let statsHTML = `
        <div class="stat-item">
            <span>Total Churches:</span>
            <strong>${churchList.length}</strong>
        </div>
        <div class="stat-item">
            <span>Active:</span>
            <strong>${statusCount['Active'] || 0}</strong>
        </div>
        <div class="stat-item">
            <span>Ruins:</span>
            <strong>${(statusCount['Ruin'] || 0) + (statusCount['Ruin?'] || 0)}</strong>
        </div>
        <div class="stat-item">
            <span>Unknown:</span>
            <strong>${statusCount['Unknown'] || 0}</strong>
        </div>
    `;
    
    statsContainer.innerHTML = statsHTML;
}

function showChurchDetails(church) {
    document.getElementById('churchModalTitle').textContent = church.Name;
    document.getElementById('churchModalBody').innerHTML = `
        <p><strong>Location:</strong> ${church.Location}</p>
        <p><strong>Parish:</strong> ${church.Parish}</p>
        <p><strong>Status:</strong> <span style="color: ${statusColors[church.Status]}">${church.Status}</span></p>
        <p><strong>Type:</strong> ${church.Classification}</p>
        <p><strong>Coordinates:</strong> ${church.Latitude.toFixed(5)}, ${church.Longitude.toFixed(5)}</p>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('churchModal'));
    modal.show();
}