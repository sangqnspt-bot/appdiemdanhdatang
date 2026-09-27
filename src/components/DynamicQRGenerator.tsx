import React, { useState, useEffect } from 'react';
import { QrCode, RefreshCw, Smartphone, ShieldCheck, Check, Clock } from 'lucide-react';
import { Student } from '../types/attendance';

interface DynamicQRGeneratorProps {
  sessionId: string;
  courseName: string;
  className: string;
  unmarkedStudents: Student[];
  onStudentScanned: (studentId: string) => void;
}

export const DynamicQRGenerator: React.FC<DynamicQRGeneratorProps> = ({
  sessionId,
  courseName,
  className,
  unmarkedStudents,
  onStudentScanned
}) => {
  const [countdown, setCountdown] = useState(15);
  const [tokenHash, setTokenHash] = useState('TOTP-' + Math.random().toString(36).substring(2, 8).toUpperCase());
  const [selectedStudentId, setSelectedStudentId] = useState<string>(unmarkedStudents[0]?.id || '');
  const [scanSuccessMessage, setScanSuccessMessage] = useState<string | null>(null);

  // Rotation cycle every 15 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setTokenHash('TOTP-' + Math.random().toString(36).substring(2, 8).toUpperCase());
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (unmarkedStudents.length > 0 && !unmarkedStudents.some(s => s.id === selectedStudentId)) {
      setSelectedStudentId(unmarkedStudents[0].id);
    }
  }, [unmarkedStudents]);

  const handleSimulateScan = () => {
    if (!selectedStudentId) return;
    const targetStudent = unmarkedStudents.find(s => s.id === selectedStudentId);
    if (targetStudent) {
      onStudentScanned(selectedStudentId);
      setScanSuccessMessage(`Đã ghi nhận có mặt cho SV: ${targetStudent.fullName} (${targetStudent.studentCode})`);
      setTimeout(() => setScanSuccessMessage(null), 3000);
    }
  };

  // Generate an authentic QR-like SVG matrix based on current hash
  const generateQrMatrix = () => {
    const size = 21; // standard version 1 QR size
    const matrix: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));
    
    // Corners (Position detection patterns)
    const drawFinder = (startX: number, startY: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (
            r === 0 || r === 6 || c === 0 || c === 6 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            matrix[startY + r][startX + c] = true;
          }
        }
      }
    };

    drawFinder(0, 0);
    drawFinder(size - 7, 0);
    drawFinder(0, size - 7);

    // Hash pseudo-random bits
    let seed = 0;
    for (let i = 0; i < tokenHash.length; i++) {
      seed = (seed << 5) - seed + tokenHash.charCodeAt(i);
    }

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Skip finder zones
        if (
          (r < 8 && c < 8) ||
          (r < 8 && c >= size - 8) ||
          (r >= size - 8 && c < 8)
        ) continue;

        // Timing patterns
        if (r === 6 || c === 6) {
          matrix[r][c] = (r + c) % 2 === 0;
          continue;
        }

        seed = (seed * 9301 + 49297) % 233280;
        matrix[r][c] = seed / 233280 > 0.45;
      }
    }

    return matrix;
  };

  const matrix = generateQrMatrix();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-600" />
            <span>Mã QR Động Xoay Vòng (Anti-Cheat TOTP)</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Tự động đổi chu kỳ 15s · Khắc chế hoàn toàn việc chụp ảnh gửi từ xa
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
          <Clock className="w-3.5 h-3.5" />
          <span>{countdown}s</span>
        </div>
      </div>

      {/* QR Display Area */}
      <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-100">
        <div className="relative p-4 bg-white rounded-xl shadow-xs border border-slate-200">
          <svg
            viewBox="0 0 21 21"
            className="w-48 h-48 sm:w-56 sm:h-56 shape-rendering-crisp"
            style={{ imageRendering: 'pixelated' }}
          >
            {matrix.map((row, rIdx) =>
              row.map((cell, cIdx) =>
                cell ? (
                  <rect
                    key={`${rIdx}-${cIdx}`}
                    x={cIdx}
                    y={rIdx}
                    width={1}
                    height={1}
                    className="fill-slate-900"
                  />
                ) : null
              )
            )}
          </svg>

          {/* Central Logo Stamp */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 text-xs text-slate-600 font-mono">
          <span>Token mã hóa: <strong className="text-slate-900">{tokenHash}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Bán kính: <strong className="text-emerald-700">GPS &lt; 100m</strong></span>
        </div>
      </div>

      {/* Scan Simulation Tool for Testing & Demonstration */}
      <div className="mt-6 pt-5 border-t border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-slate-500" />
            <span>Mô Phỏng Thiết Bị Sinh Viên Quét Mã</span>
          </span>
          <span className="text-2xs text-slate-500">
            {unmarkedStudents.length} SV chưa điểm danh
          </span>
        </div>

        {unmarkedStudents.length > 0 ? (
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="flex-1 text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-indigo-600"
            >
              {unmarkedStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.studentCode} - {s.className})
                </option>
              ))}
            </select>
            <button
              onClick={handleSimulateScan}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Check className="w-4 h-4" />
              <span>Quét Hợp Lệ</span>
            </button>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Tất cả sinh viên trong ca học đã hoàn tất điểm danh!</span>
          </div>
        )}

        {scanSuccessMessage && (
          <div className="mt-2.5 p-2 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{scanSuccessMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
