import React from 'react';
import { MapPin, Phone, Star, Navigation } from 'lucide-react';
import type { Garage } from '../data/garages';
import { GarageLocator } from '../services/GarageLocator';

interface GarageResultsProps {
  garages: any[];
  userLocation?: { lat: number; lng: number };
  onOpenMap?: () => void;
  onGetDirections?: (garage: Garage) => void;
}

export function GarageResults({
  garages,
  userLocation,
  onOpenMap,
  onGetDirections,
}: GarageResultsProps) {
  return (
    <div className="space-y-3 mt-2">
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
        <p className="text-sm font-semibold text-emerald-900">
          📍 Found {garages.length} garage{garages.length !== 1 ? 's' : ''} near you
        </p>
      </div>

      {garages.map((garage, index) => (
        <div
          key={garage.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="inline-block w-6 h-6 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {index + 1}
                </span>
                <h3 className="font-bold text-gray-900">{garage.name}</h3>
              </div>
            </div>
            <span className="text-emerald-600 font-bold text-sm whitespace-nowrap">
              {garage.distanceInMiles} mi
            </span>
          </div>

          <div className="space-y-1 mb-3 text-sm">
            <div className="flex items-start gap-2 text-gray-600">
              <MapPin size={14} className="mt-0.5 flex-shrink-0 text-emerald-600" />
              <span>{garage.address}, {garage.city}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Phone size={14} className="text-emerald-600" />
              <a
                href={`tel:${garage.phone}`}
                className="hover:underline text-blue-600"
              >
                {garage.phone}
              </a>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              <span>
                {garage.rating} • {garage.reviews} reviews
              </span>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {garage.services.slice(0, 3).map((service, i) => (
                <span
                  key={i}
                  className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded"
                >
                  {service}
                </span>
              ))}
              {garage.services.length > 3 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  +{garage.services.length - 3}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (onGetDirections) {
                  onGetDirections(garage);
                } else {
                  const directionsUrl = GarageLocator.getDirectionsUrl(
                    userLocation?.lat || 37.7749,
                    userLocation?.lng || -122.4194,
                    garage.lat,
                    garage.lng,
                    garage.name
                  );
                  window.open(directionsUrl, '_blank');
                }
              }}
              className="flex-1 text-sm bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition font-semibold flex items-center justify-center gap-1"
            >
              <Navigation size={14} />
              Get Directions
            </button>
            <button
              onClick={onOpenMap}
              className="flex-1 text-sm bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold"
            >
              View on Map
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
