export const LocationService = {
  getCurrentPosition: (): Promise<{ lat: number; lng: number }> =>
    new Promise((resolve, reject) => {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => reject(err),
          { timeout: 10000, enableHighAccuracy: true }
        );
      } else {
        reject(new Error("Geolocation is not supported by this browser."));
      }
    }),
  generateGoogleMapsURL: (lat: number, lng: number) => `https://www.google.com/maps?q=${lat},${lng}`,
  getAddress: (lat: number, lng: number) => {
    // This is a mock geocoding service as per the prompt.
    // In a real app, this would be a call to a geocoding API.
    const addresses: { [key: string]: { address: string; city: string } } = {
      '28.6139,77.2090': { address: 'Connaught Place, New Delhi', city: 'New Delhi' },
      '19.0760,72.8777': { address: 'Mumbai, Maharashtra', city: 'Mumbai' },
      '12.9716,77.5946': { address: 'Bengaluru, Karnataka', city: 'Bengaluru' },
      '22.5726,88.3639': { address: 'Kolkata, West Bengal', city: 'Kolkata' },
      '13.0827,80.2707': { address: 'Chennai, Tamil Nadu', city: 'Chennai' },
    };
    
    // Find the closest mock address
    let closestKey = '';
    let minDistance = Infinity;

    for (const key in addresses) {
      const [mockLat, mockLng] = key.split(',').map(Number);
      const distance = Math.sqrt(Math.pow(lat - mockLat, 2) + Math.pow(lng - mockLng, 2));
      if (distance < minDistance) {
        minDistance = distance;
        closestKey = key;
      }
    }

    if (closestKey && minDistance < 1) { // 1 degree of lat/lng is roughly 111km
      return addresses[closestKey];
    }
    
    return {
      address: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      city: 'Unknown City',
    };
  },
};
