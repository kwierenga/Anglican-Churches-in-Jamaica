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
            history: { header: "Historical Background", content: "Serving the Alley community in Clarendon.", expanded: "History of Anglican presence in rural Clarendon."