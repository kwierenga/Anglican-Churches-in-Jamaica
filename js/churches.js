// Sample data - 10 Anglican churches in Jamaica for testing
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
        introduction: "Holy Trinity Cathedral serves as a prominent Anglican church in downtown Kingston. Located on North Street, it represents an important religious site in the capital city. The cathedral continues to serve the local Anglican community with regular services.",
        sections: {
            history: {
                header: "Historical Background",
                content: "This cathedral has been an active place of worship in Kingston for many years, serving as a central location for Anglican ceremonies and community events.",
                expanded: "Holy Trinity Cathedral was established to serve the growing Anglican population in Kingston. Over the years, it has hosted numerous significant religious ceremonies and has been a cornerstone of the Anglican community in Jamaica's capital city."
            },
            architecture: {
                header: "Architectural Details", 
                content: "The cathedral features traditional Anglican church architecture with Gothic influences and local adaptations.",
                expanded: "Built in the Gothic Revival style, Holy Trinity Cathedral features pointed arches, stained glass windows, and a distinctive bell tower. The structure incorporates local materials while maintaining traditional Anglican architectural elements."
            },
            clergy: {
                header: "Clergy Through the Years",
                content: "Served by various distinguished clergy members throughout its history.",
                expanded: "The cathedral has been served by numerous notable clergy including bishops, deans, and priests who have contributed significantly to the Anglican community in Jamaica."
            },
            notable_events: {
                header: "Notable Events & Factoids",
                content: "Has witnessed many significant religious, royal, and community events throughout Kingston's history.",
                expanded: "The cathedral has hosted royal visits, state funerals, and important ecclesiastical events. It has survived earthquakes and hurricanes, undergoing several renovations to maintain its structural integrity and historical significance."
            }
        },
        images: ["placeholder-church.jpg"],
        year_built: null
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
        introduction: "St. George's Church located at 1 West Street in Kingston is an active Anglican parish church. It serves the local community with regular worship services and religious activities. The church maintains the Anglican tradition in central Kingston.",
        sections: {
            history: { header: "Historical Background", content: "Active parish church serving the Kingston community for generations.", expanded: "St. George's Church has been a cornerstone of Anglican worship in central Kingston, adapting to the changing urban landscape while maintaining traditional services." },
            architecture: { header: "Architectural Details", content: "Traditional church building with colonial influences.", expanded: "The church features a simple yet elegant design typical of urban Anglican churches in Jamaica, with a focus on functionality and worship space." },
            clergy: { header: "Clergy Through the Years", content: "Various clergy have served this urban parish.", expanded: "List of clergy who have served St. George's Church throughout its history." },
            notable_events: { header: "Notable Events & Factoids", content: "Community church serving downtown Kingston.", expanded: "The church has been involved in various community outreach programs and has adapted to serve the evolving needs of its urban congregation." }
        },
        images: ["placeholder-church.jpg"],
        year_built: null
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
        introduction: "St. Andrew Parish Church in Half-Way-Tree serves as a major Anglican church in the parish of St. Andrew. Located in this busy commercial area, it provides spiritual services to both residents and visitors. The church represents historical Anglican presence in this important parish.",
        sections: {
            history: { header: "Historical Background", content: "Key parish church serving the Half-Way-Tree community.", expanded: "Detailed history of St. Andrew Parish Church's establishment and role in the community." },
            architecture: { header: "Architectural Details", content: "Prominent church building in Half-Way-Tree area.", expanded: "Architectural description of this important parish church." },
            clergy: { header: "Clergy Through the Years", content: "Served by notable clergy in St. Andrew parish.", expanded: "History of clergy serving this parish church." },
            notable_events: { header: "Notable Events & Factoids", content: "Important community events and religious ceremonies.", expanded: "Notable events in the church's history." }
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
        introduction: "St. Peter's Church in Alley, Clarendon serves the Anglican community in this rural parish. The church provides regular worship services and maintains Anglican traditions in the Clarendon area. It represents the spread of Anglicanism into rural Jamaica.",
        sections: {
            history: { header: "Historical Background", content: "Serving the Alley community in Clarendon.", expanded: "History of Anglican presence in rural Clarendon." },
            architecture: { header: "Architectural Details", content: "Rural church architecture adapted to local conditions.", expanded: "Description of the church's rural architectural style." },
            clergy: { header: "Clergy Through the Years", content: "Clergy serving rural Clarendon communities.", expanded: "List of clergy who have served this rural church." },
            notable_events: { header: "Notable Events & Factoids", content: "Community-focused church in rural Jamaica.", expanded: "Notable events in this rural church's history." }
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
        introduction: "St. James Parish Church located in Sam Sharpe Square, Montego Bay is a significant Anglican church in western Jamaica. Situated in this historic square, it serves both locals and tourists. The church represents Anglican heritage in Jamaica's tourism capital.",
        sections: {
            history: { header: "Historical Background", content: "Important parish church in Montego Bay's historic square.", expanded: "Historical significance of this church in Montego Bay." },
            architecture: { header: "Architectural Details", content: "Notable church architecture in urban St. James.", expanded: "Architectural features of this prominent church." },
            clergy: { header: "Clergy Through the Years", content: "Clergy serving the Montego Bay Anglican community.", expanded: "History of clergy in this important parish." },
            notable_events: { header: "Notable Events & Factoids", content: "Church in Jamaica's tourism capital.", expanded: "Notable events and community role." }
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
        introduction: "St. Ann Parish Church in St. Ann's Bay serves as the main Anglican church in this historic parish. Located in the birthplace of Marcus Garvey, it represents continuous Anglican presence in this important area. The church serves both the local community and visitors to this historic town.",
        sections: {
            history: { header: "Historical Background", content: "Parish church in the historic town of St. Ann's Bay.", expanded: "Historical role in St. Ann's Bay community." },
            architecture: { header: "Architectural Details", content: "Traditional parish church architecture.", expanded: "Architectural description of this parish church." },
            clergy: { header: "Clergy Through the Years", content: "Clergy serving St. Ann's Bay community.", expanded: "History of clergy in this parish." },
            notable_events: { header: "Notable Events & Factoids", content: "Church in historic St. Ann's Bay.", expanded: "Notable historical events." }
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
        introduction: "St. Thomas Parish Church in Morant Bay serves as an important Anglican church in eastern Jamaica. Located in this historic town known for the Morant Bay Rebellion, the church represents Anglican continuity in St. Thomas. It serves the local community amidst the parish's rich history.",
        sections: {
            history: { header: "Historical Background", content: "Parish church in historic Morant Bay.", expanded: "Role during and after the Morant Bay Rebellion." },
            architecture: { header: "Architectural Details", content: "Church architecture in eastern Jamaica.", expanded: "Architectural features adapted to the eastern parish." },
            clergy: { header: "Clergy Through the Years", content: "Clergy serving St. Thomas parish.", expanded: "History of clergy in this eastern parish." },
            notable_events: { header: "Notable Events & Factoids", content: "Church in historically significant Morant Bay.", expanded: "Connection to historical events in St. Thomas." }
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
        introduction: "St. Catherine Parish Church in Spanish Town serves the Anglican community in Jamaica's former capital. Located in this historically significant town, the church represents Anglican heritage from the colonial era. It continues to serve the spiritual needs of Spanish Town residents.",
        sections: {
            history: { header: "Historical Background", content: "Parish church in Jamaica's former capital.", expanded: "Historical significance in former capital Spanish Town." },
            architecture: { header: "Architectural Details", content: "Church architecture reflecting Spanish Town's history.", expanded: "Architectural features from the colonial era." },
            clergy: { header: "Clergy Through the Years", content: "Clergy serving the former capital community.", expanded: "History of clergy in this historically important parish." },
            notable_events: { header: "Notable Events & Factoids", content: "Church in Jamaica's former capital city.", expanded: "Connection to Jamaica's colonial history." }
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
        introduction: "The old St. Peter's Church in Port Royal stands as a historic ruin from the era when Port Royal was the 'wickedest city on earth'. This church ruin represents the Anglican presence in the historic pirate haven. Today it serves as a historical landmark of Jamaica's colorful past.",
        sections: {
            history: { header: "Historical Background", content: "Historic church ruin in famous Port Royal.", expanded: "History of Anglicanism in the pirate city of Port Royal." },
            architecture: { header: "Architectural Details", content: "Ruins showing 17th century church architecture.", expanded: "Architectural remains and historical significance." },
            clergy: { header: "Clergy Through the Years", content: "Clergy who served in historic Port Royal.", expanded: "Historical clergy in this notorious port city." },
            notable_events: { header: "Notable Events & Factoids", content: "Church connected to Port Royal's pirate history.", expanded: "Connection to earthquakes, pirates, and naval history." }
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
        introduction: "St. Mary's Church in Highgate serves the Anglican community in this picturesque parish. Located in the lush landscape of St. Mary, the church provides spiritual services to this agricultural community. It represents the Anglican tradition in this northeastern Jamaican parish.",
        sections: {
            history: { header: "Historical Background", content: "Church serving the Highgate community in St. Mary.", expanded: "History of Anglican presence in St. Mary parish." },
            architecture: { header: "Architectural Details", content: "Church architecture adapted to St. Mary's landscape.", expanded: "Architectural features suitable for the parish environment." },
            clergy: { header: "Clergy Through the Years", content: "Clergy serving St. Mary parish communities.", expanded: "History of clergy in this agricultural parish." },
            notable_events: { header: "Notable Events & Factoids", content: "Community church in picturesque St. Mary.", expanded: "Notable events in the church's community life." }
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