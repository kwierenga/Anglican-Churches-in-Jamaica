// app.js - Google Maps version for Anglican Churches of Jamaica

// ----- 1. Map constants -----
const JAMAICA_CENTER = { lat: 18.154333965681116, lng: -77.37938278401592 };
const DEFAULT_ZOOM = 9.3;

// Parish centre coordinates for "zoom to parish"
// Names must EXACTLY match churchesData[i].parish
const parishCenters = {
  "Clarendon":     { lat: 18.0,  lng: -77.27 },
  "Hanover":       { lat: 18.4,  lng: -78.17 },
  "Kingston":      { lat: 17.97, lng: -76.79 },
  "Manchester":    { lat: 18.05, lng: -77.51 },  
  "Portland":      { lat: 18.12, lng: -76.49 },
  "St. Andrew":    { lat: 18.06, lng: -76.76 },  
  "St. Ann":       { lat: 18.33, lng: -77.24 }, 
  "St. Catherine": { lat: 18.03, lng: -76.99 },
  "St. Elizabeth": { lat: 18.05, lng: -77.75 },
  "St. James":     { lat: 18.45, lng: -77.9  },
  "St. Mary":      { lat: 18.28, lng: -76.88 }, 
  "St. Thomas":    { lat: 17.95, lng: -76.42 }, 
  "Trelawny":      { lat: 18.35, lng: -77.55 },
  "Westmoreland":  { lat: 18.25, lng: -78.05 }   
};

// Colour-code parishes for marker icons (fallback used if missing)
const parishColors = {
  "Kingston": "#8b1a1a",
  "St. Andrew": "#5b3b7a",
  "St. Thomas": "#2f6b3f",
  "Portland": "#1d2a4d",
  "St. Mary": "#d4af37",
  "St. Ann": "#3f6ba5",
  "Trelawny": "#b5651d",
  "St. James": "#006d5b",
  "Hanover": "#7b1fa2",
  "Westmoreland": "#c62828",
  "St. Elizabeth": "#2e7d32",
  "Manchester": "#1565c0",
  "Clarendon": "#ef6c00",
  "St. Catherine": "#6d4c41"
};

const FALLBACK_MARKER_COLOR = "#1d2a4d";

// Custom map style: mute almost everything, hide built-in labels/icons
// so we can show only Anglican churches + our own parish capital labels.

// ----- Church icon tinting per parish -----
// Base black church icon; will be tinted per parish colour.
const baseIconUrl = "images/church-marker.png";  // adjust path if needed
const parishIconUrls = {}; // parish name -> coloured dataURL

const baseIconImg = new Image();
baseIconImg.src = baseIconUrl;

// When the base icon loads, create a tinted version for each parish colour
baseIconImg.onload = function () {
  Object.entries(parishColors).forEach(([parish, color]) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = baseIconImg.width;
    canvas.height = baseIconImg.height;

    // Draw the black icon first
    ctx.drawImage(baseIconImg, 0, 0);

    // Use the icon as a mask and fill with the parish colour
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Store data URL
    parishIconUrls[parish] = canvas.toDataURL();
  });
};
const baseMapStyle = [
  // Turn off all default icons
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }]
  },
  // Hide POIs and transit
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }]
  },
  // Hide administrative + road labels (we'll add our own capitals)
  {
    featureType: "administrative",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "road",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  // Slightly soften land / water colours
  {
    featureType: "landscape",
    stylers: [{ saturation: -20 }, { lightness: 10 }]
  },
  {
    featureType: "water",
    stylers: [{ saturation: -20 }, { lightness: 5 }]
  }
];

// Parish capitals for custom labels (no extra icons)
const parishCapitals = [
  { parish: "Kingston",      name: "Kingston",         position: { lat: 17.97, lng: -76.79 } },
  { parish: "St. Andrew",    name: "Half Way Tree",    position: { lat: 17.99, lng: -76.79 } },
  { parish: "St. Thomas",    name: "Morant Bay",       position: { lat: 17.88, lng: -76.41 } },
  { parish: "Portland",      name: "Port Antonio",     position: { lat: 18.18, lng: -76.53 } },
  { parish: "St. Mary",      name: "Port Maria",       position: { lat: 18.37, lng: -76.9  } },
  { parish: "St. Ann",       name: "St. Ann's Bay",    position: { lat: 18.43, lng: -77.2  } },
  { parish: "Trelawny",      name: "Falmouth",         position: { lat: 18.49, lng: -77.65 } },
  { parish: "St. James",     name: "Montego Bay",      position: { lat: 18.47, lng: -77.92 } },
  { parish: "Hanover",       name: "Lucea",            position: { lat: 18.44, lng: -78.18 } },
  { parish: "Westmoreland",  name: "Savanna-la-Mar",   position: { lat: 18.23, lng: -78.13 } },
  { parish: "St. Elizabeth", name: "Black River",      position: { lat: 18.03, lng: -77.85 } },
  { parish: "Manchester",    name: "Mandeville",       position: { lat: 18.04, lng: -77.5  } },
  { parish: "Clarendon",     name: "May Pen",          position: { lat: 17.97, lng: -77.24 } },
  { parish: "St. Catherine", name: "Spanish Town",     position: { lat: 17.99, lng: -76.95 } }
];

// ----- 2. State -----
let map;
let markers = [];
let selectedMarker = null;

// DOM references (wired up in initMap)
let churchListEl;
let parishFilterEl;
let textFilterEl;
let layoutRootEl;
let detailsTitleEl;
let detailsIntroEl;
let detailsHistoryEl;
let detailsArchitectureEl;
let detailsClergyEl;
let detailsFactsEl;

// ----- 3. Entry point for Google Maps callback -----
function initMap() {
  // Cache DOM
  churchListEl = document.getElementById("church-list");
  parishFilterEl = document.getElementById("parishFilter");
  textFilterEl = document.getElementById("textFilter");
  layoutRootEl = document.querySelector("body");

  detailsTitleEl = document.getElementById("details-title");
  detailsIntroEl = document.getElementById("details-intro");
  detailsHistoryEl = document.getElementById("details-history");
  detailsArchitectureEl = document.getElementById("details-architecture");
  detailsClergyEl = document.getElementById("details-clergy");
  detailsFactsEl = document.getElementById("details-facts");

  // Create the Google map
  map = new google.maps.Map(document.getElementById("map"), {
    center: JAMAICA_CENTER,
    zoom: DEFAULT_ZOOM,
    mapTypeId: "roadmap",
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DEFAULT,
      position: google.maps.ControlPosition.TOP_RIGHT,
      mapTypeIds: ["roadmap", "satellite", "hybrid", "terrain"]
    },
    streetViewControl: false,
    fullscreenControl: true,
    styles: baseMapStyle
  });

  // Add custom parish capital labels
  addParishCapitalLabels();

  // Initialise filters
  buildParishFilterOptions();

  if (parishFilterEl) {
    parishFilterEl.addEventListener("change", () => {
      applyFilters();
      zoomToSelectedParish();
    });
  }
  if (textFilterEl) {
    textFilterEl.addEventListener("input", () => {
      applyFilters();
    });
  }

  // Initial render
  applyFilters();
}

// Make initMap global for the Google Maps callback
window.initMap = initMap;

// ----- 4. Parish capital labels -----
function addParishCapitalLabels() {
  parishCapitals.forEach((cap) => {
    new google.maps.Marker({
      position: cap.position,
      map,
      clickable: false,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 0, // invisible icon; label only
        fillOpacity: 0,
        strokeOpacity: 0
      },
      label: {
        text: cap.name,
        color: "#333333",
        fontSize: "12px",
        fontWeight: "500"
      }
    });
  });
}

// ----- 5. Filters & rendering -----
function buildParishFilterOptions() {
  if (!parishFilterEl || !Array.isArray(churchesData)) return;

  const existing = new Set();
  Array.from(parishFilterEl.options || []).forEach((opt) => {
    if (opt.value) existing.add(opt.value);
  });

  const parishes = new Set();
  churchesData.forEach((c) => {
    if (c.parish && !existing.has(c.parish)) {
      parishes.add(c.parish);
    }
  });

  Array.from(parishes)
    .sort((a, b) => a.localeCompare(b))
    .forEach((parish) => {
      const opt = document.createElement("option");
      opt.value = parish;
      opt.textContent = parish;
      parishFilterEl.appendChild(opt);
    });
}

function getFilteredChurches() {
  let data = Array.isArray(churchesData) ? churchesData.slice() : [];
  const parish = parishFilterEl ? parishFilterEl.value.trim() : "";
  const text = textFilterEl ? textFilterEl.value.trim().toLowerCase() : "";

  if (parish) {
    data = data.filter((c) => c.parish === parish);
  }

  if (text) {
    data = data.filter((c) => {
      const haystack = [
        c.name,
        c.parish,
        c.town,
        c.intro,
        c.history,
        c.architecture,
        c.clergy,
        c.interestingFacts
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(text);
    });
  }

  return data;
}

function applyFilters() {
  const filtered = getFilteredChurches();
  renderListAndMarkers(filtered);
}

// ----- 6. Markers & sidebar -----
function clearMarkers() {
  markers.forEach((m) => m.setMap(null));
  markers = [];
  selectedMarker = null;
}


function createChurchMarker(church) {
  const color = parishColors[church.parish] || FALLBACK_MARKER_COLOR;
  const iconUrl = parishIconUrls[church.parish];

  const markerOptions = {
    position: { lat: church.lat, lng: church.lng },
    map,
    title: church.name
  };

  if (iconUrl) {
    // Use the tinted church icon for this parish
    markerOptions.icon = {
      url: iconUrl,
      scaledSize: new google.maps.Size(30, 30),
      anchor: new google.maps.Point(15, 30) // bottom centre at lat/lng
    };
  } else {
    // Fallback: coloured arrow while icons are still loading
    markerOptions.icon = {
      path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
      scale: 5,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 1
    };
  }

  const marker = new google.maps.Marker(markerOptions);

  marker._churchId = church.id;
  marker._parishName = church.parish;

  marker.addListener("click", () => {
    setSelectedChurch(church, marker);
    scrollListToChurch(church.id);
  });

  markers.push(marker);
  return marker;
}
function renderListAndMarkers(data) {
  clearMarkers();
  if (!churchListEl) return;

  churchListEl.innerHTML = "";

  data.forEach((church) => {
    const marker = createChurchMarker(church);

    const li = document.createElement("li");
    li.className = "church-list-item";
    li.dataset.churchId = church.id;

    const nameEl = document.createElement("h3");
    nameEl.className = "church-name";
    nameEl.textContent = church.name;
    li.appendChild(nameEl);

    const metaEl = document.createElement("p");
    metaEl.className = "church-meta";
    metaEl.textContent = [church.parish, church.town].filter(Boolean).join(" — ");
    li.appendChild(metaEl);

    li.addEventListener("click", () => {
      setSelectedChurch(church, marker);
    });

    churchListEl.appendChild(li);
  });

  // If we have at least one church, select the first by default
  if (data.length > 0) {
    const first = data[0];
    const firstMarker = markers.find((m) => m._churchId === first.id);
    if (firstMarker) {
      setSelectedChurch(first, firstMarker, { skipPanIfVisible: true });
    }
  } else {
    // Clear details if nothing matches
    updateDetailsPanel(null);
  }
}

// ----- 7. Selection, details panel & map focus -----

function setSelectedChurch(church, marker, options = {}) {
  const { skipPanIfVisible = false } = options;

  // Track the selected marker in case we want to adjust later
  selectedMarker = marker || null;

  // Highlight list item
  if (churchListEl) {
    Array.from(churchListEl.children).forEach((li) => {
      li.classList.toggle(
        "is-selected",
        li.dataset.churchId === String(church.id)
      );
    });
  }

  // Update details panel
  updateDetailsPanel(church);

  // Pan/zoom the map
  if (marker && map) {
    const pos = marker.getPosition();
    if (!skipPanIfVisible) {
      map.panTo(pos);
      if (map.getZoom() < 11) {
        map.setZoom(11);
      }
    }
  }

  // Ensure layout shows details panel
  if (layoutRootEl) {
    layoutRootEl.classList.add("layout--details-open");
  }
}
function updateDetailsPanel(church) {
  if (!detailsTitleEl) return;

  if (!church) {
    detailsTitleEl.textContent = "No churches match the current filters.";
    if (detailsIntroEl) detailsIntroEl.textContent = "";
    if (detailsHistoryEl) detailsHistoryEl.textContent = "";
    if (detailsArchitectureEl) detailsArchitectureEl.textContent = "";
    if (detailsClergyEl) detailsClergyEl.textContent = "";
    if (detailsFactsEl) detailsFactsEl.textContent = "";
    return;
  }

  detailsTitleEl.textContent = church.name || "Unnamed church";

  if (detailsIntroEl) {
    detailsIntroEl.textContent = church.intro || "";
  }
  if (detailsHistoryEl) {
    detailsHistoryEl.textContent = church.history || "";
  }
  if (detailsArchitectureEl) {
    detailsArchitectureEl.textContent = church.architecture || "";
  }
  if (detailsClergyEl) {
    detailsClergyEl.textContent = church.clergy || "";
  }
  if (detailsFactsEl) {
    detailsFactsEl.textContent = church.interestingFacts || "";
  }
}

function scrollListToChurch(churchId) {
  if (!churchListEl) return;
  const li = Array.from(churchListEl.children).find(
    (el) => el.dataset.churchId === String(churchId)
  );
  if (li && typeof li.scrollIntoView === "function") {
    li.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
}

// ----- 8. Zoom-to-parish behaviour when filter changes -----
function zoomToSelectedParish() {
  if (!parishFilterEl || !map) return;
  const parish = parishFilterEl.value.trim();
  if (!parish) {
    map.panTo(JAMAICA_CENTER);
    map.setZoom(DEFAULT_ZOOM);
    return;
  }

  const center = parishCenters[parish];
  if (center) {
    map.panTo(center);
    map.setZoom(10);
  }
}
