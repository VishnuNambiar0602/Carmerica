import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin, Phone, Star, X } from 'lucide-react';
import { CALIFORNIA_GARAGES, type Garage } from '../data/garages';
import { GarageLocator, type UserLocation } from '../services/GarageLocator';
import DirectionsView from './DirectionsView';
import 'leaflet/dist/leaflet.css';

const LeafletMapContainer = MapContainer as any;
const LeafletTileLayer = TileLayer as any;
const LeafletMarker = Marker as any;
const LeafletCircleMarker = CircleMarker as any;

interface GarageMapProps {
  onClose?: () => void;
  onGarageSelect?: (garage: Garage) => void;
}

// Fix for default markers in Leaflet
const defaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [1, -28],
  shadowSize: [32, 32],
  className: 'bg-blue-500',
});

L.Marker.prototype.options.icon = defaultIcon;

// Component to handle map centering
function MapController({ userLocation }: { userLocation: UserLocation | null }) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 9);
    }
  }, [userLocation, map]);

  return null;
}

export default function GarageMap({ onClose, onGarageSelect }: GarageMapProps) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedGarage, setSelectedGarage] = useState<Garage | null>(null);
  const [nearestGarages, setNearestGarages] = useState<any[]>([]);
  const [showDirections, setShowDirections] = useState(false);
  const [selectedGarageForDirections, setSelectedGarageForDirections] = useState<Garage | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for garageId in URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const garageId = params.get('garageId');
    if (garageId) {
      const garage = CALIFORNIA_GARAGES.find(g => g.id === garageId);
      if (garage) {
        setSelectedGarageForDirections(garage);
        setShowDirections(true);
        // Remove the URL parameter after processing
        window.history.replaceState({}, '', '/garage-map');
      }
    }
  }, []);

  useEffect(() => {
    // Get initial location
    GarageLocator.getUserLocation().then((location) => {
      setUserLocation(location);
      setLoading(false);

      // Calculate nearest garages
      const nearest = GarageLocator.findNearestGarages(CALIFORNIA_GARAGES, location, 10);
      setNearestGarages(nearest);
    });

    // Watch for location changes (real-time tracking)
    watchIdRef.current = GarageLocator.watchUserLocation((location) => {
      setUserLocation(location);

      // Update nearest garages as user moves
      const nearest = GarageLocator.findNearestGarages(CALIFORNIA_GARAGES, location, 10);
      setNearestGarages(nearest);
    });

    return () => {
      if (watchIdRef.current) {
        GarageLocator.stopWatchingLocation(watchIdRef.current);
      }
    };
  }, []);

  const handleGarageClick = (garage: Garage) => {
    setSelectedGarage(garage);
    if (onGarageSelect) {
      onGarageSelect(garage);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">CarMerica Garages</h1>
          <p className="text-emerald-100 text-sm">Find garages near you</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-emerald-700 rounded-lg transition"
          >
            <X size={24} />
          </button>
        )}
      </div>

      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Map */}
        <div className="flex-1 rounded-lg overflow-hidden border border-gray-200">
          {userLocation && (
            <LeafletMapContainer
              center={[userLocation.lat, userLocation.lng]}
              zoom={9}
              style={{ height: '100%', width: '100%' }}
            >
              <LeafletTileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />

              <MapController userLocation={userLocation} />

              {/* User Location */}
              {userLocation && (
                <LeafletCircleMarker
                  center={[userLocation.lat, userLocation.lng]}
                  radius={10}
                  fillColor="#3b82f6"
                  color="#1e40af"
                  weight={2}
                  opacity={1}
                  fillOpacity={0.8}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">Your Location</p>
                      <p className="text-gray-600">
                        {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                      </p>
                    </div>
                  </Popup>
                </LeafletCircleMarker>
              )}

              {/* Garage Markers */}
              {CALIFORNIA_GARAGES.map((garage) => (
                <LeafletMarker
                  key={garage.id}
                  position={[garage.lat, garage.lng]}
                  icon={defaultIcon}
                  eventHandlers={{
                    click: () => handleGarageClick(garage),
                  }}
                >
                  <Popup>
                    <div className="w-64">
                      <h3 className="font-bold text-lg mb-2">{garage.name}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <MapPin size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                          <p>{garage.address}, {garage.city}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-emerald-600" />
                          <p>{garage.phone}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star size={16} className="text-yellow-500 fill-yellow-500" />
                          <p>{garage.rating} ({garage.reviews} reviews)</p>
                        </div>
                        {userLocation && (
                          <p className="text-gray-600 font-semibold">
                            {GarageLocator.calculateDistance(
                              userLocation.lat,
                              userLocation.lng,
                              garage.lat,
                              garage.lng
                            ) * 0.621371} mi away
                          </p>
                        )}
                        <button
                          onClick={() => {
                            setSelectedGarageForDirections(garage);
                            setShowDirections(true);
                          }}
                          className="w-full mt-3 bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition text-sm font-semibold flex items-center justify-center gap-2"
                        >
                          <Navigation size={14} />
                          Get Directions
                        </button>
                      </div>
                    </div>
                  </Popup>
                </LeafletMarker>
              ))}
            </LeafletMapContainer>
          )}
        </div>

        {/* Sidebar - Nearest Garages */}
        <div className="w-80 flex flex-col gap-4">
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
            <h2 className="font-bold text-emerald-900 mb-2">📍 Nearest Garages</h2>
            <p className="text-sm text-emerald-700">
              Showing {nearestGarages.length} closest locations
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {nearestGarages.map((garage, index) => (
              <div
                key={garage.id}
                onClick={() => handleGarageClick(garage)}
                className="p-4 border border-gray-200 rounded-lg hover:border-emerald-600 hover:bg-emerald-50 cursor-pointer transition"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-6 h-6 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                      <h3 className="font-bold text-gray-900">{garage.name}</h3>
                    </div>
                  </div>
                  <span className="text-emerald-600 font-bold whitespace-nowrap">
                    {garage.distanceInMiles} mi
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-1">{garage.address}</p>
                <p className="text-sm text-gray-600 mb-2">{garage.city}</p>

                <div className="flex items-center gap-2 mb-2">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold">{garage.rating}</span>
                  <span className="text-sm text-gray-500">({garage.reviews} reviews)</span>
                </div>

                <p className="text-xs text-gray-500 mb-2">Hours: {garage.hours}</p>

                <div className="flex gap-2 flex-wrap mb-2">
                  {garage.services.slice(0, 2).map((service, i) => (
                    <span
                      key={i}
                      className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded"
                    >
                      {service}
                    </span>
                  ))}
                  {garage.services.length > 2 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      +{garage.services.length - 2} more
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`tel:${garage.phone}`);
                    }}
                    className="flex-1 text-sm bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold"
                  >
                    Call
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGarageForDirections(garage);
                      setShowDirections(true);
                    }}
                    className="flex-1 text-sm bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition font-semibold flex items-center justify-center gap-1"
                  >
                    <Navigation size={14} />
                    Navigate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Directions View Modal */}
      {showDirections && selectedGarageForDirections && userLocation && (
        <DirectionsView
          garage={selectedGarageForDirections}
          userLocation={userLocation}
          onClose={() => {
            setShowDirections(false);
            setSelectedGarageForDirections(null);
          }}
        />
      )}
    </div>
  );
}
