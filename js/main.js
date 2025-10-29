document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search');
    const parishFilter = document.getElementById('parish-filter');
    const churchList = document.getElementById('church-list');
    const churchCount = document.getElementById('church-count');
    
    let allChurches = getAllChurches();
    let currentChurches = [...allChurches];
    
    // Initialize the website
    initializeWebsite();
    
    // Search functionality
    searchInput.addEventListener('input', handleSearch);
    parishFilter.addEventListener('change', handleSearch);
    
    function initializeWebsite() {
        updateChurchList(currentChurches);
        initializeMap(currentChurches);
        updateChurchCount();
        
        // Add keyboard shortcut for search
        searchInput.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }
    
    function handleSearch() {
        const query = searchInput.value.trim();
        const parish = parishFilter.value;
        
        currentChurches = searchChurches(query, parish);
        updateChurchList(currentChurches);
        updateMapMarkers(currentChurches);
        updateChurchCount();
    }
    
    function updateChurchList(churches) {
        churchList.innerHTML = '';
        
        if (churches.length === 0) {
            churchList.innerHTML = `
                <div class="no-results">
                    <h3>No churches found</h3>
                    <p>Try adjusting your search terms or select a different parish.</p>
                </div>
            `;
            return;
        }
        
        churches.forEach(church => {
            const churchCard = createChurchCard(church);
            churchList.appendChild(churchCard);
        });
    }
    
    function createChurchCard(church) {
        const churchCard = document.createElement('div');
        churchCard.className = 'church-card';
        churchCard.setAttribute('data-church-id', church.id);
        
        // Determine status badge color
        const statusClass = getStatusClass(church.status);
        
        churchCard.innerHTML = `
            <div class="church-card-header">
                <h3>${church.name}</h3>
                <span class="status-badge ${statusClass}">${church.status}</span>
            </div>
            <div class="location">📍 ${church.location.address}, ${church.location.parish}</div>
            <div class="church-meta">
                <span class="classification">${church.classification}</span>
                ${church.year_built ? `<span class="year-built">🏛️ ${church.year_built}</span>` : ''}
            </div>
            ${church.contentStatus && !church.contentStatus.researched ? 
                '<div class="research-flag">🔍 Research Needed</div>' : ''}
        `;
        
        churchCard.addEventListener('click', () => {
            navigateToChurchDetail(church.id);
        });
        
        // Add keyboard navigation
        churchCard.setAttribute('tabindex', '0');
        churchCard.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateToChurchDetail(church.id);
            }
        });
        
        return churchCard;
    }
    
    function getStatusClass(status) {
        switch (status.toLowerCase()) {
            case 'active':
                return 'status-active';
            case 'ruin':
                return 'status-ruin';
            case 'closed':
                return 'status-closed';
            default:
                return 'status-unknown';
        }
    }
    
    function navigateToChurchDetail(churchId) {
        // Add a small delay for better UX
        churchList.style.opacity = '0.7';
        setTimeout(() => {
            window.location.href = `church.html?id=${churchId}`;
        }, 150);
    }
    
    function updateChurchCount() {
        const count = currentChurches.length;
        const total = allChurches.length;
        
        if (count === total) {
            churchCount.textContent = `${total} Churches`;
        } else {
            churchCount.textContent = `${count} of ${total} Churches`;
        }
        
        // Update the page title with count
        document.title = `Anglican Churches of Jamaica (${count} churches)`;
    }
    
    // Add some utility functions
    function getRandomChurch() {
        const randomIndex = Math.floor(Math.random() * allChurches.length);
        return allChurches[randomIndex];
    }
    
    function focusOnChurch(churchId) {
        const church = getChurchById(churchId);
        if (church && map) {
            map.setView([church.location.latitude, church.location.longitude], 15);
            
            // Find and open the marker popup
            markers.forEach(marker => {
                const markerLatLng = marker.getLatLng();
                if (markerLatLng.lat === church.location.latitude && 
                    markerLatLng.lng === church.location.longitude) {
                    marker.openPopup();
                }
            });
        }
    }
    
    // Export functions to global scope for use in other files
    window.focusOnChurch = focusOnChurch;
    window.getRandomChurch = getRandomChurch;
});

// Add some global utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add CSS for new elements
const additionalStyles = `
    .church-card-header {
        display: flex;
        justify-content: between;
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 0.5rem;
    }
    
    .church-card-header h3 {
        flex: 1;
        margin: 0;
    }
    
    .status-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.7rem;
        font-weight: bold;
        text-transform: uppercase;
    }
    
    .status-active {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
    
    .status-ruin {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f1b0b7;
    }
    
    .status-closed {
        background: #e2e3e5;
        color: #383d41;
        border: 1px solid #d6d8db;
    }
    
    .status-unknown {
        background: #fff3cd;
        color: #856404;
        border: 1px solid #ffeaa7;
    }
    
    .church-meta {
        display: flex;
        gap: 1rem;
        margin-top: 0.5rem;
        font-size: 0.8rem;
    }
    
    .classification {
        color: #8B0000;
        font-weight: 500;
    }
    
    .year-built {
        color: #666;
    }
    
    .research-flag {
        background: #fff3cd;
        color: #856404;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.7rem;
        margin-top: 0.5rem;
        display: inline-block;
        border-left: 3px solid #ffc107;
    }
    
    .no-results {
        text-align: center;
        padding: 2rem;
        color: #666;
    }
    
    .no-results h3 {
        color: #8B0000;
        margin-bottom: 0.5rem;
    }
    
    .church-card:focus {
        outline: 2px solid #8B0000;
        outline-offset: 2px;
    }
    
    .church-card {
        transition: all 0.2s ease;
    }
    
    .church-card:active {
        transform: scale(0.98);
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Add loading state management
window.showLoading = function() {
    const loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(139, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            color: white;
            font-size: 1.2rem;
        ">
            <div style="text-align: center;">
                <div class="loading" style="width: 40px; height: 40px; border-width: 4px; margin: 0 auto 1rem;"></div>
                Loading...
            </div>
        </div>
    `;
    document.body.appendChild(loader);
};

window.hideLoading = function() {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.remove();
    }
};

// Error handling
window.addEventListener('error', function(e) {
    console.error('Website error:', e.error);
    // You could show a user-friendly error message here
});

// Online/offline detection
window.addEventListener('online', function() {
    console.log('Connection restored');
});

window.addEventListener('offline', function() {
    console.log('Connection lost - some features may not work');
});