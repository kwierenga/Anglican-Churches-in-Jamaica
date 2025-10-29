document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const churchId = urlParams.get('id');
    
    if (churchId) {
        loadChurchDetails(churchId);
    } else {
        // Redirect to main page if no ID provided
        window.location.href = 'index.html';
    }
    
    // Setup research form submission
    setupResearchForm();
});

function loadChurchDetails(churchId) {
    const church = getChurchById(churchId);
    
    if (!church) {
        // Church not found, redirect to main page
        window.location.href = 'index.html';
        return;
    }
    
    // Update page title and header
    document.title = `${church.name} - Anglican Churches of Jamaica`;
    document.getElementById('church-name').textContent = church.name;
    document.getElementById('church-location').textContent = 
        `${church.location.address}, ${church.location.parish}`;
    
    // Update introduction
    document.getElementById('church-intro').textContent = church.introduction;
    
    // Update sections
    document.getElementById('history-brief').textContent = church.sections.history.content;
    document.getElementById('architecture-brief').textContent = church.sections.architecture.content;
    document.getElementById('clergy-brief').textContent = church.sections.clergy.content;
    document.getElementById('events-brief').textContent = church.sections.notable_events.content;
    
    // NEW: Show research status
    showResearchStatus(church);
    
    // Load images
    loadChurchImages(church);
    
    // Initialize mini map
    initializeMiniMap(church);
    
    // Set up modal functionality
    setupModal();
}

function loadChurchImages(church) {
    const mainImage = document.getElementById('main-church-image');
    const thumbnailsContainer = document.getElementById('image-thumbnails');
    
    if (church.images && church.images.length > 0) {
        // Set main image
        mainImage.src = `images/churches/${church.images[0]}`;
        mainImage.alt = church.name;
        
        // Create thumbnails
        thumbnailsContainer.innerHTML = '';
        church.images.forEach((image, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.src = `images/churches/${image}`;
            thumbnail.alt = `${church.name} - Image ${index + 1}`;
            thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
            thumbnail.addEventListener('click', () => {
                mainImage.src = `images/churches/${image}`;
                // Update active thumbnail
                document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
                thumbnail.classList.add('active');
            });
            thumbnailsContainer.appendChild(thumbnail);
        });
    } else {
        // Use placeholder if no images
        mainImage.src = 'images/placeholder-church.jpg';
        mainImage.alt = 'Image not available';
    }
}

function initializeMiniMap(church) {
    const miniMap = L.map('mini-map').setView([church.location.latitude, church.location.longitude], 15);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(miniMap);
    
    L.marker([church.location.latitude, church.location.longitude])
        .addTo(miniMap)
        .bindPopup(church.name)
        .openPopup();
}

function setupModal() {
    const modal = document.getElementById('expanded-modal');
    const closeBtn = document.querySelector('.close');
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function toggleSection(section) {
    const content = document.getElementById(`${section}-content`);
    content.style.display = content.style.display === 'none' ? 'block' : 'block';
}

function showExpanded(section) {
    const churchId = new URLSearchParams(window.location.search).get('id');
    const church = getChurchById(churchId);
    
    if (church && church.sections[section]) {
        const modal = document.getElementById('expanded-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('modal-content');
        
        modalTitle.textContent = church.sections[section].header;
        modalContent.innerHTML = `<p>${church.sections[section].expanded}</p>`;
        
        modal.style.display = 'block';
    }
}

// NEW: Research status display
function showResearchStatus(church) {
    const researchBanner = document.getElementById('research-banner');
    const priorityBadge = document.getElementById('research-priority');
    const lastUpdated = document.getElementById('last-updated-date');
    
    if (church.contentStatus && !church.contentStatus.researched) {
        researchBanner.style.display = 'block';
        priorityBadge.textContent = church.contentStatus.researchPriority.charAt(0).toUpperCase() + 
                                   church.contentStatus.researchPriority.slice(1) + ' Priority';
        priorityBadge.className = `priority-badge priority-${church.contentStatus.researchPriority}`;
        lastUpdated.textContent = church.contentStatus.lastUpdated;
        
        // Set church ID for research form
        document.getElementById('research-church-id').value = church.id;
    } else {
        researchBanner.style.display = 'none';
    }
}

// NEW: Research modal functions
function showResearchForm() {
    document.getElementById('research-modal').style.display = 'block';
}

function closeResearchModal() {
    document.getElementById('research-modal').style.display = 'none';
}

// NEW: Research form setup and submission
function setupResearchForm() {
    const researchForm = document.getElementById('research-form');
    if (researchForm) {
        researchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const churchId = document.getElementById('research-church-id').value;
            const church = getChurchById(churchId);
            
            const contribution = {
                churchId: churchId,
                churchName: church.name,
                name: document.getElementById('researcher-name').value,
                email: document.getElementById('researcher-