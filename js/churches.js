// Enhanced data structure with content status tracking
const churches = [
    {
        id: 1,
        name: "Holy Trinity Cathedral",
        location: {
            address: "North Street, Kingston",
            parish: "Kingston",
            latitude: 17.97,
            longitude: -76.79
        },
        status: "Active",
        classification: "Cathedral",
        // CONTENT STATUS TRACKING
        contentStatus: {
            researched: false,
            verified: false,
            needsReview: true,
            lastUpdated: "2024-01-01",
            researchPriority: "high"
        },
        introduction: "Holy Trinity Cathedral serves as a prominent Anglican church in downtown Kingston. Located on North Street, it represents an important religious site in the capital city. The cathedral continues to serve the local Anglican community with regular services.",
        sections: {
            history: {
                header: "Historical Background",
                content: "This cathedral has been an active place of worship in Kingston for many years, serving as a central location for Anglican ceremonies and community events.",
                expanded: "🚧 **Research in Progress**\n\nWe are currently gathering verified historical information about Holy Trinity Cathedral. This content will be updated with accurate, sourced historical details.\n\n*Help us research this church by contacting local historical societies or church archives.*",
                researchStatus: "needed",
                sources: []
            },
            architecture: {
                header: "Architectural Details", 
                content: "The cathedral features traditional Anglican church architecture with Gothic influences and local adaptations.",
                expanded: "🚧 **Research in Progress**\n\nArchitectural details and historical significance are being researched. We aim to provide accurate information about building style, materials, and historical context.\n\n*Professional architectural assessment pending.*",
                researchStatus: "needed",
                sources: []
            },
            clergy: {
                header: "Clergy Through the Years",
                content: "Served by various distinguished clergy members throughout its history.",
                expanded: "🚧 **Research in Progress**\n\nHistorical records of clergy are being compiled. This section will include verified timelines of rectors, priests, and notable religious figures.\n\n*Church archives and diocesan records under review.*",
                researchStatus: "needed",
                sources: []
            },
            notable_events: {
                header: "Notable Events & Factoids",
                content: "Has witnessed many significant religious, royal, and community events throughout Kingston's history.",
                expanded: "🚧 **Research in Progress**\n\nSignificant events, renovations, and historical milestones are being documented from verified sources.\n\n*Historical newspapers and church records being researched.*",
                researchStatus: "needed",
                sources: []
            }
        },
        images: ["placeholder-church.jpg"],
        year_built: 1911,
        researchContact: {
            needed: true,
            type: "historical, architectural, community",
            notes: "Contact church office for historical records"
        }
    },
    {
        id: 2,
        name: "St. George's Church",
        location: {
            address: "1 West Street, Kingston",
            parish: "Kingston",
            latitude: 17.98,
            longitude: -76.79
        },
        status: "Active",
        classification: "Parish Church",
        contentStatus: {
            researched: false,
            verified: false,
            needsReview: true,
            lastUpdated: "2024-01-01",
            researchPriority: "high"
        },
        introduction: "St. George's Church located at 1 West Street in Kingston is an active Anglican parish church. It serves the local community with regular worship services and religious activities. The church maintains the Anglican tradition in central Kingston.",
        sections: {
            history: {
                header: "Historical Background",
                content: "Active parish church serving the Kingston community for generations.",
                expanded: "🚧 **Research in Progress**\n\nSt. George's Church has been a cornerstone of Anglican worship in central Kingston. We are researching its establishment date, historical significance, and role in the community.\n\n*Historical records and church archives being reviewed.*",
                researchStatus: "needed",
                sources: []
            },
            architecture: {
                header: "Architectural Details", 
                content: "Traditional church building with colonial influences.",
                expanded: "🚧 **Research in Progress**\n\nThe church features architectural elements typical of urban Anglican churches in Jamaica. Detailed architectural analysis is underway to document building materials, style, and historical modifications.\n\n*Architectural survey in progress.*",
                researchStatus: "needed",
                sources: []
            },
            clergy: {
                header: "Clergy Through the Years",
                content: "Various clergy have served this urban parish.",
                expanded: "🚧 **Research in Progress**\n\nRecords of clergy who have served St. George's Church are being compiled. This will include rectors, priests, and their periods of service.\n\n*Diocesan records and church archives under examination.*",
                researchStatus: "needed",
                sources: []
            },
            notable_events: {
                header: "Notable Events & Factoids",
                content: "Community church serving downtown Kingston.",
                expanded: "🚧 **Research in Progress**\n\nSignificant community events, renovations, and historical milestones associated with St. George's Church are being documented from verified sources.\n\n*Local newspapers and community records being researched.*",
                researchStatus: "needed",
                sources: []
            }
        },
        images: ["placeholder-church.jpg"],
        year_built: 1885,
        researchContact: {
            needed: true,
            type: "historical, community",
            notes: "Contact parish office for historical information"
        }
    },
    {
        id: 3,
        name: "St. Andrew Parish Church",
        location: {
            address: "Half-Way-Tree, St. Andrew",
            parish: "St. Andrew",
            latitude: 18.00,
            longitude: -76.78
        },
        status: "Active",
        classification: "Parish Church",
        contentStatus: {
            researched: false,
            verified: false,
            needsReview: true,
            lastUpdated: "2024-01-01",
            researchPriority: "medium"
        },
        introduction: "St. Andrew Parish Church in Half-Way-Tree serves as a major Anglican church in the parish of St. Andrew. Located in this busy commercial area, it provides spiritual services to both residents and visitors.",
        sections: {
            history: { header: "Historical Background", content: "Key parish church serving the Half-Way-Tree community.", expanded: "Research in progress..." },
            architecture: { header: "Architectural Details", content: "Prominent church building in Half-Way-Tree area.", expanded: "Research in progress..." },
            clergy: { header: "Clergy Through the Years", content: "Served by notable clergy in St. Andrew parish.", expanded: "Research in progress..." },
            notable_events: { header: "Notable Events & Factoids", content: "Important community events and religious ceremonies.", expanded: "Research in progress..." }
        },
        images: ["placeholder-church.jpg"],
        year_built: null
    },
    {
        id: 4,
        name: "St. Peter's Church",
        location: {
            address: "Alley, Clarendon",
            parish: "Clarendon",
            latitude: 17.96,
            longitude: -77.24
        },
        status: "Active",
        classification: "Church",
        contentStatus: {
            researched: false,
            verified: false,
            needsReview: true,
            lastUpdated: "2024-01-01",
            researchPriority: "medium"
        },
        introduction: "St. Peter's Church in Alley, Clarendon serves the Anglican community in this rural parish. The church provides regular worship services and maintains Anglican traditions in the Clarendon area.",
        sections: {
            history: { header: "Historical Background", content: "Serving the Alley community in Clarendon.", expanded: "Research in progress..." },
            architecture: { header: "Architectural Details", content: "Rural church architecture adapted to local conditions.", expanded: "Research in progress..." },
            clergy: { header: "Clergy Through the Years", content: "Clergy serving rural Clarendon communities.", expanded: "Research in progress..." },
            notable_events: { header: "Notable Events & Factoids", content: "Community-focused church in rural Jamaica.", expanded: "Research in progress..." }
        },
        images: ["placeholder-church.jpg"],
        year_built: null
    },
    {
        id: 5,
        name: "St. James Parish Church",
        location: {
            address: "Sam Sharpe Square, St. James",
            parish: "St. James",
            latitude: 18.47,
            longitude: -77.92
        },
        status: "Active",
        classification: "Parish Church",
        contentStatus: {
            researched: false,
            verified: false,
            needsReview: true,
            lastUpdated: "2024-01-01",
            researchPriority: "high"
        },
        introduction: "St. James Parish Church located in Sam Sharpe Square, Montego Bay is a significant Anglican church in western Jamaica. Situated in this historic square, it serves both locals and tourists.",
        sections: {
            history: { header: "Historical Background", content: "Important parish church in Montego Bay's historic square.", expanded: "Research in progress..." },
            architecture: { header: "Architectural Details", content: "Notable church architecture in urban St. James.", expanded: "Research in progress..." },
            clergy: { header: "Clergy Through the Years", content: "Clergy serving the Montego Bay Anglican community.", expanded: "Research in progress..." },
            notable_events: { header: "Notable Events & Factoids", content: "Church in Jamaica's tourism capital.", expanded: "Research in progress..." }
        },
        images: ["placeholder-church.jpg"],
        year_built: null
    },
    {
        id: 6,
        name: "St. Ann Parish Church",
        location: {
            address: "St. Ann's Bay, St. Ann",
            parish: "St. Ann",
            latitude: 18.43,
            longitude: -77.20
        },
        status: "Active",
        classification: "Parish Church",
        contentStatus: {
            researched: false,
            verified: false,
            needsReview: true,
            lastUpdated: "2024-01-01",
            researchPriority: "medium"
        },
        introduction: "St. Ann Parish Church in St. Ann's Bay serves as the main Anglican church in this historic parish. Located in the birthplace of Marcus Garvey, it represents continuous Anglican presence.",
        sections: {
            history: { header: "Historical Background", content: "Parish church in the historic town of St. Ann's Bay.", expanded: "Research in progress..." },
            architecture: { header: "Architectural Details", content: "Traditional parish church architecture.", expanded: "Research in progress..." },
            clergy: { header: "Clergy Through the Years", content: "Clergy serving St. Ann's Bay community.", expanded: "Research in progress..." },
            notable_events: { header: "Notable Events & Factoids", content: "Church in historic St. Ann's Bay.", expanded: "Research in progress..." }
        },
        images: ["placeholder-church.jpg"],
        year_built: null
    },
    {
        id: 7,
        name: "St. Thomas Parish Church",
        location: {
            address: "Morant Bay, St. Thomas",
            parish: "St. Thomas",
            latitude: 17.88,
            longitude: -76.41
        },
        status: "Active",
        classification: "Parish Church",
        contentStatus: {
            researched: false,
            verified: false,
            needsReview: true,
            lastUpdated: "2024-01-01",
            researchPriority: "medium"
        },
        introduction: "St. Thomas Parish Church in Morant Bay serves as an important Anglican church in eastern Jamaica. Located in this historic town, the church represents Anglican continuity in St. Thomas.",
        sections: {
            history: { header: "Historical Background", content: "Parish church in historic Morant Bay.", expanded: "Research in progress..." },
            architecture: { header: "Architectural Details", content: "Church architecture in eastern Jamaica.", expanded: "Research in progress..." },
            clergy: { header: "Clergy Through the Years", content: "Clergy serving St. Thomas parish.", expanded: "Research in progress..." },
            notable_events: { header: "Notable Events & Factoids", content: "Church in historically significant Morant Bay.", expanded: "Research in progress..." }
        },
        images: ["placeholder-church.jpg"],
        year_built: null
    },
    {
        id: 8,
        name: "St. Catherine Parish Church",
        location: {
            address: "Spanish Town, St. Catherine",
            parish: "St. Catherine",
            latitude: 17.99,
            longitude: -76.96
        },
        status: "Active",
        classification: "Parish Church",
        contentStatus: {
            researched: false,
            verified: false,
            needsReview: true,
            lastUpdated: "2024-01-01",
            researchPriority: "high"
        },
        introduction: "St. Catherine Parish Church in Spanish Town serves the Anglican community in Jamaica's former capital. Located in this historically significant town, the church represents Anglican heritage.",
        sections: {
            history: { header: "Historical Background", content: "Parish church in Jamaica's former capital.", expanded: "Research in progress..." },
            architecture: { header: "Architectural Details", content: "Church architecture reflecting Spanish Town's history.", expanded: "Research in progress..." },
            clergy: { header: "Clergy Through the Years", content: "Clergy serving the former capital community.", expanded: "Research in progress..." },
            notable_events: { header: "Notable Events & Factoids", content: "Church in Jamaica's former capital city.", expanded: "Research in progress..." }
        },
        images: ["placeholder-church.jpg"],
        year_built: null
    },
    {
        id: 9,
        name: "St. Peter's Church (Old)",
        location: {
            address: "Port Royal, Kingston",
            parish: "Kingston",
            latitude: 17.94,
            longitude: -76.84
        },
        status: "Ruin",
        classification: "Church",
        contentStatus: {
            researched: false,
            verified: false,
            needsReview: true,
            lastUpdated: "2024-01-01",
            researchPriority: "low"
        },
        introduction: "The old St. Peter's Church in Port Royal stands as a historic ruin from the era when Port Royal was the 'wickedest city on earth'. This church ruin represents the Anglican presence in the historic pirate haven.",
        sections: {
            history: { header: "Historical Background", content: "Historic church ruin in famous Port Royal.", expanded: "Research in progress..." },
            architecture: { header: "Architectural Details", content: "Ruins showing 17th century church architecture.", expanded: "Research in progress..." },
            clergy: { header: "Clergy Through the Years", content: "Clergy who served in historic Port Royal.", expanded: "Research in progress..." },
            notable_events: { header: "Notable Events & Factoids", content: "Church connected to Port Royal's pirate history.", expanded: "Research in progress..." }
        },
        images: ["placeholder-church.jpg"],
        year_built: null
    },
    {
        id: 10,
        name: "St. Mary's Church",
        location: {
            address: "Highgate, St. Mary",
            parish: "St. Mary",
            latitude: 18.25,
            longitude: -76.90
        },
        status: "Active",
        classification: "Church",
        contentStatus: {
            researched: false,
            verified: false,
            needsReview: true,
            lastUpdated: "2024-01-01",
            researchPriority: "low"
        },
        introduction: "St. Mary's Church in Highgate serves the Anglican community in this picturesque parish. Located in the lush landscape of St. Mary, the church provides spiritual services to this agricultural community.",
        sections: {
            history: { header: "Historical Background", content: "Church serving the Highgate community in St. Mary.", expanded: "Research in progress..." },
            architecture: { header: "Architectural Details", content: "Church architecture adapted to St. Mary's landscape.", expanded: "Research in progress..." },
            clergy: { header: "Clergy Through the Years", content: "Clergy serving St. Mary parish communities.", expanded: "Research in progress..." },
            notable_events: { header: "Notable Events & Factoids", content: "Community church in picturesque St. Mary.", expanded: "Research in progress..." }
        },
        images: ["placeholder-church.jpg"],
        year_built: null
    }
];

// Function to get all churches
function getAllChurches() {
    return churches;
}

// Function to get church by ID
function getChurchById(id) {
    return churches.find(church => church.id === parseInt(id));
}

// Function to search churches
function searchChurches(query, parish = '') {
    const searchTerm = query.toLowerCase();
    return churches.filter(church => {
        const matchesSearch = church.name.toLowerCase().includes(searchTerm) ||
                            church.location.address.toLowerCase().includes(searchTerm) ||
                            church.location.parish.toLowerCase().includes(searchTerm);
        
        const matchesParish = !parish || church.location.parish.toLowerCase().includes(parish.toLowerCase());
        
        return matchesSearch && matchesParish;
    });
}

// Content management functions
function getChurchesByResearchPriority(priority) {
    return churches.filter(church => church.contentStatus.researchPriority === priority);
}

function getChurchesNeedingResearch() {
    return churches.filter(church => !church.contentStatus.researched);
}

function markChurchResearched(churchId, sources = []) {
    const church = getChurchById(churchId);
    if (church) {
        church.contentStatus.researched = true;
        church.contentStatus.lastUpdated = new Date().toISOString().split('T')[0];
        church.sections.history.sources = sources;
        // Could save to localStorage or send to server
    }
}

// Get research statistics
function getResearchStats() {
    const total = churches.length;
    const researched = churches.filter(church => church.contentStatus.researched).length;
    const needingResearch = total - researched;
    
    return {
        total,
        researched,
        needingResearch,
        highPriority: churches.filter(church => church.contentStatus.researchPriority === 'high').length,
        mediumPriority: churches.filter(church => church.contentStatus.researchPriority === 'medium').length,
        lowPriority: churches.filter(church => church.contentStatus.researchPriority === 'low').length
    };
}