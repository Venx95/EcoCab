
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin } from 'lucide-react';

interface MapComponentProps {
  pickupPoint?: string;
  destination?: string;
}

declare global {
  interface Window {
    google: typeof google;
  }
}

const MapComponent = ({ pickupPoint, destination }: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  
  // Clean up function to remove all markers
  const clearMarkers = () => {
    if (markersRef.current) {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    }
    
    if (directionsRenderer.current) {
      directionsRenderer.current.setMap(null);
    }
  };
  
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
        // Check if Google Maps API is already loaded
        if (window.google && window.google.maps) {
          if (mapRef.current) {
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
            
            mapInstance.current = map;
            setMapLoaded(true);
            setIsLoading(false);
            
            // Initialize directions renderer
            directionsRenderer.current = new google.maps.DirectionsRenderer({
              suppressMarkers: true, // Don't show default markers as we've created custom ones
              polylineOptions: {
                strokeColor: "#22c55e",
                strokeWeight: 5,
                strokeOpacity: 0.7
              }
            });
            
            directionsRenderer.current.setMap(map);
            
            // Update map with locations if provided
            updateMapWithLocations(map);
          }
        } else {
          // Fallback to load Google Maps API dynamically if not already loaded
          const loader = new Loader({
            apiKey: "AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg", // This is a public test API key
            version: "weekly",
            libraries: ["places"]
          });
          
          await loader.load();
          
          if (mapRef.current && window.google) {
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
            
            mapInstance.current = map;
            setMapLoaded(true);
            setIsLoading(false);
            
            // Initialize directions renderer
            directionsRenderer.current = new google.maps.DirectionsRenderer({
              suppressMarkers: true, // Don't show default markers as we've created custom ones
              polylineOptions: {
                strokeColor: "#22c55e",
                strokeWeight: 5,
                strokeOpacity: 0.7
              }
            });
            
            directionsRenderer.current.setMap(map);
            
            // Update map with locations if provided
            updateMapWithLocations(map);
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
      clearMarkers();
    };
  }, []); // Only run on mount
  
  // Update map when pickup or destination change
  useEffect(() => {
    if (mapLoaded && mapInstance.current) {
      updateMapWithLocations(mapInstance.current);
    }
  }, [pickupPoint, destination, mapLoaded]);
  
  // Function to update the map with locations
  const updateMapWithLocations = (map: google.maps.Map) => {
    // Clear previous markers and routes
    clearMarkers();
    
    if (!pickupPoint && !destination) return;
    
    // Convert addresses to coordinates and add markers if provided
    const bounds = new google.maps.LatLngBounds();
    const geocoder = new google.maps.Geocoder();
    
    if (pickupPoint) {
      geocoder.geocode({ address: pickupPoint }, (results, status) => {
        if (status === "OK" && results && results[0] && results[0].geometry) {
          const position = results[0].geometry.location;
          
          // Add pickup marker
          const pickupMarker = new google.maps.Marker({
            position,
            map,
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
          
          markersRef.current.push(pickupMarker);
          
          // Add pickup info window
          const pickupInfo = new google.maps.InfoWindow({
            content: `<div class="p-2"><strong>Pickup:</strong> ${pickupPoint}</div>`
          });
          
          pickupMarker.addListener("click", () => {
            pickupInfo.open(map, pickupMarker);
          });
          
          bounds.extend(position);
          
          // If both points are available, fit the map to show both
          if (destination) {
            map.fitBounds(bounds);
          } else {
            map.setCenter(position);
          }
        }
      });
    }
    
    if (destination) {
      geocoder.geocode({ address: destination }, (results, status) => {
        if (status === "OK" && results && results[0] && results[0].geometry) {
          const position = results[0].geometry.location;
          
          // Add destination marker
          const destMarker = new google.maps.Marker({
            position,
            map,
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
          
          markersRef.current.push(destMarker);
          
          // Add destination info window
          const destInfo = new google.maps.InfoWindow({
            content: `<div class="p-2"><strong>Destination:</strong> ${destination}</div>`
          });
          
          destMarker.addListener("click", () => {
            destInfo.open(map, destMarker);
          });
          
          bounds.extend(position);
          
          // If both points are available, fit the map to show both
          if (pickupPoint) {
            map.fitBounds(bounds);
          } else {
            map.setCenter(position);
          }
        }
      });
    }
    
    // If both pickup and destination are set, try to draw a route between them
    if (pickupPoint && destination && directionsRenderer.current) {
      const directionsService = new google.maps.DirectionsService();
      
      directionsService.route({
        origin: pickupPoint,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING
      }, (response, status) => {
        if (status === "OK" && response && directionsRenderer.current) {
          directionsRenderer.current.setDirections(response);
        }
      });
    }
  };
  
  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-border shadow-sm">
      <div ref={mapRef} className="w-full h-full bg-muted"></div>
    </div>
  );
};

export default MapComponent;
