
import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin } from 'lucide-react';

interface MapComponentProps {
  pickupPoint?: string;
  destination?: string;
}

// This is a simulated Google Maps component
// In a real application, you would use an actual Google Maps API key
const MapComponent = ({ pickupPoint, destination }: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Simulate map loading state
    let timer: ReturnType<typeof setTimeout>;
    
    if (mapRef.current) {
      // Add loading state
      mapRef.current.innerHTML = `
        <div class="flex flex-col items-center justify-center w-full h-full">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p class="text-muted-foreground">Loading map...</p>
        </div>
      `;
      
      // Simulate map loading
      timer = setTimeout(() => {
        if (mapRef.current) {
          // For demo purposes, we're using a static map image
          // In a real app, you would initialize Google Maps here
          mapRef.current.innerHTML = `
            <div class="relative w-full h-full">
              <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none"></div>
              <img 
                src="https://maps.googleapis.com/maps/api/staticmap?center=New+York,NY&zoom=13&size=600x400&maptype=roadmap&key=YOUR_API_KEY" 
                alt="Map" 
                class="w-full h-full object-cover rounded-lg" 
                style="filter: saturate(1.1) hue-rotate(10deg);"
              />
              
              ${pickupPoint ? `
                <div class="absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
                  <div class="bg-primary text-white p-2 rounded-full shadow-lg animate-bounce">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </div>
                  <div class="bg-white px-2 py-1 rounded mt-1 shadow text-sm font-medium">
                    ${pickupPoint}
                  </div>
                </div>
              ` : ''}
              
              ${destination ? `
                <div class="absolute top-2/3 right-1/4 transform -translate-x-1/2 -translate-y-1/2">
                  <div class="bg-accent text-white p-2 rounded-full shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </div>
                  <div class="bg-white px-2 py-1 rounded mt-1 shadow text-sm font-medium">
                    ${destination}
                  </div>
                </div>
              ` : ''}
              
              <div class="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
              </div>
              
              <div class="absolute bottom-4 left-4 bg-white rounded-lg py-1 px-2 text-xs shadow-lg">
                Map data ©2024 Ecocab
              </div>
            </div>
          `;
        }
      }, 1500);
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [pickupPoint, destination]);
  
  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-border shadow-sm">
      <div ref={mapRef} className="w-full h-full bg-muted"></div>
    </div>
  );
};

export default MapComponent;
