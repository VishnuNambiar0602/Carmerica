import type { Garage } from '../data/garages';

export interface UserLocation {
  lat: number;
  lng: number;
}

// Demo mode - set to true to use dummy San Francisco location for development
const DEMO_MODE = process.env.NODE_ENV === 'development';

// Dummy San Francisco location for testing (when not in user's actual location)
const DUMMY_LOCATION: UserLocation = {
  lat: 37.7749,  // San Francisco coordinates
  lng: -122.4194,
};

export class GarageLocator {
  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in kilometers
   */
  static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(value: number): number {
    return (value * Math.PI) / 180;
  }

  /**
   * Get user's current location using browser Geolocation API
   */
  static getUserLocation(): Promise<UserLocation> {
    return new Promise((resolve, reject) => {
      // If demo mode is enabled, return dummy San Francisco location
      if (DEMO_MODE) {
        console.log('📍 DEMO MODE: Using dummy San Francisco location', DUMMY_LOCATION);
        resolve(DUMMY_LOCATION);
        return;
      }

      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          // Default to San Francisco if geolocation fails
          console.warn('Geolocation error:', error);
          resolve({
            lat: 37.7749,
            lng: -122.4194,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    });
  }

  /**
   * Watch user location in real-time
   */
  static watchUserLocation(callback: (location: UserLocation) => void): number | null {
    // If demo mode is enabled, return dummy location and optionally simulate movement
    if (DEMO_MODE) {
      console.log('📍 DEMO MODE: Watching dummy San Francisco location');
      callback(DUMMY_LOCATION);
      
      // Optionally simulate slight location changes for testing
      // Uncomment to simulate movement
      /*
      let counter = 0;
      const interval = setInterval(() => {
        counter++;
        const variation = counter * 0.0001; // Slight variation
        callback({
          lat: DUMMY_LOCATION.lat + variation,
          lng: DUMMY_LOCATION.lng + variation,
        });
      }, 5000);
      return interval as any;
      */
      
      return -1; // Return dummy ID
    }

    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return null;
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        callback({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Watch position error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }

  /**
   * Stop watching user location
   */
  static stopWatchingLocation(watchId: number): void {
    if (watchId === -1 || DEMO_MODE) {
      // Demo mode, nothing to clear
      return;
    }
    navigator.geolocation.clearWatch(watchId);
  }

  /**
   * Find nearest garages to a location
   */
  static findNearestGarages(garages: Garage[], userLocation: UserLocation, limit: number = 5) {
    const withDistance = garages.map((garage) => ({
      ...garage,
      distance: this.calculateDistance(userLocation.lat, userLocation.lng, garage.lat, garage.lng),
      distanceInMiles: (this.calculateDistance(userLocation.lat, userLocation.lng, garage.lat, garage.lng) * 0.621371).toFixed(1),
    }));

    return withDistance.sort((a, b) => a.distance - b.distance).slice(0, limit);
  }

  /**
   * Format distance for display
   */
  static formatDistance(distanceKm: number): string {
    const distanceMiles = (distanceKm * 0.621371).toFixed(1);
    return `${distanceMiles} miles`;
  }

  /**
   * Generate Google Maps/OpenStreetMap directions URL
   */
  static getDirectionsUrl(
    userLat: number,
    userLng: number,
    garageLat: number,
    garageLng: number,
    garageName: string
  ): string {
    // Using OpenStreetMap with OSRM for directions (free)
    return `https://www.openstreetmap.org/directions?engine=osrm_car&route=${userLat},${userLng};${garageLat},${garageLng}`;
  }
}
