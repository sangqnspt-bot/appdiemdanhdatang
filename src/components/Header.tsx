import React from 'react';
import { 
  ShieldCheck, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Sparkles, 
  UserCheck, 
  SlidersHorizontal,
  GraduationCap,
  Key,
  ExternalLink
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'dashboard' | 'attendance' | 'ews' | 'excel' | 'audit';
  onSelectTab: (tab: 'dashboard' | 'attendance' | 'ews' | 'excel' | 'audit') => void;
  userRole: 'teacher' | 'admin';
  onToggleRole: () => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  pendingSyncCount: number;
  onSyncOffline: () => void;
  onOpenAdvisor: () => void;
  onOpenSettings: () => void;
  hasApiKey: boolean;
  currentModel?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  onToggleRole,
  isOffline,
  onToggleOffline,
  pendingSyncCount,
  onSyncOffline,
  onOpenAdvisor,
  onOpenSettings,
  hasApiKey,
  currentModel = 'gemini-3-flash-preview'
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              Smart Attendance Expert
            </span>
          </div>

          {/* Zone 2: Navigation links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
                currentTab === 'dashboard'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => onSelectTab('attendance')}
              className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
                currentTab === 'attendance'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Điểm danh thực địa
            </button>
            <button
              onClick={() => onSelectTab('ews')}
              className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
                currentTab === 'ews'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Cảnh báo sớm EWS
            </button>
            <button
              onClick={() => onSelectTab('excel')}
              className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
                currentTab === 'excel'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Chuẩn hóa & Cổng LMS
            </button>
            <button
              onClick={() => onSelectTab('audit')}
              className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
                currentTab === 'audit'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Nhật ký Audit Log
            </button>
          </nav>

          {/* Zone 3: Actions & Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Required Settings (API Key) button with red text indicator */}
            <button
              onClick={onOpenSettings}
              title="Cài đặt Model AI & Quản lý Gemini API Key"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 shadow-2xs transition-all hover:scale-102 cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              <span className="hidden md:inline">Settings:</span>
              <span className="text-rose-600 font-bold whitespace-nowrap">
                Lấy API key để sử dụng app
              </span>
              {hasApiKey && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 ml-0.5" title="Đã có API Key lưu cục bộ" />
              )}
            </button>

            {/* Offline Simulation Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={onToggleOffline}
                title={isOffline ? "Đang chạy chế độ Ngoại tuyến (Offline)" : "Đang kết nối Trực tuyến (Online)"}
                className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md transition-all ${
                  isOffline 
                    ? 'bg-amber-500 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5 text-emerald-600" />}
                <span className="hidden xl:inline">{isOffline ? 'Offline' : 'Online'}</span>
              </button>

              {pendingSyncCount > 0 && (
                <button
                  onClick={onSyncOffline}
                  disabled={isOffline}
                  title="Nhấp để đồng bộ dữ liệu đệm lên máy chủ"
                  className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                    isOffline 
                      ? 'bg-amber-100 text-amber-800 opacity-60 cursor-not-allowed' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                  }`}
                >
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>{pendingSyncCount}</span>
                </button>
              )}
            </div>

            {/* Persona Switcher */}
            <button
              onClick={onToggleRole}
              title="Chuyển đổi vai trò người dùng"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <strong className="text-slate-900 font-semibold text-2xs md:text-xs">
                {userRole === 'admin' ? 'Admin' : 'Giảng viên'}
              </strong>
            </button>

            {/* AI Advisor Button */}
            <button
              onClick={onOpenAdvisor}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cố Vấn AI</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100 text-xs">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${currentTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'}`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => onSelectTab('attendance')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${currentTab === 'attendance' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'}`}
          >
            Điểm danh
          </button>
          <button
            onClick={() => onSelectTab('ews')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${currentTab === 'ews' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'}`}
          >
            Cảnh báo EWS
          </button>
          <button
            onClick={() => onSelectTab('excel')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${currentTab === 'excel' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'}`}
          >
            Chuẩn hóa Excel
          </button>
          <button
            onClick={() => onSelectTab('audit')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${currentTab === 'audit' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'}`}
          >
            Audit Log
          </button>
        </div>
      </div>
    </header>
  );
};
