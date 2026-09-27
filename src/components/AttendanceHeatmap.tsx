import React, { useState } from 'react';
import { Flame, Calendar, Clock, Info, ShieldAlert, Award, TrendingDown } from 'lucide-react';
import { EarlyWarningStudent } from '../types/attendance';

interface AttendanceHeatmapProps {
  ewsList: EarlyWarningStudent[];
}

interface HeatCell {
  day: string;
  shift: string;
  shiftLabel: string;
  timeRange: string;
  absenceRate: number;
  attendedRate: number;
  lateRate: number;
  totalStudents: number;
}

export const AttendanceHeatmap: React.FC<AttendanceHeatmapProps> = ({ ewsList }) => {
  const [hoveredCell, setHoveredCell] = useState<HeatCell | null>(null);

  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const shifts = [
    { key: 'morning', label: 'Ca Sáng', time: '07:30 - 11:30' },
    { key: 'afternoon', label: 'Ca Chiều', time: '13:00 - 17:00' },
    { key: 'evening', label: 'Ca Tối', time: '18:00 - 21:00' }
  ];

  // Realistic academic heatmap data pattern
  // Monday morning & Friday afternoon usually have higher absence rates in universities
  const heatmapData: HeatCell[] = [
    // Morning
    { day: 'Thứ 2', shift: 'morning', shiftLabel: 'Ca Sáng', timeRange: '07:30 - 11:30', absenceRate: 18.5, attendedRate: 76.5, lateRate: 5.0, totalStudents: 145 },
    { day: 'Thứ 3', shift: 'morning', shiftLabel: 'Ca Sáng', timeRange: '07:30 - 11:30', absenceRate: 4.2, attendedRate: 93.8, lateRate: 2.0, totalStudents: 150 },
    { day: 'Thứ 4', shift: 'morning', shiftLabel: 'Ca Sáng', timeRange: '07:30 - 11:30', absenceRate: 6.8, attendedRate: 91.2, lateRate: 2.0, totalStudents: 140 },
    { day: 'Thứ 5', shift: 'morning', shiftLabel: 'Ca Sáng', timeRange: '07:30 - 11:30', absenceRate: 5.5, attendedRate: 92.5, lateRate: 2.0, totalStudents: 152 },
    { day: 'Thứ 6', shift: 'morning', shiftLabel: 'Ca Sáng', timeRange: '07:30 - 11:30', absenceRate: 9.1, attendedRate: 87.9, lateRate: 3.0, totalStudents: 148 },
    { day: 'Thứ 7', shift: 'morning', shiftLabel: 'Ca Sáng', timeRange: '07:30 - 11:30', absenceRate: 14.3, attendedRate: 81.7, lateRate: 4.0, totalStudents: 110 },
    // Afternoon
    { day: 'Thứ 2', shift: 'afternoon', shiftLabel: 'Ca Chiều', timeRange: '13:00 - 17:00', absenceRate: 7.2, attendedRate: 90.8, lateRate: 2.0, totalStudents: 160 },
    { day: 'Thứ 3', shift: 'afternoon', shiftLabel: 'Ca Chiều', timeRange: '13:00 - 17:00', absenceRate: 5.0, attendedRate: 93.0, lateRate: 2.0, totalStudents: 155 },
    { day: 'Thứ 4', shift: 'afternoon', shiftLabel: 'Ca Chiều', timeRange: '13:00 - 17:00', absenceRate: 6.1, attendedRate: 91.9, lateRate: 2.0, totalStudents: 150 },
    { day: 'Thứ 5', shift: 'afternoon', shiftLabel: 'Ca Chiều', timeRange: '13:00 - 17:00', absenceRate: 8.4, attendedRate: 88.6, lateRate: 3.0, totalStudents: 158 },
    { day: 'Thứ 6', shift: 'afternoon', shiftLabel: 'Ca Chiều', timeRange: '13:00 - 17:00', absenceRate: 22.4, attendedRate: 72.6, lateRate: 5.0, totalStudents: 142 }, // Peak absence!
    { day: 'Thứ 7', shift: 'afternoon', shiftLabel: 'Ca Chiều', timeRange: '13:00 - 17:00', absenceRate: 16.0, attendedRate: 79.0, lateRate: 5.0, totalStudents: 95 },
    // Evening
    { day: 'Thứ 2', shift: 'evening', shiftLabel: 'Ca Tối', timeRange: '18:00 - 21:00', absenceRate: 6.0, attendedRate: 91.0, lateRate: 3.0, totalStudents: 85 },
    { day: 'Thứ 3', shift: 'evening', shiftLabel: 'Ca Tối', timeRange: '18:00 - 21:00', absenceRate: 4.8, attendedRate: 93.2, lateRate: 2.0, totalStudents: 88 },
    { day: 'Thứ 4', shift: 'evening', shiftLabel: 'Ca Tối', timeRange: '18:00 - 21:00', absenceRate: 7.5, attendedRate: 89.5, lateRate: 3.0, totalStudents: 80 },
    { day: 'Thứ 5', shift: 'evening', shiftLabel: 'Ca Tối', timeRange: '18:00 - 21:00', absenceRate: 9.0, attendedRate: 87.0, lateRate: 4.0, totalStudents: 82 },
    { day: 'Thứ 6', shift: 'evening', shiftLabel: 'Ca Tối', timeRange: '18:00 - 21:00', absenceRate: 19.8, attendedRate: 75.2, lateRate: 5.0, totalStudents: 75 },
    { day: 'Thứ 7', shift: 'evening', shiftLabel: 'Ca Tối', timeRange: '18:00 - 21:00', absenceRate: 11.2, attendedRate: 85.8, lateRate: 3.0, totalStudents: 60 }
  ];

  // Helper to color heatmap cells
  const getCellColor = (absence: number) => {
    if (absence >= 20) return 'bg-rose-500 text-white font-bold hover:bg-rose-600'; // Critical risk
    if (absence >= 15) return 'bg-orange-400 text-white font-semibold hover:bg-orange-500'; // High warning
    if (absence >= 10) return 'bg-amber-300 text-amber-950 font-medium hover:bg-amber-400'; // Notice
    if (absence >= 6) return 'bg-emerald-200 text-emerald-950 hover:bg-emerald-300';
    return 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'; // Super healthy
  };

  // Risk distribution breakdown
  const criticalCount = ewsList.filter(e => e.absenceRate >= 20).length;
  const warningCount = ewsList.filter(e => e.absenceRate >= 10 && e.absenceRate < 20).length;
  const safeCount = ewsList.filter(e => e.absenceRate < 10).length;
  const total = Math.max(1, ewsList.length);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Bản Đồ Nhiệt Tỷ Lệ Vắng Học (Attendance Heatmap)
              <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                D3.js EdTech Standard
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Phát hiện "điểm mù chuyên cần" theo ngày trong tuần và khung ca học để kịp thời siết chặt kỷ luật
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-2xs font-medium text-slate-600 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block" />
            &lt; 6% (Tốt)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-300 inline-block" />
            10-15% (Lưu ý)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-orange-400 inline-block" />
            15-20% (Báo động)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-rose-500 inline-block" />
            &ge; 20% (Nguy cơ cấm thi)
          </span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[620px]">
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {/* Header row: Blank top-left + Days */}
            <div className="p-2 font-bold text-slate-400 text-2xs uppercase">Ca Học</div>
            {days.map(d => (
              <div key={d} className="p-2 font-bold text-slate-700 bg-slate-50 rounded-lg">
                {d}
              </div>
            ))}

            {/* Shift Rows */}
            {shifts.map(shift => (
              <React.Fragment key={shift.key}>
                {/* Row label */}
                <div className="p-2 bg-slate-50 rounded-lg flex flex-col justify-center items-center text-slate-700">
                  <span className="font-bold text-xs">{shift.label}</span>
                  <span className="text-2xs font-mono text-slate-400">{shift.time}</span>
                </div>

                {/* Day cells for this shift */}
                {days.map(day => {
                  const cell = heatmapData.find(c => c.day === day && c.shift === shift.key);
                  if (!cell) return <div key={day} className="bg-slate-100 rounded-lg" />;
                  
                  return (
                    <div
                      key={day}
                      onMouseEnter={() => setHoveredCell(cell)}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`h-16 rounded-xl flex flex-col items-center justify-center p-2 cursor-pointer transition-all transform hover:scale-104 shadow-2xs ${getCellColor(cell.absenceRate)}`}
                    >
                      <span className="text-sm font-bold font-mono">
                        {cell.absenceRate}%
                      </span>
                      <span className="text-2xs opacity-80 font-mono">
                        {cell.totalStudents} SV
                      </span>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Hovered Cell Detail Card */}
      {hoveredCell ? (
        <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-950 animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-indigo-900">{hoveredCell.day} - {hoveredCell.shiftLabel}</strong> ({hoveredCell.timeRange})
              <div className="text-2xs text-slate-600 mt-0.5">
                Quy mô: <strong>{hoveredCell.totalStudents} sinh viên</strong> · Đi muộn: <strong>{hoveredCell.lateRate}%</strong>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold font-mono text-rose-600 block">
              Tỷ lệ vắng: {hoveredCell.absenceRate}%
            </span>
            <span className="text-2xs text-emerald-700 font-medium">
              Có mặt đúng giờ: {hoveredCell.attendedRate}%
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 text-center italic">
          * Rê chuột vào từng ô ca học để xem phân tích số lượng sinh viên, tỷ lệ đi muộn và chi tiết điểm danh.
        </div>
      )}

      {/* EWS Risk Distribution Section */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-indigo-600" />
          Phân Phối Dải Rủi Ro Chuyên Cần Toàn Khóa (EWS Bell Curve)
        </h4>

        <div className="space-y-2">
          {/* Safe bar */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1 text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Vùng An Toàn (&lt; 10% vắng)
              </span>
              <span className="font-mono text-emerald-700 font-bold">{safeCount} SV ({((safeCount / total) * 100).toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${(safeCount / total) * 100}%` }} />
            </div>
          </div>

          {/* Warning bar */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1 text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Vùng Báo Động (10% - 20% vắng)
              </span>
              <span className="font-mono text-amber-700 font-bold">{warningCount} SV ({((warningCount / total) * 100).toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${(warningCount / total) * 100}%` }} />
            </div>
          </div>

          {/* Critical bar */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1 text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                Ngưỡng Nguy Hiểm EWS (&ge; 20% - Cấm thi)
              </span>
              <span className="font-mono text-rose-700 font-bold">{criticalCount} SV ({((criticalCount / total) * 100).toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-rose-600 h-full rounded-full transition-all" style={{ width: `${(criticalCount / total) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
