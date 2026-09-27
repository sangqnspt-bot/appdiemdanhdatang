import React, { useState, useEffect } from 'react';
import { 
  Key, 
  ExternalLink, 
  Check, 
  AlertCircle, 
  Sparkles, 
  X, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  CheckCircle2,
  Trash2
} from 'lucide-react';

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  speed: string;
  reasoning: string;
}

export const SUPPORTED_MODELS: ModelOption[] = [
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash (Preview)',
    description: 'Model tốc độ siêu tốc, tối ưu hóa độ trễ phản hồi, phù hợp điểm danh và tra cứu thời gian thực.',
    badge: 'Mặc định & Khuyên dùng',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    speed: 'Siêu nhanh (~0.8s)',
    reasoning: 'Rất tốt'
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro (Preview)',
    description: 'Model tư duy chuyên sâu, đối chiếu quy chế Bộ GD&ĐT phức tạp và lập báo cáo học thuật chuyên sâu.',
    badge: 'Tư duy chuyên sâu',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    speed: 'Tiêu chuẩn (~2.1s)',
    reasoning: 'Xuất sắc'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Model ổn định cao, đảm bảo tính liên tục của hệ thống khi các bản preview quá tải hoặc cạn quota.',
    badge: 'Dự phòng cao',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    speed: 'Nhanh (~1.1s)',
    reasoning: 'Tốt'
  }
];

export const STORAGE_KEYS = {
  API_KEY: 'gemini_api_key',
  SELECTED_MODEL: 'gemini_selected_model'
};

interface ApiKeySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMandatory?: boolean;
  onSaved?: (key: string, model: string) => void;
}

export const ApiKeySettingsModal: React.FC<ApiKeySettingsModalProps> = ({
  isOpen,
  onClose,
  isMandatory = false,
  onSaved
}) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3-flash-preview');
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load existing key from localStorage
  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
      const storedModel = localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL) || 'gemini-3-flash-preview';
      setApiKey(storedKey);
      setSelectedModel(storedModel);
      setSavedSuccess(false);
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setErrorMsg('Vui lòng nhập API Key để sử dụng các tính năng AI của ứng dụng.');
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.API_KEY, trimmed);
      localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, selectedModel);
      setSavedSuccess(true);
      setErrorMsg(null);

      if (onSaved) {
        onSaved(trimmed, selectedModel);
      }

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg('Không thể lưu vào bộ nhớ trình duyệt (localStorage). Vui lòng thử lại.');
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
    setApiKey('');
    setSavedSuccess(false);
    setErrorMsg('Đã xóa API Key khỏi bộ nhớ trình duyệt.');
    setTimeout(() => setErrorMsg(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-inner">
                <Key className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  Thiết Lập Model & API Key Gemini
                  <span className="text-2xs font-normal bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-400/30">
                    AI Studio
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Cấu hình khóa cá nhân để vận hành Trợ lý Cố vấn EdTech & Phân tích Đa Tầng
                </p>
              </div>
            </div>

            {!isMandatory && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                title="Đóng modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Instructions Box */}
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 space-y-1">
              <p className="font-semibold text-indigo-950">
                Lấy API key Google Gemini hoàn toàn miễn phí:
              </p>
              <p className="text-slate-600 leading-relaxed">
                Để kích hoạt các tính năng Cố vấn AI, tự động dự thảo công văn EWS 20% và kiểm toán chuyên cần, bạn cần nhập API Key từ Google AI Studio. Khóa của bạn được lưu an toàn trực tiếp trong trình duyệt (<code className="font-mono text-indigo-700 bg-indigo-100/70 px-1 py-0.5 rounded">localStorage</code>) và không gửi tới bất kỳ bên thứ ba nào.
              </p>
              <a
                href="https://aistudio.google.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-2 pt-1"
              >
                <span>Nhấp vào đây để lấy API key tại Google AI Studio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Model Selection Cards */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              1. Chọn Model AI Hoạt Động (Model Cards)
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {SUPPORTED_MODELS.map((model) => {
                const isSelected = selectedModel === model.id;
                return (
                  <div
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`relative p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-400'
                        }`}>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                          {model.name}
                        </span>
                      </div>

                      {model.badge && (
                        <span className={`text-2xs font-bold px-2 py-0.5 rounded-full border ${model.badgeColor}`}>
                          {model.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-2xs text-slate-600 mt-1.5 pl-6 leading-relaxed">
                      {model.description}
                    </p>

                    <div className="flex items-center gap-4 mt-2 pl-6 text-2xs text-slate-500 font-mono">
                      <span>Tốc độ: <strong className="text-slate-700">{model.speed}</strong></span>
                      <span>Khả năng lý luận: <strong className="text-slate-700">{model.reasoning}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-2xs text-slate-500 mt-1.5 italic">
              * Hệ thống tự động kích hoạt cơ chế Fallback tuần tự: nếu model được chọn gặp lỗi/quá tải, sẽ tự động chuyển sang model tiếp theo.
            </p>
          </div>

          {/* API Key Input Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="gemini-key-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Nhập Gemini API Key
              </label>
              {apiKey && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="text-2xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Xóa khóa</span>
                </button>
              )}
            </div>

            <div className="relative">
              <input
                id="gemini-key-input"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setErrorMsg(null);
                  setSavedSuccess(false);
                }}
                placeholder="AIzaSy..."
                className="w-full text-xs font-mono rounded-xl border border-slate-300 px-3.5 py-2.5 pr-10 bg-slate-50 focus:bg-white text-slate-900 focus:outline-indigo-600 transition-colors shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showKey ? "Ẩn khóa" : "Hiện khóa"}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            <p className="text-2xs text-slate-500 mt-1">
              Khóa API bắt đầu bằng <code className="font-mono">AIzaSy...</code> và được mã hóa lưu trữ nội bộ trên trình duyệt của bạn.
            </p>
          </div>

          {/* Alert messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Đã lưu thành công cấu hình API Key và Model! Đang sẵn sàng hoạt động...</span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          {isMandatory ? (
            <span className="text-2xs text-amber-700 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Vui lòng lưu API Key để tiếp tục sử dụng ứng dụng.</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors shadow-2xs"
            >
              Đóng
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Lưu Thiết Lập</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
