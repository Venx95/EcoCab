
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin } from 'lucide-react';

interface MapComponentProps {
  pickupPoint?: string;
  destination?: string;
}

const MapComponent = ({ pickupPoint, destination }: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Display loading state
    if (isLoading) {
      mapRef.current.innerHTML = `
        <div class="flex flex-col items-center justify-center w-full h-full">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p class="text-muted-foreground">Loading map...</p>
        </div>
      `;
    }
    
    // Initialize Google Maps
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: "AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg", // This is a public test API key from Google Maps documentation
          version: "weekly",
          libraries: ["places"]
        });
        
        await loader.load();
        
        if (!mapRef.current || !window.google) return;
        
        // Clear the loading indicator
        mapRef.current.innerHTML = '';
        
        // Create the map
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 40.749933, lng: -73.98633 }, // Default to New York
          zoom: 13,
          mapTypeControl: false,
          fullscreenControl: true,
          streetViewControl: false,
          zoomControl: true
        });
        
        setMapLoaded(true);
        setIsLoading(false);
        
        // Convert addresses to coordinates and add markers if provided
        if (pickupPoint || destination) {
          const geocoder = new google.maps.Geocoder();
          
          // Array to store marker positions for boundary fitting
          const bounds = new google.maps.LatLngBounds();
          
          if (pickupPoint) {
            geocoder.geocode({ address: pickupPoint }, (results, status) => {
              if (status === "OK" && results && results[0]) {
                const position = results[0].geometry.location;
                
                // Add pickup marker
                const pickupMarker = new google.maps.Marker({
                  position: position,
                  map: map,
                  icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: "#22c55e", // Green color for pickup
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "#ffffff",
                  },
                  title: "Pickup: " + pickupPoint
                });
                
                // Add pickup info window
                const pickupInfo = new google.maps.InfoWindow({
                  content: `<div class="p-2"><strong>Pickup:</strong> ${pickupPoint}</div>`
                });
                
                pickupMarker.addListener("click", () => {
                  pickupInfo.open(map, pickupMarker);
                });
                
                bounds.extend(position);
                
                // If both points are available, fit the map to show both
                if (destination && mapLoaded) {
                  map.fitBounds(bounds);
                }
              }
            });
          }
          
          if (destination) {
            geocoder.geocode({ address: destination }, (results, status) => {
              if (status === "OK" && results && results[0]) {
                const position = results[0].geometry.location;
                
                // Add destination marker
                const destMarker = new google.maps.Marker({
                  position: position,
                  map: map,
                  icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: "#0ea5e9", // Blue color for destination
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "#ffffff",
                  },
                  title: "Destination: " + destination
                });
                
                // Add destination info window
                const destInfo = new google.maps.InfoWindow({
                  content: `<div class="p-2"><strong>Destination:</strong> ${destination}</div>`
                });
                
                destMarker.addListener("click", () => {
                  destInfo.open(map, destMarker);
                });
                
                bounds.extend(position);
                
                // If both points are available, fit the map to show both
                if (pickupPoint && mapLoaded) {
                  map.fitBounds(bounds);
                }
              }
            });
          }
          
          // If both pickup and destination are set, try to draw a route between them
          if (pickupPoint && destination) {
            const directionsService = new google.maps.DirectionsService();
            const directionsRenderer = new google.maps.DirectionsRenderer({
              suppressMarkers: true, // Don't show default markers as we've created custom ones
              polylineOptions: {
                strokeColor: "#22c55e",
                strokeWeight: 5,
                strokeOpacity: 0.7
              }
            });
            
            directionsRenderer.setMap(map);
            
            directionsService.route({
              origin: pickupPoint,
              destination: destination,
              travelMode: google.maps.TravelMode.DRIVING
            }, (response, status) => {
              if (status === "OK" && response) {
                directionsRenderer.setDirections(response);
              }
            });
          }
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        if (mapRef.current) {
          mapRef.current.innerHTML = `
            <div class="flex flex-col items-center justify-center w-full h-full">
              <div class="text-red-500 mb-2">Failed to load map</div>
              <p class="text-muted-foreground text-sm">Please try refreshing the page</p>
            </div>
          `;
        }
      }
    };
    
    // Initialize map with a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initMap();
    }, 500);
    
    return () => {
      clearTimeout(timer);
    };
  }, [pickupPoint, destination, mapLoaded]);
  
  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-border shadow-sm">
      <div ref={mapRef} className="w-full h-full bg-muted"></div>
    </div>
  );
};

export default MapComponent;
