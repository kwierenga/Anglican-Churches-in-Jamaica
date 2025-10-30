# Anglican Churches of Jamaica

An interactive map showing all Anglican places of worship across Jamaica, built with Google Maps integration.

## Features

- **Google Maps Integration**: High-quality satellite, hybrid, terrain, and street maps
- **Interactive Map**: View churches across all Jamaican parishes with multiple map types
- **Search & Filter**: Search by church name, location, or filter by status, parish, and type
- **Statistics**: Real-time counts and statistics
- **Responsive Design**: Works on desktop and mobile devices
- **Detailed Information**: Click any church for detailed information
- **Multiple Map Types**: Switch between Street, Satellite, Hybrid, and Terrain views

## Data Source

This project uses the complete and corrected dataset of Anglican churches in Jamaica, including:
- 14 parishes across Jamaica
- Multiple status types (Active, Ruin, Unknown, Closed)
- Various classifications (Cathedral, Parish Church, Chapel, Mission Station, etc.)
- Accurate coordinates verified and corrected

## Setup Instructions

### 1. Google Maps API Key

This project requires a Google Maps API key:

1. **Get an API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the "Maps JavaScript API"
   - Create credentials (API key)
   - Restrict the API key to your domain for security

2. **Configure the Key**:
   - Open `script.js`
   - Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key:
   ```javascript
   const GOOGLE_MAPS_API_KEY = 'your_actual_api_key_here';