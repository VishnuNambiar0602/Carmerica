import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { X, Navigation, Clock, MapPin, AlertCircle } from 'lucide-react';
import type { Garage } from '../data/garages';
import { GarageLocator } from '../services/GarageLocator';

const LeafletMapContainer = MapContainer as any;
const LeafletTileLayer = TileLayer as any;
const LeafletMarker = Marker as any;
const LeafletPolyline = Polyline as any;

interface DirectionsViewProps {
  garage: Garage;
  userLocation: { lat: number; lng: number };
  onClose: () => void;
}

// Fix marker icon
const defaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userMarkerIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [1, -28],
  shadowSize: [32, 32],
});

// Map controller to fit bounds
function MapController({
  userLocation,
  garageLocation,
}: {
  userLocation: { lat: number; lng: number };
  garageLocation: { lat: number; lng: number };
}) {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds([
      [userLocation.lat, userLocation.lng],
      [garageLocation.lat, garageLocation.lng],
    ]);
    map.fitBounds(bounds, { padding: [100, 100] });
  }, [userLocation, garageLocation, map]);

  return null;
}

export default function DirectionsView({
  garage,
  userLocation,
  onClose,
}: DirectionsViewProps) {
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const distanceInMiles = GarageLocator.calculateDistance(
    userLocation.lat,
    userLocation.lng,
    garage.lat,
    garage.lng
  ) * 0.621371;

  // Fetch route from OSRM (free routing engine)
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use OSRM for free routing
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${garage.lng},${garage.lat}?overview=full&geometries=geojson`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch route');
        }

        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coordinates = route.geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
          );

          setRouteCoordinates(coordinates);
          setRouteInfo({
            distance: route.distance / 1000, // Convert to km
            duration: Math.round(route.duration / 60), // Convert to minutes
          });
        }
      } catch (err) {
        console.error('Route fetch error:', err);
        // Fallback: create a simple straight line
        setRouteCoordinates([
          [userLocation.lat, userLocation.lng],
          [garage.lat, garage.lng],
        ]);
        setRouteInfo({
          distance: distanceInMiles / 0.621371,
          duration: Math.round((distanceInMiles / 60) * 60), // Rough estimate
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [userLocation, garage]);

  const estimatedMinutes = routeInfo?.duration || 0;
  const distanceKm = routeInfo?.distance || distanceInMiles / 0.621371;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full h-[80vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Directions to {garage.name}</h2>
            <p className="text-emerald-100 text-sm">{garage.address}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-emerald-700 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Map */}
        <div className="flex-1 relative overflow-hidden">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading route...</p>
              </div>
            </div>
          ) : (
            <LeafletMapContainer
              center={[userLocation.lat, userLocation.lng]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <LeafletTileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />

              <MapController
                userLocation={userLocation}
                garageLocation={{ lat: garage.lat, lng: garage.lng }}
              />

              {/* Route Line */}
              {routeCoordinates.length > 0 && (
                <LeafletPolyline
                  positions={routeCoordinates}
                  color="#16a34a"
                  weight={4}
                  opacity={0.8}
                  dashArray="5, 5"
                />
              )}

              {/* User Location */}
              <LeafletMarker
                position={[userLocation.lat, userLocation.lng]}
                icon={userMarkerIcon}
              >
                <Popup>Your Location</Popup>
              </LeafletMarker>

              {/* Garage Location */}
              <LeafletMarker
                position={[garage.lat, garage.lng]}
                icon={defaultIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold">{garage.name}</p>
                    <p className="text-gray-600">{garage.address}</p>
                  </div>
                </Popup>
              </LeafletMarker>
            </LeafletMapContainer>
          )}
        </div>

        {/* Route Info */}
        {routeInfo && (
          <div className="border-t border-gray-200 bg-gray-50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Distance */}
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MapPin className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Distance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(distanceKm * 0.621371).toFixed(1)} mi
                  </p>
                </div>
              </div>

              {/* Estimated Time */}
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <Clock className="text-emerald-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Est. Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {estimatedMinutes} min
                  </p>
                </div>
              </div>

              {/* Garage Info */}
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Navigation className="text-yellow-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Destination</p>
                  <p className="text-sm font-bold text-gray-900">{garage.name}</p>
                </div>
              </div>
            </div>

            {/* Garage Details */}
            <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium text-gray-900">{garage.address}</p>
                <p className="text-sm text-gray-600">{garage.city}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Hours</p>
                <p className="font-medium text-gray-900">{garage.hours}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <a
                  href={`tel:${garage.phone}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {garage.phone}
                </a>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rating</p>
                <p className="font-medium text-gray-900">
                  ⭐ {garage.rating} ({garage.reviews} reviews)
                </p>
              </div>
            </div>

            {/* Note */}
            <div className="mt-6 flex gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="text-blue-600 flex-shrink-0" size={18} />
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This is a demonstration using your test location in San Francisco. 
                Actual directions will work with real locations once deployed.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
