
// Type definitions for Google Maps JavaScript API
declare interface Window {
  google: typeof google;
}

declare namespace google.maps {
  class Map {
    constructor(mapDiv: Element, opts?: MapOptions);
    setCenter(latLng: LatLng | LatLngLiteral): void;
    setZoom(zoom: number): void;
    fitBounds(bounds: LatLngBounds | LatLngBoundsLiteral): void;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
    toJSON(): LatLngLiteral;
  }

  class LatLngBounds {
    constructor(sw?: LatLng, ne?: LatLng);
    extend(latLng: LatLng | LatLngLiteral): LatLngBounds;
  }

  class Marker {
    constructor(opts: MarkerOptions);
    setPosition(latLng: LatLng | LatLngLiteral): void;
    setMap(map: Map | null): void;
    addListener(eventName: string, handler: Function): MapsEventListener;
  }

  class InfoWindow {
    constructor(opts?: InfoWindowOptions);
    open(map: Map, anchor?: MVCObject): void;
    setContent(content: string | Node): void;
  }

  class Geocoder {
    constructor();
    geocode(request: GeocoderRequest, callback: (results: GeocoderResult[], status: GeocoderStatus) => void): void;
  }

  class DirectionsService {
    constructor();
    route(request: DirectionsRequest, callback: (result: DirectionsResult | null, status: DirectionsStatus) => void): void;
  }

  class DirectionsRenderer {
    constructor(opts?: DirectionsRendererOptions);
    setMap(map: Map | null): void;
    setDirections(directions: DirectionsResult): void;
  }

  class Autocomplete {
    constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
    addListener(eventName: string, handler: Function): MapsEventListener;
    getPlace(): PlaceResult;
  }

  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    mapTypeId?: string;
    mapTypeControl?: boolean;
    fullscreenControl?: boolean;
    streetViewControl?: boolean;
    zoomControl?: boolean;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  interface LatLngBoundsLiteral {
    east: number;
    north: number;
    south: number;
    west: number;
  }

  interface MarkerOptions {
    position: LatLng | LatLngLiteral;
    map?: Map;
    icon?: string | Icon | Symbol;
    title?: string;
  }

  interface InfoWindowOptions {
    content?: string | Node;
    position?: LatLng | LatLngLiteral;
  }

  interface GeocoderRequest {
    address?: string;
    location?: LatLng | LatLngLiteral;
    placeId?: string;
    bounds?: LatLngBounds | LatLngBoundsLiteral;
    componentRestrictions?: GeocoderComponentRestrictions;
    region?: string;
  }

  interface GeocoderComponentRestrictions {
    country: string | string[];
  }

  interface GeocoderResult {
    address_components: GeocoderAddressComponent[];
    formatted_address: string;
    geometry: GeocoderGeometry;
    place_id: string;
    types: string[];
  }

  interface GeocoderAddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
  }

  interface GeocoderGeometry {
    location: LatLng;
    location_type: string;
    viewport: LatLngBounds;
    bounds?: LatLngBounds;
  }

  interface DirectionsRequest {
    origin: string | LatLng | LatLngLiteral | Place;
    destination: string | LatLng | LatLngLiteral | Place;
    travelMode: TravelMode;
    transitOptions?: TransitOptions;
    drivingOptions?: DrivingOptions;
    unitSystem?: UnitSystem;
    waypoints?: DirectionsWaypoint[];
    optimizeWaypoints?: boolean;
    provideRouteAlternatives?: boolean;
    avoidFerries?: boolean;
    avoidHighways?: boolean;
    avoidTolls?: boolean;
    region?: string;
  }

  interface DirectionsWaypoint {
    location: string | LatLng | LatLngLiteral | Place;
    stopover?: boolean;
  }

  interface Place {
    location?: LatLng | LatLngLiteral;
    placeId?: string;
    query?: string;
  }

  interface TransitOptions {
    arrivalTime?: Date;
    departureTime?: Date;
    modes?: TransitMode[];
    routingPreference?: TransitRoutePreference;
  }

  interface DrivingOptions {
    departureTime: Date;
    trafficModel?: TrafficModel;
  }

  interface DirectionsResult {
    routes: DirectionsRoute[];
  }

  interface DirectionsRoute {
    legs: DirectionsLeg[];
    overview_path: LatLng[];
    overview_polyline: string;
    warnings: string[];
    waypoint_order: number[];
  }

  interface DirectionsLeg {
    distance: Distance;
    duration: Duration;
    end_address: string;
    end_location: LatLng;
    start_address: string;
    start_location: LatLng;
    steps: DirectionsStep[];
  }

  interface DirectionsStep {
    distance: Distance;
    duration: Duration;
    end_location: LatLng;
    instructions: string;
    path: LatLng[];
    start_location: LatLng;
    transit?: TransitDetails;
    travel_mode: TravelMode;
  }

  interface Distance {
    text: string;
    value: number;
  }

  interface Duration {
    text: string;
    value: number;
  }

  interface TransitDetails {
    arrival_stop: TransitStop;
    arrival_time: Time;
    departure_stop: TransitStop;
    departure_time: Time;
    headsign: string;
    headway: number;
    line: TransitLine;
    num_stops: number;
  }

  interface TransitStop {
    location: LatLng;
    name: string;
  }

  interface Time {
    text: string;
    time_zone: string;
    value: Date;
  }

  interface TransitLine {
    agencies: TransitAgency[];
    color: string;
    icon: string;
    name: string;
    short_name: string;
    text_color: string;
    vehicle: TransitVehicle;
  }

  interface TransitAgency {
    name: string;
    phone: string;
    url: string;
  }

  interface TransitVehicle {
    icon: string;
    local_icon: string;
    name: string;
    type: VehicleType;
  }

  enum TravelMode {
    BICYCLING = "BICYCLING",
    DRIVING = "DRIVING",
    TRANSIT = "TRANSIT",
    WALKING = "WALKING"
  }

  enum TransitMode {
    BUS = "BUS",
    RAIL = "RAIL",
    SUBWAY = "SUBWAY",
    TRAIN = "TRAIN",
    TRAM = "TRAM"
  }

  enum TransitRoutePreference {
    FEWER_TRANSFERS = "FEWER_TRANSFERS",
    LESS_WALKING = "LESS_WALKING"
  }

  enum TrafficModel {
    BEST_GUESS = "BEST_GUESS",
    OPTIMISTIC = "OPTIMISTIC",
    PESSIMISTIC = "PESSIMISTIC"
  }

  enum UnitSystem {
    IMPERIAL = 0,
    METRIC = 1
  }

  enum VehicleType {
    BUS = "BUS",
    CABLE_CAR = "CABLE_CAR",
    COMMUTER_TRAIN = "COMMUTER_TRAIN",
    FERRY = "FERRY",
    FUNICULAR = "FUNICULAR",
    GONDOLA_LIFT = "GONDOLA_LIFT",
    HEAVY_RAIL = "HEAVY_RAIL",
    HIGH_SPEED_TRAIN = "HIGH_SPEED_TRAIN",
    INTERCITY_BUS = "INTERCITY_BUS",
    METRO_RAIL = "METRO_RAIL",
    MONORAIL = "MONORAIL",
    OTHER = "OTHER",
    RAIL = "RAIL",
    SHARE_TAXI = "SHARE_TAXI",
    SUBWAY = "SUBWAY",
    TRAM = "TRAM",
    TROLLEYBUS = "TROLLEYBUS"
  }

  interface DirectionsRendererOptions {
    directions?: DirectionsResult;
    map?: Map;
    panel?: Element;
    polylineOptions?: PolylineOptions;
    suppressMarkers?: boolean;
    suppressPolylines?: boolean;
  }

  interface PolylineOptions {
    path?: LatLng[] | LatLngLiteral[];
    clickable?: boolean;
    draggable?: boolean;
    editable?: boolean;
    geodesic?: boolean;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
  }

  interface AutocompleteOptions {
    bounds?: LatLngBounds | LatLngBoundsLiteral;
    componentRestrictions?: GeocoderComponentRestrictions;
    fields?: string[];
    strictBounds?: boolean;
    types?: string[];
  }

  interface PlaceResult {
    address_components?: GeocoderAddressComponent[];
    formatted_address?: string;
    geometry?: {
      location: LatLng;
      viewport: LatLngBounds;
    };
    name?: string;
  }

  interface MapsEventListener {
    remove(): void;
  }

  interface MVCObject {}

  type GeocoderStatus = 'OK' | 'UNKNOWN_ERROR' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST' | 'ZERO_RESULTS' | 'ERROR';
  type DirectionsStatus = 'OK' | 'UNKNOWN_ERROR' | 'REQUEST_DENIED' | 'INVALID_REQUEST' | 'ZERO_RESULTS' | 'MAX_WAYPOINTS_EXCEEDED' | 'NOT_FOUND' | 'OVER_QUERY_LIMIT' | 'MAX_ROUTE_LENGTH_EXCEEDED';

  const SymbolPath: {
    BACKWARD_CLOSED_ARROW: number;
    BACKWARD_OPEN_ARROW: number;
    CIRCLE: number;
    FORWARD_CLOSED_ARROW: number;
    FORWARD_OPEN_ARROW: number;
  };

  interface Symbol {
    path: string | number;
    anchor?: Point;
    fillColor?: string;
    fillOpacity?: number;
    labelOrigin?: Point;
    rotation?: number;
    scale?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
  }

  class Point {
    constructor(x: number, y: number);
    x: number;
    y: number;
    equals(other: Point): boolean;
    toString(): string;
  }

  interface Icon {
    url: string;
    anchor?: Point;
    labelOrigin?: Point;
    origin?: Point;
    scaledSize?: Size;
    size?: Size;
  }

  class Size {
    constructor(width: number, height: number, widthUnit?: string, heightUnit?: string);
    width: number;
    height: number;
    equals(other: Size): boolean;
    toString(): string;
  }

  namespace places {
    class Autocomplete extends google.maps.MVCObject {
      constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
      getBounds(): google.maps.LatLngBounds | undefined;
      getPlace(): PlaceResult;
      setBounds(bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral): void;
      setComponentRestrictions(restrictions: GeocoderComponentRestrictions): void;
      setFields(fields: string[]): void;
      setOptions(options: AutocompleteOptions): void;
      setTypes(types: string[]): void;
    }
  }
}
