document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search');
    const parishFilter = document.getElementById('parish-filter');
    const churchList = document.getElementById('church-list');
    const churchCount = document.getElementById('church-count');
    
    let allChurches = getAllChurches();
    let currentChurches = [...allChurches];
    
    // Initialize
    updateChurchList(currentChurches);
    initializeMap(currentChurches);
    
    // Search functionality
    searchInput.addEventListener('input', handleSearch);
    parishFilter.addEventListener('change', handleSearch);
    
    function handleSearch() {
        const query = searchInput.value;
        const parish = parishFilter.value;
        
        currentChurches = searchChurches(query, parish);
        updateChurchList(currentChurches);
        updateMapMarkers(currentChurches);
    }
    
    function updateChurchList(churches) {
        churchCount.textContent = churches.length;
        churchList.innerHTML = '';
        
        if (churches.length === 0) {
            churchList.innerHTML = '<div class="no-results">No churches found matching your search.</div>';
            return;
        }
        
        churches.forEach(church => {
            const churchCard = document.createElement('div');
            churchCard.className = 'church-card';
            churchCard.innerHTML = `
                <h3>${church.name}</h3>
                <div class="location">${church.location.address}, ${church.location.parish}</div>
                <div class="status">${church.status} • ${church.classification}</div>
            `;
            churchCard.addEventListener('click', () => {
                window.location.href = `church.html?id=${church.id}`;
            });
            churchList.appendChild(churchCard);
        });
    }
});