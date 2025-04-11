
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
// (Leaflet's default icons have issues with bundlers)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapComponentProps {
  pickupPoint?: string;
  destination?: string;
  height?: string;
}

// Helper component to update the map view when props change
const ChangeView = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
};

// Calculate distance between two coordinates using the Haversine formula
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  // Earth's radius in kilometers
  const R = 6371;
  
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  
  return distance;
};

const MapComponent = ({ pickupPoint, destination, height = "100%" }: MapComponentProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.749933, -73.98633]); // Default to New York
  const [mapZoom, setMapZoom] = useState<number>(13);
  
  useEffect(() => {
    // Function to geocode an address to coordinates using OSM Nominatim
    const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
      if (!address) return null;
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
        );
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        }
        return null;
      } catch (error) {
        console.error("Error geocoding address:", error);
        return null;
      }
    };
    
    const fetchCoordinates = async () => {
      setIsLoading(true);
      
      if (pickupPoint) {
        const coords = await geocodeAddress(pickupPoint);
        setPickupCoords(coords);
      } else {
        setPickupCoords(null);
      }
      
      if (destination) {
        const coords = await geocodeAddress(destination);
        setDestinationCoords(coords);
      } else {
        setDestinationCoords(null);
      }
      
      setIsLoading(false);
    };
    
    fetchCoordinates();
  }, [pickupPoint, destination]);
  
  // Calculate the center and zoom level based on pickup and destination
  useEffect(() => {
    if (pickupCoords && destinationCoords) {
      // Center between pickup and destination
      const centerLat = (pickupCoords[0] + destinationCoords[0]) / 2;
      const centerLng = (pickupCoords[1] + destinationCoords[1]) / 2;
      setMapCenter([centerLat, centerLng]);
      setMapZoom(10);
    } else if (pickupCoords) {
      setMapCenter(pickupCoords);
      setMapZoom(13);
    } else if (destinationCoords) {
      setMapCenter(destinationCoords);
      setMapZoom(13);
    }
  }, [pickupCoords, destinationCoords]);

  if (isLoading) {
    return (
      <div className="w-full h-full rounded-lg overflow-hidden border border-border shadow-sm flex flex-col items-center justify-center bg-muted" style={{ height }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-border shadow-sm" style={{ height }}>
      <MapContainer 
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={false}
        // Changed how we provide initial center and zoom to the MapContainer
        // Instead of passing center and zoom directly, we'll use the ChangeView component
        // This ensures type safety with react-leaflet
        center={mapCenter} 
        zoom={mapZoom}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {pickupCoords && (
          <Marker position={pickupCoords}>
            <Popup>
              <strong>Pickup:</strong> {pickupPoint}
            </Popup>
          </Marker>
        )}
        
        {destinationCoords && (
          <Marker position={destinationCoords}>
            <Popup>
              <strong>Destination:</strong> {destination}
            </Popup>
          </Marker>
        )}
        
        <ChangeView center={mapCenter} zoom={mapZoom} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
