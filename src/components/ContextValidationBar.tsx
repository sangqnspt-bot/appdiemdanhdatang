import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Clock, 
  UserCheck, 
  Wifi, 
  ChevronDown, 
  ChevronUp,
  Settings2,
  ShieldAlert
} from 'lucide-react';
import { ClassSession, GeofenceConfig } from '../types/attendance';
import { GeofenceService, LocationValidationResult } from '../services/geofenceService';

interface ContextValidationBarProps {
  session: ClassSession;
  currentTeacherId: string;
  currentTeacherName: string;
  geofenceConfig: GeofenceConfig;
  currentLat: number;
  currentLng: number;
  currentIp: string;
  onChangeLocation: (lat: number, lng: number, ip: string) => void;
}

export const ContextValidationBar: React.FC<ContextValidationBarProps> = ({
  session,
  currentTeacherId,
  currentTeacherName,
  geofenceConfig,
  currentLat,
  currentLng,
  currentIp,
  onChangeLocation
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Condition 1: Right Teacher Identity
  const isTeacherMatch = currentTeacherId === session.teacherId;

  // Condition 2: Right Time Slot (In production check current time, simulated as match)
  const isTimeSlotValid = true;

  // Condition 3: Geofence or Internal IP
  const locationResult: LocationValidationResult = GeofenceService.validateLocation(
    currentLat,
    currentLng,
    currentIp,
    geofenceConfig
  );

  const isAllValid = isTeacherMatch && isTimeSlotValid && locationResult.isValid;

  const handlePresetChange = (preset: 'in_lab' | 'at_gate' | 'outside' | 'internal_ip' | 'external_4g') => {
    switch (preset) {
      case 'in_lab':
        // Near center ~ 15m
        onChangeLocation(geofenceConfig.latitude + 0.0001, geofenceConfig.longitude + 0.0001, '192.168.1.105');
        break;
      case 'at_gate':
        // ~ 45m away
        onChangeLocation(geofenceConfig.latitude + 0.0003, geofenceConfig.longitude + 0.0003, '192.168.1.188');
        break;
      case 'outside':
        // ~ 450m away, outside geofence and external IP
        onChangeLocation(geofenceConfig.latitude + 0.004, geofenceConfig.longitude + 0.004, '113.161.72.90');
        break;
      case 'internal_ip':
        // Inside school IP network even if GPS signal weak
        onChangeLocation(geofenceConfig.latitude + 0.003, geofenceConfig.longitude + 0.003, '192.168.1.240');
        break;
      case 'external_4g':
        onChangeLocation(geofenceConfig.latitude + 0.003, geofenceConfig.longitude + 0.003, '171.244.15.22');
        break;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs mb-6">
      {/* Primary 3-tier status strip */}
      <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isAllValid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
          }`}>
            {isAllValid ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-wide">
                Kiểm Soát Bối Cảnh Đa Tầng (3 Điều Kiện Bắt Buộc)
              </span>
              <span className={`text-2xs font-bold uppercase px-2 py-0.5 rounded ${
                isAllValid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {isAllValid ? 'Đủ Điều Kiện Hợp Lệ' : 'Vi Phạm Điều Kiện'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Xác thực danh tính giảng viên · Khung giờ phân công · Tọa độ Geofence hoặc IP nội bộ
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="self-start md:self-auto flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Mô phỏng vị trí & IP</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 3 Verification Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 p-4 bg-slate-50/50">
        
        {/* Tier 1: Identity */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span>1. Danh Tính Giảng Viên</span>
            </span>
            {isTeacherMatch ? (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Khớp lịch
              </span>
            ) : (
              <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Sai giảng viên
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-slate-900">
            {session.teacherName}
          </p>
          <p className="text-2xs text-slate-500 mt-0.5">
            Mã GV: {session.teacherId} · Khoa {session.major}
          </p>
        </div>

        {/* Tier 2: Time slot */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>2. Khung Giờ Quy Định</span>
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Trong giờ học
            </span>
          </div>
          <p className="text-xs font-medium text-slate-900">
            {session.timeSlot.start} – {session.timeSlot.end} ({session.timeSlot.shift === 'morning' ? 'Ca Sáng' : 'Ca Chiều'})
          </p>
          <p className="text-2xs text-slate-500 mt-0.5">
            Phòng: {session.room} · Buổi #{session.sessionNumber}/{session.totalCourseSessions}
          </p>
        </div>

        {/* Tier 3: Geofence & IP */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>3. Geofence & Dải IP</span>
            </span>
            {locationResult.isValid ? (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Hợp lệ
              </span>
            ) : (
              <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Ngoài phạm vi
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-slate-900 font-mono">
            Cách tâm {locationResult.distanceMeters}m · IP: {currentIp}
          </p>
          <p className="text-2xs text-slate-500 mt-0.5">
            Ngưỡng bán kính: {geofenceConfig.radiusMeters}m · {geofenceConfig.campusName}
          </p>
        </div>
      </div>

      {/* Location Simulator Panel (Collapsible) */}
      {isExpanded && (
        <div className="p-4 bg-slate-100/70 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h5 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                Bộ Giả Lập Tọa Độ GPS & Mạng Học Đường (Simulator)
              </h5>
              <p className="text-2xs text-slate-500 mt-0.5">
                Kiểm thử hành vi hệ thống khi thiết bị ở trong/ngoài khuôn viên hoặc kết nối qua mạng nội bộ/4G
              </p>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => handlePresetChange('in_lab')}
                className="px-2.5 py-1 text-2xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded shadow-2xs"
              >
                Tại phòng Lab (15m, IP nội bộ)
              </button>
              <button
                onClick={() => handlePresetChange('at_gate')}
                className="px-2.5 py-1 text-2xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded shadow-2xs"
              >
                Tại Cổng trường (45m)
              </button>
              <button
                onClick={() => handlePresetChange('outside')}
                className="px-2.5 py-1 text-2xs font-medium bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded shadow-2xs"
              >
                Ngoài trường (450m, IP 4G)
              </button>
              <button
                onClick={() => handlePresetChange('internal_ip')}
                className="px-2.5 py-1 text-2xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded shadow-2xs"
              >
                Chỉ IP nội bộ trường (Wi-Fi)
              </button>
            </div>
          </div>

          <div className="mt-3 p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center justify-between">
            <span className="font-mono text-2xs">
              Tọa độ: {currentLat.toFixed(5)}, {currentLng.toFixed(5)} · IP Máy trạm: {currentIp}
            </span>
            <span className={`font-medium ${locationResult.isValid ? 'text-emerald-700' : 'text-rose-700'}`}>
              {locationResult.reason}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
