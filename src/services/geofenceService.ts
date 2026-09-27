import { GeofenceConfig } from '../types/attendance';

export interface LocationValidationResult {
  isValid: boolean;
  distanceMeters: number;
  isWithinGeofence: boolean;
  isIpAllowed: boolean;
  reason: string;
  currentLat: number;
  currentLng: number;
  currentIp: string;
}

export class GeofenceService {
  // Haversine formula to compute great-circle distance between two points in meters
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }

  // Check if IP address is in allowed subnet patterns
  static isIpInSubnets(ip: string, subnets: string[]): boolean {
    if (!ip) return false;
    for (const subnet of subnets) {
      if (subnet.startsWith('192.168.1.') && ip.startsWith('192.168.1.')) return true;
      if (subnet.startsWith('172.16.') && ip.startsWith('172.16.')) return true;
      if (subnet.startsWith('10.') && ip.startsWith('10.')) return true;
      if (ip === '127.0.0.1' || ip === 'localhost') return true;
    }
    return false;
  }

  // Validate contextual location (Rule: either Geofence within radius OR school internal IP)
  static validateLocation(
    currentLat: number,
    currentLng: number,
    currentIp: string,
    config: GeofenceConfig
  ): LocationValidationResult {
    const distanceMeters = this.calculateDistance(
      currentLat,
      currentLng,
      config.latitude,
      config.longitude
    );

    const isWithinGeofence = distanceMeters <= config.radiusMeters;
    const isIpAllowed = this.isIpInSubnets(currentIp, config.allowedIpSubnets);

    const isValid = isWithinGeofence || isIpAllowed;

    let reason = '';
    if (isWithinGeofence && isIpAllowed) {
      reason = `Hợp lệ: Vị trí cách tâm cơ sở ${distanceMeters}m (ngưỡng: ${config.radiusMeters}m) & IP nội bộ trường (${currentIp}).`;
    } else if (isWithinGeofence) {
      reason = `Hợp lệ: Vị trí cách cơ sở ${distanceMeters}m nằm trong bán kính cho phép (${config.radiusMeters}m).`;
    } else if (isIpAllowed) {
      reason = `Hợp lệ: Kết nối qua mạng IP nội bộ học đường (${currentIp}).`;
    } else {
      reason = `Không hợp lệ: Vị trí cách trường ${distanceMeters}m (vượt quá bán kính ${config.radiusMeters}m) và IP (${currentIp}) ngoài dải mạng trường.`;
    }

    return {
      isValid,
      distanceMeters,
      isWithinGeofence,
      isIpAllowed,
      reason,
      currentLat,
      currentLng,
      currentIp
    };
  }
}
